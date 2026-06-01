'use client';

import { motion } from 'framer-motion';
import { Users, Smartphone, Trash2, Plus, Search, ExternalLink } from 'lucide-react';
import type { Account, Device } from '@/types';
import PlatformIcon from '@/components/shared/PlatformIcon';
import CopyButton from '@/components/shared/CopyButton';

interface AccountListProps {
  accounts: Account[];
  devices: Device[];
  searchQuery: string;
  onAddAccount: (deviceId?: string) => void;
  onDeleteAccount: (accountId: string) => void;
}

export default function AccountList({
  accounts,
  devices,
  searchQuery,
  onAddAccount,
  onDeleteAccount,
}: AccountListProps) {
  const filteredAccounts = accounts.filter(a => 
    a.plataforma.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.usuarioEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (accounts.length === 0) {
    return (
      <div className="account-list-empty">
        <div className="empty-icon">
          <Users size={48} />
        </div>
        <h3>Sin cuentas</h3>
        <p>Agrega tu primera cuenta digital asociada a un dispositivo.</p>
        <button onClick={() => onAddAccount()} className="btn-primary">
          <Plus size={14} />
          <span>Agregar Cuenta</span>
        </button>
      </div>
    );
  }

  return (
    <div className="account-list-container">
      <div className="account-list-header">
        <h3>{filteredAccounts.length} cuenta{filteredAccounts.length !== 1 ? 's' : ''}</h3>
        <button onClick={() => onAddAccount()} className="account-add-btn">
          <Plus size={14} />
          <span>Agregar Cuenta</span>
        </button>
      </div>

      <div className="account-list">
        {filteredAccounts.map((account, index) => {
          const device = devices.find(d => d.id === account.dispositivoId);
          
          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="account-item"
            >
              {/* Platform Icon */}
              <div className="account-platform">
                <PlatformIcon plataforma={account.plataforma} size={36} />
              </div>

              {/* Account Info */}
              <div className="account-info">
                <span className="account-platform-name">{account.plataforma}</span>
                <span className="account-email">{account.usuarioEmail}</span>
                {account.notas && (
                  <span className="account-notes">{account.notas}</span>
                )}
              </div>

              {/* Device Badge */}
              {device && (
                <div className="account-device">
                  <Smartphone size={12} />
                  <span>{device.nombre}</span>
                </div>
              )}

              {/* Actions */}
              <div className="account-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CopyButton text={account.usuarioEmail} label="cuenta" />
                <button 
                  onClick={() => onDeleteAccount(account.id)}
                  className="account-delete-btn"
                  title="Eliminar cuenta"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}