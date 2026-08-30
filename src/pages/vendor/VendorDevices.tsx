import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import { NameCell, AttributeCell, MonoCell, RowAction, relativeTime } from '../../components/tableCells';
import { Device } from '../../types/database.types';
import { IconRack, IconLocation } from '../../components/icons';

const isOnline = (lastSeenAt: string | null) =>
  lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000 : false;

export default function VendorDevices() {
  const navigate = useNavigate();
  const devices: Device[] = [
    { id: '1', customer_id: '1', device_identifier: 'BMS-A001', name: 'Main HQ Battery', device_type: 'BMS V1', location: 'New York', status: 'active', last_seen_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];

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
        <RowAction label="Open" onClick={() => navigate(`/vendor/devices/${row.id}`)} />
      ),
      align: 'right' as const,
      compact: true as const,
    },
  ];

  const online = devices.filter((d) => isOnline(d.last_seen_at)).length;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Vendor portal"
        title="Devices"
        description="Units installed at your customers' sites. Select a device to open its monitoring workspace."
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
        ]}
      />

      <DataTable
        columns={columns}
        data={devices}
        searchPlaceholder="Search devices…"
        onRowClick={(row) => navigate(`/vendor/devices/${row.id}`)}
        emptyTitle="No devices assigned"
        emptyHint="Devices appear here once registered against one of your customers."
      />
    </DashboardLayout>
  );
}
