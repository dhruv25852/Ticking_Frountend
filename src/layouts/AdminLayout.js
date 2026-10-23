import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Watch,
  FolderTree,
  Crown,
  ShoppingBag,
  Users,
  CreditCard,
  Tag,
  Star,
  Boxes,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Watch },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Brands', path: '/admin/brands', icon: Crown },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
      isActive
        ? 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20'
        : 'text-stone-400 hover:text-white hover:bg-stone-900/60'
    }`;

  return (
    <div className="flex h-screen w-full bg-[#070709] text-stone-200 overflow-hidden font-sans">
      {/* SIDEBAR (Desktop Fixed Width, Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0B0B0E] border-r border-stone-800/80 flex flex-col justify-between transition-transform duration-300 shrink-0 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Monogram Header & Navigation */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Sidebar Header: Exact h-16 alignment matching main top navigation */}
          <div className="h-16 px-5 border-b border-stone-800/80 flex items-center justify-between shrink-0 box-border">
            <Link to="/" className="flex items-center gap-3 min-w-0 flex-1 group">
              <div className="w-8 h-8 border border-[#D4AF37] flex items-center justify-center bg-black shrink-0 transition-transform group-hover:scale-105">
                <span className="font-serif text-[#D4AF37] text-base font-bold leading-none">
                  {settings?.storeName ? settings.storeName.charAt(0) : 'T'}
                </span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span
                  title={settings?.storeName || 'TICKING LUXARY WATCH'}
                  className="font-serif text-[12.5px] tracking-[0.14em] text-[#F3E5AB] font-bold block truncate uppercase leading-tight"
                >
                  {settings?.storeName || 'TICKING LUXARY WATCH'}
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#D4AF37] block font-semibold leading-tight mt-0.5">
                  Admin Console
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800/60 transition-colors ml-2 shrink-0"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 flex flex-col gap-1 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={linkClass}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Back to Store & Logout */}
        <div className="p-3.5 border-t border-stone-800/80 bg-[#09090C] flex flex-col gap-1.5 shrink-0">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-stone-400 hover:text-[#D4AF37] hover:bg-stone-900/60 rounded-xl transition-colors font-medium uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Live Storefront</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors text-left font-medium uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* MAIN ADMIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Top Header: Exact h-16 matching sidebar header */}
        <header className="h-16 bg-[#0B0B0E] border-b border-stone-800/80 px-4 sm:px-8 flex items-center justify-between shrink-0 box-border">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800/60 transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-400 truncate">
              Master Horological Management
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2.5 bg-[#121216] border border-stone-800 px-3.5 py-1.5 rounded-full shadow-inner">
              <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[10px] font-bold text-[#D4AF37] shrink-0">
                {user?.name?.[0] || 'T'}
              </div>
              <span className="text-xs font-semibold text-stone-200 whitespace-nowrap">
                {user?.name || 'TICKING OWNER (Master Admin)'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#070709]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
