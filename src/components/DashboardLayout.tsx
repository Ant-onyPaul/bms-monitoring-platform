import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/* -----------------------------------------------------------------------------
   DashboardLayout

   The app shell. Deliberately has no background of its own: the ambient light
   field painted on the document shows through, which is what gives the glass
   chrome something to refract.

   Content is keyed on pathname so each route mounts with a short entrance —
   the transition marks that the view changed without delaying it.
   -------------------------------------------------------------------------- */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  return (
    <div className="flex h-screen text-ink overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto scrollbar-fine">
          <div
            key={location.pathname}
            className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-9
              animate-slide-up-fade"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
