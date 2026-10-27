import React from 'react';
import { useBank } from '../../context/BankContext';
import { computeFinancialWellness } from '../../lib/eligibilityEngine';
import { formatCurrency, formatPercentage } from '../../lib/formatters';
import { HeartPulse, CheckCircle2, AlertCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

export const FinancialWellnessGauge: React.FC = () => {
  const { currentUser, advances, setActiveTab } = useBank();

  // Compute active advances & upcoming commitment
  const activeAdvances = advances.filter((a) => a.status === 'DISBURSED' || a.status === 'ACTIVE');
  const existingBurden = activeAdvances.reduce((sum, a) => sum + a.outstandingTotal, 0);
  const monthlyCommitment = activeAdvances.reduce((sum, a) => sum + a.monthlyInstallment, 0);

  const wellness = computeFinancialWellness(currentUser, existingBurden, monthlyCommitment);

  // SVG Gauge calculations (semi-circle arc)
  const radius = 64;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (wellness.overallScore / 100) * circumference;

  let tierColor = 'text-emerald-500';
  let tierBg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  if (wellness.tier === 'GOOD') {
    tierColor = 'text-brand-500';
    tierBg = 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800/60';
  } else if (wellness.tier === 'FAIR') {
    tierColor = 'text-amber-500';
    tierBg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Financial Wellness Indicator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Continuous affordability & borrowing health rating
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${tierBg}`}>
            {wellness.tier}
          </span>
        </div>

        {/* Semi-circle Gauge */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <svg className="w-48 h-28" viewBox="0 0 160 90">
            {/* Background semi-circle */}
            <path
              d="M 16 80 A 64 64 0 0 1 144 80"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="12"
              strokeLinecap="round"
              className="dark:stroke-slate-800"
            />
            {/* Colored score arc */}
            <path
              d="M 16 80 A 64 64 0 0 1 144 80"
              fill="none"
              stroke="url(#wellness-gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="wellness-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Score */}
          <div className="absolute top-12 text-center">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {wellness.overallScore}
            </span>
            <span className="text-xs font-semibold text-slate-400">/100</span>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Affordability Index
            </div>
          </div>
        </div>

        {/* Key Health Metrics Bar */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Debt-to-Income (DTI)</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {formatPercentage(wellness.debtToIncomeRatio)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              Target &lt; 40% (Healthy)
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Monthly Free Cashflow</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(wellness.discretionaryBuffer)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Available buffer
            </span>
          </div>
        </div>

        {/* Actionable Non-Judgmental Insights */}
        <div className="mt-4 space-y-2">
          {wellness.insights.slice(0, 2).map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 text-xs text-slate-700 dark:text-slate-300 border border-brand-100 dark:border-brand-900/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11.5px] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Limit Callout */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Max Affordability Ceiling:</span>
          <span className="font-bold text-brand-600 dark:text-brand-400 font-mono ml-1.5">
            {formatCurrency(wellness.recommendedMaxAdvance)}
          </span>
        </div>
        <button
          onClick={() => setActiveTab('apply')}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1"
        >
          Check Eligibility <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
