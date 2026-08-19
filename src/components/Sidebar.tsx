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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.05)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        
        {/* Header/Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <span className="text-xl font-bold text-brand-green tracking-wide">SHADE ENERGY</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-r-lg mb-1 text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-green/20 to-transparent text-brand-green shadow-[inset_4px_0_0_0_#10B981]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-green shadow-[0_0_10px_#10B981] animate-pulseGlow"></div>
                    )}
                    <Icon className={`w-5 h-5 mr-3 shrink-0 transition-transform duration-300 ${!isActive && 'group-hover:translate-x-1 group-hover:scale-110'} ${isActive ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : ''}`} />
                    <span className={`transition-transform duration-300 ${!isActive && 'group-hover:translate-x-1'}`}>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors"
          >
            <FiLogOut className="w-5 h-5 mr-3 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
