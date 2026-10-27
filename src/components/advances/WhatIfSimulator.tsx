import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { calculateAdvanceRepayment } from '../../lib/advanceCalculator';
import { formatCurrency, formatPercentage } from '../../lib/formatters';
import { Sliders, Sparkles, ArrowRight, ShieldCheck, Check, DollarSign } from 'lucide-react';

interface WhatIfSimulatorProps {
  onApplyWithTerms?: (amount: number, tenure: number) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ onApplyWithTerms }) => {
  const { systemConfig, currentUser, setActiveTab } = useBank();

  const [simAmount, setSimAmount] = useState<number>(5000);
  const [simTenure, setSimTenure] = useState<number>(6);

  const calc = calculateAdvanceRepayment(
    simAmount,
    simTenure,
    systemConfig.baseInterestRatePct,
    systemConfig.processingFeePct
  );

  // Compare 3 standard tenures (3, 6, 12 months)
  const option3mo = calculateAdvanceRepayment(simAmount, 3, systemConfig.baseInterestRatePct, systemConfig.processingFeePct);
  const option6mo = calculateAdvanceRepayment(simAmount, 6, systemConfig.baseInterestRatePct, systemConfig.processingFeePct);
  const option12mo = calculateAdvanceRepayment(simAmount, 12, systemConfig.baseInterestRatePct, systemConfig.processingFeePct);

  const handleApply = (amount: number, tenure: number) => {
    if (onApplyWithTerms) {
      onApplyWithTerms(amount, tenure);
    } else {
      setActiveTab('apply');
    }
  };

  // Affordability ratio
  const ratio = (calc.monthlyInstallment / currentUser.monthlyIncome) * 100;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Smart What-If Advance Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate amounts & tenures to find your ideal monthly installment
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
          Dynamic APR: {systemConfig.baseInterestRatePct}%
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Sliders Side */}
        <div className="space-y-6">
          {/* Amount Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Advance Amount
              </span>
              <span className="font-mono text-base font-bold text-brand-600 dark:text-brand-400">
                {formatCurrency(simAmount)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max={systemConfig.maxAdvanceLimit}
              step="500"
              value={simAmount}
              onChange={(e) => setSimAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>$500</span>
              <span>$10,000</span>
              <span>${systemConfig.maxAdvanceLimit.toLocaleString()} Max</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Repayment Duration
              </span>
              <span className="font-mono text-base font-bold text-brand-600 dark:text-brand-400">
                {simTenure} Months
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={simTenure}
              onChange={(e) => setSimTenure(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
              <span>1 Month</span>
              <span>6 Months</span>
              <span>12 Months</span>
              <span>24 Months</span>
            </div>
          </div>

          {/* Affordability Meter Callout */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Monthly Affordability Strain:</span>
              <span className={`font-bold font-mono ${ratio <= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                {ratio.toFixed(1)}% of salary ({ratio <= 20 ? 'Optimal' : 'Moderate'})
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${ratio <= 20 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (ratio / 40) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Real-time Calculation Result Box */}
        <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-850 p-6 text-white border border-brand-900/40 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-brand-300 uppercase tracking-wider font-semibold mb-2">
              <span>Estimated Repayment Breakdown</span>
              <span className="font-mono">APR {calc.apr}%</span>
            </div>

            <div className="my-3">
              <div className="text-xs text-slate-400">Estimated Monthly Installment:</div>
              <div className="text-3xl font-extrabold text-brand-400 font-mono tracking-tight mt-1">
                {formatCurrency(calc.monthlyInstallment)}
                <span className="text-sm font-normal text-slate-400"> /month</span>
              </div>
            </div>

            <div className="space-y-2 py-3 border-y border-slate-800 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span className="font-sans">Principal Amount:</span>
                <span className="text-white">{formatCurrency(calc.requestedAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-sans">Total Estimated Interest:</span>
                <span className="text-emerald-400">+{formatCurrency(calc.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-sans">One-Time Processing Fee (1%):</span>
                <span className="text-slate-300">+{formatCurrency(calc.processingFee)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-slate-800 text-sm">
                <span className="font-sans text-brand-200">Total Repayment:</span>
                <span className="text-brand-300">{formatCurrency(calc.totalRepaymentExpected)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleApply(simAmount, simTenure)}
            className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Lock Terms & Continue to Application</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Quick Comparison Scenarios */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          Quick Comparison Options for {formatCurrency(simAmount)}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 3 Months */}
          <div
            onClick={() => setSimTenure(3)}
            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
              simTenure === 3
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white mb-1">
              <span>Fast Payoff (3 Months)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">Lowest Fee</span>
            </div>
            <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
              {formatCurrency(option3mo.monthlyInstallment)}/mo
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Total Interest: {formatCurrency(option3mo.totalInterest)}
            </div>
          </div>

          {/* 6 Months */}
          <div
            onClick={() => setSimTenure(6)}
            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
              simTenure === 6
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white mb-1">
              <span>Balanced (6 Months)</span>
              <span className="text-brand-600 dark:text-brand-400 font-mono">Popular</span>
            </div>
            <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
              {formatCurrency(option6mo.monthlyInstallment)}/mo
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Total Interest: {formatCurrency(option6mo.totalInterest)}
            </div>
          </div>

          {/* 12 Months */}
          <div
            onClick={() => setSimTenure(12)}
            className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
              simTenure === 12
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white mb-1">
              <span>Low Monthly (12 Months)</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">Max Buffer</span>
            </div>
            <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
              {formatCurrency(option12mo.monthlyInstallment)}/mo
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Total Interest: {formatCurrency(option12mo.totalInterest)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
