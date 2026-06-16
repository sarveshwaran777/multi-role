import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Menu, Bell, Search, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const { user, darkMode, toggleDarkMode } = useAuth();
  const location = useLocation();

  // Map pathnames to descriptive titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/users')) return 'User Control Hub';
    if (path.startsWith('/orders')) return 'Order Registry';
    if (path.startsWith('/reports')) return 'Performance Analytics';
    if (path.startsWith('/settings')) return 'System Configuration';
    return 'Control Panel';
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-violet-50 text-violet-700 border-violet-200/50 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/30';
      case 'Manager':
        return 'bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/30';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/50 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800/30';
    }
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 lg:hidden"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">{getPageTitle()}</h1>
      </div>

      {/* Utilities panel */}
      <div className="flex items-center gap-4">
        {/* Role Badge Indicator */}
        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user?.role)}`}>
          <Shield className="w-3.5 h-3.5" />
          <span>{user?.role}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Icon (Mock) */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>

        {/* User Mini Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline text-sm font-semibold text-slate-700 dark:text-slate-300">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
