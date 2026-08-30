import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import { NameCell, MonoCell, RowAction } from '../../components/tableCells';
import { Customer } from '../../types/database.types';
import { IconPlus, IconCustomers, IconVendors } from '../../components/icons';

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers] = useState<Customer[]>([
    { id: '1', vendor_id: '1', name: 'Customer A1', code: 'CUST-A1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', vendor_id: '1', name: 'Customer A2', code: 'CUST-A2', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', vendor_id: '2', name: 'Customer B1', code: 'CUST-B1', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  const columns = [
    {
      header: 'Customer',
      accessor: (row: Customer) => <NameCell name={row.name} code={row.code} />,
    },
    {
      header: 'Vendor',
      accessor: (row: Customer) => <MonoCell>VEN-{row.vendor_id}</MonoCell>,
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

  const activeCustomers = customers.filter((c) => c.status === 'active').length;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Organisation"
        title="Customers"
        description="Every customer across all vendors. Select a customer to see the devices installed at their sites."
        actions={
          <Button variant="primary" icon={IconPlus}>
            Add customer
          </Button>
        }
      />

      <MetricStrip
        className="mb-5"
        items={[
          { label: 'Total customers', value: customers.length, icon: IconCustomers },
          { label: 'Active', value: activeCustomers, tone: 'ok' },
          {
            label: 'Vendors represented',
            value: new Set(customers.map((c) => c.vendor_id)).size,
            icon: IconVendors,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers…"
        onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
        emptyTitle="No customers yet"
        emptyHint="Customers are created under a vendor."
      />
    </DashboardLayout>
  );
}
