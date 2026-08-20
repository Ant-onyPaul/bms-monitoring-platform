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
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        
        {/* Header/Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <span className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-[#10B981] flex items-center justify-center">
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
                      ? 'bg-[#10B981]/10 text-[#10B981]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#10B981] rounded-r-sm"></div>
                    )}
                    <Icon className={`w-5 h-5 mr-3 shrink-0 ${isActive ? 'text-[#10B981]' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <FiLogOut className="w-5 h-5 mr-3 shrink-0 text-muted-foreground" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
