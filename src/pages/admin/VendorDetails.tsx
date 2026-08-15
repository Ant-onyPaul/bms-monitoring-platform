import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { Customer } from '../../types/database.types';

export default function AdminVendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data scoped to this specific vendor
  const [customers] = useState<Customer[]>([
    { id: '1', vendor_id: id || '', name: 'Customer A1', code: 'CUST-A1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', vendor_id: id || '', name: 'Customer A2', code: 'CUST-A2', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  const columns = [
    { header: 'Customer Name', accessor: 'name' as keyof Customer },
    { header: 'Code', accessor: 'code' as keyof Customer },
    { 
      header: 'Status', 
      accessor: (row: Customer) => <StatusBadge lastSeenAt={null} status={row.status} /> 
    },
    {
      header: 'Actions',
      accessor: (row: Customer) => (
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/${row.id}`); }}
          className="text-brand-blue hover:text-blue-400 text-sm font-medium"
        >
          View Devices
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
              <h2 className="text-3xl font-bold text-white tracking-tight">Vendor Overview</h2>
            </div>
            <p className="text-slate-400 mt-1 ml-11">Manage customers belonging to Vendor ID: {id}</p>
          </div>
          <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Add Customer
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-medium text-white mb-4">Customers</h3>
          <DataTable columns={columns} data={customers} searchPlaceholder="Search customers..." onRowClick={(row) => navigate(`/admin/customers/${row.id}`)} />
        </div>
      </div>
    </DashboardLayout>
  );
}
