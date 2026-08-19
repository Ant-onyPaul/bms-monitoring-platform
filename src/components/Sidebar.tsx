import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiGrid, 
  FiServer, 
  FiUsers, 
  FiLogOut,
  FiBriefcase
} from 'react-icons/fi';
import Logo from './Logo';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ isOpen, toggleSidebar }: any) {
  const { profile, signOut } = useAuth();
  const role = profile?.role || 'customer';

  // Define menus based on roles
  const menus: Record<string, any[]> = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
      { name: 'Vendors', path: '/admin/vendors', icon: FiBriefcase },
      { name: 'Customers', path: '/admin/customers', icon: FiUsers },
      { name: 'Devices', path: '/admin/devices', icon: FiServer },
    ],
    vendor: [
      { name: 'Dashboard', path: '/vendor/dashboard', icon: FiHome },
      { name: 'Customers', path: '/vendor/customers', icon: FiUsers },
      { name: 'Devices', path: '/vendor/devices', icon: FiServer },
    ],
    customer: [
      { name: 'Dashboard', path: '/customer/dashboard', icon: FiHome },
      { name: 'My Devices', path: '/customer/devices', icon: FiServer },
    ]
  };

  const menuItems = menus[role] || menus.customer;

  const handleLogout = async () => {
    if (import.meta.env.VITE_MOCK_AUTH === 'true') {
      window.location.href = '/login';
    } else {
      await signOut();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        
        {/* Header/Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 shrink-0">
          <span className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-green to-brand-blue flex items-center justify-center">
               <span className="text-white text-xs font-bold">S</span>
            </div>
            SHADE ENERGY
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 group relative ${
                    isActive
                      ? 'bg-slate-50 text-brand-green'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand-green rounded-r-full"></div>
                    )}
                    <Icon className={`w-5 h-5 mr-3 shrink-0 ${isActive ? 'text-brand-green' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <FiLogOut className="w-5 h-5 mr-3 shrink-0 text-slate-400" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
