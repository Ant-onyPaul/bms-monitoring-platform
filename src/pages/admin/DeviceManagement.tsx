import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { Device } from '../../types/database.types';

export default function DeviceManagement() {
  const navigate = useNavigate();
  const [devices] = useState<Device[]>([
    { id: '1', customer_id: '1', device_identifier: 'BMS-A001', name: 'Main HQ Battery', device_type: 'BMS V1', location: 'New York', status: 'active', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', customer_id: '2', device_identifier: 'BMS-A002', name: 'Branch 1 Backup', device_type: 'BMS V2', location: 'Boston', status: 'active', last_seen_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  const columns = [
    { header: 'Device Name', accessor: 'name' as keyof Device },
    { header: 'Identifier', accessor: 'device_identifier' as keyof Device },
    { header: 'Location', accessor: 'location' as keyof Device },
    { 
      header: 'Status', 
      accessor: (row: Device) => <StatusBadge lastSeenAt={row.last_seen_at} status={row.status} /> 
    },
    {
      header: 'Actions',
      accessor: (row: Device) => (
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/devices/${row.id}`); }}
          className="text-brand-blue hover:text-blue-400 text-sm font-medium"
        >
          View Details
        </button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="flex justify-between items-end pb-2 border-b border-slate-700/50">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Devices</h2>
            <p className="text-slate-400 mt-1">Manage and monitor all devices.</p>
          </div>
          <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Register Device
          </button>
        </div>

        <DataTable columns={columns} data={devices} searchPlaceholder="Search devices..." onRowClick={(row) => navigate(`/admin/devices/${row.id}`)} />
      </div>
    </DashboardLayout>
  );
}
