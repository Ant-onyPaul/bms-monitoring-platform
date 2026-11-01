import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import OnboardModal from '../../components/OnboardModal';
import { NameCell, AttributeCell, MonoCell, RowAction, relativeTime } from '../../components/tableCells';
import { Device } from '../../types/database.types';
import { useApiList } from '../../hooks/useApiList';
import { useAuth } from '../../hooks/useAuth';
import { DEVICE_FIELDS, createDevice } from '../../lib/onboarding';
import { IconPlus, IconRack, IconLocation } from '../../components/icons';

const isOnline = (lastSeenAt: string | null) =>
  lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000 : false;

export default function CustomerDevices() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  // The API scopes this list to the signed-in customer.
  const { rows: devices, setRows: setDevices, error } = useApiList<Device>('/api/devices');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      header: 'System',
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
        <RowAction label="Open" onClick={() => navigate(`/customer/devices/${row.id}`)} />
      ),
      align: 'right' as const,
      compact: true as const,
    },
  ];

  const online = devices.filter((d) => isOnline(d.last_seen_at)).length;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Your storage"
        title="My devices"
        description="Battery systems installed at your sites. Select a system to see its live condition and history."
        actions={
          <Button variant="primary" icon={IconPlus} onClick={() => setIsModalOpen(true)}>
            Register device
          </Button>
        }
      />

      <MetricStrip
        className="mb-5"
        items={[
          { label: 'Systems', value: devices.length, icon: IconRack },
          { label: 'Online', value: online, tone: 'ok' },
          {
            label: 'Offline',
            value: devices.length - online,
            tone: online === devices.length ? 'default' : 'crit',
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={devices}
        searchPlaceholder="Search systems…"
        onRowClick={(row) => navigate(`/customer/devices/${row.id}`)}
        emptyTitle="No systems yet"
        emptyHint="Register a system with the IMEI printed on its LTE module."
      />

      {error && <p role="alert" className="mt-4 text-[13px] text-crit-ink">{error}</p>}

      <OnboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register device"
        description="Enter the IMEI printed on the LTE module. Its telemetry will appear on this device."
        submitLabel="Register device"
        fields={DEVICE_FIELDS}
        owner={{ label: 'Customer', name: profile?.full_name ?? '—' }}
        onCreate={async (values) => {
          const device = await createDevice(values, null);
          setDevices((prev) => [device, ...prev]);
          return null;
        }}
      />
    </DashboardLayout>
  );
}
