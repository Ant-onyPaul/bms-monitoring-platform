import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { Device } from '../../types/database.types';

export default function VendorCustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data scoped to this specific customer
  const [devices] = useState<Device[]>([
    { id: '1', customer_id: id || '', device_identifier: 'BMS-A001', name: 'Main HQ Battery', device_type: 'BMS V1', location: 'New York', status: 'active', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', customer_id: id || '', device_identifier: 'BMS-A002', name: 'Branch 1 Backup', device_type: 'BMS V2', location: 'Boston', status: 'active', last_seen_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
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
          onClick={(e) => { e.stopPropagation(); navigate(`/vendor/devices/${row.id}`); }}
          className="text-brand-blue hover:text-blue-400 text-sm font-medium"
        >
          View Dashboard
        </button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="flex justify-between items-start pb-2 border-b border-slate-700/50">
          <div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
                ← Back
              </button>
              <h2 className="text-3xl font-bold text-white tracking-tight">Customer Overview</h2>
            </div>
            <p className="text-slate-400 mt-1 ml-11">Manage devices belonging to Customer ID: {id}</p>
          </div>
          <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Register Device
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-medium text-white mb-4">Devices</h3>
          <DataTable columns={columns} data={devices} searchPlaceholder="Search devices..." onRowClick={(row) => navigate(`/vendor/devices/${row.id}`)} />
        </div>
      </div>
    </DashboardLayout>
  );
}
