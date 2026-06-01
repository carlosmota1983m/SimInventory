'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Edit3, Trash2, Plus, ChevronDown, ChevronUp,
  Signal, Wifi, Battery, Unlink, Shield, X, CreditCard,
  Calendar, User, Copy, Check, Zap, Radio,
} from 'lucide-react';
import type { Device, Sim } from '@/types';
import { SLOT_CONFIG_LABELS, SLOT_CAPACITY } from '@/types';
import CopyButton from '@/components/shared/CopyButton';
import CarrierIcon from '@/components/shared/CarrierIcon';
import PlatformIcon from '@/components/shared/PlatformIcon';
import { getRechargeStatus, formatDate } from '@/lib/utils';

interface DeviceCardProps {
  device: Device;
  onEdit: () => void;
  onDelete: () => void;
  onAssignSim: (slotType: 'FISICA' | 'ESIM') => void;
  onUnlinkSim: (sim: Sim) => void;
  onAddAccount: () => void;
  onDeleteAccount: (accountId: string) => void;
}

const CARRIER_ACCENT: Record<string, { from: string; to: string; text: string }> = {
  telcel:   { from: '#1d4ed8', to: '#3b82f6', text: '#93c5fd' },
  movistar: { from: '#16a34a', to: '#22c55e', text: '#86efac' },
  'at&t':   { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc' },
  att:      { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc' },
  bait:     { from: '#7c3aed', to: '#a855f7', text: '#d8b4fe' },
  unefon:   { from: '#c2410c', to: '#f97316', text: '#fdba74' },
  virgin:   { from: '#b91c1c', to: '#ef4444', text: '#fca5a5' },
};
const DEFAULT_ACCENT = { from: '#3f3f46', to: '#52525b', text: '#71717a' };
function getAccent(c: string) { return CARRIER_ACCENT[c.toLowerCase().trim()] ?? DEFAULT_ACCENT; }

// ─── Main DeviceCard ─────────────────────────────────────────────────────────
export default function DeviceCard({
  device, onEdit, onDelete, onAssignSim, onUnlinkSim, onAddAccount, onDeleteAccount,
}: DeviceCardProps) {
  const [showAccountEmail, setShowAccountEmail] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const capacity = SLOT_CAPACITY[device.configuracionSlots];
  const physicalSims = device.sims.filter((s) => s.tipo === 'FISICA');
  const esimSims = device.sims.filter((s) => s.tipo === 'ESIM');

  const totalSlots = capacity.physical + capacity.esim;
  const usedSlots = device.sims.length;
  const urgentCount = device.sims.filter((s) => {
    const r = getRechargeStatus(s.fechaUltimaRecarga);
    return r.isUrgent || r.isExpired;
  }).length;

  const handleDragOver = (e: React.DragEvent, slotKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotKey);
  };
  const handleDrop = (e: React.DragEvent, slotType: 'FISICA' | 'ESIM') => {
    e.preventDefault();
    setDragOverSlot(null);
    onAssignSim(slotType);
  };

  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="group relative device-phone-card"
    >
      {/* Urgent badge */}
      {urgentCount > 0 && (
        <div className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white glow-alert">
          {urgentCount}
        </div>
      )}

      {/* Device name + actions header */}
      <div className="device-phone-header">
        <div className="flex items-center gap-2 min-w-0">
          <div className="device-phone-name-icon">
            <Smartphone size={14} style={{ color: '#818cf8' }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-white leading-tight truncate">{device.nombre}</h3>
            <p className="text-[10px]" style={{ color: '#3a3a3a' }}>
              {SLOT_CONFIG_LABELS[device.configuracionSlots]} · {usedSlots}/{totalSlots} slots
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button onClick={onEdit} className="btn-icon" title="Editar"><Edit3 size={13} /></button>
          <button
            onClick={onDelete}
            className="btn-icon"
            title="Eliminar"
            style={{ color: '#3a3a3a' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#3a3a3a'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── PHONE MOCKUP ── */}
      <div className="device-phone-body">
        <div className="phone-mockup-large">
          {/* Outer shell */}
          <div className="phone-shell-large">
            {/* Side button (power) */}
            <div className="phone-side-button phone-power" />
            <div className="phone-side-button phone-vol-up" />
            <div className="phone-side-button phone-vol-down" />

            {/* Screen */}
            <div className="phone-screen-large">
              {/* Dynamic Island */}
              <div className="phone-island-large">
                <div className="phone-island-cam" />
              </div>

              {/* Status bar */}
              <div className="phone-status-bar">
                <span className="phone-time">{timeStr}</span>
                <div className="phone-status-icons">
                  <Signal size={10} />
                  <Wifi size={10} />
                  <Battery size={10} />
                </div>
              </div>

              {/* Screen content */}
              <div className="phone-content-area">
                {/* SIM Cards inside phone */}
                <div className="phone-section">
                  <div className="phone-section-header">
                    <CreditCard size={10} />
                    <span>Líneas SIM</span>
                  </div>

                  {/* Physical SIM slots */}
                  {Array.from({ length: capacity.physical }).map((_, i) => {
                    const sim = physicalSims[i] || null;
                    const slotKey = `phys-${i}`;
                    return (
                      <PhoneSimRow
                        key={slotKey}
                        sim={sim}
                        type="FISICA"
                        index={i}
                        onAssign={() => onAssignSim('FISICA')}
                        onUnlink={sim ? () => onUnlinkSim(sim) : undefined}
                        isDragOver={dragOverSlot === slotKey}
                        onDragOver={(e) => handleDragOver(e, slotKey)}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => handleDrop(e, 'FISICA')}
                      />
                    );
                  })}

                  {/* eSIM slots */}
                  {Array.from({ length: capacity.esim }).map((_, i) => {
                    const sim = esimSims[i] || null;
                    const slotKey = `esim-${i}`;
                    return (
                      <PhoneSimRow
                        key={slotKey}
                        sim={sim}
                        type="ESIM"
                        index={i}
                        onAssign={() => onAssignSim('ESIM')}
                        onUnlink={sim ? () => onUnlinkSim(sim) : undefined}
                        isDragOver={dragOverSlot === slotKey}
                        onDragOver={(e) => handleDragOver(e, slotKey)}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => handleDrop(e, 'ESIM')}
                      />
                    );
                  })}
                </div>

                {/* Accounts inside phone */}
                <div className="phone-section">
                  <div className="phone-section-header">
                    <User size={10} />
                    <span>Cuentas</span>
                    <button
                      onClick={onAddAccount}
                      className="phone-add-btn"
                      title="Agregar cuenta"
                    >
                      <Plus size={9} />
                    </button>
                  </div>

                  {device.accounts.length === 0 ? (
                    <button
                      onClick={onAddAccount}
                      className="phone-empty-slot"
                    >
                      <Plus size={10} />
                      <span>Agregar cuenta</span>
                    </button>
                  ) : (
                    <div className="phone-accounts-list">
                      {device.accounts.map((account) => (
                        <div key={account.id} className="phone-account-row">
                          <PlatformIcon plataforma={account.plataforma} size={20} />
                          <div className="phone-account-info">
                            <span className="phone-account-platform">{account.plataforma}</span>
                            <span className="phone-account-email">{account.usuarioEmail}</span>
                          </div>
                          <div className="phone-account-actions">
                            <CopyButton text={account.usuarioEmail} />
                            <button
                              onClick={() => onDeleteAccount(account.id)}
                              className="phone-delete-btn"
                              title="Eliminar"
                            >
                              <X size={9} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Home bar */}
              <div className="phone-home-bar">
                <div className="phone-home-indicator" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Phone SIM Row (inside phone screen) ────────────────────────────────────
function PhoneSimRow({
  sim, type, index, onAssign, onUnlink,
  isDragOver, onDragOver, onDragLeave, onDrop,
}: {
  sim: Sim | null; type: 'FISICA' | 'ESIM'; index: number;
  onAssign: () => void; onUnlink?: () => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const recharge = sim ? getRechargeStatus(sim.fechaUltimaRecarga) : null;
  const accent = sim ? getAccent(sim.compania) : DEFAULT_ACCENT;

  if (sim) {
    return (
      <div
        className={`phone-sim-row phone-sim-filled ${isDragOver ? 'phone-sim-dragover' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${accent.from}1a, ${accent.to}0e)`,
          borderColor: `${accent.from}40`,
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Carrier dot + name */}
        <div className="phone-sim-left">
          <CarrierIcon compania={sim.compania} size={20} className="mr-1.5" />
          <div className="phone-sim-info">
            <div className="phone-sim-carrier-row">
              <span className="phone-sim-carrier" style={{ color: accent.text }}>
                {sim.compania}
              </span>
              <span className="phone-sim-type-badge" style={{
                background: type === 'ESIM' ? 'rgba(6,182,212,0.15)' : `${accent.from}25`,
                color: type === 'ESIM' ? '#22d3ee' : accent.text,
                borderColor: type === 'ESIM' ? 'rgba(6,182,212,0.3)' : `${accent.from}40`,
              }}>
                {type === 'ESIM' ? 'eSIM' : `SIM ${index + 1}`}
              </span>
              {sim.registroGubernamental && (
                <Shield size={8} className="text-amber-400" />
              )}
            </div>
            <span className="phone-sim-number">{sim.numero}</span>
          </div>
        </div>

        {/* Right side: status + actions */}
        <div className="phone-sim-right">
          {recharge && recharge.daysUntilExpiry != null && (
            <span className={`phone-sim-status ${
              recharge.isExpired ? 'phone-sim-expired' :
              recharge.isUrgent ? 'phone-sim-urgent' : 'phone-sim-ok'
            }`}>
              {recharge.isExpired ? (
                <><Zap size={8} /> Vencida</>
              ) : recharge.isUrgent ? (
                <><Zap size={8} /> {recharge.daysUntilExpiry}d</>
              ) : (
                <>{recharge.daysUntilExpiry}d</>
              )}
            </span>
          )}
          <CopyButton text={sim.numero} />
          {onUnlink && (
            <button onClick={onUnlink} className="phone-unlink-btn" title="Desvincular">
              <Unlink size={9} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty slot
  return (
    <button
      onClick={onAssign}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`phone-sim-row phone-sim-empty ${isDragOver ? 'phone-sim-dragover' : ''}`}
    >
      <Plus size={10} />
      <span>{type === 'ESIM' ? 'Agregar eSIM' : 'Agregar SIM'}</span>
    </button>
  );
}
