import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Handshake, Users, Building2,
  FileBarChart, Bell, UserCircle, LogOut, ChevronLeft,
  ChevronRight, TrendingUp, Menu, X, Package, ShoppingBag,
  Sun, Moon, ShieldAlert, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../hooks/useAlerts';
import { useTheme } from '../context/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount } = useAlerts();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = (path: string) => {
    if (path.startsWith('/deals/')) return 'Deal Details';
    switch (path) {
      case '/dashboard': return 'Sales Report';
      case '/reports': return 'Sales Report'; // Matches screenshot
      case '/deals': return 'Deals Pipeline';
      case '/products': return 'Products Catalog';
      case '/customers': return 'Consumer CRM';
      case '/sales': return 'Sales Ledger';
      case '/performance': return 'Team Performance';
      case '/accounts': return 'Client Accounts';
      case '/alerts': return 'System Alerts';
      case '/profile': return 'My Profile';
      case '/admin': return 'Admin Settings';
      default: return 'Sales Report';
    }
  };

  const menuGroups = [
    {
      title: 'MENU',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/reports', label: 'Report', icon: FileBarChart },
        { to: '/products', label: 'Products', icon: Package },
        { to: '/customers', label: 'Consumer', icon: Users },
      ]
    },
    {
      title: 'FINANCIAL',
      items: [
        { to: '/sales', label: 'Transactions', icon: ShoppingBag },
        { to: '/accounts', label: 'Invoices', icon: Building2 },
      ]
    },
    {
      title: 'TOOLS',
      items: [
        { to: '/deals', label: 'Deals Pipeline', icon: Handshake },
        { to: '/performance', label: 'Performance', icon: FileBarChart },
        { to: '/profile', label: 'Settings', icon: UserCircle },
        { to: '/alerts', label: 'Alerts', icon: Bell },
      ]
    }
  ];

  if (user?.role === 'admin') {
    const toolsGroup = menuGroups.find(g => g.title === 'TOOLS');
    if (toolsGroup && !toolsGroup.items.some(i => i.to === '/admin')) {
      toolsGroup.items.push({ to: '/admin', label: 'Admin Panel', icon: ShieldAlert });
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-colors duration-300">
      {/* Brand Header */}
      <div className={`flex items-center gap-2.5 px-5 py-5 ${collapsed ? 'justify-center px-2' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6f2b8b] to-[#b56dd3] flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-[#6f2b8b]/20 relative">
          <span className="text-sm font-black text-white">G</span>
          <div className="absolute inset-0.5 rounded-[9px] border border-white/20" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-black text-slate-850 dark:text-white tracking-tight leading-tight">
              GWC <span className="text-[#6f2b8b] dark:text-[#b56dd3]">DATA.AI</span>
            </p>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-4">
        {menuGroups.map(group => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold px-3 mb-2">
                {group.title}
              </p>
            )}
            {collapsed && (
              <div className="w-full border-t border-slate-100 dark:border-slate-800/80 my-2" />
            )}
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl mb-1 transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6f2b8b] to-[#8a3fa9] text-white font-bold shadow-md shadow-[#6f2b8b]/15'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex-shrink-0">
                      <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-350'} />
                      {label.includes('Alerts') && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {!collapsed && <span className="text-xs font-semibold">{label}</span>}
                    
                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700">
                        {label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>


      {/* Logout / User Info when Collapsed */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6f2b8b] to-[#b56dd3] flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md shadow-[#6f2b8b]/20 select-none">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate leading-tight">{user?.name}</p>
              <p className="text-[9px] text-slate-400 capitalize truncate font-semibold mt-0.5">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6f2b8b] to-[#b56dd3] flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-md shadow-[#6f2b8b]/20 select-none">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] dark:bg-slate-950 transition-colors duration-300 font-sans">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 relative ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        <SidebarContent />

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white shadow-sm transition-all z-20 cursor-pointer"
        >
          {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
        </button>
      </aside>

      {/* Sidebar Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white border-r border-slate-100 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 bg-transparent">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="text-left">
              <h1 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                {getPageTitle(location.pathname)}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800/80 transition-colors cursor-pointer"
              title="Search"
            >
              <Search size={15} />
            </button>

            {/* Notification Bell */}
            <button
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800/80 transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800/80 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

            {/* Profile Pill */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-full pl-1.5 pr-4.5 py-1.5 shadow-sm border border-slate-100 dark:border-slate-800/80 hidden sm:flex">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6f2b8b] to-[#b56dd3] flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm select-none">
                {user?.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div className="text-left">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block leading-tight">{user?.name}</span>
                <span className="text-[9px] text-slate-400 font-semibold block leading-none">{user?.role === 'admin' ? 'Admin store' : 'Store employee'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f4f6fa] dark:bg-slate-950 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
