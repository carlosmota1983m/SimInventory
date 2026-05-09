'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Edit3, Trash2, Plus, ChevronDown, ChevronUp,
  Signal, Wifi, Battery, Unlink, Shield, X, GripVertical,
} from 'lucide-react';
import type { Device, Sim } from '@/types';
import { SLOT_CONFIG_LABELS, SLOT_CAPACITY } from '@/types';
import CopyButton from '@/components/shared/CopyButton';
import PlatformIcon from '@/components/shared/PlatformIcon';
import { getRechargeStatus } from '@/lib/utils';

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

// ─── Phone SIM Slot ──────────────────────────────────────────────────────────
function PhoneSimSlot({
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
        className={`relative rounded-xl overflow-hidden transition-all duration-200 ${isDragOver ? 'ring-2 ring-indigo-500/60 ring-offset-1 ring-offset-black' : ''}`}
        style={{
          background: `linear-gradient(135deg, ${accent.from}16, ${accent.to}0c)`,
          border: `1px solid ${accent.from}38`,
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Urgency strip */}
        {(recharge?.isUrgent || recharge?.isExpired) && (
          <div
            className={`text-[9px] font-bold text-center py-0.5 tracking-widest uppercase ${
              recharge.isExpired ? 'bg-red-600/90 text-white glow-alert' : 'bg-amber-500/80 text-black'
            }`}
          >
            {recharge.isExpired ? '⚠ VENCIDA' : `⚡ ${recharge.daysUntilExpiry}d`}
          </div>
        )}
        <div className="p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: accent.to, boxShadow: `0 0 5px ${accent.to}` }}
              />
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: accent.text }}>
                {sim.compania}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {sim.registroGubernamental && <Shield size={9} className="text-amber-400" />}
              <span
                className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: `${accent.from}28`, color: accent.text }}
              >
                {type === 'ESIM' ? 'eSIM' : `SIM ${index + 1}`}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-white/90 tracking-wide">
              {sim.numero}
            </span>
            <div className="flex items-center gap-1">
              <CopyButton text={sim.numero} />
              {onUnlink && (
                <button
                  onClick={onUnlink}
                  className="rounded-md p-1 transition-colors hover:bg-white/10"
                  title="Desvincular SIM"
                  style={{ color: `${accent.text}70` }}
                >
                  <Unlink size={9} />
                </button>
              )}
            </div>
          </div>
          {recharge?.daysUntilExpiry != null && (
            <p className="text-[9px] mt-1" style={{ color: `${accent.text}60` }}>
              {recharge.isExpired ? 'Vencida' : `${recharge.daysUntilExpiry}d restantes`}
            </p>
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
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-3 text-[10px] font-medium transition-all duration-200 w-full ${
        isDragOver
          ? 'drop-zone-active text-indigo-300'
          : 'border-white/8 text-zinc-700 hover:border-indigo-500/35 hover:bg-indigo-500/4 hover:text-indigo-400'
      }`}
      style={{ minHeight: 56 }}
    >
      {isDragOver ? (
        <>
          <div className="w-4 h-4 rounded-full bg-indigo-500/25 flex items-center justify-center">
            <Plus size={10} className="text-indigo-300" />
          </div>
          <span>Soltar aquí</span>
        </>
      ) : (
        <>
          <Plus size={12} />
          <span>{type === 'ESIM' ? 'eSIM' : 'SIM'}</span>
        </>
      )}
    </button>
  );
}

// ─── Main DeviceCard ─────────────────────────────────────────────────────────
export default function DeviceCard({
  device, onEdit, onDelete, onAssignSim, onUnlinkSim, onAddAccount, onDeleteAccount,
}: DeviceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAccountEmail, setShowAccountEmail] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const capacity = SLOT_CAPACITY[device.configuracionSlots];
  const physicalSims = device.sims.filter((s) => s.tipo === 'FISICA');
  const esimSims = device.sims.filter((s) => s.tipo === 'ESIM');

  const totalSlots = capacity.physical + capacity.esim;
  const usedSlots = device.sims.length;
  const fillPct = totalSlots > 0 ? (usedSlots / totalSlots) * 100 : 0;
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
  const timeStr = `${hour.toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;

  // Status color for the fill indicator
  const statusColor = fillPct === 100 ? '#22c55e' : fillPct > 0 ? '#f59e0b' : '#2a2a2a';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="group relative card overflow-visible"
    >
      {/* Urgent badge */}
      {urgentCount > 0 && (
        <div className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white glow-alert">
          {urgentCount}
        </div>
      )}

      {/* ── HEADER ── */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          {/* Device icon with fill indicator */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))', border: '1px solid rgba(99,102,241,0.18)' }}
          >
            <Smartphone size={18} style={{ color: '#818cf8' }} />
            <div
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
              style={{ background: statusColor, border: '1.5px solid #161616' }}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">{device.nombre}</h3>
            <p className="text-[11px] mt-0.5" style={{ color: '#3a3a3a' }}>
              {SLOT_CONFIG_LABELS[device.configuracionSlots]}
            </p>
          </div>
        </div>

        {/* Actions (hover) */}
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

      {/* ── BODY: Phone Mockup + SIM Slots ── */}
      <div className="px-5 py-5">
        <div className="flex items-start gap-4">
          {/* Phone mockup */}
          <div className="flex-shrink-0">
            <PhoneMockup deviceName={device.nombre} sims={device.sims} timeStr={timeStr} />
          </div>

          {/* SIM slot grid */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Physical slots */}
            {Array.from({ length: capacity.physical }).map((_, i) => {
              const sim = physicalSims[i] || null;
              const slotKey = `phys-${i}`;
              return (
                <PhoneSimSlot
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
                <PhoneSimSlot
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
        </div>
      </div>

      {/* ── ACCOUNTS FOOTER ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="px-5 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {device.accounts.map((account) => (
            <div key={account.id} className="relative group/acc">
              <button
                onClick={() => setShowAccountEmail(showAccountEmail === account.id ? null : account.id)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <PlatformIcon plataforma={account.plataforma} size={30} />
              </button>

              <AnimatePresence>
                {showAccountEmail === account.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.93 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.93 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 min-w-[160px]"
                  >
                    <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                      <div className="px-3 py-2.5">
                        <p className="text-[11px] font-semibold mb-0.5" style={{ color: '#a5b4fc' }}>{account.plataforma}</p>
                        <div className="flex items-center gap-1">
                          <p className="text-[11px] truncate max-w-[120px]" style={{ color: '#888' }}>{account.usuarioEmail}</p>
                          <CopyButton text={account.usuarioEmail} />
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} className="px-3 py-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteAccount(account.id); setShowAccountEmail(null); }}
                          className="flex items-center gap-1 text-[10px] transition-colors"
                          style={{ color: '#f87171' }}
                        >
                          <X size={9} />
                          Eliminar cuenta
                        </button>
                      </div>
                    </div>
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-[#1a1a1a]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <button
            onClick={onAddAccount}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-all"
            style={{ border: '1px dashed rgba(255,255,255,0.08)', color: '#333' }}
            title="Agregar cuenta"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)'; (e.currentTarget as HTMLElement).style.color = '#818cf8'; (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#333'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Plus size={13} />
          </button>

          {device.accounts.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-auto flex items-center gap-1 text-[11px] transition-colors"
              style={{ color: '#333' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#888'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#333'; }}
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {device.accounts.length} cuenta{device.accounts.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>

        {/* Expanded accounts list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-1">
                {device.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.035)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <PlatformIcon plataforma={account.plataforma} size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: '#aaa' }}>{account.plataforma}</p>
                      <p className="text-[11px] truncate" style={{ color: '#444' }}>{account.usuarioEmail}</p>
                    </div>
                    <CopyButton text={account.usuarioEmail} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Phone Mockup ────────────────────────────────────────────────────────────
function PhoneMockup({ deviceName, sims, timeStr }: {
  deviceName: string; sims: Sim[]; timeStr: string;
}) {
  const primarySim = sims[0];
  const accent = primarySim ? getAccent(primarySim.compania) : DEFAULT_ACCENT;

  return (
    <div className="phone-mockup animate-float" style={{ width: 76, minHeight: 136 }}>
      <div className="phone-screen" style={{ minHeight: 126 }}>
        {/* Dynamic Island */}
        <div className="phone-island" style={{ width: 52, height: 14, top: 5, borderRadius: 10 }} />

        <div className="flex flex-col h-full pt-5 px-2 pb-1.5">
          {/* Time */}
          <div className="text-center mt-1">
            <span className="text-[9px] font-mono font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {timeStr}
            </span>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between mt-1 px-0.5">
            <Signal size={7} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <div className="flex gap-0.5">
              <Wifi size={7} style={{ color: 'rgba(255,255,255,0.4)' }} />
              <Battery size={7} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>

          {/* SIM indicators */}
          <div className="flex-1 flex flex-col justify-center gap-1 mt-2">
            {sims.length === 0 ? (
              <div className="text-center">
                <div
                  className="mx-auto h-5 w-5 rounded-lg flex items-center justify-center mb-1"
                  style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
                >
                  <Plus size={9} style={{ color: 'rgba(255,255,255,0.15)' }} />
                </div>
                <span className="text-[7px]" style={{ color: 'rgba(255,255,255,0.15)' }}>Sin SIM</span>
              </div>
            ) : (
              sims.map((sim) => {
                const a = getAccent(sim.compania);
                const r = getRechargeStatus(sim.fechaUltimaRecarga);
                return (
                  <div
                    key={sim.id}
                    className="rounded-lg px-1.5 py-1"
                    style={{
                      background: `linear-gradient(135deg, ${a.from}28, ${a.to}18)`,
                      border: `1px solid ${a.from}45`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[6.5px] font-bold uppercase tracking-wide truncate"
                        style={{ maxWidth: 28, color: a.text }}
                      >
                        {sim.compania}
                      </span>
                      {(r.isUrgent || r.isExpired) && (
                        <span className="text-[7px] text-red-400">!</span>
                      )}
                    </div>
                    <span
                      className="font-mono block mt-0.5 leading-none"
                      style={{ fontSize: 7, color: 'rgba(255,255,255,0.65)' }}
                    >
                      ···{sim.numero.slice(-4)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Home bar */}
          <div className="flex justify-center mt-1">
            <div className="h-0.5 w-5 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
