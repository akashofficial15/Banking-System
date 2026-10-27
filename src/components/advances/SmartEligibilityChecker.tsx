import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { evaluateEligibility } from '../../lib/eligibilityEngine';
import { formatCurrency } from '../../lib/formatters';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Info, ChevronRight, HelpCircle } from 'lucide-react';

interface SmartEligibilityCheckerProps {
  amount?: number;
  tenure?: number;
}

export const SmartEligibilityChecker: React.FC<SmartEligibilityCheckerProps> = ({
  amount = 5000,
  tenure = 6,
}) => {
  const { currentUser, advances, systemConfig } = useBank();

  // Active advances burden
  const activeBurden = advances
    .filter((a) => a.userId === currentUser.id && (a.status === 'DISBURSED' || a.status === 'ACTIVE'))
    .reduce((sum, a) => sum + a.outstandingTotal, 0);

  const evaluation = evaluateEligibility(currentUser, amount, tenure, activeBurden, systemConfig);

  let confidenceBadge = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  if (evaluation.approvalConfidence === 'MODERATE') {
    confidenceBadge = 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800/60';
  } else if (evaluation.approvalConfidence === 'LOW') {
    confidenceBadge = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  } else if (evaluation.approvalConfidence === 'INELIGIBLE') {
    confidenceBadge = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Smart Eligibility & Transparency Checker
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live underwriting simulation for {formatCurrency(amount)} ({tenure} months)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${confidenceBadge}`}>
            {evaluation.approvalConfidence} Confidence
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            Score: {evaluation.overallScore}/100
          </span>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 mb-6">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">
              {evaluation.summaryNote}
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Assessed based on verifiable net monthly pay of {formatCurrency(currentUser.monthlyIncome)}, credit score of {currentUser.creditScore}, active facilities (${activeBurden.toLocaleString()}), and Nexora regulatory underwriting caps.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Transparent Scoring Factors */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Transparent Criteria Breakdown
        </h4>
        <div className="space-y-3">
          {evaluation.factors.map((factor, idx) => {
            const isPass = factor.status === 'PASS';
            const isWarn = factor.status === 'WARN';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-850 hover:border-slate-200 dark:hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isPass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {factor.factor}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPass
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : isWarn
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {factor.score}/{factor.maxScore} pts
                    </span>
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed pl-6">
                  {factor.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Maximum Borrowing Limit Callout */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400">Preliminary Auto-Approval Limit:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white ml-2">
            {formatCurrency(evaluation.maxEligibleAmount)}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Routing Tier: <span className="font-bold text-brand-600 dark:text-brand-400">Tier {evaluation.preliminaryTier}</span>
        </div>
      </div>
    </div>
  );
};
