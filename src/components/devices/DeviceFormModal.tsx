'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { SlotConfig } from '@/types';
import { SLOT_CONFIG_LABELS } from '@/types';

interface DeviceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nombre: string; configuracionSlots: SlotConfig }) => Promise<void>;
  initialData?: { nombre: string; configuracionSlots: SlotConfig };
  title?: string;
}

const slotOptions: { value: SlotConfig; label: string }[] = [
  { value: 'ONE_PHYSICAL', label: SLOT_CONFIG_LABELS.ONE_PHYSICAL },
  { value: 'TWO_PHYSICAL', label: SLOT_CONFIG_LABELS.TWO_PHYSICAL },
  { value: 'ONE_PHYS_ONE_ESIM', label: SLOT_CONFIG_LABELS.ONE_PHYS_ONE_ESIM },
  { value: 'TWO_ESIM', label: SLOT_CONFIG_LABELS.TWO_ESIM },
];

export default function DeviceFormModal({ isOpen, onClose, onSubmit, initialData, title }: DeviceFormModalProps) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? '');
  const [configuracionSlots, setConfiguracionSlots] = useState<SlotConfig>(initialData?.configuracionSlots ?? 'ONE_PHYS_ONE_ESIM');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ nombre: nombre.trim(), configuracionSlots });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1a2e]/95 p-6 shadow-2xl backdrop-blur-xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">{title || 'Nuevo Dispositivo'}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Nombre del dispositivo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="iPhone 13 Pro, Samsung S24..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Configuración de Slots</label>
            <div className="grid grid-cols-2 gap-3">
              {slotOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfiguracionSlots(opt.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    configuracionSlots === opt.value
                      ? 'border-violet-500/60 bg-violet-500/20 text-violet-300 shadow-lg shadow-violet-500/10'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !nombre.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Dispositivo'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
