import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { AdvanceStatementModal } from '../advances/AdvanceStatementModal';
import { Sparkles, TrendingUp, CalendarCheck, FileText, Download, CheckCircle2 } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const { setActiveTab, selectedAdvance, advances } = useBank();
  const [showStatementModal, setShowStatementModal] = useState(false);

  const targetAdvance = selectedAdvance || advances[0];

  const handleOpenStatement = () => {
    setShowStatementModal(true);
  };

  const actions = [
    {
      title: 'Apply for Advance',
      desc: 'Instant salary & equipment liquidity with 2-minute decision.',
      icon: Sparkles,
      color: 'from-brand-600 to-teal-500 text-white',
      badge: 'Zero Collateral',
      onClick: () => setActiveTab('apply'),
    },
    {
      title: 'Track Application',
      desc: 'Live journey timeline & underwriting notes.',
      icon: TrendingUp,
      color: 'from-blue-600 to-indigo-600 text-white',
      badge: 'Real-time',
      onClick: () => setActiveTab('tracking'),
    },
    {
      title: 'Repay Next Installment',
      desc: 'Schedule deduction, manual pay, or execute early payoff with interest rebate.',
      icon: CalendarCheck,
      color: 'from-emerald-600 to-teal-600 text-white',
      badge: 'Rebate Savings',
      onClick: () => setActiveTab('repayments'),
    },
    {
      title: 'Download Statements',
      desc: 'Generate signed audit-compliant PDF advance & account statement.',
      icon: FileText,
      color: 'from-slate-700 to-slate-900 text-white dark:from-slate-800 dark:to-slate-950',
      badge: 'Official PDF',
      onClick: handleOpenStatement,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={act.onClick}
              className="group text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${act.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {act.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {act.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Launch action →
              </div>
            </button>
          );
        })}
      </div>

      {targetAdvance && (
        <AdvanceStatementModal
          advance={targetAdvance}
          isOpen={showStatementModal}
          onClose={() => setShowStatementModal(false)}
        />
      )}
    </>
  );
};
