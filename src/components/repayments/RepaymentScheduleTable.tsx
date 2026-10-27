import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Advance, RepaymentInstallment } from '../../types';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/formatters';
import { EarlySettlementModal } from './EarlySettlementModal';
import {
  CalendarCheck,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Download,
} from 'lucide-react';

export const RepaymentScheduleTable: React.FC = () => {
  const { advances, selectedAdvance, setSelectedAdvanceId, makeRepayment } = useBank();
  const [showEarlySettlement, setShowEarlySettlement] = useState(false);
  const [payingInstallmentNo, setPayingInstallmentNo] = useState<number | null>(null);

  if (!selectedAdvance) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active advance selected.
      </div>
    );
  }

  const handlePayNow = (installment: RepaymentInstallment) => {
    setPayingInstallmentNo(installment.installmentNo);
    setTimeout(() => {
      makeRepayment(
        selectedAdvance.id,
        installment.installmentNo,
        installment.totalDue,
        'Direct Debit (NX-8829-4410-09)'
      );
      setPayingInstallmentNo(null);
    }, 700);
  };

  const paidCount = selectedAdvance.repaymentSchedule.filter((s) => s.status === 'PAID').length;
  const progressPct = Math.round((paidCount / Math.max(1, selectedAdvance.tenureMonths)) * 100);

  return (
    <div className="space-y-6">
      {/* Advance Selector & Metrics Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Active Facility
            </span>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {selectedAdvance.applicationNo}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {selectedAdvance.purpose.replace(/_/g, ' ')} Servicing Schedule
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Progress: {paidCount} of {selectedAdvance.tenureMonths} installments paid ({progressPct}%)
          </p>

          {/* Progress bar */}
          <div className="w-64 bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500">Remaining Balance:</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(selectedAdvance.outstandingTotal)}
            </div>
          </div>

          {selectedAdvance.outstandingTotal > 0 && (
            <button
              onClick={() => setShowEarlySettlement(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/25 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Settle Early & Save Interest</span>
            </button>
          )}
        </div>
      </div>

      {/* Installments Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Amortization & Payment History
          </h4>

          <span className="text-xs text-slate-500 font-mono">
            Fixed Monthly Installment: <strong>{formatCurrency(selectedAdvance.monthlyInstallment)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-1">#</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Principal</th>
                <th className="pb-3">Interest</th>
                <th className="pb-3">Fees</th>
                <th className="pb-3">Total Due</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-1">Action / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {selectedAdvance.repaymentSchedule.map((inst) => {
                const colors = getStatusColor(inst.status);
                const isPaid = inst.status === 'PAID';
                const isDue = inst.status === 'DUE' || inst.status === 'UPCOMING';
                const isPayingThis = payingInstallmentNo === inst.installmentNo;

                return (
                  <tr
                    key={inst.installmentNo}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 pl-1 text-slate-400 font-sans font-bold">
                      {inst.installmentNo}
                    </td>

                    <td className="py-3 font-sans text-slate-800 dark:text-slate-200 font-medium">
                      {formatDate(inst.dueDate)}
                    </td>

                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {formatCurrency(inst.principal)}
                    </td>

                    <td className="py-3 text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(inst.interest)}
                    </td>

                    <td className="py-3 text-slate-400">
                      {formatCurrency(inst.fee)}
                    </td>

                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inst.totalDue)}
                    </td>

                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                        {inst.status}
                      </span>
                    </td>

                    <td className="py-3 text-right pr-1">
                      {isPaid ? (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {inst.transactionRef || 'PAID'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayNow(inst)}
                          disabled={isPayingThis}
                          className="px-3 py-1 rounded-lg text-[11px] font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-xs transition-all"
                        >
                          {isPayingThis ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Early Settlement Modal */}
      <EarlySettlementModal
        advance={selectedAdvance}
        isOpen={showEarlySettlement}
        onClose={() => setShowEarlySettlement(false)}
      />
    </div>
  );
};
