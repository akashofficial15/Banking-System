import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Advance } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import {
  Banknote,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send,
  Building,
  CreditCard,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FinanceDisbursementQueue: React.FC = () => {
  const { advances, accounts, disburseAdvance, currentUser, setActiveTab, setSelectedAdvanceId } = useBank();
  const [selectedDisbAdv, setSelectedDisbAdv] = useState<Advance | null>(null);
  const [targetAccountId, setTargetAccountId] = useState<string>(accounts[0]?.id || 'acc-01');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Advances ready for disbursement (Status: APPROVED)
  const approvedAdvances = advances.filter((a) => a.status === 'APPROVED');

  const handleExecuteDisbursement = (adv: Advance) => {
    setSelectedDisbAdv(adv);
    setIsProcessing(true);

    setTimeout(() => {
      disburseAdvance(adv.id, targetAccountId);
      setIsProcessing(false);
      setSelectedDisbAdv(null);

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#10b981', '#3b82f6'],
        });
      } catch (e) {
        // ignore
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Treasury Liquidity Desk
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Instant ACH Channel
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Advance Disbursement & Fund Release
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Execute final automated transfer of sanctioned funds directly to recipient accounts with immutable transaction references.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto">
          {approvedAdvances.length} Advances Ready for Payout
        </span>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-1">Application Ref</th>
                <th className="pb-3">Applicant</th>
                <th className="pb-3">Sanctioned Amount</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Target Account</th>
                <th className="pb-3">Approval Officer</th>
                <th className="pb-3 text-right pr-1">Disbursement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {approvedAdvances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No approved advances currently pending disbursement.
                  </td>
                </tr>
              ) : (
                approvedAdvances.map((adv) => {
                  const amount = adv.approvedAmount || adv.requestedAmount;
                  const isBusy = isProcessing && selectedDisbAdv?.id === adv.id;

                  return (
                    <tr
                      key={adv.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 pl-1 font-mono font-bold text-brand-600 dark:text-brand-400">
                        {adv.applicationNo}
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {adv.applicantName}
                        </div>
                        <div className="text-[11px] text-slate-500">{adv.applicantRole}</div>
                      </td>

                      <td className="py-3.5 font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(amount)}
                      </td>

                      <td className="py-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800/60">
                          Instant ACH
                        </span>
                      </td>

                      <td className="py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        NX-8829-4410-09
                      </td>

                      <td className="py-3.5 text-slate-600 dark:text-slate-300">
                        Elena Rostova (VP Risk)
                      </td>

                      <td className="py-3.5 text-right pr-1">
                        <button
                          onClick={() => handleExecuteDisbursement(adv)}
                          disabled={isBusy}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isBusy ? 'Releasing Funds...' : 'Release Funds'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
