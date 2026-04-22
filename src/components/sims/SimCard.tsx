'use client';

import { motion } from 'framer-motion';
import { Shield, Trash2, Edit3, Unlink, Calendar } from 'lucide-react';
import type { Sim } from '@/types';
import CompanyBadge from '@/components/shared/CompanyBadge';
import CopyButton from '@/components/shared/CopyButton';
import { getCarrierColors } from '@/lib/constants';
import { getRechargeStatus, formatDate } from '@/lib/utils';

interface SimCardProps {
  sim: Sim;
  onEdit: () => void;
  onDelete: () => void;
  onUnlink?: () => void;
}

export default function SimCard({ sim, onEdit, onDelete, onUnlink }: SimCardProps) {
  const colors = getCarrierColors(sim.compania);
  const recharge = getRechargeStatus(sim.fechaUltimaRecarga);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg} shadow-lg ${colors.glow} transition-all hover:shadow-xl`}
    >
      {/* SIM card cut corner effect */}
      <div
        className="absolute top-0 right-0 w-0 h-0"
        style={{
          borderLeft: '24px solid transparent',
          borderTop: `24px solid #121212`,
        }}
      />

      {/* Recharge alert strip */}
      {(recharge.isUrgent || recharge.isExpired) && (
        <div className={`px-4 py-1.5 text-xs font-bold text-center ${
          recharge.isExpired
            ? 'bg-red-600/30 text-red-300 animate-pulse'
            : 'bg-amber-500/20 text-amber-300'
        }`}>
          ⚠ {recharge.label}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <CompanyBadge compania={sim.compania} />
          <div className="flex items-center gap-1">
            {sim.registroGubernamental && (
              <div className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-400" title="Registro Gubernamental">
                <Shield size={12} />
                <span className="text-[10px] font-semibold">REG</span>
              </div>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              sim.tipo === 'ESIM'
                ? 'bg-cyan-500/15 text-cyan-400'
                : 'bg-zinc-500/15 text-zinc-400'
            }`}>
              {sim.tipo === 'ESIM' ? 'eSIM' : 'Física'}
            </span>
          </div>
        </div>

        {/* Number */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-mono font-bold text-white tracking-wider">{sim.numero}</span>
          <CopyButton text={sim.numero} label="número" />
        </div>

        {/* Details grid */}
        <div className="space-y-2 text-sm">
          {sim.ssidIccid && (
            <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
              <span className="text-zinc-500 text-xs">ICCID</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs text-zinc-300">{sim.ssidIccid}</span>
                <CopyButton text={sim.ssidIccid} label="ICCID" />
              </div>
            </div>
          )}

          {sim.pin && (
            <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
              <span className="text-zinc-500 text-xs">PIN</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs text-zinc-300">{sim.pin}</span>
                <CopyButton text={sim.pin} label="PIN" />
              </div>
            </div>
          )}

          {sim.puk && (
            <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
              <span className="text-zinc-500 text-xs">PUK</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs text-zinc-300">{sim.puk}</span>
                <CopyButton text={sim.puk} label="PUK" />
              </div>
            </div>
          )}

          {sim.fechaUltimaRecarga && (
            <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
              <Calendar size={12} className="text-zinc-500" />
              <span className="text-zinc-500 text-xs">Última recarga:</span>
              <span className={`text-xs font-medium ${
                recharge.isExpired ? 'text-red-400' : recharge.isUrgent ? 'text-amber-400' : 'text-zinc-300'
              }`}>
                {formatDate(sim.fechaUltimaRecarga)}
              </span>
            </div>
          )}

          {sim.dispositivoId && sim.device && (
            <div className="flex items-center gap-2 rounded-lg bg-violet-500/10 px-3 py-2">
              <span className="text-violet-400 text-xs">📱 En:</span>
              <span className="text-xs font-medium text-violet-300">{sim.device.nombre}</span>
            </div>
          )}
        </div>

        {/* QR Image */}
        {sim.imagenQr && (
          <div className="mt-3 flex justify-center">
            <img
              src={sim.imagenQr}
              alt="QR eSIM"
              className="h-24 w-24 rounded-lg border border-white/10 object-contain bg-white/5"
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/5">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <Edit3 size={13} /> Editar
          </button>

          {onUnlink && sim.dispositivoId && (
            <button
              onClick={onUnlink}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 transition-all hover:bg-amber-500/20"
            >
              <Unlink size={13} /> Desvincular
            </button>
          )}

          <button
            onClick={onDelete}
            className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
