import React, { useState, useRef, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Bell,
  Sun,
  Moon,
  Search,
  Shield,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Lock,
  Layers,
  Sparkles,
  CreditCard,
  RotateCcw,
  Menu,
  X,
  LayoutDashboard,
  Zap,
  TrendingUp,
  CalendarCheck,
  FileCheck2,
  ClipboardList,
  Sliders,
  Database,
  FlaskConical,
  Wallet,
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../lib/formatters';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isDarkMode,
    toggleDarkMode,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    activeTab,
    setActiveTab,
    setSelectedAdvanceId,
    resetDemoData,
  } = useBank();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Navigation Menu"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                NEXORA
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80">
                Advances
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
              Smart Liquidity Platform
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search advances, statements, reference IDs..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
          />
        </div>

        {/* Right side tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Apply Button */}
          {currentUser.role === 'customer' && (
            <button
              onClick={() => setActiveTab('apply')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all hover:shadow-brand-500/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply for Advance
            </button>
          )}

          {/* Reset Demo Data button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset to factory demo data"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notification Center Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-navy-900 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      Notifications & Alerts
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-brand-500 text-white">
                        {unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          markNotificationRead(item.id);
                          if (item.linkToAdvanceId) {
                            setSelectedAdvanceId(item.linkToAdvanceId);
                            setActiveTab('tracking');
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          !item.read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatDateTime(item.timestamp).split(',')[1]}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                          {item.message}
                        </p>
                        {item.linkToAdvanceId && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                            <span>Open details</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-500/50"
              />
              <div className="text-left hidden lg:block pr-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                  {currentUser.roleTitle.split('&')[0]}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-brand-500/50"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {currentUser.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> KYC Level 3
                      </span>
                      <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> MFA Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="py-2 space-y-1 text-xs">
                  <div className="flex justify-between py-1 text-slate-500 dark:text-slate-400">
                    <span>Active Account:</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      {currentUser.activeAccountNo}
                    </span>
                  </div>
                  {currentUser.approvalLimit && (
                    <div className="flex justify-between py-1 text-slate-500 dark:text-slate-400">
                      <span>Approval Limit:</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        ${currentUser.approvalLimit.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 text-slate-500 dark:text-slate-400">
                    <span>Credit Score:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {currentUser.creditScore} (Prime)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    Account & Security Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-navy-900/95 backdrop-blur-lg p-4 space-y-1.5 animate-in slide-in-from-top-2 duration-150 max-h-[80vh] overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation Menu
          </div>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'apply', label: 'Apply for Advance', icon: Sparkles },
            { id: 'advances', label: 'Advances Portfolio', icon: Zap },
            { id: 'tracking', label: 'Journey & Tracking', icon: TrendingUp },
            { id: 'repayments', label: 'Repayments & Calendar', icon: CalendarCheck },
            { id: 'workflow', label: 'Approval Desk', icon: FileCheck2 },
            { id: 'accounts', label: 'Accounts & Cards', icon: Wallet },
            { id: 'audit', label: 'Audit & Compliance', icon: ClipboardList },
            { id: 'settings', label: 'Rules & Governance', icon: Sliders },
            { id: 'api-schema', label: 'API & DB Schema', icon: Database },
            { id: 'tests', label: 'Automated Tests', icon: FlaskConical },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Demo Data?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              This will restore the factory demonstration benchmark, resetting all accounts, advances, and logs.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
