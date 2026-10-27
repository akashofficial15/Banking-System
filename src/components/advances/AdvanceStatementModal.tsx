import React from 'react';
import { Advance } from '../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/formatters';
import { Printer, Download, X, ShieldCheck, CheckCircle2, FileText } from 'lucide-react';

interface AdvanceStatementModalProps {
  advance: Advance;
  isOpen: boolean;
  onClose: () => void;
}

export const AdvanceStatementModal: React.FC<AdvanceStatementModalProps> = ({
  advance,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Official Facility Statement & Sanction Letter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL DOCUMENT */}
        <div className="space-y-6 text-xs" id="printable-statement">
          {/* Bank Header */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  NEXORA BANK NA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-100 text-brand-800">
                  CREDIT OPERATIONS
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Treasury & Retail Advances Division • One Financial Plaza, New York, NY
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                FDIC Certificate #88921 • Member Federal Reserve System
              </p>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="font-bold text-brand-700 block text-sm">{advance.applicationNo}</span>
              <span className="text-[11px] text-slate-500">{formatDate(advance.createdAt)}</span>
            </div>
          </div>

          {/* Recipient & Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                APPLICANT & ACCOUNT
              </span>
              <div className="font-bold text-sm text-slate-900">{advance.applicantName}</div>
              <div className="text-slate-600 text-[11px]">{advance.applicantRole}</div>
              <div className="text-slate-500 text-[11px] font-mono mt-1">
                Account: NX-8829-4410-09
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                FACILITY PARTICULARS
              </span>
              <div className="font-bold text-sm text-slate-900">
                {advance.purpose.replace(/_/g, ' ')}
              </div>
              <div className="text-slate-600 text-[11px]">
                Status: <strong className="text-emerald-700 uppercase">{advance.status}</strong>
              </div>
              <div className="text-slate-500 text-[11px]">
                Tenure: {advance.tenureMonths} Months ({advance.repaymentMethod.replace(/_/g, ' ')})
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Sanction Terms & Cost of Credit
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-sans block">Sanctioned Amount</span>
                <span className="font-bold text-sm text-slate-900">
                  {formatCurrency(advance.approvedAmount || advance.requestedAmount)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-sans block">Annual APR</span>
                <span className="font-bold text-sm text-slate-900">{advance.interestRateAnnual}%</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-sans block">Monthly Installment</span>
                <span className="font-bold text-sm text-brand-700">
                  {formatCurrency(advance.monthlyInstallment)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-sans block">Total Repayment</span>
                <span className="font-bold text-sm text-slate-900">
                  {formatCurrency(advance.totalRepaymentExpected)}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Extract */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
              Installment Servicing Schedule
            </h4>
            <table className="w-full text-left font-mono text-[11px] border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 font-sans border-b border-slate-200">
                <tr>
                  <th className="py-1.5 px-2">#</th>
                  <th className="py-1.5 px-2">Due Date</th>
                  <th className="py-1.5 px-2">Principal</th>
                  <th className="py-1.5 px-2">Interest</th>
                  <th className="py-1.5 px-2">Total Due</th>
                  <th className="py-1.5 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {advance.repaymentSchedule.slice(0, 6).map((inst) => (
                  <tr key={inst.installmentNo}>
                    <td className="py-1.5 px-2 font-bold">{inst.installmentNo}</td>
                    <td className="py-1.5 px-2 font-sans">{formatDate(inst.dueDate)}</td>
                    <td className="py-1.5 px-2">{formatCurrency(inst.principal)}</td>
                    <td className="py-1.5 px-2">{formatCurrency(inst.interest)}</td>
                    <td className="py-1.5 px-2 font-bold">{formatCurrency(inst.totalDue)}</td>
                    <td className="py-1.5 px-2 text-right font-sans font-bold">
                      <span className={inst.status === 'PAID' ? 'text-emerald-700' : 'text-slate-600'}>
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mandatory Disclosures & Seal */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10.5px] text-slate-500">
            <div className="space-y-0.5">
              <p>
                <strong>Early Repayment Guarantee:</strong> Customer holds the statutory right to settle early with a 60% rebate on unearned interest.
              </p>
              <p>Cryptographic Signature Hash: <code className="text-slate-700">SHA256:88fa2901c0b3921...</code></p>
            </div>

            <div className="text-right flex items-center gap-1.5 font-bold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>DIGITALLY CERTIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
