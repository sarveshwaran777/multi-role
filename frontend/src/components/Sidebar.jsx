import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      permission: 'Dashboard'
    },
    {
      name: 'Users',
      path: '/users',
      icon: Users,
      permission: 'Users'
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: ShoppingBag,
      permission: 'Orders'
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
      permission: 'Reports'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      permission: 'Settings'
    }
  ];

  // Filter menu items by permission
  const filteredMenu = menuItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200/60 dark:border-slate-800/60">
          <NavLink to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>AeroDash</span>
          </NavLink>
          
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 dark:shadow-indigo-600/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-base shadow-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-transparent rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
