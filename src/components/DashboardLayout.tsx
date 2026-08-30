import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/* -----------------------------------------------------------------------------
   DashboardLayout

   The app shell. Content is keyed on pathname so each route mounts with a short
   entrance — the transition marks that the view changed without delaying it.
   -------------------------------------------------------------------------- */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  return (
    <div className="flex h-screen bg-canvas text-ink overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto scrollbar-fine">
          <div
            key={location.pathname}
            className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
