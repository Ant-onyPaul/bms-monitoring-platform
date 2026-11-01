import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import OnboardModal from '../../components/OnboardModal';
import { NameCell, AttributeCell, MonoCell, RowAction, relativeTime } from '../../components/tableCells';
import { Customer, Device } from '../../types/database.types';
import { useApiList } from '../../hooks/useApiList';
import { DEVICE_FIELDS, createDevice } from '../../lib/onboarding';
import { IconPlus, IconRack, IconLocation } from '../../components/icons';

const isOnline = (lastSeenAt: string | null) =>
  lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000 : false;

export default function DeviceManagement() {
  const navigate = useNavigate();
  const { rows: devices, setRows: setDevices, error } = useApiList<Device>('/api/devices');
  const { rows: customers } = useApiList<Customer>('/api/customers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const customerOptions = useMemo(
    () => customers.map((c) => ({ id: c.id, name: c.name, meta: c.vendor_name })),
    [customers],
  );

  const columns = [
    {
      header: 'Device',
      accessor: (row: Device) => <NameCell name={row.name} code={row.device_identifier} />,
    },
    {
      header: 'Customer',
      accessor: (row: Device) => <MonoCell>{row.customer_name ?? '—'}</MonoCell>,
    },
    {
      header: 'Location',
      accessor: (row: Device) => (
        <AttributeCell icon={IconLocation}>{row.location ?? '—'}</AttributeCell>
      ),
    },
    {
      header: 'Type',
      accessor: (row: Device) => <MonoCell>{row.device_type ?? '—'}</MonoCell>,
      compact: true as const,
    },
    {
      header: 'Last seen',
      accessor: (row: Device) => <MonoCell>{relativeTime(row.last_seen_at)}</MonoCell>,
      compact: true as const,
    },
    {
      header: 'Status',
      accessor: (row: Device) => (
        <StatusBadge lastSeenAt={row.last_seen_at} status={row.status} />
      ),
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
        eyebrow="Fleet"
        title="Devices"
        description="Every battery management unit registered on the platform. Select a device to open its monitoring workspace."
        actions={
          <Button variant="primary" icon={IconPlus} onClick={() => setIsModalOpen(true)}>
            Register device
          </Button>
        }
      />

      <MetricStrip
        className="mb-5"
        items={[
          { label: 'Registered', value: devices.length, icon: IconRack },
          { label: 'Reporting', value: online, tone: 'ok' },
          { label: 'Not reporting', value: devices.length - online, tone: online === devices.length ? 'default' : 'crit' },
          { label: 'Sites', value: new Set(devices.map((d) => d.location)).size, icon: IconLocation },
        ]}
      />

      <DataTable
        columns={columns}
        data={devices}
        searchPlaceholder="Search devices, identifiers, sites…"
        onRowClick={(row) => navigate(`/admin/devices/${row.id}`)}
        emptyTitle="No devices registered"
        emptyHint="Register a device to begin collecting telemetry."
      />

      {error && <p role="alert" className="mt-4 text-[13px] text-crit-ink">{error}</p>}

      <OnboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register device"
        description="Telemetry is matched to this device by the IMEI of its LTE module."
        submitLabel="Register device"
        fields={DEVICE_FIELDS}
        parent={{ label: 'Customer', options: customerOptions, emptyHint: 'Add a customer first — every device belongs to one.' }}
        onCreate={async (values, customerId) => {
          const device = await createDevice(values, customerId);
          setDevices((prev) => [device, ...prev]);
          return null;
        }}
      />
    </DashboardLayout>
  );
}
