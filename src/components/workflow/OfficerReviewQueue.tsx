import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { Advance } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/formatters';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  DollarSign,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const OfficerReviewQueue: React.FC = () => {
  const { advances, currentUser, reviewApplication, setSelectedAdvanceId, setActiveTab } = useBank();

  const [selectedReviewAdv, setSelectedReviewAdv] = useState<Advance | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');
  const [adjustedAmount, setAdjustedAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter advances requiring review:
  // Bank Officer can review SUBMITTED advances (or UNDER_REVIEW up to $5,000)
  // Approving Manager can approve SUBMITTED and UNDER_REVIEW up to $50,000
  const pendingAdvances = advances.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW');

  const handleOpenReview = (adv: Advance) => {
    setSelectedReviewAdv(adv);
    setAdjustedAmount(adv.requestedAmount);
    setDecisionNotes(
      adv.eligibilityScore >= 80
        ? 'KYC and payroll documents verified. Affordability metrics satisfied with safe margin.'
        : 'Marginal qualification. Income verified but active debt burden requires monitoring.'
    );
  };

  const handleExecuteDecision = (decision: 'APPROVE' | 'REJECT') => {
    if (!selectedReviewAdv) return;
    setIsSubmitting(true);

    setTimeout(() => {
      reviewApplication(selectedReviewAdv.id, decision, decisionNotes, adjustedAmount);
      setIsSubmitting(false);
      setSelectedReviewAdv(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Credit Underwriting Operations
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Officer Limit: ${currentUser.approvalLimit ? currentUser.approvalLimit.toLocaleString() : '5,000'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Application Approval & Review Desk
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate credit eligibility, inspect verified documentation, and render binding approval decisions.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 self-start sm:self-auto">
          {pendingAdvances.length} Requests Awaiting Action
        </span>
      </div>

      {/* Applications Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-1">Application Ref</th>
                <th className="pb-3">Applicant & Role</th>
                <th className="pb-3">Purpose</th>
                <th className="pb-3">Requested</th>
                <th className="pb-3">Tenure</th>
                <th className="pb-3">Score / Risk</th>
                <th className="pb-3">Docs</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {pendingAdvances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No applications currently pending in this queue.
                  </td>
                </tr>
              ) : (
                pendingAdvances.map((adv) => {
                  const isOverLimit =
                    currentUser.approvalLimit && adv.requestedAmount > currentUser.approvalLimit;

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

                      <td className="py-3.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {adv.purpose.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(adv.requestedAmount)}
                      </td>

                      <td className="py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {adv.tenureMonths} Mo
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            adv.eligibilityScore >= 80
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {adv.eligibilityScore}/100 Score
                        </span>
                      </td>

                      <td className="py-3.5 text-slate-500">
                        {adv.documents ? adv.documents.length : 0} Files
                      </td>

                      <td className="py-3.5 text-right pr-1">
                        <button
                          onClick={() => handleOpenReview(adv)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-xs transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Review & Adjudicate</span>
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

      {/* Interactive Review Modal */}
      {selectedReviewAdv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Adjudicate Facility:</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">
                    {selectedReviewAdv.applicationNo}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Applicant: {selectedReviewAdv.applicantName} ({selectedReviewAdv.applicantRole})
                </p>
              </div>
              <button
                onClick={() => setSelectedReviewAdv(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Application Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-sans block">Requested</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {formatCurrency(selectedReviewAdv.requestedAmount)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-sans block">Tenure</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedReviewAdv.tenureMonths} Months
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-sans block">Est. Installment</span>
                <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                  {formatCurrency(selectedReviewAdv.monthlyInstallment)}/mo
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 font-sans block">Score</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {selectedReviewAdv.eligibilityScore}/100
                </span>
              </div>
            </div>

            {/* Documents attached */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Attached Supporting Documents
              </h4>
              <div className="space-y-2">
                {selectedReviewAdv.documents && selectedReviewAdv.documents.length > 0 ? (
                  selectedReviewAdv.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        <span className="font-bold text-slate-900 dark:text-white">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({doc.size})</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> OCR Verified
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No documents attached.</p>
                )}
              </div>
            </div>

            {/* Approval adjustment controls */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Approved Amount Adjustment ($)
                </label>
                <input
                  type="number"
                  value={adjustedAmount}
                  onChange={(e) => setAdjustedAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Underwriting Decision Rationale & Mandatory Notes
                </label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Record binding underwriting justification..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedReviewAdv(null)}
                className="px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteDecision('REJECT')}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleExecuteDecision('APPROVE')}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sanction Approval ({formatCurrency(adjustedAmount)})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
