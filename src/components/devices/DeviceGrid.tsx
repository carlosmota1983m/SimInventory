'use client';

import { motion } from 'framer-motion';
import { 
  Smartphone, Edit3, Trash2, Plus, Signal, Wifi, Battery, 
  CreditCard, User, Zap, Unlink, Shield, X, GripVertical
} from 'lucide-react';
import type { Device, Sim, SlotConfig } from '@/types';
import { SLOT_CONFIG_LABELS, SLOT_CAPACITY } from '@/types';
import CopyButton from '@/components/shared/CopyButton';
import PlatformIcon from '@/components/shared/PlatformIcon';
import { getRechargeStatus, formatDate } from '@/lib/utils';

interface DeviceGridProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  onEditDevice: (deviceId: string) => void;
  onDeleteDevice: (deviceId: string, deviceName: string) => void;
  onAssignSim: (deviceId: string, slotType: 'FISICA' | 'ESIM') => void;
  onUnlinkSim: (sim: Sim) => void;
  onAddAccount: (deviceId: string) => void;
  onDeleteAccount: (accountId: string) => void;
  draggedSimId: string | null;
  onDragOver: (e: React.DragEvent, slotKey: string) => void;
  onDragLeave: (slotKey: string) => void;
  onDrop: (e: React.DragEvent, deviceId: string, slotType: 'FISICA' | 'ESIM') => void;
}

