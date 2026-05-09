'use client';

import { motion } from 'framer-motion';
import { Shield, Trash2, Edit3, Unlink, Calendar, GripVertical } from 'lucide-react';
import type { Sim } from '@/types';
import CopyButton from '@/components/shared/CopyButton';
import { getRechargeStatus, formatDate } from '@/lib/utils';

const CARRIER_ACCENT: Record<string, { from: string; to: string; text: string; dot: string }> = {
  telcel:   { from: '#1d4ed8', to: '#3b82f6', text: '#93c5fd', dot: '#60a5fa' },
  movistar: { from: '#15803d', to: '#22c55e', text: '#86efac', dot: '#4ade80' },
  'at&t':   { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc', dot: '#38bdf8' },
  att:      { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc', dot: '#38bdf8' },
  bait:     { from: '#6d28d9', to: '#a855f7', text: '#d8b4fe', dot: '#c084fc' },
  unefon:   { from: '#c2410c', to: '#f97316', text: '#fdba74', dot: '#fb923c' },
  virgin:   { from: '#9f1239', to: '#ef4444', text: '#fca5a5', dot: '#f87171' },
};
const DEFAULT_ACCENT = { from: '#27272a', to: '#3f3f46', text: '#a1a1aa', dot: '#71717a' };
function getAccent(c: string) { return CARRIER_ACCENT[c.toLowerCase().trim()] ?? DEFAULT_ACCENT; }

interface SimCardProps {
  sim: Sim;
  onEdit: () => void;
  onDelete: () => void;
  onUnlink?: () => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export default function SimCard({ sim, onEdit, onDelete, onUnlink, isDragging, onDragStart }: SimCardProps) {
  const accent = getAccent(sim.compania);
  const recharge = getRechargeStatus(sim.fechaUltimaRecarga);
  const isDrawer = !sim.dispositivoId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: isDragging ? 0.38 : 1, scale: isDragging ? 0.94 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      draggable={isDrawer}
      onDragStart={onDragStart}
      className="group relative overflow-hidden rounded-2xl transition-shadow duration-200"
      style={{
        background: `linear-gradient(148deg, ${accent.from}12 0%, ${accent.to}07 100%)`,
        border: `1px solid ${accent.from}30`,
        cursor: isDrawer ? 'grab' : 'default',
      }}
    >
      {/* Physical SIM corner notch */}
      {sim.tipo === 'FISICA' && (
        <div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderLeft: '18px solid transparent',
            borderTop: `18px solid ${accent.from}55`,
          }}
        />
      )}

      {/* Urgency bar */}
      {(recharge.isUrgent || recharge.isExpired) && (
        <div
          className={`flex items-center justify-center gap-1.5 px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${
            recharge.isExpired ? 'glow-alert text-white' : 'text-amber-900'
          }`}
          style={{
            background: recharge.isExpired
              ? 'linear-gradient(90deg, #7f1d1d, #dc2626)'
              : 'linear-gradient(90deg, #78350f, #d97706)',
          }}
        >
          ⚡ {recharge.label}
        </div>
      )}

      <div className="p-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Drag handle */}
            {isDrawer && (
              <GripVertical
                size={13}
                className="text-zinc-700 group-hover:text-zinc-500 transition-colors -ml-0.5 cursor-grab flex-shrink-0"
              />
            )}
            {/* Carrier */}
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: accent.dot, boxShadow: `0 0 6px ${accent.dot}80` }}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accent.text }}>
                {sim.compania}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {sim.registroGubernamental && (
              <div
                className="flex items-center gap-1 rounded-full px-1.5 py-0.5"
                style={{ background: '#78350f28', border: '1px solid #d9770638' }}
                title="Registro Gubernamental"
              >
                <Shield size={9} className="text-amber-400" />
                <span className="text-[9px] font-bold text-amber-400">REG</span>
              </div>
            )}
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: sim.tipo === 'ESIM' ? 'rgba(6,182,212,0.12)' : `${accent.from}18`,
                color: sim.tipo === 'ESIM' ? '#22d3ee' : accent.text,
                border: `1px solid ${sim.tipo === 'ESIM' ? 'rgba(6,182,212,0.25)' : `${accent.from}35`}`,
              }}
            >
              {sim.tipo === 'ESIM' ? 'eSIM' : 'Física'}
            </span>
          </div>
        </div>

        {/* ── Phone Number ── */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-mono font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.90)' }}>
            {sim.numero}
          </span>
          <CopyButton text={sim.numero} label="número" />
        </div>

        {/* ── Details ── */}
        <div className="space-y-1.5">
          {sim.ssidIccid && (
            <DataRow label="ICCID" value={sim.ssidIccid} mono copyValue={sim.ssidIccid} />
          )}
          {sim.pin && <DataRow label="PIN" value={sim.pin} mono copyValue={sim.pin} />}
          {sim.puk && <DataRow label="PUK" value={sim.puk} mono copyValue={sim.puk} />}

          {sim.fechaUltimaRecarga && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <Calendar size={10} style={{ color: '#444', flexShrink: 0 }} />
              <span className="text-[11px]" style={{ color: '#444', flexShrink: 0 }}>Recarga:</span>
              <span
                className="text-[11px] font-medium"
                style={{
                  color: recharge.isExpired ? '#f87171' : recharge.isUrgent ? '#fbbf24' : '#888',
                }}
              >
                {formatDate(sim.fechaUltimaRecarga)}
              </span>
              {recharge.daysUntilExpiry != null && !recharge.isExpired && (
                <span className="ml-auto text-[10px]" style={{ color: '#333' }}>
                  {recharge.daysUntilExpiry}d
                </span>
              )}
            </div>
          )}

          {sim.dispositivoId && sim.device && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: `${accent.from}12`, border: `1px solid ${accent.from}28` }}
            >
              <span className="text-[10px]">📱</span>
              <span className="text-[11px]" style={{ color: '#555' }}>En:</span>
              <span className="text-[11px] font-semibold" style={{ color: accent.text }}>
                {sim.device.nombre}
              </span>
            </div>
          )}
        </div>

        {/* QR image */}
        {sim.imagenQr && (
          <div className="mt-3 flex justify-center">
            <div className="rounded-xl overflow-hidden p-1.5" style={{ background: 'white' }}>
              <img src={sim.imagenQr} alt="QR eSIM" className="h-20 w-20 object-contain" />
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div
          className="mt-4 flex items-center gap-1.5 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={onEdit}
            className="btn-ghost flex-1 flex items-center justify-center gap-1.5 text-[12px]"
            style={{ paddingTop: 7, paddingBottom: 7 }}
          >
            <Edit3 size={11} />
            Editar
          </button>

          {onUnlink && sim.dispositivoId && (
            <button
              onClick={onUnlink}
              className="flex items-center justify-center gap-1 rounded-xl px-3 text-[12px] font-medium transition-all"
              style={{
                paddingTop: 7, paddingBottom: 7,
                background: 'rgba(120,53,15,0.18)',
                border: '1px solid rgba(217,119,6,0.25)',
                color: '#fbbf24',
              }}
            >
              <Unlink size={11} />
              Desvincular
            </button>
          )}

          <button
            onClick={onDelete}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              padding: 7,
              background: 'rgba(127,29,29,0.12)',
              border: '1px solid rgba(220,38,38,0.2)',
              color: '#f87171',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(127,29,29,0.28)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(127,29,29,0.12)'; }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DataRow({ label, value, mono = false, copyValue }: {
  label: string; value: string; mono?: boolean; copyValue?: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-2"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}
    >
      <span className="text-[11px]" style={{ color: '#444' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-[11px] ${mono ? 'font-mono' : ''}`} style={{ color: '#888' }}>{value}</span>
        {copyValue && <CopyButton text={copyValue} label={label} />}
      </div>
    </div>
  );
}
