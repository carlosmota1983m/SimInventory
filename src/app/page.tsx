'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Smartphone, CreditCard, Users, Plus, Search,
  LayoutGrid, Archive, Signal, AlertTriangle,
  Activity, ChevronRight, Zap, LogOut,
} from 'lucide-react';
import { useDevices } from '@/hooks/useDevices';
import { useSims } from '@/hooks/useSims';
import { useAccounts } from '@/hooks/useAccounts';
import DeviceCard from '@/components/devices/DeviceCard';
import DeviceFormModal from '@/components/devices/DeviceFormModal';
import SimAssignDrawer from '@/components/devices/SimAssignDrawer';
import SimCard from '@/components/sims/SimCard';
import SimFormModal from '@/components/sims/SimFormModal';
import AccountFormModal from '@/components/accounts/AccountFormModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import LoginScreen from '@/components/auth/LoginScreen';
import type { Sim } from '@/types';

type Tab = 'devices' | 'sims' | 'accounts';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('devices');
  const [searchQuery, setSearchQuery] = useState('');

  const { devices, loading: loadingDevices, fetchDevices, createDevice, updateDevice, deleteDevice } = useDevices();
  const { sims, drawerSims, loading: loadingSims, fetchSims, createSim, updateSim, deleteSim, assignSim, unlinkSim } = useSims();
  const { accounts, loading: loadingAccounts, fetchAccounts, createAccount, deleteAccount } = useAccounts();

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [editingSim, setEditingSim] = useState<Sim | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [preselectedDeviceId, setPreselectedDeviceId] = useState<string | undefined>();
  const [assignDrawer, setAssignDrawer] = useState<{ deviceId: string; slotType: 'FISICA' | 'ESIM' } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string; message: string; action: () => Promise<void>; variant: 'danger' | 'warning';
  } | null>(null);
  const [draggedSimId, setDraggedSimId] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('sim-manager-auth');
    setIsAuthenticated(auth === 'true');
    setAuthChecked(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sim-manager-auth');
    setIsAuthenticated(false);
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchDevices(), fetchSims(), fetchAccounts()]);
  }, [fetchDevices, fetchSims, fetchAccounts]);

  // Show nothing while checking auth
  if (!authChecked) return null;

  // Show login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }


  const handleDeleteDevice = (deviceId: string, deviceName: string) => {
    setConfirmAction({
      title: 'Eliminar Dispositivo',
      message: `¿Eliminar "${deviceName}"? Las cuentas asociadas se eliminarán y los SIMs se moverán al cajón.`,
      variant: 'danger',
      action: async () => { await deleteDevice(deviceId); await refreshAll(); },
    });
  };

  const handleUnlinkSim = (sim: Sim) => {
    setConfirmAction({
      title: 'Desvincular SIM',
      message: `¿Desvincular la SIM ${sim.numero} (${sim.compania})? Se moverá al cajón.`,
      variant: 'warning',
      action: async () => { await unlinkSim(sim.id); await refreshAll(); },
    });
  };

  const handleDeleteSim = (sim: Sim) => {
    setConfirmAction({
      title: 'Eliminar SIM',
      message: `¿Eliminar permanentemente la SIM ${sim.numero} (${sim.compania})?`,
      variant: 'danger',
      action: async () => { await deleteSim(sim.id); await refreshAll(); },
    });
  };

  const handleDeleteAccount = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    setConfirmAction({
      title: 'Eliminar Cuenta',
      message: `¿Eliminar la cuenta de ${account?.plataforma || 'esta plataforma'}?`,
      variant: 'danger',
      action: async () => { await deleteAccount(accountId); await refreshAll(); },
    });
  };

  const handleAssignSim = async (simId: string) => {
    if (!assignDrawer) return;
    await assignSim(simId, assignDrawer.deviceId);
    await refreshAll();
  };

  const filteredDevices = devices.filter((d) => d.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSims = sims.filter(
    (s) => s.numero.includes(searchQuery) || s.compania.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDevices = devices.length;
  const totalSims = sims.length;
  const simsInDrawer = drawerSims.length;
  const simsAssigned = totalSims - simsInDrawer;
  const urgentSims = sims.filter((s) => {
    if (!s.fechaUltimaRecarga) return false;
    const days = 90 - Math.floor((Date.now() - new Date(s.fechaUltimaRecarga).getTime()) / 86400000);
    return days <= 10;
  }).length;

  const loading = loadingDevices || loadingSims || loadingAccounts;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'devices', label: 'Dispositivos', icon: <Smartphone size={14} />, count: totalDevices },
    { id: 'sims', label: 'SIMs', icon: <CreditCard size={14} />, count: totalSims },
    { id: 'accounts', label: 'Cuentas', icon: <Users size={14} />, count: accounts.length },
  ];

  const addLabel = activeTab === 'devices' ? 'Dispositivo' : activeTab === 'sims' ? 'SIM' : 'Cuenta';

  return (
    <div className="page-container">
      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(10,10,10,0.88)',
          backdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <div className="content-width">
          {/* Top bar */}
          <div className="flex items-center justify-between" style={{ paddingTop: 14, paddingBottom: 14 }}>
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                  boxShadow: '0 2px 12px rgba(99,102,241,0.4)',
                }}
              >
                <Signal size={15} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">SIM Manager</h1>
                <p className="text-[10px] mt-0.5" style={{ color: '#444' }}>Pro · Inventario</p>
              </div>
            </div>

            {/* Right side pills */}
            <div className="flex items-center gap-2">
              {urgentSims > 0 && (
                <div
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold glow-alert"
                  style={{ background: 'rgba(127,29,29,0.5)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}
                >
                  <AlertTriangle size={11} />
                  {urgentSims} urgente{urgentSims !== 1 ? 's' : ''}
                </div>
              )}
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#555' }}
              >
                <Archive size={11} />
                {simsInDrawer} en cajón
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#444', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = '#444'; }}
                title="Cerrar sesión"
              >
                <LogOut size={11} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="hidden md:flex items-center gap-1 pb-3">
            {[
              { label: 'Dispositivos', value: totalDevices, icon: <Smartphone size={12} />, color: '#818cf8' },
              { label: 'SIMs activas', value: simsAssigned, icon: <Activity size={12} />, color: '#34d399' },
              { label: 'En cajón', value: simsInDrawer, icon: <Archive size={12} />, color: '#71717a' },
              { label: 'Cuentas', value: accounts.length, icon: <Users size={12} />, color: '#fb923c' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs font-bold text-white">{s.value}</span>
                <span className="text-[11px]" style={{ color: '#444' }}>{s.label}</span>
                {i < 3 && <span className="ml-1" style={{ color: '#2a2a2a', fontSize: 10 }}>·</span>}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0.5 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                className="relative flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors"
                style={{ color: activeTab === tab.id ? '#e4e4e7' : '#444' }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{
                    background: activeTab === tab.id ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                    color: activeTab === tab.id ? '#a5b4fc' : '#333',
                  }}
                >
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="tab-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="content-width" style={{ paddingTop: 28, paddingBottom: 48 }}>
        {/* Search + Add */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#333' }} />
            <input
              id="main-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'devices' ? 'Buscar dispositivos...'
                  : activeTab === 'sims' ? 'Número o compañía...'
                  : 'Buscar cuentas...'
              }
              className="input-base pl-9"
              style={{ fontSize: 13 }}
            />
          </div>
          <button
            id="btn-add-main"
            onClick={() => {
              if (activeTab === 'devices') setShowDeviceModal(true);
              else if (activeTab === 'sims') { setEditingSim(null); setShowSimModal(true); }
              else { setPreselectedDeviceId(undefined); setShowAccountModal(true); }
            }}
            className="btn-primary flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">{addLabel}</span>
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="device-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton rounded-2xl" style={{ height: 280, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {/* DEVICES */}
          {!loading && activeTab === 'devices' && (
            <motion.div key="devices" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {filteredDevices.length === 0 ? (
                <EmptyState
                  icon={<Smartphone size={36} />}
                  title="Sin dispositivos"
                  description="Agrega tu primer dispositivo para comenzar a gestionar tu inventario de SIMs."
                  actionLabel="Agregar Dispositivo"
                  onAction={() => setShowDeviceModal(true)}
                />
              ) : (
                <div className="device-grid">
                  {filteredDevices.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onEdit={() => setEditingDevice(device.id)}
                      onDelete={() => handleDeleteDevice(device.id, device.nombre)}
                      onAssignSim={(slotType) => setAssignDrawer({ deviceId: device.id, slotType })}
                      onUnlinkSim={handleUnlinkSim}
                      onAddAccount={() => { setPreselectedDeviceId(device.id); setShowAccountModal(true); }}
                      onDeleteAccount={handleDeleteAccount}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SIMS */}
          {!loading && activeTab === 'sims' && (
            <motion.div key="sims" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {filteredSims.length === 0 ? (
                <EmptyState
                  icon={<CreditCard size={36} />}
                  title="Sin SIMs"
                  description="Agrega tu primera SIM o eSIM para comenzar a gestionarlas."
                  actionLabel="Agregar SIM"
                  onAction={() => { setEditingSim(null); setShowSimModal(true); }}
                />
              ) : (() => {
                const drawerFiltered = filteredSims.filter((s) => !s.dispositivoId);
                const assignedFiltered = filteredSims.filter((s) => s.dispositivoId);
                return (
                  <>
                    {drawerFiltered.length > 0 && (
                      <section className="mb-8">
                        <SectionHeader
                          icon={<Archive size={13} />}
                          title="Cajón"
                          count={drawerFiltered.length}
                          subtitle="Arrastra al dispositivo para asignar"
                          accent="#818cf8"
                        />
                        <div className="sim-grid">
                          {drawerFiltered.map((sim) => (
                            <SimCard
                              key={sim.id}
                              sim={sim}
                              onEdit={() => { setEditingSim(sim); setShowSimModal(true); }}
                              onDelete={() => handleDeleteSim(sim)}
                              isDragging={draggedSimId === sim.id}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('simId', sim.id);
                                e.dataTransfer.setData('simType', sim.tipo);
                                setDraggedSimId(sim.id);
                              }}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                    {assignedFiltered.length > 0 && (
                      <section>
                        <SectionHeader
                          icon={<LayoutGrid size={13} />}
                          title="Asignadas"
                          count={assignedFiltered.length}
                          accent="#34d399"
                        />
                        <div className="sim-grid">
                          {assignedFiltered.map((sim) => (
                            <SimCard
                              key={sim.id}
                              sim={sim}
                              onEdit={() => { setEditingSim(sim); setShowSimModal(true); }}
                              onDelete={() => handleDeleteSim(sim)}
                              onUnlink={() => handleUnlinkSim(sim)}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* ACCOUNTS */}
          {!loading && activeTab === 'accounts' && (
            <motion.div key="accounts" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {accounts.length === 0 ? (
                <EmptyState
                  icon={<Users size={36} />}
                  title="Sin cuentas"
                  description="Agrega tu primera cuenta digital asociada a un dispositivo."
                  actionLabel="Agregar Cuenta"
                  onAction={() => { setPreselectedDeviceId(undefined); setShowAccountModal(true); }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {accounts
                    .filter((a) =>
                      a.plataforma.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      a.usuarioEmail.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((account, i) => {
                      const device = devices.find((d) => d.id === account.dispositivoId);
                      return (
                        <motion.div
                          key={account.id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.035 }}
                          className="group flex items-center gap-3.5 rounded-xl px-4 py-3 transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.04)',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.035)'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                        >
                          <img
                            src={`https://logo.clearbit.com/${account.plataforma.toLowerCase().replace(/\s+/g, '')}.com`}
                            alt={account.plataforma}
                            className="h-8 w-8 rounded-xl object-cover flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23222" width="40" height="40" rx="10"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="14" font-family="sans-serif">${account.plataforma[0]?.toUpperCase()}</text></svg>`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{account.plataforma}</p>
                            <p className="text-xs truncate" style={{ color: '#444' }}>{account.usuarioEmail}</p>
                          </div>
                          {device && (
                            <span
                              className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                              style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.18)' }}
                            >
                              <Smartphone size={10} />
                              {device.nombre}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="rounded-lg p-1.5 transition-all opacity-0 group-hover:opacity-100"
                            style={{ color: '#3f3f46' }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)';
                              (e.currentTarget as HTMLElement).style.color = '#f87171';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = '#3f3f46';
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6" /><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                            </svg>
                          </button>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {showDeviceModal && (
          <DeviceFormModal
            isOpen={showDeviceModal}
            onClose={() => setShowDeviceModal(false)}
            onSubmit={async (data) => { await createDevice(data); await refreshAll(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingDevice && (() => {
          const device = devices.find((d) => d.id === editingDevice);
          if (!device) return null;
          return (
            <DeviceFormModal
              key={editingDevice}
              isOpen={true}
              onClose={() => setEditingDevice(null)}
              onSubmit={async (data) => { await updateDevice(editingDevice, data); await refreshAll(); }}
              initialData={{ nombre: device.nombre, configuracionSlots: device.configuracionSlots }}
              title="Editar Dispositivo"
            />
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showSimModal && (
          <SimFormModal
            isOpen={showSimModal}
            onClose={() => { setShowSimModal(false); setEditingSim(null); }}
            onSubmit={async (data) => {
              if (editingSim) await updateSim(editingSim.id, data);
              else await createSim(data);
              await refreshAll();
            }}
            devices={devices}
            initialData={editingSim ? {
              tipo: editingSim.tipo, numero: editingSim.numero, compania: editingSim.compania,
              registroGubernamental: editingSim.registroGubernamental,
              ssidIccid: editingSim.ssidIccid || undefined, pin: editingSim.pin || undefined,
              puk: editingSim.puk || undefined, fechaUltimaRecarga: editingSim.fechaUltimaRecarga,
              dispositivoId: editingSim.dispositivoId,
              imagenQr: editingSim.imagenQr || undefined,
            } : undefined}
            title={editingSim ? 'Editar SIM' : 'Nueva SIM'}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAccountModal && (
          <AccountFormModal
            isOpen={showAccountModal}
            onClose={() => { setShowAccountModal(false); setPreselectedDeviceId(undefined); }}
            onSubmit={async (data) => { await createAccount(data); await refreshAll(); }}
            devices={devices}
            preselectedDeviceId={preselectedDeviceId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assignDrawer && (
          <SimAssignDrawer
            isOpen={true}
            onClose={() => setAssignDrawer(null)}
            availableSims={drawerSims}
            slotType={assignDrawer.slotType}
            onSelect={handleAssignSim}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        variant={confirmAction?.variant || 'danger'}
        confirmLabel="Sí, continuar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          if (confirmAction) await confirmAction.action();
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

function SectionHeader({
  icon, title, count, subtitle, accent = '#818cf8',
}: {
  icon: React.ReactNode; title: string; count: number; subtitle?: string; accent?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color: accent }}>{icon}</span>
      <h2 className="section-label">{title}</h2>
      <span
        className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
        style={{ background: 'rgba(255,255,255,0.05)', color: '#3a3a3a' }}
      >
        {count}
      </span>
      {subtitle && (
        <span className="hidden sm:inline text-[11px]" style={{ color: '#2e2e2e' }}>
          — {subtitle}
        </span>
      )}
    </div>
  );
}

function EmptyState({ icon, title, description, actionLabel, onAction }: {
  icon: React.ReactNode; title: string; description: string; actionLabel: string; onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ padding: '80px 0' }}>
      <div
        className="mb-5 flex items-center justify-center rounded-2xl"
        style={{
          width: 72, height: 72,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#2a2a2a',
        }}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: '#888' }}>{title}</h3>
      <p className="text-sm mb-7 max-w-xs leading-relaxed" style={{ color: '#333' }}>{description}</p>
      <button onClick={onAction} className="btn-primary flex items-center gap-1.5">
        <Plus size={14} />
        {actionLabel}
      </button>
    </div>
  );
}
