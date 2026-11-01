import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import PageHeader from '../../components/PageHeader';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import MetricStrip from '../../components/MetricStrip';
import Button from '../../components/ui/Button';
import OnboardModal from '../../components/OnboardModal';
import { NameCell, AttributeCell, MonoCell, RowAction, relativeTime } from '../../components/tableCells';
import { Customer, Device } from '../../types/database.types';
import { useApiList, useApiRecord } from '../../hooks/useApiList';
import { DEVICE_FIELDS, createDevice } from '../../lib/onboarding';
import { IconPlus, IconRack, IconLocation } from '../../components/icons';

const isOnline = (lastSeenAt: string | null) =>
  lastSeenAt ? Date.now() - new Date(lastSeenAt).getTime() < 5 * 60 * 1000 : false;

interface CustomerDetailsViewProps {
  /** Route prefix for device links, e.g. "/admin". */
  basePath: string;
  /** Only admins register devices on a customer's behalf; vendors view. */
  canRegisterDevices: boolean;
}

export default function CustomerDetailsView({ basePath, canRegisterDevices }: CustomerDetailsViewProps) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { record: customer, error: customerError } = useApiRecord<Customer>(`/api/customers/${encodeURIComponent(id)}`);
  const { rows: devices, setRows: setDevices } = useApiList<Device>(`/api/devices?customer_id=${encodeURIComponent(id)}`);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <RowAction label="Open" onClick={() => navigate(`${basePath}/devices/${row.id}`)} />
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
        eyebrow={customer ? `${customer.code} · ${customer.vendor_name}` : 'Customer'}
        title={customer?.name ?? 'Customer overview'}
        description="Devices installed at this customer's sites. Select a device to open its monitoring workspace."
        actions={
          canRegisterDevices && (
            <Button variant="primary" icon={IconPlus} onClick={() => setIsModalOpen(true)} disabled={!customer}>
              Register device
            </Button>
          )
        }
      />

      {customerError && <p role="alert" className="mb-4 text-[13px] text-crit-ink">{customerError}</p>}

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
        onRowClick={(row) => navigate(`${basePath}/devices/${row.id}`)}
        emptyTitle="No devices for this customer"
        emptyHint={canRegisterDevices ? 'Register a device to begin collecting telemetry.' : 'The customer registers its devices.'}
      />

      {canRegisterDevices && (
        <OnboardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Register device"
          description="Telemetry is matched to this device by the IMEI of its LTE module."
          submitLabel="Register device"
          fields={DEVICE_FIELDS}
          owner={{ label: 'Customer', name: customer?.name ?? '—', meta: customer?.vendor_name }}
          onCreate={async (values) => {
            const device = await createDevice(values, id);
            setDevices((prev) => [device, ...prev]);
            return null;
          }}
        />
      )}
    </DashboardLayout>
  );
}
