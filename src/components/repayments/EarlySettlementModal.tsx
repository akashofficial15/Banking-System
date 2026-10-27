import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Advance } from '../../types';
import { calculateEarlySettlementQuote } from '../../lib/advanceCalculator';
import { formatCurrency } from '../../lib/formatters';
import { Sparkles, CheckCircle2, ShieldCheck, X, ArrowRight, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EarlySettlementModalProps {
  advance: Advance;
  isOpen: boolean;
  onClose: () => void;
}

export const EarlySettlementModal: React.FC<EarlySettlementModalProps> = ({
  advance,
  isOpen,
  onClose,
}) => {
  const { systemConfig, executeEarlySettlement, currentUser } = useBank();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedResult, setCompletedResult] = useState<{ payoffAmount: number; savings: number } | null>(null);

  if (!isOpen) return null;

  const quote = calculateEarlySettlementQuote(
    advance.id,
    advance.requestedAmount,
    advance.repaymentSchedule,
    systemConfig.earlySettlementRebatePct
  );

  const handleConfirmEarlySettlement = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const res = executeEarlySettlement(advance.id);
      setIsProcessing(false);
      setCompletedResult(res);
      setIsCompleted(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        // ignore
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Early Settlement Calculator & Payoff
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Facility {advance.applicationNo} • Statutory Interest Rebate Guarantee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="py-4 space-y-4 text-xs">
            {/* Rebate Highlight Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-brand-500/10 border border-teal-500/20 text-slate-800 dark:text-slate-200">
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Early Settlement Rebate Savings
                </span>
                <span className="font-mono text-base text-emerald-600 dark:text-emerald-400 font-extrabold">
                  {formatCurrency(quote.effectiveSavings)} Saved
                </span>
              </div>
              <p className="text-[11.5px] text-slate-600 dark:text-slate-400">
                By paying off your remaining balance ahead of schedule, {systemConfig.earlySettlementRebatePct}% of future unearned interest is permanently waived under Nexora's fair banking policy.
              </p>
            </div>

            {/* Financial Breakdown Table */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-sans">
                <span>Original Facility Amount:</span>
                <span className="text-slate-900 dark:text-white">{formatCurrency(quote.originalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-sans">
                <span>Total Paid to Date:</span>
                <span className="text-slate-900 dark:text-white">{formatCurrency(quote.totalPaidSoFar)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-sans">
                <span>Remaining Principal:</span>
                <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(quote.remainingPrincipal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-sans">
                <span>Unaccrued Future Interest:</span>
                <span className="text-slate-400 line-through">{formatCurrency(quote.unaccruedFutureInterest)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-sans">
                <span>Interest Rebate Discount ({systemConfig.earlySettlementRebatePct}%):</span>
                <span>-{formatCurrency(quote.rebateDiscountAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-sans">
                <span>Prepayment Penalty Fee:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">$0.00 (Fee-Free)</span>
              </div>

              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-sans font-bold">
                <span className="text-slate-900 dark:text-white">Net Early Settlement Payoff:</span>
                <span className="text-brand-600 dark:text-brand-400 text-lg font-mono">
                  {formatCurrency(quote.netSettlementPayoffAmount)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              * Funds will be debited from primary checking account NX-8829-4410-09 upon confirmation.
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEarlySettlement}
                disabled={isProcessing}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-all flex items-center gap-1.5"
              >
                {isProcessing ? (
                  <span>Processing Payoff...</span>
                ) : (
                  <>
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Confirm & Pay {formatCurrency(quote.netSettlementPayoffAmount)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Facility Successfully Settled!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Advance {advance.applicationNo} has been closed in full with zero remaining liability.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs font-mono text-emerald-800 dark:text-emerald-300">
              Total Interest Rebate Saved: <strong>{formatCurrency(completedResult?.savings || 0)}</strong>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
