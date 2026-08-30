import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { Panel } from '../components/ui/Panel';
import { IconSliders } from '../components/icons';

export default function Settings() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Thresholds, notification routing and account preferences."
      />
      <Panel className="flex flex-col items-center justify-center py-20 text-center">
        <IconSliders size={22} className="text-ink-4 mb-3" />
        <p className="text-[14px] font-medium text-ink">Not yet available</p>
        <p className="mt-1.5 text-[13px] text-ink-3 max-w-sm">
          Alert thresholds and notification routing will be configurable here once the backend is
          connected.
        </p>
      </Panel>
    </DashboardLayout>
  );
}
