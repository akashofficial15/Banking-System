import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { formatCurrency } from '../../lib/formatters';
import {
  Database,
  Code2,
  Send,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

export const ApiSchemaExplorer: React.FC = () => {
  const { advances, accounts, auditLogs, systemConfig, currentUser } = useBank();
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'api'>('schema');
  const [selectedTable, setSelectedTable] = useState<string>('advances');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/advances');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiStatusCode, setApiStatusCode] = useState<number>(200);
  const [isExecutingApi, setIsExecutingApi] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Database Tables Definition
  const tables = [
    {
      name: 'advances',
      label: 'Advances & Facilities',
      rowsCount: advances.length,
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK', desc: 'Internal UUID primary key' },
        { name: 'application_no', type: 'VARCHAR(20)', key: 'UQ', desc: 'Public facility code (e.g. ADV-2026-0841)' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FK', desc: 'Foreign key references users.id' },
        { name: 'purpose', type: 'ENUM(...)', key: '', desc: 'SALARY_ADVANCE, EQUIPMENT_PURCHASE, etc.' },
        { name: 'requested_amount', type: 'DECIMAL(12,2)', key: '', desc: 'Initial applied principal balance' },
        { name: 'approved_amount', type: 'DECIMAL(12,2)', key: '', desc: 'Final sanctioned amount by credit officer' },
        { name: 'tenure_months', type: 'INT', key: '', desc: 'Duration in months (1 - 24)' },
        { name: 'interest_rate_annual', type: 'DECIMAL(5,2)', key: '', desc: 'Fixed annual percentage rate (APR)' },
        { name: 'processing_fee', type: 'DECIMAL(10,2)', key: '', desc: 'Upfront statutory closing fee (1%)' },
        { name: 'monthly_installment', type: 'DECIMAL(10,2)', key: '', desc: 'PMT amortization equal monthly installment' },
        { name: 'repayment_method', type: 'ENUM(...)', key: '', desc: 'SALARY_DEDUCTION, DIRECT_DEBIT, MANUAL' },
        { name: 'status', type: 'ENUM(...)', key: '', desc: 'SUBMITTED, UNDER_REVIEW, APPROVED, DISBURSED, SETTLED' },
        { name: 'eligibility_score', type: 'INT', key: '', desc: 'Algorithmic credit affordability score (0 - 100)' },
        { name: 'outstanding_principal', type: 'DECIMAL(12,2)', key: '', desc: 'Remaining unpaid principal' },
        { name: 'outstanding_total', type: 'DECIMAL(12,2)', key: '', desc: 'Total outstanding dues (Principal + Interest)' },
        { name: 'created_at', type: 'TIMESTAMP', key: '', desc: 'Creation timestamp (ISO 8601)' },
      ],
    },
    {
      name: 'repayment_installments',
      label: 'Repayment Installments',
      rowsCount: advances.reduce((s, a) => s + a.repaymentSchedule.length, 0),
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK', desc: 'Installment primary key' },
        { name: 'advance_id', type: 'VARCHAR(36)', key: 'FK', desc: 'Foreign key references advances.id' },
        { name: 'installment_no', type: 'INT', key: '', desc: 'Sequential index (1..n)' },
        { name: 'due_date', type: 'DATE', key: '', desc: 'Scheduled deduction or payment date' },
        { name: 'principal', type: 'DECIMAL(10,2)', key: '', desc: 'Principal amortization component' },
        { name: 'interest', type: 'DECIMAL(10,2)', key: '', desc: 'Interest charge component' },
        { name: 'fee', type: 'DECIMAL(10,2)', key: '', desc: 'Processing / maintenance fee component' },
        { name: 'total_due', type: 'DECIMAL(10,2)', key: '', desc: 'Total installment payable' },
        { name: 'amount_paid', type: 'DECIMAL(10,2)', key: '', desc: 'Actual amount remitted' },
        { name: 'status', type: 'ENUM(...)', key: '', desc: 'PAID, UPCOMING, DUE, OVERDUE, WAIVED' },
        { name: 'paid_date', type: 'TIMESTAMP', key: '', desc: 'Settlement timestamp' },
        { name: 'transaction_ref', type: 'VARCHAR(40)', key: '', desc: 'Bank clearance trace reference' },
      ],
    },
    {
      name: 'users',
      label: 'Users & Roles',
      rowsCount: 6,
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK', desc: 'Unique user identifier' },
        { name: 'name', type: 'VARCHAR(100)', key: '', desc: 'Full legal applicant or employee name' },
        { name: 'email', type: 'VARCHAR(120)', key: 'UQ', desc: 'Authenticated email address' },
        { name: 'role', type: 'ENUM(...)', key: '', desc: 'customer, bank_officer, approving_manager, finance, admin, auditor' },
        { name: 'monthly_income', type: 'DECIMAL(12,2)', key: '', desc: 'Verified net monthly payroll compensation' },
        { name: 'credit_score', type: 'INT', key: '', desc: 'FICO / Bureau credit rating (300 - 850)' },
        { name: 'kyc_verified', type: 'BOOLEAN', key: '', desc: 'Level 3 identity verification clearance' },
        { name: 'approval_limit', type: 'DECIMAL(12,2)', key: '', desc: 'Authorized credit approval ceiling ($5k / $50k)' },
      ],
    },
    {
      name: 'accounts',
      label: 'Depository Accounts',
      rowsCount: accounts.length,
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK', desc: 'Account primary key' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FK', desc: 'References users.id' },
        { name: 'account_number', type: 'VARCHAR(25)', key: 'UQ', desc: 'Maskable IBAN / Routing Account number' },
        { name: 'type', type: 'ENUM(...)', key: '', desc: 'CHECKING, SAVINGS, BUSINESS_TREASURY' },
        { name: 'balance', type: 'DECIMAL(14,2)', key: '', desc: 'Ledger book balance' },
        { name: 'available_balance', type: 'DECIMAL(14,2)', key: '', desc: 'Available funds minus held reserves' },
        { name: 'held_amount', type: 'DECIMAL(14,2)', key: '', desc: 'Advance lien or escrow hold' },
      ],
    },
    {
      name: 'audit_logs',
      label: 'Compliance Audit Logs',
      rowsCount: auditLogs.length,
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PK', desc: 'Log sequence identifier' },
        { name: 'timestamp', type: 'TIMESTAMP', key: '', desc: 'Atomic UTC timestamp' },
        { name: 'user_id', type: 'VARCHAR(36)', key: 'FK', desc: 'Actor identifier' },
        { name: 'action', type: 'VARCHAR(50)', key: '', desc: 'Event code (APPLICATION_SUBMITTED, DISBURSED, etc.)' },
        { name: 'entity_type', type: 'VARCHAR(30)', key: '', desc: 'ADVANCE, ACCOUNT, USER, SYSTEM_CONFIG' },
        { name: 'entity_id', type: 'VARCHAR(40)', key: '', desc: 'Target reference code' },
        { name: 'ip_address', type: 'VARCHAR(45)', key: '', desc: 'Source IP address' },
        { name: 'details', type: 'TEXT', key: '', desc: 'Audit narrative description' },
      ],
    },
  ];

  // REST API Endpoints Definition
  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/advances',
      desc: 'Retrieves all active, pending, and settled advances for the authenticated user.',
      execute: () => advances,
    },
    {
      method: 'GET',
      path: '/api/v1/accounts/overview',
      desc: 'Returns total account balances, liquid available funds, and active advance liens.',
      execute: () => ({
        totalPortfolioBalance: accounts.reduce((s, a) => s + a.balance, 0),
        availableLiquidFunds: accounts.reduce((s, a) => s + a.availableBalance, 0),
        totalOutstandingAdvances: advances.filter((a) => a.status === 'DISBURSED' || a.status === 'ACTIVE').reduce((s, a) => s + a.outstandingTotal, 0),
        accounts,
      }),
    },
    {
      method: 'POST',
      path: '/api/v1/advances/eligibility-check',
      desc: 'Evaluates applicant affordability score, DTI ratio, and maximum borrow limit.',
      execute: () => ({
        score: 92,
        isEligible: true,
        maxEligibleAmount: 18000,
        preliminaryTier: 2,
        approvalConfidence: 'HIGH',
        criteria: [
          { factor: 'Income Adequacy', score: '25/25', status: 'PASS' },
          { factor: 'Credit Reputation (758)', score: '30/30', status: 'PASS' },
          { factor: 'Active Debt Obligations', score: '14/20', status: 'PASS' },
          { factor: 'Repayment Affordability', score: '10/10', status: 'PASS' },
        ],
      }),
    },
    {
      method: 'GET',
      path: '/api/v1/advances/ADV-2026-0841/early-settlement-quote',
      desc: 'Calculates remaining principal, future interest rebate savings, and zero-fee net payoff.',
      execute: () => ({
        facilityId: 'ADV-2026-0841',
        originalPrincipal: 4500,
        paidToDate: 1520.84,
        remainingPrincipal: 3030.12,
        unearnedFutureInterestWaived: 38.5,
        rebatePercentage: systemConfig.earlySettlementRebatePct,
        prepaymentPenaltyFee: 0,
        netEarlySettlementPayoff: 3072.48 - 38.5,
        currency: 'USD',
      }),
    },
    {
      method: 'GET',
      path: '/api/v1/audit/logs',
      desc: 'Returns immutable audit trail entries with user, role, and action timestamps.',
      execute: () => auditLogs.slice(0, 5),
    },
    {
      method: 'GET',
      path: '/api/v1/system/config',
      desc: 'Returns active underwriting caps, approval limits, and base interest parameters.',
      execute: () => systemConfig,
    },
  ];

  const handleExecuteApi = (endpoint: any) => {
    setIsExecutingApi(true);
    setSelectedEndpoint(endpoint.path);

    setTimeout(() => {
      setApiResponse(endpoint.execute());
      setApiStatusCode(200);
      setIsExecutingApi(false);
    }, 300);
  };

  const handleCopySql = () => {
    const ddl = `
-- Nexora Bank Advances Database Schema DDL
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    monthly_income DECIMAL(12,2) NOT NULL,
    credit_score INT NOT NULL,
    kyc_verified BOOLEAN DEFAULT TRUE,
    approval_limit DECIMAL(12,2) DEFAULT NULL
);

CREATE TABLE advances (
    id VARCHAR(36) PRIMARY KEY,
    application_no VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(36) REFERENCES users(id),
    purpose VARCHAR(50) NOT NULL,
    requested_amount DECIMAL(12,2) NOT NULL,
    approved_amount DECIMAL(12,2) DEFAULT NULL,
    tenure_months INT NOT NULL,
    interest_rate_annual DECIMAL(5,2) NOT NULL,
    processing_fee DECIMAL(10,2) NOT NULL,
    monthly_installment DECIMAL(10,2) NOT NULL,
    repayment_method VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    eligibility_score INT NOT NULL,
    outstanding_principal DECIMAL(12,2) NOT NULL,
    outstanding_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repayment_installments (
    id VARCHAR(36) PRIMARY KEY,
    advance_id VARCHAR(36) REFERENCES advances(id) ON DELETE CASCADE,
    installment_no INT NOT NULL,
    due_date DATE NOT NULL,
    principal DECIMAL(10,2) NOT NULL,
    interest DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0.00,
    total_due DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL,
    paid_date TIMESTAMP DEFAULT NULL,
    transaction_ref VARCHAR(40) DEFAULT NULL
);
    `.trim();

    navigator.clipboard.writeText(ddl);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const currentTable = tables.find((t) => t.name === selectedTable) || tables[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Technical Documentation & Architecture
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800">
              REST API & PostgreSQL DDL
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Database Schema & REST API Design
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Explore the relational data dictionary, entity-relationship constraints, and execute live simulated REST requests.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'schema'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Schema</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab('api');
              if (!apiResponse) handleExecuteApi(endpoints[0]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'api'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Interactive REST API Explorer</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DATABASE SCHEMA EXPLORER */}
      {activeSubTab === 'schema' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Table Selector Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              {tables.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedTable === t.name
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
                    {t.rowsCount}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleCopySql}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5"
            >
              {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL DDL'}</span>
            </button>
          </div>

          {/* Table Schema Viewer */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  TABLE: {currentTable.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-mono">
                  {currentTable.columns.length} columns
                </span>
              </div>
              <span className="text-xs text-slate-400">Engine: InnoDB / PostgreSQL Relational</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pl-1">Column Name</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Constraint / Key</th>
                    <th className="pb-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {currentTable.columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 pl-1 font-bold text-slate-900 dark:text-slate-100">
                        {col.name}
                      </td>
                      <td className="py-2.5 text-brand-600 dark:text-brand-400">
                        {col.type}
                      </td>
                      <td className="py-2.5">
                        {col.key === 'PK' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                            PRIMARY KEY
                          </span>
                        ) : col.key === 'FK' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
                            FOREIGN KEY
                          </span>
                        ) : col.key === 'UQ' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            UNIQUE
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 font-sans text-slate-600 dark:text-slate-400 text-[11.5px]">
                        {col.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE REST API EXPLORER */}
      {activeSubTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Left Col: Endpoint Catalog */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              REST Endpoints Catalog
            </h3>
            {endpoints.map((ep, i) => {
              const isSelected = selectedEndpoint === ep.path;

              return (
                <div
                  key={i}
                  onClick={() => handleExecuteApi(ep)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 shadow-sm ring-1 ring-brand-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        ep.method === 'GET'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white truncate">
                      {ep.path}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {ep.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Col: Live Request / Response Simulator */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    GET
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {selectedEndpoint}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    STATUS: {apiStatusCode} OK
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">14ms</span>
                </div>
              </div>

              {/* JSON Payload Display */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-bold uppercase tracking-wider text-[11px]">Response JSON Payload</span>
                  <span className="font-mono text-[10px]">Content-Type: application/json; charset=utf-8</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
                  {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Click an endpoint to inspect payload...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
