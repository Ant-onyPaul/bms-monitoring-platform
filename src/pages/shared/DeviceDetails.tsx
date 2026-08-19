import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import { Device, DeviceCurrentData } from '../../types/database.types';
import { useDeviceRealtime } from '../../hooks/useDeviceRealtime';

// BMS Components
import { BmsOverview } from '../../components/bms/BmsOverview';
import { ModuleOverview } from '../../components/bms/ModuleOverview';
import { CellOverview } from '../../components/bms/CellOverview';
import { BmsHistory } from '../../components/bms/BmsHistory';
import { BmsAlerts } from '../../components/bms/BmsAlerts';

type Tab = 'overview' | 'modules' | 'cells' | 'history' | 'alerts';

export default function DeviceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>();
  
  // Mock device data repository
  const MOCK_DEVICES: Device[] = [
    { id: '1', customer_id: '1', device_identifier: 'BMS-A001', name: 'Main HQ Battery', device_type: 'BMS V1', location: 'New York', status: 'active', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', customer_id: '2', device_identifier: 'BMS-A002', name: 'Branch 1 Backup', device_type: 'BMS V2', location: 'Boston', status: 'active', last_seen_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  // Resolve device based on route parameter
  const device = MOCK_DEVICES.find(d => d.id === id) || MOCK_DEVICES[0];

  const initialCurrentData: DeviceCurrentData = {
    id: '1',
    device_id: device.id,
    received_at: new Date().toISOString(),
    temperature: 24.5,
    humidity: 52,
    voltage: 230,
    current: 4.2,
    power: 966,
    status: 'Normal',
    raw_data: null,
    updated_at: new Date().toISOString()
  };

  useDeviceRealtime(device.id, initialCurrentData);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'modules', label: 'Modules' },
    { id: 'cells', label: 'Cells' },
    { id: 'history', label: 'History' },
    { id: 'alerts', label: 'Alerts' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        {/* Device Context Header */}
        <div className="flex justify-between items-start pb-4">
          <div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 transition-colors">
                ← Back
              </button>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{device.name}</h2>
              <StatusBadge lastSeenAt={device.last_seen_at} status={device.status} />
            </div>
            <p className="text-slate-600 mt-1 ml-11">
              ID: {device.device_identifier} | Location: {device.location} | Type: {device.device_type}
            </p>
          </div>
        </div>

        {/* Local Tab Navigation */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'border-brand-green text-brand-green'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Selected Workspace Content */}
        <div className="pt-2">
          {activeTab === 'overview' && <BmsOverview deviceId={device.id} />}
          {activeTab === 'modules' && (
            <ModuleOverview 
              deviceId={device.id} 
              onModuleSelect={(moduleId) => {
                setSelectedModuleId(moduleId);
                setActiveTab('cells');
              }}
            />
          )}
          {activeTab === 'cells' && <CellOverview deviceId={device.id} moduleId={selectedModuleId} />}
          {activeTab === 'history' && <BmsHistory deviceId={device.id} />}
          {activeTab === 'alerts' && <BmsAlerts deviceId={device.id} />}
        </div>

      </div>
    </DashboardLayout>
  );
}
