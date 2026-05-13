'use client';

import { motion } from 'framer-motion';
import { 
  Smartphone, CreditCard, Users, Signal, Activity, Archive,
  AlertTriangle, Search, Filter, RefreshCw, LogOut, Grid3X3,
  LayoutGrid, List
} from 'lucide-react';
import type { Device, Sim, Account } from '@/types';

type ViewMode = 'grid' | 'list';
type Tab = 'devices' | 'sims' | 'accounts';

interface TopBarProps {
  devices: Device[];
  sims: Sim[];
  accounts: Account[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNew: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  isLoading: boolean;
}

export default function TopBar({
  devices,
  sims,
  accounts,
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onAddNew,
  onRefresh,
  onLogout,
  isLoading,
}: TopBarProps) {
  const drawerSims = sims.filter(s => !s.dispositivoId);
  const assignedSims = sims.filter(s => s.dispositivoId);
  
  const urgentSims = sims.filter(s => {
    if (!s.fechaUltimaRecarga) return false;
    const days = 90 - Math.floor((Date.now() - new Date(s.fechaUltimaRecarga).getTime()) / 86400000);
    return days <= 10;
  }).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'devices', label: 'Dispositivos', icon: <Smartphone size={14} />, count: devices.length },
    { id: 'sims', label: 'SIMs', icon: <CreditCard size={14} />, count: sims.length },
    { id: 'accounts', label: 'Cuentas', icon: <Users size={14} />, count: accounts.length },
  ];

  const getAddLabel = () => {
    if (activeTab === 'devices') return 'Dispositivo';
    if (activeTab === 'sims') return 'SIM';
    return 'Cuenta';
  };

  const getSearchPlaceholder = () => {
    if (activeTab === 'devices') return 'Buscar dispositivos...';
    if (activeTab === 'sims') return 'Número o compañía...';
    return 'Buscar cuentas...';
  };

  return (
    <header className="topbar">
      {/* Left: Stats Pills */}
      <div className="topbar-stats">
        <StatPill 
          icon={<Smartphone size={12} />} 
          value={devices.length} 
          label="Dispositivos" 
          color="#818cf8" 
        />
        <StatPill 
          icon={<Activity size={12} />} 
          value={assignedSims.length} 
          label="Activas" 
          color="#34d399" 
        />
        <StatPill 
          icon={<Archive size={12} />} 
          value={drawerSims.length} 
          label="En cajón" 
          color="#71717a" 
        />
        <StatPill 
          icon={<Users size={12} />} 
          value={accounts.length} 
          label="Cuentas" 
          color="#fb923c" 
        />
        
        {urgentSims > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="topbar-alert"
          >
            <AlertTriangle size={12} />
            <span>{urgentSims} urgente{urgentSims !== 1 ? 's' : ''}</span>
          </motion.div>
        )}
      </div>

      {/* Center: Search */}
      <div className="topbar-search">
        <Search size={14} className="topbar-search-icon" />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="topbar-search-input"
        />
      </div>

      {/* Right: Actions */}
      <div className="topbar-actions">
        {/* Tabs */}
        <div className="topbar-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`topbar-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span className="topbar-tab-label">{tab.label}</span>
              <span className="topbar-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle (only for SIMs) */}
        {activeTab === 'sims' && (
          <div className="topbar-view-toggle">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Vista de grid"
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="Vista de lista"
            >
              <List size={14} />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <button
          onClick={onRefresh}
          className="topbar-btn"
          disabled={isLoading}
          title="Actualizar"
        >
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
        </button>

        <button
          onClick={onLogout}
          className="topbar-btn topbar-btn-logout"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>

        <button onClick={onAddNew} className="topbar-add-btn">
          <Plus size={16} />
          <span>{getAddLabel()}</span>
        </button>
      </div>
    </header>
  );
}

function StatPill({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  color: string;
}) {
  return (
    <div className="stat-pill" style={{ '--accent': color } as React.CSSProperties}>
      <span className="stat-pill-icon" style={{ color }}>{icon}</span>
      <span className="stat-pill-value">{value}</span>
      <span className="stat-pill-label">{label}</span>
    </div>
  );
}