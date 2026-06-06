'use client';

import { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';

interface DashboardLayoutShellProps {
  children: React.ReactNode;
  storeName: string | null;
  isConnected: boolean;
}

export default function DashboardLayoutShell({
  children,
  storeName,
  isConnected,
}: DashboardLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex font-sans" dir="rtl">
      {/* Sidebar (Desktop fixed + Mobile Drawer) */}
      <DashboardSidebar
        storeName={storeName}
        isConnected={isConnected}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 md:mr-64">
        {/* Topbar */}
        <DashboardTopbar
          storeName={storeName}
          isConnected={isConnected}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        {/* Page Content */}
        <main className="flex-grow p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
