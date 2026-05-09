'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Shield } from 'lucide-react';
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

const CARRIER_DOT: Record<string, string> = {
  Telcel: '#60a5fa',
  Movistar: '#4ade80',
  'AT&T': '#38bdf8',
  Bait: '#c084fc',
  Unefon: '#fb923c',
  Virgin: '#f87171',
};

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
              style={{ background: 'linear-gradient(135deg, #0e7490 30, #06b6d420)', border: '1px solid #0891b230' }}
            >
              <CreditCard size={18} className="text-cyan-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title || 'Nueva SIM'}</h2>
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
            {/* Type toggle */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Tipo de SIM</label>
              <div className="grid grid-cols-2 gap-2">
                {(['FISICA', 'ESIM'] as SimType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className="flex flex-col items-center gap-1.5 rounded-xl py-4 text-sm font-semibold transition-all"
                    style={{
                      background: tipo === t
                        ? t === 'ESIM'
                          ? 'linear-gradient(135deg, #0e749025, #06b6d415)'
                          : 'linear-gradient(135deg, #4338ca25, #6366f115)'
                        : 'rgba(255,255,255,0.03)',
                      border: tipo === t
                        ? `1px solid ${t === 'ESIM' ? '#0891b250' : 'rgba(99,102,241,0.5)'}`
                        : '1px solid rgba(255,255,255,0.07)',
                      color: tipo === t
                        ? t === 'ESIM' ? '#22d3ee' : '#a5b4fc'
                        : '#71717a',
                    }}
                  >
                    <span className="text-xl">{t === 'ESIM' ? '📡' : '💳'}</span>
                    {t === 'ESIM' ? 'eSIM' : 'Física'}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone number */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Número <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="55 1234 5678"
                className="input-base font-mono text-base tracking-wider"
                required
              />
            </div>

            {/* Carrier */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Compañía <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {companias.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCompania(c)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      background: compania === c ? `${CARRIER_DOT[c] || '#6366f1'}20` : 'rgba(255,255,255,0.04)',
                      border: compania === c
                        ? `1px solid ${CARRIER_DOT[c] || '#6366f1'}50`
                        : '1px solid rgba(255,255,255,0.07)',
                      color: compania === c ? CARRIER_DOT[c] || '#a5b4fc' : '#71717a',
                    }}
                  >
                    {CARRIER_DOT[c] && (
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: CARRIER_DOT[c] }}
                      />
                    )}
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={compania}
                onChange={(e) => setCompania(e.target.value)}
                placeholder="O escribe otra compañía..."
                className="input-base text-sm"
                required
              />
            </div>

            {/* Governmental registration */}
            <label
              className="flex items-center gap-3 cursor-pointer rounded-xl px-4 py-3 transition-all"
              style={{
                background: registroGubernamental ? '#78350f15' : 'rgba(255,255,255,0.03)',
                border: registroGubernamental ? '1px solid #d9770630' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <input
                type="checkbox"
                checked={registroGubernamental}
                onChange={(e) => setRegistroGubernamental(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent text-amber-500 focus:ring-amber-500"
              />
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium text-zinc-200">Registro Gubernamental</span>
                  <p className="text-[11px] text-zinc-600 mt-0.5">Esta SIM está registrada ante el gobierno</p>
                </div>
              </div>
            </label>

            {/* ICCID */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                SSID / ICCID <span className="text-zinc-600 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={ssidIccid}
                onChange={(e) => setSsidIccid(e.target.value)}
                placeholder="8952140..."
                className="input-base font-mono text-sm"
              />
            </div>

            {/* PIN & PUK */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">PIN</label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="input-base font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">PUK</label>
                <input
                  type="text"
                  value={puk}
                  onChange={(e) => setPuk(e.target.value)}
                  placeholder="12345678"
                  className="input-base font-mono text-sm"
                />
              </div>
            </div>

            {/* Last recharge */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Última recarga <span className="text-zinc-600 font-normal">(opcional)</span>
              </label>
              <input
                type="date"
                value={fechaUltimaRecarga}
                onChange={(e) => setFechaUltimaRecarga(e.target.value)}
                className="input-base [color-scheme:dark] text-sm"
              />
            </div>

            {/* Assign to device */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Asignar a dispositivo <span className="text-zinc-600 font-normal">(opcional)</span>
              </label>
              <select
                value={dispositivoId}
                onChange={(e) => setDispositivoId(e.target.value)}
                className="input-base text-sm appearance-none"
                style={{ background: '#27272a' }}
              >
                <option value="" style={{ background: '#1c1c1f' }}>En cajón (sin asignar)</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id} style={{ background: '#1c1c1f' }}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !numero.trim() || !compania.trim()}
              className="btn-primary w-full text-sm py-3"
            >
              {submitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear SIM'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
