import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import { NameCell, MonoCell, RowAction } from '../../components/tableCells';
import { Customer } from '../../types/database.types';
import { IconPlus, IconCustomers, IconVendors } from '../../components/icons';

export default function AdminVendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data scoped to this specific vendor
  const [customers] = useState<Customer[]>([
    { id: '1', vendor_id: id || '', name: 'Customer A1', code: 'CUST-A1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', vendor_id: id || '', name: 'Customer A2', code: 'CUST-A2', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

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
        eyebrow={`Vendor ${id}`}
        title="Vendor overview"
        description="Customers onboarded by this vendor. Select a customer to see their installed devices."
        actions={
          <Button variant="primary" icon={IconPlus}>
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
          { label: 'Vendor code', value: `VEN-${id}`, icon: IconVendors },
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
    </DashboardLayout>
  );
}
