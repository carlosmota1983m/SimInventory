'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Sim } from '@/types';
import CompanyBadge from '@/components/shared/CompanyBadge';
import { getCarrierColors } from '@/lib/constants';

interface SimAssignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableSims: Sim[];
  slotType: 'FISICA' | 'ESIM';
  onSelect: (simId: string) => Promise<void>;
}

export default function SimAssignDrawer({ isOpen, onClose, availableSims, slotType, onSelect }: SimAssignDrawerProps) {
  const [selecting, setSelecting] = useState<string | null>(null);

  const filteredSims = availableSims.filter((s) => s.tipo === slotType);

  if (!isOpen) return null;

  const handleSelect = async (simId: string) => {
    setSelecting(simId);
    try {
      await onSelect(simId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSelecting(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-white/10 bg-[#1a1a2e]/98 p-6 shadow-2xl backdrop-blur-xl max-h-[70vh] overflow-y-auto"
      >
        {/* Drag handle */}
        <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-white/20" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">Cajón de SIMs</h3>
            <p className="text-sm text-zinc-500">
              {slotType === 'ESIM' ? 'eSIMs' : 'SIMs Físicas'} disponibles · {filteredSims.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {filteredSims.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-zinc-500">No hay {slotType === 'ESIM' ? 'eSIMs' : 'SIMs físicas'} en el cajón</p>
            <p className="text-xs text-zinc-600 mt-1">Crea una nueva SIM primero</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSims.map((sim) => {
              const colors = getCarrierColors(sim.compania);
              return (
                <button
                  key={sim.id}
                  onClick={() => handleSelect(sim.id)}
                  disabled={selecting === sim.id}
                  className={`w-full text-left rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between">
                    <CompanyBadge compania={sim.compania} />
                    <span className="text-xs text-zinc-500">{sim.tipo === 'ESIM' ? 'eSIM' : 'Física'}</span>
                  </div>
                  <p className="mt-2 text-lg font-mono text-white">{sim.numero}</p>
                  {sim.ssidIccid && (
                    <p className="text-xs text-zinc-500 font-mono mt-1">ICCID: {sim.ssidIccid}</p>
                  )}
                  {selecting === sim.id && (
                    <p className="text-xs text-violet-400 mt-2 animate-pulse">Asignando...</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
