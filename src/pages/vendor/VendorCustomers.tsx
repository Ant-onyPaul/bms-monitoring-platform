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
import { Customer } from '../../types/database.types';
import { useApiList } from '../../hooks/useApiList';
import { useAuth } from '../../hooks/useAuth';
import { CUSTOMER_FIELDS, createCustomer, formatDate } from '../../lib/onboarding';
import { IconPlus, IconCustomers, IconRack } from '../../components/icons';

export default function VendorCustomers() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  // The API scopes this list to the signed-in vendor.
  const { rows: customers, setRows: setCustomers, error } = useApiList<Customer>('/api/customers');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      header: 'Customer',
      accessor: (row: Customer) => <NameCell name={row.name} code={row.code} />,
    },
    {
      header: 'Login',
      accessor: (row: Customer) => <MonoCell>{row.contact_email ?? '—'}</MonoCell>,
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
        <RowAction label="Devices" onClick={() => navigate(`/vendor/customers/${row.id}`)} />
      ),
      align: 'right' as const,
      compact: true as const,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Vendor portal"
        title="Customers"
        description="Organisations you have onboarded. Select a customer to see their installed devices."
        actions={
          <Button variant="primary" icon={IconPlus} onClick={() => setIsModalOpen(true)}>
            Add customer
          </Button>
        }
      />

      <MetricStrip
        className="mb-5"
        items={[
          { label: 'Customers', value: customers.length, icon: IconCustomers },
          {
            label: 'Active',
            value: customers.filter((c) => c.status === 'active').length,
            tone: 'ok',
          },
          { label: 'Devices', value: customers.reduce((n, c) => n + c.device_count, 0), icon: IconRack },
        ]}
      />

      {error && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{error}</p>}

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers…"
        onRowClick={(row) => navigate(`/vendor/customers/${row.id}`)}
        emptyTitle="No customers yet"
        emptyHint="Add a customer — they will register their own devices."
      />

      <OnboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add customer"
        description="Creates the customer and its login. A one-time password is issued."
        submitLabel="Create customer"
        fields={CUSTOMER_FIELDS}
        owner={{ label: 'Vendor', name: profile?.full_name ?? '—' }}
        onCreate={async (values) => {
          const { customer, credentials } = await createCustomer(values, null);
          setCustomers((prev) => [customer, ...prev]);
          return credentials;
        }}
      />
    </DashboardLayout>
  );
}
