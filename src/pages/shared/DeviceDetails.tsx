import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import { FiThermometer, FiDroplet, FiZap, FiBattery, FiActivity } from 'react-icons/fi';
import { Device, DeviceCurrentData } from '../../types/database.types';
import { useDeviceRealtime } from '../../hooks/useDeviceRealtime';

export default function DeviceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock device and data
  const [device] = useState<Device>({
    id: id || '1',
    customer_id: '1',
    device_identifier: 'BMS-A001',
    name: 'Main HQ Battery',
    device_type: 'BMS V1',
    location: 'New York',
    status: 'active',
    last_seen_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

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

  const { data: currentData } = useDeviceRealtime(device.id, initialCurrentData);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="flex justify-between items-start pb-2 border-b border-slate-700/50">
          <div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
                ← Back
              </button>
              <h2 className="text-3xl font-bold text-white tracking-tight">{device.name}</h2>
              <StatusBadge lastSeenAt={device.last_seen_at} status={device.status} />
            </div>
            <p className="text-slate-400 mt-1 ml-11">
              ID: {device.device_identifier} | Location: {device.location} | Type: {device.device_type}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Temperature" value={`${currentData?.temperature ?? '--'}`} unit="°C" icon={FiThermometer} colorClass="bg-orange-500/10 text-orange-500" />
          <StatCard title="Humidity" value={`${currentData?.humidity ?? '--'}`} unit="%" icon={FiDroplet} colorClass="bg-blue-500/10 text-blue-500" />
          <StatCard title="Voltage" value={`${currentData?.voltage ?? '--'}`} unit="V" icon={FiZap} colorClass="bg-yellow-500/10 text-yellow-500" />
          <StatCard title="Current" value={`${currentData?.current ?? '--'}`} unit="A" icon={FiActivity} colorClass="bg-purple-500/10 text-purple-500" />
          <StatCard title="Power" value={`${currentData?.power ?? '--'}`} unit="W" icon={FiBattery} colorClass="bg-brand-green/10 text-brand-green" />
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px]">
          <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-medium text-white mb-2">Historical data not yet available</h3>
          <p className="text-slate-400 text-center max-w-md">
            Historical charts, curve compression, and long-term time-series storage will be available in a future version.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
