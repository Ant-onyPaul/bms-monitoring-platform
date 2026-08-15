import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { Customer } from '../../types/database.types';

export default function VendorCustomers() {
  const navigate = useNavigate();
  const customers: Customer[] = [
    { id: '1', vendor_id: '1', name: 'Customer A1', code: 'CUST-A1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

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
          onClick={(e) => { e.stopPropagation(); navigate(`/vendor/customers/${row.id}`); }}
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
        <div className="flex justify-between items-end pb-2 border-b border-slate-700/50">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">My Customers</h2>
            <p className="text-slate-400 mt-1">Manage your registered customers.</p>
          </div>
        </div>
        <DataTable columns={columns} data={customers} searchPlaceholder="Search customers..." onRowClick={(row) => navigate(`/vendor/customers/${row.id}`)} />
      </div>
    </DashboardLayout>
  );
}
