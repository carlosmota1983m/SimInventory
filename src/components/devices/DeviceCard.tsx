'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Edit3, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Device, Sim, SlotConfig } from '@/types';
import { SLOT_CONFIG_LABELS, SLOT_CAPACITY } from '@/types';
import CompanyBadge from '@/components/shared/CompanyBadge';
import CopyButton from '@/components/shared/CopyButton';
import PlatformIcon from '@/components/shared/PlatformIcon';
import { getRechargeStatus } from '@/lib/utils';
import { getCarrierColors } from '@/lib/constants';
import { Shield } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
  onEdit: () => void;
  onDelete: () => void;
  onAssignSim: (slotType: 'FISICA' | 'ESIM') => void;
  onUnlinkSim: (sim: Sim) => void;
  onAddAccount: () => void;
  onDeleteAccount: (accountId: string) => void;
}

export default function DeviceCard({
  device,
  onEdit,
  onDelete,
  onAssignSim,
  onUnlinkSim,
  onAddAccount,
  onDeleteAccount,
}: DeviceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAccountEmail, setShowAccountEmail] = useState<string | null>(null);
  const capacity = SLOT_CAPACITY[device.configuracionSlots];

  const physicalSims = device.sims.filter((s) => s.tipo === 'FISICA');
  const esimSims = device.sims.filter((s) => s.tipo === 'ESIM');

  const renderSlot = (sim: Sim | null, type: 'FISICA' | 'ESIM', index: number) => {
    if (sim) {
      const recharge = getRechargeStatus(sim.fechaUltimaRecarga);
      const colors = getCarrierColors(sim.compania);

      return (
        <div
          key={sim.id}
          className={`relative rounded-xl border ${colors.border} ${colors.bg} p-3 transition-all`}
        >
          {/* Recharge alert */}
          {(recharge.isUrgent || recharge.isExpired) && (
            <div className={`absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              recharge.isExpired ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-black'
            }`}>
              {recharge.isExpired ? '¡VENCIDO!' : `${recharge.daysUntilExpiry}d`}
            </div>
          )}

          <div className="flex items-center justify-between mb-1">
            <CompanyBadge compania={sim.compania} />
            {sim.registroGubernamental && (
              <span title="Registro gubernamental"><Shield size={14} className="text-amber-400" /></span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-2">
            <span className="text-sm font-mono text-white">{sim.numero}</span>
            <CopyButton text={sim.numero} label="número" />
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-zinc-500">
              {type === 'ESIM' ? 'eSIM' : 'Física'} · Slot {index + 1}
            </span>
            <button
              onClick={() => onUnlinkSim(sim)}
              className="rounded-lg p-1 text-zinc-600 transition-colors hover:bg-red-500/20 hover:text-red-400"
              title="Desvincular SIM"
            >
              <ChevronUp size={14} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        key={`empty-${type}-${index}`}
        onClick={() => onAssignSim(type)}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 p-4 text-zinc-600 transition-all hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-violet-400"
      >
        <Plus size={20} />
        <span className="text-xs font-medium">Asignar {type === 'ESIM' ? 'eSIM' : 'SIM'}</span>
      </button>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 text-violet-400">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{device.nombre}</h3>
            <p className="text-xs text-zinc-500">{SLOT_CONFIG_LABELS[device.configuracionSlots]}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* SIM Slots */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Physical slots */}
          {Array.from({ length: capacity.physical }).map((_, i) =>
            renderSlot(physicalSims[i] || null, 'FISICA', i)
          )}
          {/* eSIM slots */}
          {Array.from({ length: capacity.esim }).map((_, i) =>
            renderSlot(esimSims[i] || null, 'ESIM', i)
          )}
        </div>
      </div>

      {/* Account Bubbles Footer */}
      <div className="border-t border-white/[0.06] px-5 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {device.accounts.map((account) => (
            <div key={account.id} className="relative group/acc">
              <button
                onClick={() => setShowAccountEmail(showAccountEmail === account.id ? null : account.id)}
                className="relative transition-transform hover:scale-110 active:scale-95"
              >
                <PlatformIcon plataforma={account.plataforma} size={34} />
              </button>

              <AnimatePresence>
                {showAccountEmail === account.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 whitespace-nowrap rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2 shadow-xl"
                  >
                    <p className="text-[11px] font-semibold text-violet-300">{account.plataforma}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-zinc-300">{account.usuarioEmail}</p>
                      <CopyButton text={account.usuarioEmail} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAccount(account.id);
                      }}
                      className="mt-1 text-[10px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      Eliminar cuenta
                    </button>
                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1a1a2e]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <button
            onClick={onAddAccount}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-dashed border-white/15 text-zinc-600 transition-all hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-400"
            title="Agregar cuenta"
          >
            <Plus size={16} />
          </button>
        </div>

        {device.accounts.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {device.accounts.length} cuenta{device.accounts.length !== 1 ? 's' : ''}
          </button>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1.5">
                {device.accounts.map((account) => (
                  <div key={account.id} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                    <PlatformIcon plataforma={account.plataforma} size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300 truncate">{account.plataforma}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{account.usuarioEmail}</p>
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
