import React from 'react';
import { useBank } from '../../context/BankContext';
import { UserRole } from '../../types';
import { ShieldCheck, UserCheck, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { currentUser, allUsers, switchUserRole } = useBank();

  return (
    <div className="bg-navy-950 text-white border-b border-brand-900/40 px-4 py-2.5 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span className="font-semibold text-brand-300 tracking-wide uppercase text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            Interactive Role Simulator (6 Personas):
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Switch persona to test multi-tier approval workflows & RBAC permissions:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {allUsers.map((user) => {
            const isActive = user.role === currentUser.role;
            let roleBadge = '';
            if (user.role === 'customer') roleBadge = 'Applicant';
            else if (user.role === 'bank_officer') roleBadge = 'Officer (≤$5k)';
            else if (user.role === 'approving_manager') roleBadge = 'Manager (≤$50k)';
            else if (user.role === 'finance_officer') roleBadge = 'Disbursement';
            else if (user.role === 'admin') roleBadge = 'SysAdmin';
            else if (user.role === 'auditor') roleBadge = 'Auditor';

            return (
              <button
                key={user.id}
                onClick={() => switchUserRole(user.role as UserRole)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-300'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={`${user.name} - ${user.roleTitle}`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-white/30"
                />
                <span className="font-medium">{user.name.split(' ')[0]}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded ${
                    isActive ? 'bg-brand-800 text-brand-100' : 'bg-slate-900/60 text-slate-400'
                  }`}
                >
                  {roleBadge}
                </span>
                {isActive && <CheckCircle2 className="w-3 h-3 text-brand-200" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
