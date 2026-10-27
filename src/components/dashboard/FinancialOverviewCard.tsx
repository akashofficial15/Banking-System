import React from 'react';
import { useBank } from '../../context/BankContext';
import { formatCurrency } from '../../lib/formatters';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  Calendar,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const FinancialOverviewCard: React.FC = () => {
  const { currentUser, accounts, advances, setActiveTab, setSelectedAdvanceId } = useBank();

  // Aggregate financial metrics
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAvailable = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
  const activeAdvances = advances.filter((a) => a.status === 'DISBURSED' || a.status === 'ACTIVE');
  const outstandingAdvanceTotal = activeAdvances.reduce((sum, a) => sum + a.outstandingTotal, 0);

  // Find next due date
  const nextAdvance = activeAdvances.find((a) => a.nextDueDate);

  return (
    <div className="space-y-4">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-brand-950 p-6 text-white shadow-xl border border-brand-900/40">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-300">
                Welcome Back
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Tier 1 Priority Customer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {currentUser.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Your Nexora Smart Advances facility is fully active. Instant salary advances and equipment loans available up to $25,000.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('apply')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Apply for Smart Advance
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              Track Advances
            </button>
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Account Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-brand-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalBalance)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8.4% monthly inflow</span>
          </div>
        </div>

        {/* Card 2: Liquid Available Funds */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-brand-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Available Liquid</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalAvailable)}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across 2 depository accounts
          </div>
        </div>

        {/* Card 3: Outstanding Advances */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-brand-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Advances</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {formatCurrency(outstandingAdvanceTotal)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {activeAdvances.length} facility active
            </span>
            {outstandingAdvanceTotal > 0 && (
              <button
                onClick={() => {
                  if (nextAdvance) setSelectedAdvanceId(nextAdvance.id);
                  setActiveTab('repayments');
                }}
                className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                Payoff early
              </button>
            )}
          </div>
        </div>

        {/* Card 4: Next Scheduled Repayment */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-brand-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Next Repayment</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
            {nextAdvance ? formatCurrency(nextAdvance.monthlyInstallment) : '$0.00'}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {nextAdvance?.nextDueDate
                ? `Due on ${new Date(nextAdvance.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'No pending dues'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold">
              Auto-Deduct
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
