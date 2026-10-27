import React from 'react';
import { useBank } from '../../context/BankContext';
import { Advance } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Copy, Sparkles, CheckCircle, ArrowRight, X } from 'lucide-react';

interface OneClickRepeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (adv: Advance) => void;
}

export const OneClickRepeatModal: React.FC<OneClickRepeatModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const { advances } = useBank();

  if (!isOpen) return null;

  // Filter advances that were successful (Disbursed, Active, or Settled)
  const pastAdvances = advances.filter(
    (a) => a.status === 'SETTLED' || a.status === 'DISBURSED' || a.status === 'APPROVED'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                One-Click Repeat Application
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pre-populate verified information from your previously settled facilities
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

        <div className="py-4 space-y-3">
          {pastAdvances.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">
              No historical advances available to duplicate.
            </p>
          ) : (
            pastAdvances.map((adv) => (
              <div
                key={adv.id}
                onClick={() => {
                  onSelectTemplate(adv);
                  onClose();
                }}
                className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-850 cursor-pointer transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {adv.purpose.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      ({adv.applicationNo})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {formatCurrency(adv.requestedAmount)}
                    </span>
                    <span>• {adv.tenureMonths} Months</span>
                    <span>• {adv.repaymentMethod.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                  <span>Pre-fill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
