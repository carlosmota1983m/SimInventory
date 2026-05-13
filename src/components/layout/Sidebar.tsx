'use client';

import { motion } from 'framer-motion';
import { 
  Smartphone, Wifi, WifiOff, Battery, BatteryMedium, BatteryLow,
  ChevronRight, Search, Plus, Signal
} from 'lucide-react';
import type { Device, Sim } from '@/types';
import { SLOT_CAPACITY } from '@/types';

interface SidebarProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  onAddDevice: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Sidebar({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onAddDevice,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const filteredDevices = devices.filter(d => 
    d.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBatteryIcon = (level: number) => {
    if (level > 70) return <Battery size={14} />;
    if (level > 30) return <BatteryMedium size={14} />;
    return <BatteryLow size={14} />;
  };

  const getBatteryColor = (level: number) => {
    if (level > 70) return '#22c55e';
    if (level > 30) return '#f59e0b';
    return '#ef4444';
  };

  // Simulate battery percentage based on device (in real app, this would come from API)
  const getSimCount = (device: Device) => {
    return device.sims.length;
  };

  const getTotalSlots = (device: Device) => {
    const capacity = SLOT_CAPACITY[device.configuracionSlots];
    return capacity.physical + capacity.esim;
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Signal size={16} />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">Gestor de SIMs PRO V1</span>
            <span className="sidebar-logo-subtitle">Pro</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <Search size={14} className="sidebar-search-icon" />
        <input
          type="text"
          placeholder="Buscar dispositivos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="sidebar-search-input"
        />
      </div>

      {/* Device List */}
      <div className="sidebar-list">
        <div className="sidebar-list-header">
          <span>DISPOSITIVOS</span>
          <span className="sidebar-list-count">{filteredDevices.length}</span>
        </div>

        <div className="sidebar-devices">
          {filteredDevices.map((device, index) => {
            const simCount = getSimCount(device);
            const totalSlots = getTotalSlots(device);
            const isSelected = selectedDeviceId === device.id;
            // Simulated online status - in real app this would come from device status
            const isOnline = index % 3 !== 0; 
            const batteryLevel = 60 + (index * 15) % 40;

            return (
              <motion.button
                key={device.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSelectDevice(device.id)}
                className={`sidebar-device-item ${isSelected ? 'selected' : ''}`}
              >
                <div className="sidebar-device-icon">
                  <Smartphone size={16} />
                  {!isOnline && (
                    <div className="sidebar-device-offline-badge">
                      <WifiOff size={8} />
                    </div>
                  )}
                </div>
                
                <div className="sidebar-device-info">
                  <span className="sidebar-device-name">{device.nombre}</span>
                  <span className="sidebar-device-meta">
                    {simCount}/{totalSlots} SIMs
                    {isOnline && (
                      <span className="sidebar-device-status">
                        <span 
                          className="sidebar-device-battery"
                          style={{ color: getBatteryColor(batteryLevel) }}
                        >
                          {getBatteryIcon(batteryLevel)}
                        </span>
                      </span>
                    )}
                  </span>
                </div>

                <ChevronRight 
                  size={14} 
                  className={`sidebar-device-arrow ${isSelected ? 'rotated' : ''}`}
                />
              </motion.button>
            );
          })}

          {filteredDevices.length === 0 && (
            <div className="sidebar-empty">
              <Smartphone size={24} />
              <span>No se encontraron dispositivos</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Device Button */}
      <button onClick={onAddDevice} className="sidebar-add-btn">
        <Plus size={16} />
        <span>Agregar Dispositivo</span>
      </button>
    </aside>
  );
}