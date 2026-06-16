import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Component */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Scrollable Content Pane */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20 grid-bg p-6 relative">
          <div className="max-w-7xl mx-auto w-full h-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
