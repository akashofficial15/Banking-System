import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { SystemConfig } from '../../types';
import { formatCurrency, formatPercentage } from '../../lib/formatters';
import { Sliders, Save, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';

export const SystemSettingsAdmin: React.FC = () => {
  const { systemConfig, updateSystemConfig, currentUser } = useBank();
  const [formData, setFormData] = useState<SystemConfig>(systemConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (key: keyof SystemConfig, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Platform Administration
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Root Level
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Configurable Underwriting Rules & Governance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Adjust limits, interest rates, DTI safety caps, and statutory early settlement rebates.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Rules Updated & Broadcasted</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Max Advance Limit */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Maximum Platform Advance Limit ($)
            </label>
            <input
              type="number"
              value={formData.maxAdvanceLimit}
              onChange={(e) => handleChange('maxAdvanceLimit', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Upper absolute ceiling for retail applicants.</p>
          </div>

          {/* Tier 2 Officer Limit */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bank Officer Approval Limit ($)
            </label>
            <input
              type="number"
              value={formData.tier2OfficerLimit}
              onChange={(e) => handleChange('tier2OfficerLimit', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Amounts above this limit require Approving Manager signoff.</p>
          </div>

          {/* Tier 3 Manager Limit */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Approving Manager Approval Limit ($)
            </label>
            <input
              type="number"
              value={formData.tier3ManagerLimit}
              onChange={(e) => handleChange('tier3ManagerLimit', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Executive committee required beyond this threshold.</p>
          </div>

          {/* Base Interest Rate */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Base Annual Interest Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.baseInterestRatePct}
              onChange={(e) => handleChange('baseInterestRatePct', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Standard benchmark for APR calculations.</p>
          </div>

          {/* Max DTI */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Maximum Debt-to-Income (DTI) Cap (%)
            </label>
            <input
              type="number"
              value={formData.maxDebtToIncomeRatioPct}
              onChange={(e) => handleChange('maxDebtToIncomeRatioPct', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Regulatory ceiling to prevent customer overindebtedness.</p>
          </div>

          {/* Early Settlement Rebate */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Early Settlement Unearned Interest Rebate (%)
            </label>
            <input
              type="number"
              value={formData.earlySettlementRebatePct}
              onChange={(e) => handleChange('earlySettlementRebatePct', Number(e.target.value))}
              className="w-full p-2.5 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Percentage of unearned future interest waived for early payoffs.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Underwriting Rules</span>
          </button>
        </div>
      </form>
    </div>
  );
};
