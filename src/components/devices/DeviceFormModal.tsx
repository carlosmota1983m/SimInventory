'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, CreditCard, ChevronDown } from 'lucide-react';
import type { SlotConfig } from '@/types';
import { SLOT_CONFIG_LABELS } from '@/types';

interface DeviceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nombre: string; configuracionSlots: SlotConfig }) => Promise<void>;
  initialData?: { nombre: string; configuracionSlots: SlotConfig };
  title?: string;
}

const slotOptions: { value: SlotConfig; label: string; desc: string; icon: string }[] = [
  { value: 'ONE_PHYSICAL', label: '1 Físico', desc: '1 slot para SIM física', icon: '📱' },
  { value: 'TWO_PHYSICAL', label: '2 Físicos', desc: '2 slots para SIM física', icon: '📱' },
  { value: 'ONE_PHYS_ONE_ESIM', label: '1 Físico + eSIM', desc: '1 SIM + 1 eSIM', icon: '📶' },
  { value: 'TWO_ESIM', label: 'SIN SIM', desc: 'Sin slots para SIM', icon: '🚫' },
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: '#111113',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #4338ca30, #6366f120)', border: '1px solid #6366f130' }}
            >
              <Smartphone size={18} className="text-indigo-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title || 'Nuevo Dispositivo'}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 transition-all hover:bg-white/8 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Device name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Nombre del dispositivo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="iPhone 15 Pro, Galaxy S24..."
              className="input-base"
              autoFocus
              required
            />
          </div>

          {/* Slot configuration */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Configuración de slots
            </label>
            <div className="grid grid-cols-2 gap-2">
              {slotOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfiguracionSlots(opt.value)}
                  className="relative flex flex-col items-start gap-1 rounded-xl px-4 py-3 text-left transition-all"
                  style={{
                    background: configuracionSlots === opt.value
                      ? 'linear-gradient(135deg, #4338ca25, #6366f115)'
                      : 'rgba(255,255,255,0.03)',
                    border: configuracionSlots === opt.value
                      ? '1px solid rgba(99,102,241,0.5)'
                      : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: configuracionSlots === opt.value
                      ? '0 0 0 2px rgba(99,102,241,0.1), inset 0 1px 0 rgba(99,102,241,0.1)'
                      : 'none',
                  }}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: configuracionSlots === opt.value ? '#a5b4fc' : '#d4d4d8' }}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[11px] text-zinc-600">{opt.desc}</span>
                  {configuracionSlots === opt.value && (
                    <div
                      className="absolute right-2 top-2 h-2 w-2 rounded-full"
                      style={{ background: '#818cf8' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !nombre.trim()}
            className="btn-primary w-full text-sm py-3"
          >
            {submitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Dispositivo'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
