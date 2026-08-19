import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { Customer } from '../../types/database.types';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers] = useState<Customer[]>([
    { id: '1', vendor_id: '1', name: 'Customer A1', code: 'CUST-A1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', vendor_id: '1', name: 'Customer A2', code: 'CUST-A2', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', vendor_id: '2', name: 'Customer B1', code: 'CUST-B1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
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
          className="text-brand-green hover:text-green-700 text-sm font-medium"
        >
          View Devices
        </button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="flex justify-between items-end pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Customers</h2>
            <p className="text-slate-600 mt-1">Manage all customers across all vendors.</p>
          </div>
          <button className="bg-brand-green hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Add Customer
          </button>
        </div>

        <DataTable columns={columns} data={customers} searchPlaceholder="Search customers..." onRowClick={(row) => navigate(`/admin/customers/${row.id}`)} />
      </div>
    </DashboardLayout>
  );
}