const CARRIER_ACCENT: Record<string, { from: string; to: string; text: string }> = {
  telcel:   { from: '#1d4ed8', to: '#3b82f6', text: '#93c5fd' },
  movistar: { from: '#16a34a', to: '#22c55e', text: '#86efac' },
  'at&t':   { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc' },
  att:      { from: '#0369a1', to: '#0ea5e9', text: '#7dd3fc' },
  bait:     { from: '#7c3aed', to: '#a855f7', text: '#d8b4fe' },
  unefon:   { from: '#c2410c', to: '#f97316', text: '#fdba74' },
  virgin:   { from: '#b91c1c', to: '#ef4444', text: '#fca5a5' },
};

const DEFAULT_ACCENT = { from: '#3f3f46', to: '#52525b', text: '#71717a' };

function getAccent(carrier: string) {
  return CARRIER_ACCENT[carrier.toLowerCase().trim()] ?? DEFAULT_ACCENT;
}

export default function DeviceGrid({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onEditDevice,
  onDeleteDevice,
  onAssignSim,
  onUnlinkSim,
  onAddAccount,
  onDeleteAccount,
  draggedSimId,
  onDragOver,
  onDragLeave,
  onDrop,
}: DeviceGridProps) {
  if (devices.length === 0) {
    return (
      <div className="device-grid-empty">
        <div className="empty-icon">
          <Smartphone size={48} />
        </div>
        <h3>Sin dispositivos</h3>
        <p>Agrega tu primer dispositivo para comenzar a gestionar tu inventario de SIMs.</p>
      </div>
    );
  }

  return (
    <div className="device-grid-container">
      {devices.map((device, index) => (
        <PhoneCard
          key={device.id}
          device={device}
          index={index}
          isSelected={selectedDeviceId === device.id}
          onSelect={() => onSelectDevice(device.id)}
          onEdit={() => onEditDevice(device.id)}
          onDelete={() => onDeleteDevice(device.id, device.nombre)}
          onAssignSim={(slotType) => onAssignSim(device.id, slotType)}
          onUnlinkSim={onUnlinkSim}
          onAddAccount={() => onAddAccount(device.id)}
          onDeleteAccount={onDeleteAccount}
          draggedSimId={draggedSimId}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}

function PhoneCard({
  device,
  index,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAssignSim,
  onUnlinkSim,
  onAddAccount,
  onDeleteAccount,
  draggedSimId,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  device: Device;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAssignSim: (slotType: 'FISICA' | 'ESIM') => void;
  onUnlinkSim: (sim: Sim) => void;
  onAddAccount: () => void;
  onDeleteAccount: (accountId: string) => void;
  draggedSimId: string | null;
  onDragOver: (e: React.DragEvent, slotKey: string) => void;
  onDragLeave: (slotKey: string) => void;
  onDrop: (e: React.DragEvent, deviceId: string, slotType: 'FISICA' | 'ESIM') => void;
}) {
  const capacity = SLOT_CAPACITY[device.configuracionSlots];
  const physicalSims = device.sims.filter(s => s.tipo === 'FISICA');
  const esimSims = device.sims.filter(s => s.tipo === 'ESIM');

  const urgentCount = device.sims.filter(s => {
    const r = getRechargeStatus(s.fechaUltimaRecarga);
    return r.isUrgent || r.isExpired;
  }).length;

  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30, delay: index * 0.05 }}
      className={`phone-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      {/* Urgent Badge */}
      {urgentCount > 0 && (
        <div className="phone-card-badge-urgent">
          <Zap size={10} />
          {urgentCount}
        </div>
      )}

      {/* Header */}
      <div className="phone-card-header">
        <div className="phone-card-title">
          <div className="phone-card-icon">
            <Smartphone size={14} />
          </div>
          <div>
            <h3>{device.nombre}</h3>
            <p>{SLOT_CONFIG_LABELS[device.configuracionSlots]} · {device.sims.length}/{capacity.physical + capacity.esim} slots</p>
          </div>
        </div>
        
        <div className="phone-card-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="action-btn" title="Editar">
            <Edit3 size={12} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="action-btn action-btn-danger" 
            title="Eliminar"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Phone Mockup */}
      <div className="phone-mockup-container">
        <div className="phone-mockup">
          {/* Side Buttons */}
          <div className="phone-btn phone-btn-power" />
          <div className="phone-btn phone-btn-vol-up" />
          <div className="phone-btn phone-btn-vol-down" />

          {/* Screen */}
          <div className="phone-screen">
            {/* Dynamic Island */}
            <div className="phone-notch" />

            {/* Status Bar */}
            <div className="phone-status-bar">
              <span className="phone-time">{timeStr}</span>
              <div className="phone-icons">
                <Signal size={10} />
                <Wifi size={10} />
                <Battery size={10} />
              </div>
            </div>

            {/* Content */}
            <div className="phone-content">
              {/* SIM Section */}
              <PhoneSection title="Líneas" icon={<CreditCard size={10} />}>
                {Array.from({ length: capacity.physical }).map((_, i) => (
                  <PhoneSimSlot
                    key={`phys-${i}`}
                    sim={physicalSims[i] || null}
                    type="FISICA"
                    index={i}
                    onAssign={() => onAssignSim('FISICA')}
                    onUnlink={physicalSims[i] ? () => onUnlinkSim(physicalSims[i]) : undefined}
                    slotKey={`${device.id}-phys-${i}`}
                    isDragOver={false}
                    onDragOver={(e) => onDragOver(e, `${device.id}-phys-${i}`)}
                    onDragLeave={() => onDragLeave(`${device.id}-phys-${i}`)}
                    onDrop={(e) => onDrop(e, device.id, 'FISICA')}
                  />
                ))}
                {Array.from({ length: capacity.esim }).map((_, i) => (
                  <PhoneSimSlot
                    key={`esim-${i}`}
                    sim={esimSims[i] || null}
                    type="ESIM"
                    index={i}
                    onAssign={() => onAssignSim('ESIM')}
                    onUnlink={esimSims[i] ? () => onUnlinkSim(esimSims[i]) : undefined}
                    slotKey={`${device.id}-esim-${i}`}
                    isDragOver={false}
                    onDragOver={(e) => onDragOver(e, `${device.id}-esim-${i}`)}
                    onDragLeave={() => onDragLeave(`${device.id}-esim-${i}`)}
                    onDrop={(e) => onDrop(e, device.id, 'ESIM')}
                  />
                ))}
              </PhoneSection>

              {/* Accounts Section */}
              <PhoneSection title="Cuentas" icon={<User size={10} />} action={<Plus size={9} />} onAction={onAddAccount}>
                {device.accounts.length === 0 ? (
                  <div className="phone-empty-slot" onClick={onAddAccount}>
                    <Plus size={10} />
                    <span>Agregar</span>
                  </div>
                ) : (
                  device.accounts.map(account => (
                    <div key={account.id} className="phone-account-row">
                      <PlatformIcon plataforma={account.plataforma} size={18} />
                      <div className="phone-account-info">
                        <span className="phone-account-platform">{account.plataforma}</span>
                        <span className="phone-account-email">{account.usuarioEmail}</span>
                      </div>
                      <div className="phone-account-actions">
                        <CopyButton text={account.usuarioEmail} />
                        <button onClick={(e) => { e.stopPropagation(); onDeleteAccount(account.id); }} className="phone-delete-btn">
                          <X size={9} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </PhoneSection>
            </div>

            {/* Home Indicator */}
            <div className="phone-home-indicator" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PhoneSection({ 
  title, 
  icon, 
  children, 
  action, 
  onAction 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  action?: React.ReactNode;
  onAction?: () => void;
}) {
  return (
    <div className="phone-section">
      <div className="phone-section-header">
        {icon}
        <span>{title}</span>
        {action && (
          <button onClick={onAction} className="phone-section-action">
            {action}
          </button>
        )}
      </div>
      <div className="phone-section-content">
        {children}
      </div>
    </div>
  );
}

function PhoneSimSlot({
  sim,
  type,
  index,
  onAssign,
  onUnlink,
  slotKey,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  sim: Sim | null;
  type: 'FISICA' | 'ESIM';
  index: number;
  onAssign: () => void;
  onUnlink?: () => void;
  slotKey: string;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const accent = sim ? getAccent(sim.compania) : DEFAULT_ACCENT;
  const recharge = sim ? getRechargeStatus(sim.fechaUltimaRecarga) : null;

  if (!sim) {
    return (
      <button
        className={`phone-sim-slot empty ${isDragOver ? 'dragover' : ''}`}
        onClick={onAssign}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <Plus size={10} />
        <span>{type === 'ESIM' ? 'eSIM' : `SIM ${index + 1}`}</span>
      </button>
    );
  }

  return (
    <div
      className={`phone-sim-slot filled ${isDragOver ? 'dragover' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${accent.from}20, ${accent.to}10)`,
        borderColor: `${accent.from}40`,
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="phone-sim-left">
        <div className="phone-sim-dot" style={{ background: accent.to, boxShadow: `0 0 8px ${accent.to}80` }} />
        <div className="phone-sim-info">
          <div className="phone-sim-carrier-row">
            <span style={{ color: accent.text }}>{sim.compania}</span>
            <span 
              className="phone-sim-type"
              style={{ 
                background: type === 'ESIM' ? 'rgba(6,182,212,0.15)' : `${accent.from}25`,
                color: type === 'ESIM' ? '#22d3ee' : accent.text,
              }}
            >
              {type === 'ESIM' ? 'eSIM' : `SIM ${index + 1}`}
            </span>
            {sim.registroGubernamental && <Shield size={8} className="text-amber-400" />}
          </div>
          <span className="phone-sim-number">{sim.numero}</span>
        </div>
      </div>
      <div className="phone-sim-right">
        {recharge && recharge.daysUntilExpiry != null && (
          <span className={`phone-sim-status ${recharge.isExpired ? 'expired' : recharge.isUrgent ? 'urgent' : 'ok'}`}>
            {recharge.isExpired ? <><Zap size={8} /> Vencida</> : recharge.isUrgent ? <><Zap size={8} /> {recharge.daysUntilExpiry}d</> : <>{recharge.daysUntilExpiry}d</>}
          </span>
        )}
        <CopyButton text={sim.numero} />
        {onUnlink && (
          <button onClick={(e) => { e.stopPropagation(); onUnlink(); }} className="phone-unlink-btn" title="Desvincular">
            <Unlink size={9} />
          </button>
        )}
      </div>
    </div>
  );
}