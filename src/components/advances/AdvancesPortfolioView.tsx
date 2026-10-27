import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/formatters';
import {
  Zap,
  TrendingUp,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Download,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const AdvancesPortfolioView: React.FC = () => {
  const { advances, setSelectedAdvanceId, setActiveTab } = useBank();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAdvances = advances.filter((adv) => {
    const matchesFilter =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && (adv.status === 'DISBURSED' || adv.status === 'ACTIVE')) ||
      (filterStatus === 'PENDING' && (adv.status === 'SUBMITTED' || adv.status === 'UNDER_REVIEW' || adv.status === 'APPROVED')) ||
      (filterStatus === 'SETTLED' && adv.status === 'SETTLED');

    const matchesSearch =
      adv.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.purposeNote.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Advances Management System
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800">
              Automated Liquidity
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Smart Advances Portfolio & History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your active facilities, track pending approvals, and inspect settled advances.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('apply')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply for New Advance</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by facility ID or purpose..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto">
          {(['ALL', 'ACTIVE', 'PENDING', 'SETTLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                filterStatus === tab
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'ALL' ? 'All Facilities' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Advance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAdvances.map((adv) => {
          const colors = getStatusColor(adv.status);
          const isSettled = adv.status === 'SETTLED';

          return (
            <div
              key={adv.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 shadow-sm transition-all hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    {adv.applicationNo}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                    {adv.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {adv.purpose.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {adv.purposeNote}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 font-sans block text-[11px]">Facility Amount</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(adv.requestedAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[11px]">Monthly Installment</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrency(adv.monthlyInstallment)}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[11px]">Duration</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {adv.tenureMonths} Months
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-sans block text-[11px]">Outstanding</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(adv.outstandingTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-sans">
                  Applied {formatDate(adv.createdAt)}
                </span>
                <button
                  onClick={() => {
                    setSelectedAdvanceId(adv.id);
                    setActiveTab('tracking');
                  }}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1 group"
                >
                  <span>Track Journey</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
