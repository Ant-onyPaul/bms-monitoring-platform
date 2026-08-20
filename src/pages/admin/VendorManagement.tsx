import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { Vendor } from '../../types/database.types';
import AddVendorModal from '../../components/admin/AddVendorModal';

export default function VendorManagement() {
  const navigate = useNavigate();
  // Mock Data
  const [vendors, setVendors] = useState<Vendor[]>([
    { id: '1', name: 'Vendor A', code: 'VEN-A', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', name: 'Vendor B', code: 'VEN-B', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
          className="text-[#10B981] hover:text-[#047857] text-sm font-bold uppercase tracking-wider"
        >
          View Customers
        </button>
      )
    }
  ];

  const handleAddVendor = (vendorData: any) => {
    // Generate a simple code if one isn't provided (e.g., VEN-C)
    const code = `VEN-${vendorData.name.substring(0, 3).toUpperCase()}`;
    const newVendor: Vendor = {
      id: Math.random().toString(36).substring(2, 9),
      name: vendorData.name,
      code: code,
      status: 'offline', // Default status for a newly created vendor
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to existing vendors list
    setVendors((prev) => [...prev, newVendor]);
    
    // Show success notification
    setSuccessMessage('Vendor created successfully.');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-fade">
        <div className="flex justify-between items-end pb-2 border-b border-border">
          <div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Vendors</h2>
            <p className="text-muted-foreground font-medium mt-1">Manage all vendors in the system.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#10B981] hover:bg-[#047857] text-primary-foreground px-4 py-2 rounded-md font-bold transition-colors shadow-sm cursor-pointer"
          >
            Add Vendor
          </button>
        </div>
        
        {successMessage && (
          <div className="flex items-center gap-3 p-4 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] rounded-md animate-slide-up-fade">
            <FiCheckCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold text-sm">{successMessage}</span>
          </div>
        )}

        <DataTable columns={columns} data={vendors} searchPlaceholder="Search vendors..." onRowClick={(row) => navigate(`/admin/vendors/${row.id}`)} />
      </div>

      <AddVendorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddVendor}
      />
    </DashboardLayout>
  );
}
