import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { AdvancePurpose, RepaymentMethod, DocumentAttachment, Advance } from '../../types';
import { calculateAdvanceRepayment } from '../../lib/advanceCalculator';
import { SmartEligibilityChecker } from './SmartEligibilityChecker';
import { SmartDocumentChecklist } from './SmartDocumentChecklist';
import { WhatIfSimulator } from './WhatIfSimulator';
import { OneClickRepeatModal } from './OneClickRepeatModal';
import { formatCurrency, formatPercentage } from '../../lib/formatters';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  DollarSign,
  Calendar,
  FileCheck,
  ShieldCheck,
  CreditCard,
  Building,
  RotateCcw,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdvanceApplicationWizard: React.FC = () => {
  const { systemConfig, currentUser, submitAdvanceApplication, setActiveTab, setSelectedAdvanceId } = useBank();

  // Multi-step Wizard State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showRepeatModal, setShowRepeatModal] = useState<boolean>(false);

  // Form Fields
  const [purpose, setPurpose] = useState<AdvancePurpose>('SALARY_ADVANCE');
  const [purposeNote, setPurposeNote] = useState<string>('');
  const [requestedAmount, setRequestedAmount] = useState<number>(5000);
  const [tenureMonths, setTenureMonths] = useState<number>(6);
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('SALARY_DEDUCTION');
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [agreeConsent, setAgreeConsent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Dynamic calculations
  const calc = calculateAdvanceRepayment(
    requestedAmount,
    tenureMonths,
    systemConfig.baseInterestRatePct,
    systemConfig.processingFeePct
  );

  const handleApplyTemplate = (adv: Advance) => {
    setPurpose(adv.purpose);
    setPurposeNote(adv.purposeNote);
    setRequestedAmount(adv.requestedAmount);
    setTenureMonths(adv.tenureMonths);
    setRepaymentMethod(adv.repaymentMethod);
    if (adv.documents && adv.documents.length > 0) {
      setDocuments(adv.documents);
    }
  };

  const handleSubmit = () => {
    if (!agreeConsent) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const result = submitAdvanceApplication({
        purpose,
        purposeNote: purposeNote || `Smart advance application for ${purpose.replace(/_/g, ' ')}`,
        requestedAmount,
        tenureMonths,
        repaymentMethod,
        documents,
      });

      setIsSubmitting(false);
      setSubmittedId(result.advanceId);
      setCurrentStep(4); // Success step!

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0d9488', '#10b981', '#06b6d4'],
        });
      } catch (e) {
        // ignore if not supported
      }
    }, 900);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Repeat Application Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Apply for Smart Advance</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Zero Collateral
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Instant liquidity facility with transparent algorithmic underwriting and interest rebate guarantees.
          </p>
        </div>

        <button
          onClick={() => setShowRepeatModal(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Copy className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>One-Click Repeat Application</span>
        </button>
      </div>

      {/* Step Progress Tracker */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 1, title: 'Purpose & Terms', desc: 'Amount & simulator' },
            { step: 2, title: 'Repayment & Method', desc: 'Deduction setup' },
            { step: 3, title: 'Documents & Consent', desc: 'Checklist & APR disclosure' },
          ].map((s) => {
            const isPassed = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div
                key={s.step}
                className={`p-3 rounded-xl border transition-all text-xs flex items-center gap-3 ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20'
                    : isPassed
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isPassed
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/50'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white leading-tight">
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-400 hidden sm:block">
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Purpose & Terms */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Select Advance Purpose & Specifics
            </h3>

            {/* Purpose Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'SALARY_ADVANCE', label: 'Salary Advance', icon: DollarSign, sub: 'Short-term cashflow bridge' },
                { id: 'EQUIPMENT_PURCHASE', label: 'Equipment & Tech', icon: Building, sub: 'Hardware or workspace gear' },
                { id: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: Sparkles, sub: 'Immediate healthcare coverage' },
                { id: 'EDUCATION_TRAINING', label: 'Education & Upskilling', icon: Sparkles, sub: 'Courses or certifications' },
                { id: 'WORKING_CAPITAL', label: 'Working Capital', icon: Building, sub: 'Business liquidity / projects' },
                { id: 'RELOCATION_HOUSING', label: 'Relocation & Housing', icon: Building, sub: 'Deposit or moving expenses' },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = purpose === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => setPurpose(p.id as AdvancePurpose)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {p.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Purpose details note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Purpose Details & Remarks (Optional)
              </label>
              <textarea
                value={purposeNote}
                onChange={(e) => setPurposeNote(e.target.value)}
                placeholder="Provide any additional background for the credit officer (e.g. equipment specifications, medical urgency)..."
                rows={2}
                className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Interactive What-If Simulator embedded into step 1 */}
          <WhatIfSimulator
            onApplyWithTerms={(amt, ten) => {
              setRequestedAmount(amt);
              setTenureMonths(ten);
              setCurrentStep(2);
            }}
          />

          {/* Preliminary Live Eligibility Feedback */}
          <SmartEligibilityChecker amount={requestedAmount} tenure={tenureMonths} />

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <span>Continue to Repayment Setup</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Repayment Setup & Method */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Repayment Channel & Method
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'SALARY_DEDUCTION',
                  label: 'Salary Lien / Direct Payroll Deduction',
                  desc: 'Automatically deducted on company payroll date. Zero missed payment risk & qualifies for lowest interest.',
                  badge: 'Recommended',
                },
                {
                  id: 'DIRECT_DEBIT',
                  label: 'Automatic Direct Debit (ACH)',
                  desc: 'Debited from your Nexora Primary Checking on installment due dates.',
                  badge: 'Flexible',
                },
                {
                  id: 'MANUAL_TRANSFER',
                  label: 'Manual Wire / Internal Transfer',
                  desc: 'Remit installment manually before the grace period deadline.',
                  badge: 'Standard',
                },
              ].map((m) => {
                const isSelected = repaymentMethod === m.id;

                return (
                  <div
                    key={m.id}
                    onClick={() => setRepaymentMethod(m.id as RepaymentMethod)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-1 ring-brand-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                          {m.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                        {m.label}
                      </h4>
                      <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Repayment Schedule Preview Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Amortization Schedule Preview ({tenureMonths} Installments)
                </h4>
                <span className="text-xs font-mono text-slate-500">
                  Total Repayment: <strong className="text-brand-600 dark:text-brand-400">{formatCurrency(calc.totalRepaymentExpected)}</strong>
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Est. Due Date</th>
                      <th className="py-2.5 px-3">Principal</th>
                      <th className="py-2.5 px-3">Interest</th>
                      <th className="py-2.5 px-3">Fees</th>
                      <th className="py-2.5 px-3 text-right">Total Installment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {calc.schedule.slice(0, 4).map((inst) => (
                      <tr key={inst.installmentNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-slate-400">{inst.installmentNo}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                          {new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-2.5 px-3">{formatCurrency(inst.principal)}</td>
                        <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(inst.interest)}</td>
                        <td className="py-2.5 px-3 text-slate-400">{formatCurrency(inst.fee)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(inst.totalDue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {calc.schedule.length > 4 && (
                  <div className="py-2 text-center text-[11px] text-slate-400 bg-slate-50/40 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800">
                    + {calc.schedule.length - 4} additional installments continuing monthly
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <span>Continue to Documents</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Smart Documents & Transparent Consent */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Smart Document Verification & Disclosures
              </h3>
              <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                OCR Auto-Validation Enabled
              </span>
            </div>

            {/* Smart Document Checklist */}
            <SmartDocumentChecklist
              purpose={purpose}
              documents={documents}
              onDocumentsChange={setDocuments}
            />

            {/* Transparent Decision & APR Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Transparent Regulatory Disclosure & Early Settlement Guarantee
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11.5px]">
                Nexora Bank does not charge hidden closing fees. The effective Annual Percentage Rate (APR) for this facility is fixed at <strong>{calc.apr}%</strong>. Under the Nexora Customer Charter, you hold the right to <strong>early settlement at any time</strong> with a minimum <strong>{systemConfig.earlySettlementRebatePct}% rebate</strong> on all unearned future interest charges.
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consent"
                  checked={agreeConsent}
                  onChange={(e) => setAgreeConsent(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="consent" className="text-slate-700 dark:text-slate-300 cursor-pointer text-xs">
                  I confirm that all provided information is accurate and authorize Nexora Credit Operations to conduct digital income and employment verification.
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={!agreeConsent || isSubmitting}
              className={`px-8 py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                agreeConsent && !isSubmitting
                  ? 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/30'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              {isSubmitting ? (
                <span>Submitting to Underwriting Engine...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Advance Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Application Submitted Confirmation */}
      {currentStep === 4 && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center max-w-xl mx-auto space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Application Successfully Submitted!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Your request for {formatCurrency(requestedAmount)} has been routed to our credit queue. An officer decision will be posted shortly.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="font-sans text-slate-500">Applicant:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-slate-500">Amount:</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{formatCurrency(requestedAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-slate-500">Monthly Installment:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(calc.monthlyInstallment)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans text-slate-500">Repayment:</span>
              <span className="font-bold text-slate-900 dark:text-white">{repaymentMethod.replace(/_/g, ' ')}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (submittedId) setSelectedAdvanceId(submittedId);
                setActiveTab('tracking');
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 transition-all"
            >
              Track Application Journey
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setAgreeConsent(false);
                setActiveTab('dashboard');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Repeat Modal */}
      <OneClickRepeatModal
        isOpen={showRepeatModal}
        onClose={() => setShowRepeatModal(false)}
        onSelectTemplate={handleApplyTemplate}
      />
    </div>
  );
};
