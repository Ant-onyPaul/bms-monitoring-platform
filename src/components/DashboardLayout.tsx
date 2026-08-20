import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        
        {/* Navbar Component */}
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}
