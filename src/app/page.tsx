'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Smartphone,
  CreditCard,
  Users,
  Plus,
  Search,
  LayoutGrid,
  Archive,
  Signal,
  Wifi,
  AlertTriangle,
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
import type { Sim, SimType } from '@/types';

type Tab = 'devices' | 'sims' | 'accounts';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('devices');
  const [searchQuery, setSearchQuery] = useState('');

  // Data hooks
  const { devices, loading: loadingDevices, fetchDevices, createDevice, updateDevice, deleteDevice } = useDevices();
  const { sims, drawerSims, loading: loadingSims, fetchSims, createSim, updateSim, deleteSim, assignSim, unlinkSim } = useSims();
  const { accounts, loading: loadingAccounts, fetchAccounts, createAccount, deleteAccount } = useAccounts();

  // Modal states
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);
  const [editingSim, setEditingSim] = useState<Sim | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [preselectedDeviceId, setPreselectedDeviceId] = useState<string | undefined>();

  // Assign drawer
  const [assignDrawer, setAssignDrawer] = useState<{ deviceId: string; slotType: 'FISICA' | 'ESIM' } | null>(null);

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
    variant: 'danger' | 'warning';
  } | null>(null);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchDevices(), fetchSims(), fetchAccounts()]);
  }, [fetchDevices, fetchSims, fetchAccounts]);

  // --- Handlers ---

  const handleDeleteDevice = (deviceId: string, deviceName: string) => {
    setConfirmAction({
      title: 'Eliminar Dispositivo',
      message: `¿Estás seguro de eliminar "${deviceName}"? Las cuentas asociadas se eliminarán y los SIMs se moverán al cajón.`,
      variant: 'danger',
      action: async () => {
        await deleteDevice(deviceId);
        await refreshAll();
      },
    });
  };

  const handleUnlinkSim = (sim: Sim) => {
    setConfirmAction({
      title: 'Desvincular SIM',
      message: `¿Estás seguro de desvincular la SIM ${sim.numero} (${sim.compania})? Se moverá al cajón. Las cuentas del dispositivo no se verán afectadas.`,
      variant: 'warning',
      action: async () => {
        await unlinkSim(sim.id);
        await refreshAll();
      },
    });
  };

  const handleDeleteSim = (sim: Sim) => {
    setConfirmAction({
      title: 'Eliminar SIM',
      message: `¿Estás seguro de eliminar permanentemente la SIM ${sim.numero} (${sim.compania})?`,
      variant: 'danger',
      action: async () => {
        await deleteSim(sim.id);
        await refreshAll();
      },
    });
  };

  const handleDeleteAccount = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    setConfirmAction({
      title: 'Eliminar Cuenta',
      message: `¿Estás seguro de eliminar la cuenta de ${account?.plataforma || 'esta plataforma'}?`,
      variant: 'danger',
      action: async () => {
        await deleteAccount(accountId);
        await refreshAll();
      },
    });
  };

  const handleAssignSim = async (simId: string) => {
    if (!assignDrawer) return;
    await assignSim(simId, assignDrawer.deviceId);
    await refreshAll();
  };

  // --- Filtered data ---

  const filteredDevices = devices.filter((d) =>
    d.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSims = sims.filter(
    (s) =>
      s.numero.includes(searchQuery) ||
      s.compania.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalDevices = devices.length;
  const totalSims = sims.length;
  const simsInDrawer = drawerSims.length;
  const urgentSims = sims.filter((s) => {
    if (!s.fechaUltimaRecarga) return false;
    const days = 90 - Math.floor((Date.now() - new Date(s.fechaUltimaRecarga).getTime()) / 86400000);
    return days <= 10;
  }).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'devices', label: 'Dispositivos', icon: <Smartphone size={18} />, count: totalDevices },
    { id: 'sims', label: 'SIMs', icon: <CreditCard size={18} />, count: totalSims },
    { id: 'accounts', label: 'Cuentas', icon: <Users size={18} />, count: accounts.length },
  ];

  const loading = loadingDevices || loadingSims || loadingAccounts;

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#121212]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/25">
                <Signal size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">SIM Manager</h1>
                <p className="text-xs text-zinc-500">Pro Inventory System</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="hidden sm:flex items-center gap-4">
              {urgentSims > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-400 glow-alert">
                  <AlertTriangle size={14} />
                  {urgentSims} recarga{urgentSims !== 1 ? 's' : ''} urgente{urgentSims !== 1 ? 's' : ''}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Archive size={14} />
                {simsInDrawer} en cajón
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'bg-white/5 text-zinc-600'
                }`}>
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Search + Actions bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'devices'
                  ? 'Buscar dispositivos...'
                  : activeTab === 'sims'
                  ? 'Buscar por número o compañía...'
                  : 'Buscar cuentas...'
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <button
            onClick={() => {
              if (activeTab === 'devices') setShowDeviceModal(true);
              else if (activeTab === 'sims') { setEditingSim(null); setShowSimModal(true); }
              else { setPreselectedDeviceId(undefined); setShowAccountModal(true); }
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-indigo-500 active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">
              {activeTab === 'devices' ? 'Dispositivo' : activeTab === 'sims' ? 'SIM' : 'Cuenta'}
            </span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Wifi size={32} className="text-violet-400 animate-pulse" />
              <p className="text-sm text-zinc-500">Cargando inventario...</p>
            </div>
          </div>
        )}

        {/* Device Tab */}
        <AnimatePresence mode="wait">
          {!loading && activeTab === 'devices' && (
            <motion.div
              key="devices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {filteredDevices.length === 0 ? (
                <EmptyState
                  icon={<Smartphone size={48} />}
                  title="No hay dispositivos"
                  description="Agrega tu primer dispositivo para comenzar a gestionar tu inventario."
                  actionLabel="Agregar Dispositivo"
                  onAction={() => setShowDeviceModal(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDevices.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      onEdit={() => setEditingDevice(device.id)}
                      onDelete={() => handleDeleteDevice(device.id, device.nombre)}
                      onAssignSim={(slotType) =>
                        setAssignDrawer({ deviceId: device.id, slotType })
                      }
                      onUnlinkSim={(sim) => handleUnlinkSim(sim)}
                      onAddAccount={() => {
                        setPreselectedDeviceId(device.id);
                        setShowAccountModal(true);
                      }}
                      onDeleteAccount={(accountId) => handleDeleteAccount(accountId)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SIMs Tab */}
          {!loading && activeTab === 'sims' && (
            <motion.div
              key="sims"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {filteredSims.length === 0 ? (
                <EmptyState
                  icon={<CreditCard size={48} />}
                  title="No hay SIMs"
                  description="Agrega tu primera SIM o eSIM para comenzar."
                  actionLabel="Agregar SIM"
                  onAction={() => { setEditingSim(null); setShowSimModal(true); }}
                />
              ) : (
                <>
                  {/* Cajón section */}
                  {(() => {
                    const drawerFiltered = filteredSims.filter((s) => !s.dispositivoId);
                    const assignedFiltered = filteredSims.filter((s) => s.dispositivoId);

                    return (
                      <>
                        {drawerFiltered.length > 0 && (
                          <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                              <Archive size={16} className="text-zinc-500" />
                              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                                Cajón ({drawerFiltered.length})
                              </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {drawerFiltered.map((sim) => (
                                <SimCard
                                  key={sim.id}
                                  sim={sim}
                                  onEdit={() => { setEditingSim(sim); setShowSimModal(true); }}
                                  onDelete={() => handleDeleteSim(sim)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {assignedFiltered.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <LayoutGrid size={16} className="text-zinc-500" />
                              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                                Asignados ({assignedFiltered.length})
                              </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </motion.div>
          )}

          {/* Accounts Tab */}
          {!loading && activeTab === 'accounts' && (
            <motion.div
              key="accounts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {accounts.length === 0 ? (
                <EmptyState
                  icon={<Users size={48} />}
                  title="No hay cuentas"
                  description="Agrega tu primera cuenta digital a un dispositivo."
                  actionLabel="Agregar Cuenta"
                  onAction={() => { setPreselectedDeviceId(undefined); setShowAccountModal(true); }}
                />
              ) : (
                <div className="space-y-2">
                  {accounts
                    .filter(
                      (a) =>
                        a.plataforma.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.usuarioEmail.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((account) => {
                      const device = devices.find((d) => d.id === account.dispositivoId);
                      return (
                        <motion.div
                          key={account.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
                        >
                          <div className="flex-shrink-0">
                            <img
                              src={`https://logo.clearbit.com/${account.plataforma.toLowerCase().replace(/\s+/g, '')}.com`}
                              alt={account.plataforma}
                              className="h-10 w-10 rounded-full bg-white/10 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23333" width="40" height="40" rx="20"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif">${account.plataforma[0]?.toUpperCase()}</text></svg>`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{account.plataforma}</p>
                            <p className="text-xs text-zinc-400 truncate">{account.usuarioEmail}</p>
                          </div>
                          {device && (
                            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-400">
                              <Smartphone size={12} />
                              {device.nombre}
                            </span>
                          )}
                          {account.notas && (
                            <span className="hidden lg:inline text-xs text-zinc-600 max-w-[200px] truncate">{account.notas}</span>
                          )}
                          <button
                            onClick={() => handleDeleteAccount(account.id)}
                            className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-red-500/20 hover:text-red-400"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* === MODALS === */}

      {/* Device Form Modal */}
      <AnimatePresence>
        {showDeviceModal && (
          <DeviceFormModal
            isOpen={showDeviceModal}
            onClose={() => setShowDeviceModal(false)}
            onSubmit={async (data) => {
              await createDevice(data);
              await refreshAll();
            }}
          />
        )}
      </AnimatePresence>

      {/* Device Edit Modal */}
      <AnimatePresence>
        {editingDevice && (() => {
          const device = devices.find((d) => d.id === editingDevice);
          if (!device) return null;
          return (
            <DeviceFormModal
              key={editingDevice}
              isOpen={true}
              onClose={() => setEditingDevice(null)}
              onSubmit={async (data) => {
                await updateDevice(editingDevice, data);
                await refreshAll();
              }}
              initialData={{ nombre: device.nombre, configuracionSlots: device.configuracionSlots }}
              title="Editar Dispositivo"
            />
          );
        })()}
      </AnimatePresence>

      {/* SIM Form Modal */}
      <AnimatePresence>
        {showSimModal && (
          <SimFormModal
            isOpen={showSimModal}
            onClose={() => { setShowSimModal(false); setEditingSim(null); }}
            onSubmit={async (data) => {
              if (editingSim) {
                await updateSim(editingSim.id, data);
              } else {
                await createSim(data);
              }
              await refreshAll();
            }}
            devices={devices}
            initialData={editingSim ? {
              tipo: editingSim.tipo,
              numero: editingSim.numero,
              compania: editingSim.compania,
              registroGubernamental: editingSim.registroGubernamental,
              ssidIccid: editingSim.ssidIccid || undefined,
              pin: editingSim.pin || undefined,
              puk: editingSim.puk || undefined,
              fechaUltimaRecarga: editingSim.fechaUltimaRecarga,
              dispositivoId: editingSim.dispositivoId,
              imagenQr: editingSim.imagenQr || undefined,
            } : undefined}
            title={editingSim ? 'Editar SIM' : 'Nueva SIM'}
          />
        )}
      </AnimatePresence>

      {/* Account Form Modal */}
      <AnimatePresence>
        {showAccountModal && (
          <AccountFormModal
            isOpen={showAccountModal}
            onClose={() => { setShowAccountModal(false); setPreselectedDeviceId(undefined); }}
            onSubmit={async (data) => {
              await createAccount(data);
              await refreshAll();
            }}
            devices={devices}
            preselectedDeviceId={preselectedDeviceId}
          />
        )}
      </AnimatePresence>

      {/* SIM Assign Drawer */}
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        variant={confirmAction?.variant || 'danger'}
        confirmLabel="Sí, continuar"
        cancelLabel="Cancelar"
        onConfirm={async () => {
          if (confirmAction) {
            await confirmAction.action();
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}

// Empty state component
function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-zinc-700">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-400 mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 mb-6 max-w-md">{description}</p>
      <button
        onClick={onAction}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-indigo-500"
      >
        <Plus size={16} />
        {actionLabel}
      </button>
    </div>
  );
}
