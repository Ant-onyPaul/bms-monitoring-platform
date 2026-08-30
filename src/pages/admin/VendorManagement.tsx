import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import { NameCell, MonoCell, RowAction } from '../../components/tableCells';
import { Vendor } from '../../types/database.types';
import AddVendorModal from '../../components/admin/AddVendorModal';
import { IconPlus, IconCheckCircle, IconVendors, IconClose } from '../../components/icons';

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
    {
      header: 'Vendor',
      accessor: (row: Vendor) => <NameCell name={row.name} code={row.code} />,
    },
    {
      header: 'Status',
      accessor: (row: Vendor) => <StatusBadge lastSeenAt={null} status={row.status} />,
      compact: true as const,
    },
    {
      header: 'Created',
      accessor: (row: Vendor) => (
        <MonoCell>
          {new Date(row.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </MonoCell>
      ),
      compact: true as const,
    },
    {
      header: '',
      accessor: (row: Vendor) => (
        <RowAction label="Customers" onClick={() => navigate(`/admin/vendors/${row.id}`)} />
      ),
      align: 'right' as const,
      compact: true as const,
    },
  ];

  const handleAddVendor = (vendorData: any) => {
    // Generate a simple code if one isn't provided (e.g., VEN-C)
    const code = `VEN-${vendorData.name.substring(0, 3).toUpperCase()}`;
    const newVendor: Vendor = {
      id: Math.random().toString(36).substring(2, 9),
      name: vendorData.name,
      code: code,
      status: 'offline' as any, // Default status for a newly created vendor
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to existing vendors list
    setVendors((prev) => [...prev, newVendor]);

    // Show success notification
    setSuccessMessage('Vendor created successfully.');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const activeVendors = vendors.filter((v) => v.status === 'active').length;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Organisation"
        title="Vendors"
        description="Partners authorised to manage customers and devices on the platform."
        actions={
          <Button variant="primary" icon={IconPlus} onClick={() => setIsModalOpen(true)}>
            Add vendor
          </Button>
        }
      />

      <MetricStrip
        className="mb-5"
        items={[
          { label: 'Total vendors', value: vendors.length, icon: IconVendors },
          { label: 'Active', value: activeVendors, tone: 'ok' },
          {
            label: 'Pending activation',
            value: vendors.length - activeVendors,
            // A zero is not a warning; only colour the count when there is one.
            tone: vendors.length - activeVendors > 0 ? 'warn' : 'default',
          },
        ]}
      />

      {/* Creation confirmation — dismissible, and self-clearing after 4s */}
      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 px-4 py-3 mb-5 rounded-[10px]
            bg-ok-surface border border-ok-line animate-slide-up-fade"
        >
          <IconCheckCircle size={16} className="text-ok-ink shrink-0" />
          <span className="text-[13px] font-medium text-ok-ink flex-1">{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss"
            className="w-6 h-6 inline-flex items-center justify-center rounded text-ok-ink/70
              hover:text-ok-ink hover:bg-ok-line/50 cursor-pointer transition-colors"
          >
            <IconClose size={13} />
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={vendors}
        searchPlaceholder="Search vendors…"
        onRowClick={(row) => navigate(`/admin/vendors/${row.id}`)}
        emptyTitle="No vendors yet"
        emptyHint="Add a vendor to start onboarding customers."
      />

      <AddVendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddVendor}
      />
    </DashboardLayout>
  );
}
