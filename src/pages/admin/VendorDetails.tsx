import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import OnboardModal from '../../components/OnboardModal';
import { NameCell, MonoCell, RowAction } from '../../components/tableCells';
import { Customer, Vendor } from '../../types/database.types';
import { useApiList, useApiRecord } from '../../hooks/useApiList';
import { CUSTOMER_FIELDS, createCustomer, formatDate } from '../../lib/onboarding';
import { IconPlus, IconCustomers, IconVendors, IconRack } from '../../components/icons';

export default function AdminVendorDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { record: vendor, error: vendorError } = useApiRecord<Vendor>(`/api/vendors/${encodeURIComponent(id)}`);
  const { rows: customers, setRows: setCustomers } = useApiList<Customer>(
    `/api/customers?vendor_id=${encodeURIComponent(id)}`,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      header: 'Customer',
      accessor: (row: Customer) => <NameCell name={row.name} code={row.code} />,
    },
    {
      header: 'Devices',
      accessor: (row: Customer) => <MonoCell>{row.device_count}</MonoCell>,
      compact: true as const,
    },
    {
      header: 'Status',
      accessor: (row: Customer) => <StatusBadge lastSeenAt={null} status={row.status} />,
      compact: true as const,
    },
    {
      header: 'Created',
      accessor: (row: Customer) => <MonoCell>{formatDate(row.created_at)}</MonoCell>,
      compact: true as const,
    },
    {
      header: '',
      accessor: (row: Customer) => (
        <RowAction label="Devices" onClick={() => navigate(`/admin/customers/${row.id}`)} />
      ),
      align: 'right' as const,
      compact: true as const,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        onBack={() => navigate(-1)}
        backLabel="Back to vendors"
        eyebrow={vendor?.code ?? 'Vendor'}
        title={vendor?.name ?? 'Vendor overview'}
        description="Customers onboarded by this vendor. Select a customer to see their installed devices."
        actions={
          <Button variant="primary" icon={IconPlus} onClick={() => setIsModalOpen(true)} disabled={!vendor}>
            Add customer
          </Button>
        }
      />

      {vendorError && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{vendorError}</p>}

      <MetricStrip
        className="mb-5"
        items={[
          { label: 'Customers', value: customers.length, icon: IconCustomers },
          { label: 'Devices', value: customers.reduce((n, c) => n + c.device_count, 0), icon: IconRack },
          { label: 'Login', value: vendor?.contact_email ?? '—', icon: IconVendors },
        ]}
      />

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers…"
        onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
        emptyTitle="No customers under this vendor"
        emptyHint="Add a customer to begin registering devices."
      />

      <OnboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add customer"
        description="Creates the customer and its login. A one-time password is issued."
        submitLabel="Create customer"
        fields={CUSTOMER_FIELDS}
        owner={{ label: 'Vendor', name: vendor?.name ?? '—', meta: vendor?.code }}
        onCreate={async (values) => {
          const { customer, credentials } = await createCustomer(values, id);
          setCustomers((prev) => [customer, ...prev]);
          return credentials;
        }}
      />
    </DashboardLayout>
  );
}
