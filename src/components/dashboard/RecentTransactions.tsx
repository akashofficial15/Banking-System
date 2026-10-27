import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { transactions, advances, setSelectedAdvanceId, setActiveTab } = useBank();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'INFLOW' && tx.direction === 'INFLOW') ||
      (filterType === 'OUTFLOW' && tx.direction === 'OUTFLOW') ||
      (filterType === 'ADVANCES' && (tx.type === 'ADVANCE_DISBURSEMENT' || tx.type === 'ADVANCE_REPAYMENT'));

    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.counterparty.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>Unified Activity & Financial Transactions</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredTransactions.length} records
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time feed of payroll, disbursements, repayments, and debits.
          </p>
        </div>

        {/* Filter pills & search */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reference or payee..."
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-48"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['ALL', 'ADVANCES', 'INFLOW', 'OUTFLOW'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  filterType === filter
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {filter === 'ALL' ? 'All Activity' : filter === 'ADVANCES' ? '⚡ Advances' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pl-1">Transaction / Payee</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Reference ID</th>
              <th className="pb-3">Date & Time</th>
              <th className="pb-3 text-right">Amount</th>
              <th className="pb-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No transactions match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isInflow = tx.direction === 'INFLOW';
                const isAdvanceRelated = tx.type === 'ADVANCE_DISBURSEMENT' || tx.type === 'ADVANCE_REPAYMENT';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (tx.advanceId) {
                        setSelectedAdvanceId(tx.advanceId);
                        setActiveTab('tracking');
                      }
                    }}
                  >
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isAdvanceRelated
                              ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                              : isInflow
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isAdvanceRelated ? (
                            <Zap className="w-4 h-4" />
                          ) : isInflow ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {tx.description}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {tx.counterparty}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tx.category}
                      </span>
                    </td>

                    <td className="py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {tx.reference}
                    </td>

                    <td className="py-3.5 text-slate-500 dark:text-slate-400">
                      {formatDateTime(tx.timestamp)}
                    </td>

                    <td className="py-3.5 text-right font-mono font-bold">
                      <span
                        className={
                          isInflow
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }
                      >
                        {isInflow ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
