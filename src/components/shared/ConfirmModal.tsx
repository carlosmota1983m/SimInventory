'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const isDanger = variant === 'danger';

  const colors = isDanger
    ? {
        iconBg: 'rgba(127,29,29,0.4)',
        iconBorder: 'rgba(220,38,38,0.3)',
        iconColor: '#f87171',
        btnBg: 'linear-gradient(135deg, #b91c1c, #dc2626)',
        btnShadow: '0 4px 20px rgba(220,38,38,0.35)',
        btnHoverBg: 'linear-gradient(135deg, #dc2626, #ef4444)',
      }
    : {
        iconBg: 'rgba(120,53,15,0.4)',
        iconBorder: 'rgba(217,119,6,0.3)',
        iconColor: '#fbbf24',
        btnBg: 'linear-gradient(135deg, #b45309, #d97706)',
        btnShadow: '0 4px 20px rgba(217,119,6,0.35)',
        btnHoverBg: 'linear-gradient(135deg, #d97706, #f59e0b)',
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: '#111113',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: `0 32px 80px rgba(0,0,0,0.7), ${colors.btnShadow.replace('0 4px 20px', '0 0 60px')}`,
            }}
          >
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-600 transition-all hover:bg-white/8 hover:text-zinc-300"
            >
              <X size={16} />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: colors.iconBg, border: `1px solid ${colors.iconBorder}` }}
              >
                <AlertTriangle size={26} style={{ color: colors.iconColor }} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>

              {/* Actions */}
              <div className="mt-6 flex gap-2.5">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium text-zinc-300 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  {cancelLabel}
                </button>

                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-all"
                  style={{
                    background: colors.btnBg,
                    boxShadow: colors.btnShadow,
                    border: `1px solid ${colors.iconBorder}`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = colors.btnHoverBg; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = colors.btnBg; }}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
