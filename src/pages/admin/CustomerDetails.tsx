import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import { NameCell, AttributeCell, MonoCell, RowAction, relativeTime } from '../../components/tableCells';
import { Device } from '../../types/database.types';
import { IconPlus, IconRack, IconLocation } from '../../components/icons';

const isOnline = (lastSeenAt: string | null) =>
  lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000 : false;

export default function AdminCustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data scoped to this specific customer
  const [devices] = useState<Device[]>([
    { id: '1', customer_id: id || '', device_identifier: 'BMS-A001', name: 'Main HQ Battery', device_type: 'BMS V1', location: 'New York', status: 'active', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', customer_id: id || '', device_identifier: 'BMS-A002', name: 'Branch 1 Backup', device_type: 'BMS V2', location: 'Boston', status: 'active', last_seen_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]);

  const columns = [
    {
      header: 'Device',
      accessor: (row: Device) => <NameCell name={row.name} code={row.device_identifier} />,
    },
    {
      header: 'Location',
      accessor: (row: Device) => <AttributeCell icon={IconLocation}>{row.location ?? '—'}</AttributeCell>,
    },
    {
      header: 'Last seen',
      accessor: (row: Device) => <MonoCell>{relativeTime(row.last_seen_at)}</MonoCell>,
      compact: true as const,
    },
    {
      header: 'Status',
      accessor: (row: Device) => <StatusBadge lastSeenAt={row.last_seen_at} status={row.status} />,
      compact: true as const,
    },
    {
      header: '',
      accessor: (row: Device) => (
        <RowAction label="Open" onClick={() => navigate(`/admin/devices/${row.id}`)} />
      ),
      align: 'right' as const,
      compact: true as const,
    },
  ];

  const online = devices.filter((d) => isOnline(d.last_seen_at)).length;

  return (
    <DashboardLayout>
      <PageHeader
        onBack={() => navigate(-1)}
        backLabel="Back to customers"
        eyebrow={`Customer ${id}`}
        title="Customer overview"
        description="Devices installed at this customer's sites. Select a device to open its monitoring workspace."
        actions={
          <Button variant="primary" icon={IconPlus}>
            Register device
          </Button>
        }
      />

      <MetricStrip
        className="mb-5"
        items={[
          { label: 'Devices', value: devices.length, icon: IconRack },
          { label: 'Reporting', value: online, tone: 'ok' },
          {
            label: 'Not reporting',
            value: devices.length - online,
            tone: online === devices.length ? 'default' : 'crit',
          },
          { label: 'Sites', value: new Set(devices.map((d) => d.location)).size, icon: IconLocation },
        ]}
      />

      <DataTable
        columns={columns}
        data={devices}
        searchPlaceholder="Search devices…"
        onRowClick={(row) => navigate(`/admin/devices/${row.id}`)}
        emptyTitle="No devices for this customer"
        emptyHint="Register a device to begin collecting telemetry."
      />
    </DashboardLayout>
  );
}
