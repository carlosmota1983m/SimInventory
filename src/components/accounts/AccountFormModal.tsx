'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users } from 'lucide-react';
import type { Device } from '@/types';
import { getPlatformLogoUrl } from '@/lib/constants';

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
      await onSubmit({
        dispositivoId,
        plataforma: plataforma.trim(),
        usuarioEmail: usuarioEmail.trim(),
        notas: notas.trim() || undefined,
      });
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
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
        style={{
          background: '#111113',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #16423025, #16a34a15)', border: '1px solid #16a34a30' }}
            >
              <Users size={18} className="text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title || 'Nueva Cuenta'}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 transition-all hover:bg-white/8 hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Device selector */}
            {!preselectedDeviceId && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Dispositivo <span className="text-red-400">*</span>
                </label>
                <select
                  value={dispositivoId}
                  onChange={(e) => setDispositivoId(e.target.value)}
                  className="input-base text-sm appearance-none"
                  style={{ background: '#27272a' }}
                  required
                >
                  <option value="" style={{ background: '#1c1c1f' }}>Seleccionar dispositivo...</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id} style={{ background: '#1c1c1f' }}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Platform with suggestions */}
            <div className="relative">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Plataforma <span className="text-red-400">*</span>
              </label>

              {/* Platform preview */}
              {plataforma && (
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={getPlatformLogoUrl(plataforma)}
                    alt={plataforma}
                    className="h-6 w-6 rounded-md object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-xs text-zinc-400">{plataforma}</span>
                </div>
              )}

              <input
                type="text"
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="WhatsApp, Amazon, TikTok..."
                className="input-base text-sm"
                required
              />

              {showSuggestions && filteredPlatforms.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 z-10 mt-1.5 overflow-hidden rounded-xl shadow-2xl"
                  style={{
                    background: '#1c1c1f',
                    border: '1px solid rgba(255,255,255,0.08)',
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {filteredPlatforms.slice(0, 8).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onMouseDown={() => { setPlataforma(p); setShowSuggestions(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <img
                        src={getPlatformLogoUrl(p)}
                        alt={p}
                        className="h-5 w-5 rounded object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email / Username */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email / Usuario <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={usuarioEmail}
                onChange={(e) => setUsuarioEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="input-base text-sm"
                required
              />
            </div>

            {/* Comentario */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Comentario <span className="text-zinc-600 font-normal">(opcional)</span>
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Comentarios adicionales..."
                rows={2}
                className="input-base text-sm resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !dispositivoId || !plataforma.trim() || !usuarioEmail.trim()}
              className="btn-primary w-full text-sm py-3"
            >
              {submitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
