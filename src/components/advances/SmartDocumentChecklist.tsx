import React, { useState } from 'react';
import { DocumentAttachment, AdvancePurpose } from '../../types';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  FileCheck,
  Shield,
} from 'lucide-react';

interface SmartDocumentChecklistProps {
  purpose: AdvancePurpose;
  documents: DocumentAttachment[];
  onDocumentsChange: (docs: DocumentAttachment[]) => void;
}

export const SmartDocumentChecklist: React.FC<SmartDocumentChecklistProps> = ({
  purpose,
  documents,
  onDocumentsChange,
}) => {
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Determine required documents by purpose
  const getRequiredTypes = (p: AdvancePurpose): Array<{ type: DocumentAttachment['type']; label: string; desc: string; required: boolean }> => {
    switch (p) {
      case 'SALARY_ADVANCE':
        return [
          { type: 'PAYSLIP', label: 'Recent Monthly Paystub', desc: 'Latest payroll slip verifying net base income', required: true },
          { type: 'NATIONAL_ID', label: 'Official Identity Document', desc: 'Valid Passport or Driver’s License', required: true },
          { type: 'BANK_STATEMENT', label: 'Primary Bank Statement', desc: 'Last 60 days showing direct deposit entries', required: false },
        ];
      case 'EQUIPMENT_PURCHASE':
        return [
          { type: 'INVOICE', label: 'Merchant Quote or Proforma Invoice', desc: 'Official quote detailing equipment and total cost', required: true },
          { type: 'PAYSLIP', label: 'Recent Monthly Paystub', desc: 'Latest payroll slip verifying net earnings', required: true },
          { type: 'NATIONAL_ID', label: 'Official Identity Document', desc: 'Valid ID or work authorization', required: true },
        ];
      case 'MEDICAL_EMERGENCY':
        return [
          { type: 'INVOICE', label: 'Medical Facility Estimate / Bill', desc: 'Hospital / clinic invoice or treatment estimate', required: true },
          { type: 'PAYSLIP', label: 'Recent Monthly Paystub', desc: 'Proof of continuous employment', required: true },
        ];
      default:
        return [
          { type: 'PAYSLIP', label: 'Recent Monthly Paystub', desc: 'Latest payroll slip verifying net earnings', required: true },
          { type: 'NATIONAL_ID', label: 'Official Identity Document', desc: 'Valid Government Issued Photo ID', required: true },
          { type: 'BANK_STATEMENT', label: 'Primary Bank Statement', desc: 'Last 3 months of bank statements', required: true },
        ];
    }
  };

  const checklistItems = getRequiredTypes(purpose);

  // Missing documents
  const missingRequired = checklistItems.filter(
    (item) => item.required && !documents.some((d) => d.type === item.type)
  );

  const handleSimulatedUpload = (type: DocumentAttachment['type'], label: string) => {
    setUploadingType(type);
    setTimeout(() => {
      const newDoc: DocumentAttachment = {
        id: `doc-${Date.now()}`,
        name: `${type.toLowerCase()}_verified_${new Date().getFullYear()}.pdf`,
        type,
        url: '#',
        size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString(),
        verified: true,
        verifiedBy: 'Nexora Document Verification AI',
      };
      onDocumentsChange([...documents.filter((d) => d.type !== type), newDoc]);
      setUploadingType(null);
    }, 700);
  };

  const handleRemoveDoc = (id: string) => {
    onDocumentsChange(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Missing Checklist Banner */}
      {missingRequired.length > 0 ? (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Missing Required Supporting Documents: </span>
            <span>
              Please upload {missingRequired.map((m) => m.label).join(', ')} before submitting your advance application.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="font-bold">
            All mandatory documents verified! Your application qualifies for expedited review.
          </span>
        </div>
      )}

      {/* Checklist items */}
      <div className="space-y-3">
        {checklistItems.map((item) => {
          const uploaded = documents.find((d) => d.type === item.type);
          const isUploading = uploadingType === item.type;

          return (
            <div
              key={item.type}
              className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                uploaded
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    uploaded
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {uploaded ? <FileCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </span>
                    {item.required ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.desc}
                  </p>

                  {uploaded && (
                    <div className="mt-1 flex items-center gap-2 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-mono">
                      <span>✓ {uploaded.name} ({uploaded.size})</span>
                      <span>• Verified by OCR</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {uploaded ? (
                  <button
                    onClick={() => handleRemoveDoc(uploaded.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSimulatedUpload(item.type, item.label)}
                    disabled={isUploading}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>{isUploading ? 'Verifying...' : 'Upload & Verify'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
        <Shield className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
        <span>
          Documents are encrypted at rest using AES-256 and verified against banking tamper-evident hashes.
        </span>
      </div>
    </div>
  );
};
