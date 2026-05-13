'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Trash2, Edit3, Unlink, Calendar, GripVertical,
  CreditCard, Smartphone, Archive, Check, Clock, Zap
} from 'lucide-react';
import type { Sim, Device } from '@/types';
import CopyButton from '@/components/shared/CopyButton';
import { getRechargeStatus, formatDate } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

interface SimGridProps {
  sims: Sim[];
  viewMode: ViewMode;
  onEdit: (sim: Sim) => void;
  onDelete: (sim: Sim) => void;
  onUnlink?: (sim: Sim) => void;
  draggedSimId: string | null;
  onDragStart: (simId: string, simType: string) => void;
  onDragEnd: () => void;
}

const CARRIER_ACCENT: Record<string, { from: string; to: string; text: string; dot: string }> = {
  telcel:   { from: '#1d4ed8', to: '#3b82f6', text: '#93c5fd', dot: '#60a5fa' },
  movistar: { from: '#15803d', to: '#22c55e', text: '#86efac', dot: '#4ade80' },
  'at&t':   { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc', dot: '#38bdf8' },
  att:      { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc', dot: '#38bdf8' },
  bait:     { from: '#6d28d9', to: '#a855f7', text: '#d8b4fe', dot: '#c084fc' },
  unefon:   { from: '#c2410c', to: '#f97316', text: '#fdba74', dot: '#fb923c' },
  virgin:   { from: '#9f1239', to: '#ef4444', text: '#fca5a5', dot: '#f87171' },
};

const DEFAULT_ACCENT = { from: '#27272a', to: '#3f3f46', text: '#a1a1aa', dot: '#71717a' };

function getAccent(carrier: string) {
  return CARRIER_ACCENT[carrier.toLowerCase().trim()] ?? DEFAULT_ACCENT;
}

export default function SimGrid({
  sims,
  viewMode,
  onEdit,
  onDelete,
  onUnlink,
  draggedSimId,
  onDragStart,
  onDragEnd,
}: SimGridProps) {
  const drawerSims = sims.filter(s => !s.dispositivoId);
  const assignedSims = sims.filter(s => s.dispositivoId);

  if (sims.length === 0) {
    return (
      <div className="sim-grid-empty">
        <div className="empty-icon">
          <CreditCard size={48} />
        </div>
        <h3>Sin SIMs</h3>
        <p>Agrega tu primera SIM o eSIM para comenzar a gestionarlas.</p>
      </div>
    );
  }

  return (
    <div className="sim-container">
      {/* Drawer Section */}
      {drawerSims.length > 0 && (
        <section className="sim-section">
          <div className="sim-section-header">
            <div className="sim-section-title">
              <Archive size={14} />
              <span>Cajón</span>
            </div>
            <span className="sim-section-count">{drawerSims.length}</span>
            <span className="sim-section-hint">Arrastra al dispositivo para asignar</span>
          </div>
          <div className={viewMode === 'grid' ? 'sim-grid' : 'sim-list'}>
            <AnimatePresence>
              {drawerSims.map((sim, index) => (
                <SimCard
                  key={sim.id}
                  sim={sim}
                  index={index}
                  viewMode={viewMode}
                  onEdit={() => onEdit(sim)}
                  onDelete={() => onDelete(sim)}
                  isDragging={draggedSimId === sim.id}
                  onDragStart={() => onDragStart(sim.id, sim.tipo)}
                  onDragEnd={onDragEnd}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Assigned Section */}
      {assignedSims.length > 0 && (
        <section className="sim-section">
          <div className="sim-section-header">
            <div className="sim-section-title">
              <Smartphone size={14} />
              <span>Asignadas</span>
            </div>
            <span className="sim-section-count">{assignedSims.length}</span>
          </div>
          <div className={viewMode === 'grid' ? 'sim-grid' : 'sim-list'}>
            <AnimatePresence>
              {assignedSims.map((sim, index) => (
                <SimCard
                  key={sim.id}
                  sim={sim}
                  index={index}
                  viewMode={viewMode}
                  onEdit={() => onEdit(sim)}
                  onDelete={() => onDelete(sim)}
                  onUnlink={onUnlink ? () => onUnlink(sim) : undefined}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
}

function SimCard({
  sim,
  index,
  viewMode,
  onEdit,
  onDelete,
  onUnlink,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  sim: Sim;
  index: number;
  viewMode: ViewMode;
  onEdit: () => void;
  onDelete: () => void;
  onUnlink?: () => void;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const accent = getAccent(sim.compania);
  const recharge = getRechargeStatus(sim.fechaUltimaRecarga);
  const isDrawer = !sim.dispositivoId;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('simId', sim.id);
    e.dataTransfer.setData('simType', sim.tipo);
    if (onDragStart) onDragStart();
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        className="sim-list-item"
        style={{
          background: `linear-gradient(90deg, ${accent.from}10, transparent)`,
          borderColor: `${accent.from}30`,
        }}
        draggable={isDrawer}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
      >
        {/* Carrier */}
        <div className="sim-list-carrier">
          <div className="sim-list-dot" style={{ background: accent.dot, boxShadow: `0 0 8px ${accent.dot}` }} />
          <span style={{ color: accent.text }}>{sim.compania}</span>
          <span 
            className="sim-list-type"
            style={{ 
              background: sim.tipo === 'ESIM' ? 'rgba(6,182,212,0.15)' : `${accent.from}20`,
              color: sim.tipo === 'ESIM' ? '#22d3ee' : accent.text,
            }}
          >
            {sim.tipo === 'ESIM' ? 'eSIM' : 'Física'}
          </span>
          {sim.registroGubernamental && (
            <div className="sim-list-reg" title="Registro Gubernamental">
              <Shield size={10} />
            </div>
          )}
        </div>

        {/* Number */}
        <div className="sim-list-number">
          <span>{sim.numero}</span>
          <CopyButton text={sim.numero} />
        </div>

        {/* Device */}
        {sim.device && (
          <div className="sim-list-device">
            <Smartphone size={12} />
            <span>{sim.device.nombre}</span>
          </div>
        )}

        {/* Status */}
        {recharge.daysUntilExpiry != null && (
          <div className={`sim-list-status ${recharge.isExpired ? 'expired' : recharge.isUrgent ? 'urgent' : ''}`}>
            {recharge.isExpired ? <Zap size={10} /> : recharge.isUrgent ? <Clock size={10} /> : <Check size={10} />}
            <span>
              {recharge.isExpired ? 'Vencida' : recharge.isUrgent ? `${recharge.daysUntilExpiry}d` : `${recharge.daysUntilExpiry}d`}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="sim-list-actions">
          <button onClick={onEdit} className="sim-action-btn" title="Editar">
            <Edit3 size={12} />
          </button>
          {onUnlink && sim.dispositivoId && (
            <button onClick={onUnlink} className="sim-action-btn sim-action-warning" title="Desvincular">
              <Unlink size={12} />
            </button>
          )}
          <button onClick={onDelete} className="sim-action-btn sim-action-danger" title="Eliminar">
            <Trash2 size={12} />
          </button>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 0.95 : 1,
        y: isDragging ? 5 : 0
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
      className="sim-card"
      style={{
        background: `linear-gradient(148deg, ${accent.from}15 0%, ${accent.to}08 100%)`,
        borderColor: `${accent.from}35`,
      }}
      draggable={isDrawer}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Corner Notch for Physical SIM */}
      {sim.tipo === 'FISICA' && (
        <div className="sim-card-notch" style={{ borderTopColor: accent.from }} />
      )}

      {/* Urgent Banner */}
      {(recharge.isUrgent || recharge.isExpired) && (
        <div className={`sim-card-banner ${recharge.isExpired ? 'expired' : 'urgent'}`}>
          <Zap size={10} />
          <span>{recharge.label}</span>
        </div>
      )}

      <div className="sim-card-content">
        {/* Header */}
        <div className="sim-card-header">
          <div className="sim-card-carrier">
            {isDrawer && (
              <GripVertical size={12} className="sim-card-drag-handle" />
            )}
            <div className="sim-card-dot" style={{ background: accent.dot, boxShadow: `0 0 6px ${accent.dot}` }} />
            <span style={{ color: accent.text }}>{sim.compania}</span>
          </div>
          <div className="sim-card-badges">
            {sim.registroGubernamental && (
              <div className="sim-card-reg" title="Registro Gubernamental">
                <Shield size={9} />
                <span>REG</span>
              </div>
            )}
            <span 
              className="sim-card-type"
              style={{ 
                background: sim.tipo === 'ESIM' ? 'rgba(6,182,212,0.12)' : `${accent.from}20`,
                color: sim.tipo === 'ESIM' ? '#22d3ee' : accent.text,
                borderColor: sim.tipo === 'ESIM' ? 'rgba(6,182,212,0.25)' : `${accent.from}40`,
              }}
            >
              {sim.tipo === 'ESIM' ? 'eSIM' : 'Física'}
            </span>
          </div>
        </div>

        {/* Number */}
        <div className="sim-card-number">
          <span>{sim.numero}</span>
          <CopyButton text={sim.numero} />
        </div>

        {/* Details */}
        <div className="sim-card-details">
          {sim.ssidIccid && (
            <div className="sim-card-row">
              <span className="sim-card-label">ICCID</span>
              <span className="sim-card-value mono">{sim.ssidIccid}</span>
              <CopyButton text={sim.ssidIccid} />
            </div>
          )}
          
          {sim.fechaUltimaRecarga && (
            <div className="sim-card-row">
              <Calendar size={10} />
              <span className="sim-card-label">Recarga:</span>
              <span 
                className="sim-card-value"
                style={{ color: recharge.isExpired ? '#f87171' : recharge.isUrgent ? '#fbbf24' : '#888' }}
              >
                {formatDate(sim.fechaUltimaRecarga)}
              </span>
              {recharge.daysUntilExpiry != null && !recharge.isExpired && (
                <span className="sim-card-days">{recharge.daysUntilExpiry}d</span>
              )}
            </div>
          )}

          {sim.device && (
            <div className="sim-card-row device">
              <Smartphone size={10} />
              <span className="sim-card-label">En:</span>
              <span style={{ color: accent.text }}>{sim.device.nombre}</span>
            </div>
          )}
        </div>

        {/* QR Image */}
        {sim.imagenQr && (
          <div className="sim-card-qr">
            <img src={sim.imagenQr} alt="QR eSIM" />
          </div>
        )}

        {/* Actions */}
        <div className="sim-card-actions">
          <button onClick={onEdit} className="sim-card-btn">
            <Edit3 size={11} />
            <span>Editar</span>
          </button>
          
          {onUnlink && sim.dispositivoId && (
            <button onClick={onUnlink} className="sim-card-btn sim-card-btn-warning">
              <Unlink size={11} />
              <span>Desvincular</span>
            </button>
          )}
          
          <button onClick={onDelete} className="sim-card-btn sim-card-btn-danger">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}