import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { Vendor } from '../../types/database.types';

export default function VendorManagement() {
  const navigate = useNavigate();
  // Mock Data
  const [vendors] = useState<Vendor[]>([
    { id: '1', name: 'Vendor A', code: 'VEN-A', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', name: 'Vendor B', code: 'VEN-B', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  const columns = [
    { header: 'Vendor Name', accessor: 'name' as keyof Vendor },
    { header: 'Code', accessor: 'code' as keyof Vendor },
    { 
      header: 'Status', 
      accessor: (row: Vendor) => <StatusBadge lastSeenAt={null} status={row.status} /> 
    },
    { 
      header: 'Created', 
      accessor: (row: Vendor) => new Date(row.created_at).toLocaleDateString() 
    },
    {
      header: 'Actions',
      accessor: (row: Vendor) => (
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/vendors/${row.id}`); }}
          className="text-brand-green hover:text-green-700 text-sm font-medium"
        >
          View Customers
        </button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="flex justify-between items-end pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Vendors</h2>
            <p className="text-slate-600 mt-1">Manage all vendors in the system.</p>
          </div>
          <button className="bg-brand-green hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Add Vendor
          </button>
        </div>

        <DataTable columns={columns} data={vendors} searchPlaceholder="Search vendors..." onRowClick={(row) => navigate(`/admin/vendors/${row.id}`)} />
      </div>
    </DashboardLayout>
  );
}
