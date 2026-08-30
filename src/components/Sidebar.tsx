import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';
import {
  IconDashboard,
  IconVendors,
  IconCustomers,
  IconRack,
  IconLogout,
  IconClose,
} from './icons';

/* -----------------------------------------------------------------------------
   Sidebar

   A quiet, permanent frame of reference. Navigation is a single flat list —
   this product has three or four destinations per role, and grouping them would
   invent hierarchy that does not exist.

   The active item is marked by an inset rail and a filled ground rather than a
   coloured label, so the accent appears exactly once in the chrome.
   -------------------------------------------------------------------------- */

const MENUS = {
  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: IconDashboard },
    { name: 'Vendors', path: '/admin/vendors', icon: IconVendors },
    { name: 'Customers', path: '/admin/customers', icon: IconCustomers },
    { name: 'Devices', path: '/admin/devices', icon: IconRack },
  ],
  vendor: [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: IconDashboard },
    { name: 'Customers', path: '/vendor/customers', icon: IconCustomers },
    { name: 'Devices', path: '/vendor/devices', icon: IconRack },
  ],
  customer: [
    { name: 'Dashboard', path: '/customer/dashboard', icon: IconDashboard },
    { name: 'My Devices', path: '/customer/devices', icon: IconRack },
  ],
} as const;

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin Console',
  vendor: 'Vendor Portal',
  customer: 'Customer Portal',
};

export default function Sidebar({ isOpen, toggleSidebar }: any) {
  const { profile, signOut } = useAuth();
  const role = (profile?.role || 'customer') as keyof typeof MENUS;
  const menuItems = MENUS[role] || MENUS.customer;

  const handleLogout = async () => {
    if (import.meta.env.VITE_MOCK_AUTH === 'true') {
      window.location.href = '/login';
    } else {
      await signOut();
    }
  };

  const initials = (profile?.full_name || 'User')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Mobile scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(23,24,26,0.38)] lg:hidden animate-fade-in"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[252px] bg-surface border-r border-line
          flex flex-col
          transform transition-transform duration-300 [transition-timing-function:var(--ease-precise)]
          lg:translate-x-0 lg:static lg:inset-auto lg:shrink-0
          ${isOpen ? 'translate-x-0 shadow-[var(--shadow-e4)] lg:shadow-none' : '-translate-x-full'}
        `}
      >
        {/* Identity */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-line shrink-0">
          <Logo showText size={26} />
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Close navigation"
            className="lg:hidden w-8 h-8 -mr-1.5 inline-flex items-center justify-center rounded-md
              text-ink-3 hover:text-ink hover:bg-surface-3 transition-colors cursor-pointer"
          >
            <IconClose size={16} />
          </button>
        </div>

        {/* Role context */}
        <div className="px-5 pt-5 pb-3">
          <span className="label-technical">{ROLE_LABEL[role] ?? 'Portal'}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-fine px-3 pb-4 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => isOpen && toggleSidebar()}
                className={({ isActive }) => `
                  relative flex items-center gap-3 h-9 px-3 rounded-md
                  text-[13px] font-medium
                  transition-colors duration-150 [transition-timing-function:var(--ease-precise)]
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand
                  ${
                    isActive
                      ? 'bg-surface-3 text-ink'
                      : 'text-ink-3 hover:text-ink hover:bg-surface-2'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 rounded-r-full bg-brand"
                      />
                    )}
                    <Icon
                      size={16}
                      className={`shrink-0 ${isActive ? 'text-brand-ink' : 'text-ink-4'}`}
                    />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Identity & exit */}
        <div className="border-t border-line p-3 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <span
              className="w-8 h-8 shrink-0 rounded-md bg-surface-3 border border-line
                inline-flex items-center justify-center text-[11px] font-bold text-ink-2"
            >
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-semibold text-ink truncate">
                {profile?.full_name || 'Signed in'}
              </span>
              <span className="block text-[11px] text-ink-4 truncate">
                {profile?.email || '—'}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 h-9 px-3 rounded-md text-[13px] font-medium
              text-ink-3 hover:text-crit-ink hover:bg-crit-surface cursor-pointer
              transition-colors duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <IconLogout size={16} className="shrink-0" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
