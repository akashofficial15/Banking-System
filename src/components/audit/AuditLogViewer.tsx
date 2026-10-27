import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { AuditRecord } from '../../types';
import { formatDateTime } from '../../lib/formatters';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Eye,
  Key,
  Clock,
  Terminal,
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useBank();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [inspectRecord, setInspectRecord] = useState<AuditRecord | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.userName,
      l.userRole,
      l.action,
      l.entityType,
      l.entityId,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexora_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Regulatory Compliance & Oversight
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Immutable Audit Ledger
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Audit Trails & Verification Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tamper-evident log of all credit decisions, role alterations, disbursements, and payments.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-500 transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, user, or record ID..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-500">Event Action:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Actions</option>
            <option value="APPLICATION_SUBMITTED">APPLICATION_SUBMITTED</option>
            <option value="DOCUMENT_VERIFIED">DOCUMENT_VERIFIED</option>
            <option value="MANAGER_APPROVAL_GRANTED">MANAGER_APPROVAL_GRANTED</option>
            <option value="DISBURSEMENT_COMPLETED">DISBURSEMENT_COMPLETED</option>
            <option value="INSTALLMENT_REPAID">INSTALLMENT_REPAID</option>
            <option value="EARLY_SETTLEMENT_EXECUTED">EARLY_SETTLEMENT_EXECUTED</option>
            <option value="SYSTEM_RULE_UPDATED">SYSTEM_RULE_UPDATED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-1">Timestamp</th>
                <th className="pb-3">User & Persona</th>
                <th className="pb-3">Action Event</th>
                <th className="pb-3">Entity</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Details</th>
                <th className="pb-3 text-right pr-1">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 pl-1 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="py-3 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {log.userName}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">
                        {log.userRole.replace(/_/g, ' ')}
                      </div>
                    </td>

                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {log.entityId}
                    </td>

                    <td className="py-3 text-slate-400 text-[11px]">
                      {log.ipAddress}
                    </td>

                    <td className="py-3 font-sans text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {log.details}
                    </td>

                    <td className="py-3 text-right pr-1">
                      <button
                        onClick={() => setInspectRecord(log)}
                        className="p-1 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Inspect JSON Metadata"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Inspector Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-500" />
                <span>Audit Record Inspector:</span>
                <span className="font-mono text-slate-500">{inspectRecord.id}</span>
              </h3>
              <button
                onClick={() => setInspectRecord(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
              {JSON.stringify(inspectRecord, null, 2)}
            </pre>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-4 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
