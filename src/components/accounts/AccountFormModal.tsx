'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Device } from '@/types';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { dispositivoId: string; plataforma: string; usuarioEmail: string; notas?: string }) => Promise<void>;
  devices: Device[];
  preselectedDeviceId?: string;
  initialData?: { plataforma: string; usuarioEmail: string; notas?: string; dispositivoId?: string };
  title?: string;
}

const popularPlatforms = [
  'WhatsApp', 'Amazon', 'TikTok', 'Shein', 'Facebook', 'Instagram',
  'Telegram', 'Twitter', 'Snapchat', 'Spotify', 'Netflix', 'Uber',
  'Didi', 'Rappi', 'Mercado Libre', 'Gmail', 'Outlook', 'PayPal',
  'YouTube', 'Discord', 'Apple', 'Google', 'Temu', 'Banorte', 'BBVA',
];

export default function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  devices,
  preselectedDeviceId,
  initialData,
  title,
}: AccountFormModalProps) {
  const [dispositivoId, setDispositivoId] = useState(preselectedDeviceId || initialData?.dispositivoId || '');
  const [plataforma, setPlataforma] = useState(initialData?.plataforma ?? '');
  const [usuarioEmail, setUsuarioEmail] = useState(initialData?.usuarioEmail ?? '');
  const [notas, setNotas] = useState(initialData?.notas ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  if (!isOpen) return null;

  const filteredPlatforms = plataforma
    ? popularPlatforms.filter((p) => p.toLowerCase().includes(plataforma.toLowerCase()))
    : popularPlatforms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispositivoId || !plataforma.trim() || !usuarioEmail.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ dispositivoId, plataforma: plataforma.trim(), usuarioEmail: usuarioEmail.trim(), notas: notas.trim() || undefined });
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
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a1a2e]/95 p-6 shadow-2xl backdrop-blur-xl max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">{title || 'Nueva Cuenta'}</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!preselectedDeviceId && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Dispositivo</label>
              <select
                value={dispositivoId}
                onChange={(e) => setDispositivoId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 appearance-none"
                required
              >
                <option value="" className="bg-[#1a1a2e]">Seleccionar dispositivo...</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#1a1a2e]">{d.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Plataforma</label>
            <input
              type="text"
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="WhatsApp, Amazon, TikTok..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              required
            />
            {showSuggestions && filteredPlatforms.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a2e] shadow-xl">
                {filteredPlatforms.slice(0, 8).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onMouseDown={() => {
                      setPlataforma(p);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email / Usuario</label>
            <input
              type="text"
              value={usuarioEmail}
              onChange={(e) => setUsuarioEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Notas <span className="text-zinc-600">(opcional)</span></label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !dispositivoId || !plataforma.trim() || !usuarioEmail.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Cuenta'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
