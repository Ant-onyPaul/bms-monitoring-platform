import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import { NameCell, MonoCell, RowAction } from '../../components/tableCells';
import { Customer } from '../../types/database.types';
import { IconCustomers } from '../../components/icons';

export default function VendorCustomers() {
  const navigate = useNavigate();
  const customers: Customer[] = [
    { id: '1', vendor_id: '1', name: 'Customer A1', code: 'CUST-A1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

  const columns = [
    {
      header: 'Customer',
      accessor: (row: Customer) => <NameCell name={row.name} code={row.code} />,
    },
    {
      header: 'Status',
      accessor: (row: Customer) => <StatusBadge lastSeenAt={null} status={row.status} />,
      compact: true as const,
    },
    {
      header: 'Created',
      accessor: (row: Customer) => (
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
        ]}
      />

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers…"
        onRowClick={(row) => navigate(`/vendor/customers/${row.id}`)}
        emptyTitle="No customers yet"
        emptyHint="Customers you onboard will be listed here."
      />
    </DashboardLayout>
  );
}
