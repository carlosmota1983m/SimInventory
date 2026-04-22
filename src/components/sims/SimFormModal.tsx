'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { SimType, Device } from '@/types';

interface SimFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    tipo: SimType;
    numero: string;
    compania: string;
    registroGubernamental: boolean;
    ssidIccid?: string;
    pin?: string;
    puk?: string;
    fechaUltimaRecarga?: string | null;
    dispositivoId?: string | null;
    imagenQr?: string;
  }) => Promise<void>;
  devices: Device[];
  initialData?: {
    tipo: SimType;
    numero: string;
    compania: string;
    registroGubernamental: boolean;
    ssidIccid?: string;
    pin?: string;
    puk?: string;
    fechaUltimaRecarga?: string | null;
    dispositivoId?: string | null;
    imagenQr?: string;
  };
  title?: string;
}

const companias = ['Telcel', 'Movistar', 'AT&T', 'Bait', 'Unefon', 'Virgin'];

export default function SimFormModal({ isOpen, onClose, onSubmit, devices, initialData, title }: SimFormModalProps) {
  const [tipo, setTipo] = useState<SimType>(initialData?.tipo ?? 'FISICA');
  const [numero, setNumero] = useState(initialData?.numero ?? '');
  const [compania, setCompania] = useState(initialData?.compania ?? '');
  const [registroGubernamental, setRegistroGubernamental] = useState(initialData?.registroGubernamental ?? false);
  const [ssidIccid, setSsidIccid] = useState(initialData?.ssidIccid ?? '');
  const [pin, setPin] = useState(initialData?.pin ?? '');
  const [puk, setPuk] = useState(initialData?.puk ?? '');
  const [fechaUltimaRecarga, setFechaUltimaRecarga] = useState(
    initialData?.fechaUltimaRecarga ? initialData.fechaUltimaRecarga.split('T')[0] : ''
  );
  const [dispositivoId, setDispositivoId] = useState(initialData?.dispositivoId ?? '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim() || !compania.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        tipo,
        numero: numero.trim(),
        compania: compania.trim(),
        registroGubernamental,
        ssidIccid: ssidIccid.trim() || undefined,
        pin: pin.trim() || undefined,
        puk: puk.trim() || undefined,
        fechaUltimaRecarga: fechaUltimaRecarga || null,
        dispositivoId: dispositivoId || null,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20";

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

        <h2 className="text-xl font-bold text-white mb-6">{title || 'Nueva SIM'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-3">
              {(['FISICA', 'ESIM'] as SimType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    tipo === t
                      ? 'border-violet-500/60 bg-violet-500/20 text-violet-300 shadow-lg shadow-violet-500/10'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {t === 'ESIM' ? 'eSIM' : 'Física'}
                </button>
              ))}
            </div>
          </div>

          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Número *</label>
            <input
              type="tel"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="55 1234 5678"
              className={inputClass}
              required
            />
          </div>

          {/* Compañía */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Compañía *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {companias.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCompania(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    compania === c
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10 hover:text-zinc-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={compania}
              onChange={(e) => setCompania(e.target.value)}
              placeholder="O escribe otra..."
              className={inputClass}
              required
            />
          </div>

          {/* Registro Gubernamental */}
          <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <input
              type="checkbox"
              checked={registroGubernamental}
              onChange={(e) => setRegistroGubernamental(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
            />
            <div>
              <span className="text-sm font-medium text-zinc-300">🛡️ Registro Gubernamental</span>
              <p className="text-xs text-zinc-600">Esta SIM está registrada ante el gobierno</p>
            </div>
          </label>

          {/* SSID / ICCID */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">SSID / ICCID <span className="text-zinc-600">(opcional)</span></label>
            <input
              type="text"
              value={ssidIccid}
              onChange={(e) => setSsidIccid(e.target.value)}
              placeholder="8952140..."
              className={inputClass}
            />
          </div>

          {/* PIN & PUK side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">PIN</label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">PUK</label>
              <input
                type="text"
                value={puk}
                onChange={(e) => setPuk(e.target.value)}
                placeholder="12345678"
                className={inputClass}
              />
            </div>
          </div>

          {/* Fecha última recarga */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Última recarga <span className="text-zinc-600">(opcional)</span></label>
            <input
              type="date"
              value={fechaUltimaRecarga}
              onChange={(e) => setFechaUltimaRecarga(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
          </div>

          {/* Asignar a dispositivo */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Asignar a dispositivo <span className="text-zinc-600">(opcional)</span></label>
            <select
              value={dispositivoId}
              onChange={(e) => setDispositivoId(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              <option value="" className="bg-[#1a1a2e]">Cajón (sin asignar)</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#1a1a2e]">{d.nombre}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || !numero.trim() || !compania.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear SIM'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
