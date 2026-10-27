import React from 'react';
import { useBank } from '../../context/BankContext';
import {
  LayoutDashboard,
  Zap,
  TrendingUp,
  FileCheck2,
  CalendarCheck,
  ShieldAlert,
  Sliders,
  Wallet,
  Sparkles,
  ClipboardList,
  ChevronRight,
  FlaskConical,
  Database,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { activeTab, setActiveTab, currentUser, advances } = useBank();

  // Calculate pending reviews for badge
  const pendingOfficerCount = advances.filter((a) => a.status === 'SUBMITTED').length;
  const pendingManagerCount = advances.filter((a) => a.status === 'UNDER_REVIEW' || (a.status === 'SUBMITTED' && a.requestedAmount > 5000)).length;
  const pendingFinanceCount = advances.filter((a) => a.status === 'APPROVED').length;

  let workflowBadgeCount = 0;
  if (currentUser.role === 'bank_officer') workflowBadgeCount = pendingOfficerCount;
  else if (currentUser.role === 'approving_manager') workflowBadgeCount = pendingManagerCount;
  else if (currentUser.role === 'finance_officer') workflowBadgeCount = pendingFinanceCount;
  else if (currentUser.role === 'admin') workflowBadgeCount = pendingOfficerCount + pendingManagerCount + pendingFinanceCount;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Banking Dashboard',
      icon: LayoutDashboard,
      roles: ['customer', 'bank_officer', 'approving_manager', 'finance_officer', 'admin', 'auditor'],
    },
    {
      id: 'apply',
      label: 'Apply for Advance',
      icon: Sparkles,
      roles: ['customer', 'admin'],
      highlight: true,
    },
    {
      id: 'advances',
      label: 'Advances Portfolio',
      icon: Zap,
      roles: ['customer', 'bank_officer', 'approving_manager', 'finance_officer', 'admin', 'auditor'],
    },
    {
      id: 'tracking',
      label: 'Journey & Tracking',
      icon: TrendingUp,
      roles: ['customer', 'bank_officer', 'approving_manager', 'finance_officer', 'admin', 'auditor'],
    },
    {
      id: 'repayments',
      label: 'Repayments & Calendar',
      icon: CalendarCheck,
      roles: ['customer', 'finance_officer', 'admin', 'auditor'],
    },
    {
      id: 'workflow',
      label: 'Approval Desk',
      icon: FileCheck2,
      roles: ['bank_officer', 'approving_manager', 'finance_officer', 'admin', 'auditor'],
      badge: workflowBadgeCount,
    },
    {
      id: 'accounts',
      label: 'Accounts & Cards',
      icon: Wallet,
      roles: ['customer', 'admin', 'finance_officer'],
    },
    {
      id: 'audit',
      label: 'Audit & Compliance',
      icon: ClipboardList,
      roles: ['auditor', 'admin', 'approving_manager'],
    },
    {
      id: 'settings',
      label: 'Rules & Governance',
      icon: Sliders,
      roles: ['admin', 'auditor', 'approving_manager'],
    },
    {
      id: 'api-schema',
      label: 'API & DB Schema',
      icon: Database,
      roles: ['customer', 'bank_officer', 'approving_manager', 'finance_officer', 'admin', 'auditor'],
    },
    {
      id: 'tests',
      label: 'Automated Tests',
      icon: FlaskConical,
      roles: ['customer', 'bank_officer', 'approving_manager', 'finance_officer', 'admin', 'auditor'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-slate-900/95 text-slate-300 border-r border-slate-800 flex-shrink-0 flex flex-col justify-between hidden md:flex h-[calc(100vh-6.25rem)] sticky top-[6.25rem]">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Navigation items */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Navigation Menu
          </div>
          <nav className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                      : item.highlight
                      ? 'bg-brand-950/60 text-brand-300 border border-brand-800/60 hover:bg-brand-900/80 hover:text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && <ChevronRight className="w-3.5 h-3.5 text-brand-200" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Facility Status Card in Sidebar */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">
              Advances Health
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            All credit pipelines operational. Multi-tier limits active.
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Prime APR</span>
            <span className="font-mono font-bold text-brand-400">4.50%</span>
          </div>
        </div>
      </div>

      {/* Role Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser.roleTitle}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
