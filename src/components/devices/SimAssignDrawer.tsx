'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, CreditCard } from 'lucide-react';
import type { Sim } from '@/types';
import { getCarrierColors } from '@/lib/constants';
import { getRechargeStatus } from '@/lib/utils';

interface SimAssignDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  availableSims: Sim[];
  slotType: 'FISICA' | 'ESIM';
  onSelect: (simId: string) => Promise<void>;
}

const CARRIER_ACCENT: Record<string, { from: string; to: string; text: string }> = {
  telcel:    { from: '#1d4ed8', to: '#3b82f6', text: '#93c5fd' },
  movistar:  { from: '#15803d', to: '#22c55e', text: '#86efac' },
  'at&t':    { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc' },
  att:       { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc' },
  bait:      { from: '#6d28d9', to: '#a855f7', text: '#d8b4fe' },
  unefon:    { from: '#c2410c', to: '#f97316', text: '#fdba74' },
  virgin:    { from: '#9f1239', to: '#ef4444', text: '#fca5a5' },
};
const DEFAULT_ACCENT = { from: '#3f3f46', to: '#52525b', text: '#a1a1aa' };
function getAccent(c: string) { return CARRIER_ACCENT[c.toLowerCase().trim()] ?? DEFAULT_ACCENT; }

export default function SimAssignDrawer({ isOpen, onClose, availableSims, slotType, onSelect }: SimAssignDrawerProps) {
  const [selecting, setSelecting] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredSims = availableSims
    .filter((s) => s.tipo === slotType)
    .filter((s) =>
      s.numero.includes(search) ||
      s.compania.toLowerCase().includes(search.toLowerCase())
    );

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden"
        style={{
          borderRadius: '24px 24px 0 0',
          background: '#111113',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          boxShadow: '0 -24px 80px rgba(0,0,0,0.6)',
          maxHeight: '75vh',
        }}
      >
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {slotType === 'ESIM' ? 'Asignar eSIM' : 'Asignar SIM Física'}
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">
              {filteredSims.length} disponible{filteredSims.length !== 1 ? 's' : ''} en cajón
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2.5 text-zinc-400 transition-all hover:bg-white/8 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        {availableSims.filter((s) => s.tipo === slotType).length > 3 && (
          <div className="px-6 pb-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por número o compañía..."
                className="input-base pl-9 text-sm"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* SIM list */}
        <div className="overflow-y-auto px-6 pb-8 space-y-2.5" style={{ maxHeight: 'calc(75vh - 160px)' }}>
          {filteredSims.length === 0 ? (
            <div className="py-16 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <CreditCard size={28} className="text-zinc-600" />
              </div>
              <p className="text-zinc-400 font-medium">
                No hay {slotType === 'ESIM' ? 'eSIMs' : 'SIMs físicas'} disponibles
              </p>
              <p className="text-sm text-zinc-600 mt-1">Crea una nueva SIM primero</p>
            </div>
          ) : (
            filteredSims.map((sim) => {
              const accent = getAccent(sim.compania);
              const recharge = getRechargeStatus(sim.fechaUltimaRecarga);
              const isSelecting = selecting === sim.id;

              return (
                <motion.button
                  key={sim.id}
                  onClick={() => handleSelect(sim.id)}
                  disabled={isSelecting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full text-left rounded-2xl overflow-hidden transition-all disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${accent.from}14, ${accent.to}08)`,
                    border: `1px solid ${accent.from}35`,
                  }}
                >
                  {/* Urgency strip */}
                  {(recharge.isUrgent || recharge.isExpired) && (
                    <div
                      className="px-4 py-1 text-[10px] font-bold text-center uppercase tracking-widest"
                      style={{
                        background: recharge.isExpired
                          ? 'linear-gradient(90deg, #7f1d1d, #dc2626)'
                          : 'linear-gradient(90deg, #78350f, #d97706)',
                        color: 'white',
                      }}
                    >
                      {recharge.label}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ background: accent.to, boxShadow: `0 0 6px ${accent.to}` }}
                        />
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: accent.text }}>
                          {sim.compania}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                        style={{ background: `${accent.from}25`, color: accent.text }}
                      >
                        {sim.tipo === 'ESIM' ? 'eSIM' : 'Física'}
                      </span>
                    </div>

                    <p className="text-xl font-mono font-bold text-white tracking-wider mb-2">
                      {sim.numero}
                    </p>

                    {sim.ssidIccid && (
                      <p className="text-xs font-mono text-zinc-600">ICCID: {sim.ssidIccid}</p>
                    )}

                    {isSelecting && (
                      <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Asignando...
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
