import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import {
  Activity,
  BarChart3,
  Building2,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Stethoscope,
  Users,
  HardDrive,
  History,
  PlusCircle,
  MapPin,
  Upload,
  Bell,
  Search,
  Settings,
  HelpCircle,
  PanelLeft
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-specific navigation definitions
  const getNavItems = () => {
    switch (user?.role) {
      case 'Facility Staff':
        return [
          { to: '/dashboard', label: 'Hospital Dashboard', icon: LayoutDashboard },
          { to: '/referrals/new', label: 'Create Referral', icon: PlusCircle },
          { to: '/referrals', label: 'Manage Referrals', icon: FileText },
          { to: '/referrals/upload', label: 'Upload Referral Records', icon: Upload },
          { to: '/capacity', label: 'Update Capacity', icon: Stethoscope },
        ];

      case 'District Officer':
        return [
          { to: '/dashboard', label: 'District Dashboard', icon: LayoutDashboard },
          { to: '/hospital-analysis', label: 'Hospital Analysis', icon: Building2 },
          { to: '/analytics', label: 'Referral Analytics', icon: BarChart3 },
          { to: '/gap-analysis', label: 'Service Gap Analysis', icon: ShieldAlert },
          { to: '/alerts', label: 'Deficit Alerts', icon: Bell },
          { to: '/storage-files', label: 'Reports & Export', icon: HardDrive },
        ];

      case 'State Officer':
        return [
          { to: '/dashboard', label: 'State Dashboard', icon: LayoutDashboard },
          { to: '/district-analysis', label: 'District Analysis', icon: MapPin },
          { to: '/hospital-analysis', label: 'Hospital Analysis', icon: Building2 },
          { to: '/analytics', label: 'Referral Analytics', icon: BarChart3 },
          { to: '/gap-analysis', label: 'Service Gap Analysis', icon: ShieldAlert },
          { to: '/storage-files', label: 'Reports & Export', icon: HardDrive },
        ];

      case 'National Officer':
        return [
          { to: '/dashboard', label: 'National Dashboard', icon: LayoutDashboard },
          { to: '/state-analysis', label: 'State Analysis', icon: Layers },
          { to: '/district-analysis', label: 'District Analysis', icon: MapPin },
          { to: '/hospital-analysis', label: 'Hospital Analysis', icon: Building2 },
          { to: '/analytics', label: 'Referral Analytics', icon: BarChart3 },
          { to: '/gap-analysis', label: 'Service Gap Analysis', icon: ShieldAlert },
          { to: '/storage-files', label: 'Reports & Export', icon: HardDrive },
        ];

      case 'Administrator':
      default:
        return [
          { to: '/dashboard', label: 'System Dashboard', icon: LayoutDashboard },
          { to: '/state-analysis', label: 'State Analysis', icon: Layers },
          { to: '/district-analysis', label: 'District Analysis', icon: MapPin },
          { to: '/hospital-analysis', label: 'Hospital Analysis', icon: Building2 },
          { to: '/analytics', label: 'Referral Analytics', icon: BarChart3 },
          { to: '/gap-analysis', label: 'Service Gap Analysis', icon: ShieldAlert },
          { to: '/alerts', label: 'Deficit Alerts', icon: Bell },
          { to: '/facilities', label: 'Facilities Directory', icon: Building2 },
          { to: '/capacity', label: 'Capacity & Resources', icon: Stethoscope },
          { to: '/services', label: 'Services Catalog', icon: Layers },
          { to: '/users', label: 'User Directory', icon: Users },
          { to: '/storage-files', label: 'Reports & Export', icon: HardDrive },
          { to: '/activity-logs', label: 'Audit Trail', icon: History },
        ];
    }
  };

  const navItems = getNavItems();
  const filteredNavItems = searchQuery
    ? navItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : navItems;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-200/90 dark:border-slate-800 select-none transition-colors duration-200">
      
      {/* 1. Brand Logo Header (Matching Image 1 & Clickable Logo) */}
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <NavLink to="/dashboard" className="flex items-center space-x-2 group cursor-pointer min-w-0">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
            <img
              src="/sehat-setu-logo.png"
              alt="SEHAT-SETU Logo"
              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight block truncate">
              SEHAT-SETU
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block truncate">
              Portal
            </span>
          </div>
        </NavLink>
        <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md cursor-pointer shrink-0">
          <PanelLeft className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Search Bar (Matching Image 1 [Search  ⌘K]) */}
      <div className="px-3 pt-3.5 pb-1">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/70 focus:bg-white dark:focus:bg-slate-800 text-xs text-slate-900 dark:text-white pl-8 pr-12 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <span className="absolute right-2.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
            ⌘ K
          </span>
        </div>
      </div>

      {/* 3. Subtle Role & Jurisdiction Chip */}
      <div className="px-3 py-1.5">
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {user?.facility_name ? 'Hospital' : user?.district_name || 'National'}
          </span>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
            {user?.role}
          </span>
        </div>
      </div>

      {/* 4. Section Label */}
      <div className="px-3 pt-3 pb-1">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
          MENU
        </span>
      </div>

      {/* 5. Navigation Items (Matching Image 1 soft neutral pill) */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* 6. Secondary Links: Settings & Help Center (Matching Image 1) */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-3 pt-2 pb-1 space-y-0.5">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
        <a
          href="/about"
          className="flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help Center</span>
        </a>
      </div>

      {/* 7. User Footer with Avatar, Info & Fixed Logout (Directly accessible!) */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-xs shrink-0 shadow-2xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <ThemeToggle className="scale-75 origin-right" />
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  );
};
