import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { Panel } from '../components/ui/Panel';
import { IconCustomers } from '../components/icons';

export default function Users() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Access"
        title="Users"
        description="People with access to this workspace and the role each one holds."
      />
      <Panel className="flex flex-col items-center justify-center py-20 text-center">
        <IconCustomers size={22} className="text-ink-4 mb-3" />
        <p className="text-[14px] font-medium text-ink">Not yet available</p>
        <p className="mt-1.5 text-[13px] text-ink-3 max-w-sm">
          User administration will be enabled once authentication is connected to the backend.
        </p>
      </Panel>
    </DashboardLayout>
  );
}
