import React, { useState } from 'react';
import { useBank } from './context/BankContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { FinancialOverviewCard } from './components/dashboard/FinancialOverviewCard';
import { AccountActivityChart } from './components/dashboard/AccountActivityChart';
import { FinancialWellnessGauge } from './components/dashboard/FinancialWellnessGauge';
import { QuickActions } from './components/dashboard/QuickActions';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { AdvanceApplicationWizard } from './components/advances/AdvanceApplicationWizard';
import { AdvancesPortfolioView } from './components/advances/AdvancesPortfolioView';
import { ApplicationTrackingView } from './components/advances/ApplicationTrackingView';
import { RepaymentScheduleTable } from './components/repayments/RepaymentScheduleTable';
import { RepaymentCalendarView } from './components/repayments/RepaymentCalendarView';
import { OfficerReviewQueue } from './components/workflow/OfficerReviewQueue';
import { FinanceDisbursementQueue } from './components/workflow/FinanceDisbursementQueue';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { SystemSettingsAdmin } from './components/audit/SystemSettingsAdmin';
import { AccountsView } from './components/accounts/AccountsView';
import { AutomatedTestRunner } from './components/testrunner/AutomatedTestRunner';
import { ApiSchemaExplorer } from './components/apiexplorer/ApiSchemaExplorer';
import { ShieldCheck, Calendar, ListFilter, Sparkles, Building2 } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useBank();
  const [repaymentsSubTab, setRepaymentsSubTab] = useState<'schedule' | 'calendar'>('schedule');
  const [workflowSubTab, setWorkflowSubTab] = useState<'review' | 'disbursement'>('review');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors">
      {/* Top Interactive Role Switcher Banner */}
      <RoleSwitcherBar />

      {/* Main Header / Navigation */}
      <Navbar />

      {/* Body Area with Sidebar and Dynamic View */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Responsive Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <FinancialOverviewCard />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AccountActivityChart />
                </div>
                <div className="lg:col-span-1">
                  <FinancialWellnessGauge />
                </div>
              </div>

              <QuickActions />

              <RecentTransactions />
            </div>
          )}

          {/* TAB: APPLY WIZARD */}
          {activeTab === 'apply' && (
            <div className="animate-in fade-in duration-150">
              <AdvanceApplicationWizard />
            </div>
          )}

          {/* TAB: ADVANCES PORTFOLIO */}
          {activeTab === 'advances' && (
            <div className="animate-in fade-in duration-150">
              <AdvancesPortfolioView />
            </div>
          )}

          {/* TAB: APPLICATION TRACKING & JOURNEY */}
          {activeTab === 'tracking' && (
            <div className="animate-in fade-in duration-150">
              <ApplicationTrackingView />
            </div>
          )}

          {/* TAB: REPAYMENTS & CALENDAR */}
          {activeTab === 'repayments' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Repayment Servicing & Calendar
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    View amortization schedule or inspect payment dates on the monthly calendar.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setRepaymentsSubTab('schedule')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      repaymentsSubTab === 'schedule'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Amortization Schedule</span>
                  </button>
                  <button
                    onClick={() => setRepaymentsSubTab('calendar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      repaymentsSubTab === 'calendar'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Monthly Calendar</span>
                  </button>
                </div>
              </div>

              {repaymentsSubTab === 'schedule' ? (
                <RepaymentScheduleTable />
              ) : (
                <RepaymentCalendarView />
              )}
            </div>
          )}

          {/* TAB: WORKFLOW & APPROVAL DESK */}
          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Underwriting & Disbursement Operations
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Authorized bank officer review queue and treasury release desk.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setWorkflowSubTab('review')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      workflowSubTab === 'review'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Credit Review Queue
                  </button>
                  <button
                    onClick={() => setWorkflowSubTab('disbursement')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      workflowSubTab === 'disbursement'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Finance Disbursement Desk
                  </button>
                </div>
              </div>

              {workflowSubTab === 'review' ? (
                <OfficerReviewQueue />
              ) : (
                <FinanceDisbursementQueue />
              )}
            </div>
          )}

          {/* TAB: ACCOUNTS & CARDS */}
          {activeTab === 'accounts' && (
            <div className="animate-in fade-in duration-150">
              <AccountsView />
            </div>
          )}

          {/* TAB: AUDIT TRAILS & COMPLIANCE */}
          {activeTab === 'audit' && (
            <div className="animate-in fade-in duration-150">
              <AuditLogViewer />
            </div>
          )}

          {/* TAB: SYSTEM SETTINGS ADMIN */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-150">
              <SystemSettingsAdmin />
            </div>
          )}

          {/* TAB: API & SCHEMA EXPLORER */}
          {activeTab === 'api-schema' && (
            <div className="animate-in fade-in duration-150">
              <ApiSchemaExplorer />
            </div>
          )}

          {/* TAB: AUTOMATED TEST HARNESS */}
          {activeTab === 'tests' && (
            <div className="animate-in fade-in duration-150">
              <AutomatedTestRunner />
            </div>
          )}
        </main>
      </div>

      {/* Global Footer */}
      <footer className="bg-white/80 dark:bg-navy-950/80 border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">NEXORA BANK</span>
            <span>• Next-Generation Banking with Smart Advances Management</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </span>
            <span>FDIC Insured #88921</span>
            <span>Equal Housing Lender</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
