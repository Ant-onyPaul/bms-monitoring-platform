import { useEffect, useRef, useState } from 'react';
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
import { IconPlus, IconVendors, IconCustomers, IconRack, IconCheckCircle, IconClose } from '../../components/icons';

export default function VendorManagement() {
  const navigate = useNavigate();
  const { rows: vendors, setRows: setVendors, error } = useApiList<Vendor>('/api/vendors');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Set when a vendor is created; the banner shows once the credentials dialog closes.
  const createdRef = useRef(false);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const closeModal = () => {
    setIsModalOpen(false);
    if (createdRef.current) {
      createdRef.current = false;
      setSuccessMessage('Vendor created successfully.');
    }
  };

  const activeVendors = vendors.filter((v) => v.status === 'active').length;

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
          { label: 'Active', value: activeVendors, tone: 'ok' },
          {
            label: 'Pending activation',
            value: vendors.length - activeVendors,
            // A zero is not a warning; only colour the count when there is one.
            tone: vendors.length - activeVendors > 0 ? 'warn' : 'default',
          },
          { label: 'Customers', value: vendors.reduce((n, v) => n + v.customer_count, 0), icon: IconCustomers },
          { label: 'Devices', value: vendors.reduce((n, v) => n + v.device_count, 0), icon: IconRack },
        ]}
      />

      {error && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{error}</p>}

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

      <OnboardModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Add vendor"
        description="Creates the vendor and its login. A one-time password is issued."
        submitLabel="Create vendor"
        fields={VENDOR_FIELDS}
        onCreate={async (values) => {
          const { vendor, credentials } = await createVendor(values);
          setVendors((prev) => [vendor, ...prev]);
          createdRef.current = true;
          return credentials;
        }}
      />
    </DashboardLayout>
  );
}
