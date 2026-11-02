import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import OnboardModal from '../../components/OnboardModal';
import { NameCell, MonoCell, RowAction } from '../../components/tableCells';
import { Customer, Vendor } from '../../types/database.types';
import { useApiList } from '../../hooks/useApiList';
import { CUSTOMER_FIELDS, createCustomer } from '../../lib/onboarding';
import { IconPlus, IconCustomers, IconVendors, IconRack } from '../../components/icons';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const { rows: customers, setRows: setCustomers, error } = useApiList<Customer>('/api/customers');
  const { rows: vendors } = useApiList<Vendor>('/api/vendors');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const vendorOptions = useMemo(() => vendors.map((v) => ({ id: v.id, name: v.name, meta: v.code })), [vendors]);

  const columns = [
    {
      header: 'Customer',
      accessor: (row: Customer) => <NameCell name={row.name} code={row.code} />,
    },
    {
      header: 'Vendor',
      accessor: (row: Customer) => <MonoCell>{row.vendor_name}</MonoCell>,
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
        eyebrow="Organisation"
        title="Customers"
        description="Every customer across all vendors. Select a customer to see the devices installed at their sites."
        actions={
          <Button variant="primary" icon={IconPlus} onClick={() => setIsModalOpen(true)}>
            Add customer
          </Button>
        }
      />

      <MetricStrip
        className="mb-5"
        items={[
          { label: 'Total customers', value: customers.length, icon: IconCustomers },
          { label: 'Active', value: customers.filter((c) => c.status === 'active').length, tone: 'ok' },
          { label: 'Vendors represented', value: new Set(customers.map((c) => c.vendor_id)).size, icon: IconVendors },
          { label: 'Devices', value: customers.reduce((n, c) => n + c.device_count, 0), icon: IconRack },
        ]}
      />

      {error && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{error}</p>}

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers…"
        onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
        emptyTitle="No customers yet"
        emptyHint="Customers are created under a vendor."
      />

      <OnboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add customer"
        description="Creates the customer under the chosen vendor, with its own login."
        submitLabel="Create customer"
        fields={CUSTOMER_FIELDS}
        parent={{ label: 'Vendor', options: vendorOptions, emptyHint: 'Add a vendor first — every customer belongs to one.' }}
        onCreate={async (values, vendorId) => {
          const { customer, credentials } = await createCustomer(values, vendorId);
          setCustomers((prev) => [customer, ...prev]);
          return credentials;
        }}
      />
    </DashboardLayout>
  );
}
