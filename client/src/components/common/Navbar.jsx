import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  User,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { INITIAL_ROLES } from '../../data/benchmarkData';

export const Navbar = ({ onOpenSidebar, onOpenSearch }) => {
  const { currentUser, switchRole, isOffline, setIsOffline, offlineQueue, syncOfflineQueue, notifications, markNotificationsAsRead } = useERP();
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      syncOfflineQueue();
      setIsSyncing(false);
    }, 800);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-surface-dark/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 transition-colors">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-400 text-xs transition-colors w-44 md:w-72"
        >
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate hidden sm:inline">{t('searchPlaceholder')}</span>
          <span className="truncate sm:hidden">Search...</span>
          <kbd className="hidden md:inline-flex ml-auto px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Benchmark Date Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-medium border border-primary-100 dark:border-primary-900/50">
          <Calendar className="w-3.5 h-3.5" />
          <span>Jan 15 – Jan 21, 2025</span>
        </div>

        {/* Offline Simulation Toggle & Sync Badge */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsOffline(prev => !prev)}
            title={isOffline ? "Currently in Offline Mode. Click to switch Online." : "Currently Online. Click to simulate Offline."}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
              isOffline
                ? 'bg-amber-500/10 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700'
                : 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="hidden sm:inline">Offline</span>
                {offlineQueue.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                    {offlineQueue.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Online</span>
              </>
            )}
          </button>

          {offlineQueue.length > 0 && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 text-xs flex items-center gap-1 shadow-sm transition-all"
              title="Sync queued orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Language Selector: English / தமிழ் */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle English / தமிழ்"
        >
          <Globe className="w-3.5 h-3.5 text-primary-500" />
          <span>{language === 'en' ? 'EN' : 'தமிழ்'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle dark/light theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(prev => !prev);
              setShowRoleMenu(false);
            }}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-dropdown p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  Notifications & Alerts
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markNotificationsAsRead}
                    className="text-xs text-primary-500 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      n.type === 'danger'
                        ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50'
                        : n.type === 'warning'
                        ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(prev => !prev);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {currentUser?.name}
              </div>
              <div className="text-[10px] text-primary-500 font-medium">
                {currentUser?.badge}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl shadow-dropdown p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  Switch Active Role
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Simulate any of the 5 platform roles
                </p>
              </div>

              <div className="mt-1 space-y-1">
                {INITIAL_ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => {
                      switchRole(role.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                      currentUser.id === role.id
                        ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-left">
                      <div>{role.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{role.label}</div>
                    </div>
                    {currentUser.id === role.id && (
                      <CheckCircle2 className="w-4 h-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
