import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import OnboardModal from '../../components/OnboardModal';
import { NameCell, MonoCell, RowAction } from '../../components/tableCells';
import { Vendor } from '../../types/database.types';
import { useApiList } from '../../hooks/useApiList';
import { VENDOR_FIELDS, createVendor, formatDate } from '../../lib/onboarding';
import { IconPlus, IconVendors, IconCustomers, IconRack } from '../../components/icons';

export default function VendorManagement() {
  const navigate = useNavigate();
  const { rows: vendors, setRows: setVendors, error } = useApiList<Vendor>('/api/vendors');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      header: 'Vendor',
      accessor: (row: Vendor) => <NameCell name={row.name} code={row.code} />,
    },
    {
      header: 'Login',
      accessor: (row: Vendor) => <MonoCell>{row.contact_email ?? '—'}</MonoCell>,
    },
    {
      header: 'Customers',
      accessor: (row: Vendor) => <MonoCell>{row.customer_count}</MonoCell>,
      compact: true as const,
    },
    {
      header: 'Devices',
      accessor: (row: Vendor) => <MonoCell>{row.device_count}</MonoCell>,
      compact: true as const,
    },
    {
      header: 'Status',
      accessor: (row: Vendor) => <StatusBadge lastSeenAt={null} status={row.status} />,
      compact: true as const,
    },
    {
      header: 'Created',
      accessor: (row: Vendor) => <MonoCell>{formatDate(row.created_at)}</MonoCell>,
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

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Organisation"
        title="Vendors"
        description="Partners authorised to onboard customers on the platform."
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
          { label: 'Customers', value: vendors.reduce((n, v) => n + v.customer_count, 0), icon: IconCustomers },
          { label: 'Devices', value: vendors.reduce((n, v) => n + v.device_count, 0), icon: IconRack },
        ]}
      />

      {error && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{error}</p>}

      <DataTable
        columns={columns}
        data={vendors}
        searchPlaceholder="Search vendors…"
        onRowClick={(row) => navigate(`/admin/vendors/${row.id}`)}
        emptyTitle="No vendors yet"
        emptyHint="Add a vendor to start onboarding customers."
      />

      <OnboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add vendor"
        description="Creates the vendor and its login. A one-time password is issued."
        submitLabel="Create vendor"
        fields={VENDOR_FIELDS}
        onCreate={async (values) => {
          const { vendor, credentials } = await createVendor(values);
          setVendors((prev) => [vendor, ...prev]);
          return credentials;
        }}
      />
    </DashboardLayout>
  );
}
