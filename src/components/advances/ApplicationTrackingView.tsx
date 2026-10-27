import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { generateJourneyTimeline } from '../../lib/workflowRouter';
import { formatCurrency, formatDateTime, getStatusColor } from '../../lib/formatters';
import { AdvanceStatementModal } from './AdvanceStatementModal';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Zap,
} from 'lucide-react';

export const ApplicationTrackingView: React.FC = () => {
  const { advances, selectedAdvance, setSelectedAdvanceId, setActiveTab } = useBank();
  const [showStatement, setShowStatement] = useState(false);

  if (!selectedAdvance) {
    return (
      <div className="p-8 text-center text-slate-400">
        No active advance selected for tracking.
      </div>
    );
  }

  const timelineSteps = generateJourneyTimeline(selectedAdvance);
  const statusColors = getStatusColor(selectedAdvance.status);

  return (
    <div className="space-y-6">
      {/* Advance Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Advance Journey & Live Tracking</span>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
            >
              {selectedAdvance.status}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time end-to-end lifecycle from initial application through final settlement.
          </p>
        </div>

        {/* Switch Between Advances */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Active Advance:
          </label>
          <select
            value={selectedAdvance.id}
            onChange={(e) => setSelectedAdvanceId(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {advances.map((adv) => (
              <option key={adv.id} value={adv.id}>
                {adv.applicationNo} - {adv.purpose.replace(/_/g, ' ')} (${adv.requestedAmount.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Details Card & Interactive Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Advance Summary & Transparent Decision Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                Application Details
              </span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                {selectedAdvance.applicationNo}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedAdvance.applicantName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedAdvance.purpose.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Amount:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedAdvance.requestedAmount)}
                </span>
              </div>
              {selectedAdvance.approvedAmount && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved Amount:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedAdvance.approvedAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Tenure:</span>
                <span className="font-mono">{selectedAdvance.tenureMonths} Months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Installment:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                  {formatCurrency(selectedAdvance.monthlyInstallment)}/mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Repayment Channel:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedAdvance.repaymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Disbursement Details if disbursed */}
            {selectedAdvance.disbursementDetails && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-[11.5px]">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Disbursement Executed
                </div>
                <div className="text-slate-500 flex justify-between font-mono">
                  <span>Ref No:</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {selectedAdvance.disbursementDetails.referenceNo}
                  </span>
                </div>
                <div className="text-slate-500 flex justify-between">
                  <span>Target:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedAdvance.disbursementDetails.targetAccount}
                  </span>
                </div>
                <div className="text-slate-500 flex justify-between">
                  <span>Disbursed By:</span>
                  <span className="text-slate-800 dark:text-slate-200">
                    {selectedAdvance.disbursementDetails.disbursedBy}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions for this Advance */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => setShowStatement(true)}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Statement & Sanction Letter</span>
              </button>

              {(selectedAdvance.status === 'DISBURSED' || selectedAdvance.status === 'ACTIVE') && (
                <button
                  onClick={() => setActiveTab('repayments')}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Repay or Settle Early</span>
                </button>
              )}
            </div>
          </div>

          {/* Transparent Underwriting Factors Summary */}
          {selectedAdvance.transparencyFactors && selectedAdvance.transparencyFactors.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Transparent Decision Factors
              </h4>
              <div className="space-y-2.5">
                {selectedAdvance.transparencyFactors.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11.5px]">
                    <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span>{f.factor}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {f.score}/{f.maxScore}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {f.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Advance Journey Timeline */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Advance Journey Timeline
            </h3>

            {/* Timeline Stream */}
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {timelineSteps.map((step, idx) => {
                let iconColor = 'bg-slate-200 dark:bg-slate-700 text-slate-400';
                if (step.completed) {
                  iconColor = 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30';
                } else if (step.current) {
                  iconColor = 'bg-brand-500 text-white shadow-md shadow-brand-500/40 ring-4 ring-brand-500/20';
                }

                return (
                  <div key={idx} className="relative group text-xs">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${iconColor}`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                      )}
                    </div>

                    {/* Step Card */}
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        step.current
                          ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-950/20 shadow-sm'
                          : step.completed
                          ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                          : 'border-slate-100 dark:border-slate-800/60 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {step.title}
                          </h4>
                          {step.actorRole && (
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {step.actorRole}
                            </span>
                          )}
                        </div>
                        {step.timestamp && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDateTime(step.timestamp)}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px] mt-1">
                        {step.description}
                      </p>

                      {step.notes && (
                        <div className="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300">
                          <strong className="text-slate-900 dark:text-white">Officer Note: </strong>
                          {step.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Official Statement Modal */}
      <AdvanceStatementModal
        advance={selectedAdvance}
        isOpen={showStatement}
        onClose={() => setShowStatement(false)}
      />
    </div>
  );
};
