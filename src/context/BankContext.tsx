import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  BankAccount,
  Transaction,
  Advance,
  AuditRecord,
  SystemConfig,
  NotificationItem,
  UserRole,
  RepaymentMethod,
  AdvancePurpose,
  DocumentAttachment,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ACCOUNTS,
  INITIAL_ADVANCES,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SYSTEM_CONFIG,
} from '../data/mockData';
import { calculateAdvanceRepayment, calculateEarlySettlementQuote } from '../lib/advanceCalculator';
import { evaluateEligibility } from '../lib/eligibilityEngine';
import { determineApprovalTier } from '../lib/workflowRouter';

interface BankContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUserRole: (role: UserRole) => void;
  
  accounts: BankAccount[];
  transactions: Transaction[];
  primaryAccount: BankAccount;
  
  advances: Advance[];
  selectedAdvance: Advance | null;
  setSelectedAdvanceId: (id: string | null) => void;
  
  auditLogs: AuditRecord[];
  addAuditLog: (action: AuditRecord['action'], entityType: AuditRecord['entityType'], entityId: string, details: string, metadata?: any) => void;
  
  systemConfig: SystemConfig;
  updateSystemConfig: (newConfig: Partial<SystemConfig>) => void;
  
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type'], linkToAdvanceId?: string) => void;
  
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Advance Operations
  submitAdvanceApplication: (data: {
    purpose: AdvancePurpose;
    purposeNote: string;
    requestedAmount: number;
    tenureMonths: number;
    repaymentMethod: RepaymentMethod;
    documents: DocumentAttachment[];
  }) => { success: boolean; advanceId: string; message: string };

  reviewApplication: (
    advanceId: string,
    decision: 'APPROVE' | 'REJECT',
    notes: string,
    approvedAmount?: number
  ) => boolean;

  disburseAdvance: (advanceId: string, targetAccountId: string) => boolean;
  
  makeRepayment: (advanceId: string, installmentNo: number, amount: number, paymentMethod: string) => boolean;

  executeEarlySettlement: (advanceId: string) => { success: boolean; payoffAmount: number; savings: number };

  resetDemoData: () => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'nexora_bank_state_v1_';

export const BankProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}dark_mode`);
    return saved ? JSON.parse(saved) : true; // Default to sleek dark fintech theme
  });

  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedAdvanceId, setSelectedAdvanceId] = useState<string | null>('adv-01');

  // Users
  const [allUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_role`);
    if (saved) {
      const match = INITIAL_USERS.find((u) => u.role === saved);
      if (match) return match;
    }
    return INITIAL_USERS[0]; // Sarah Jenkins (customer)
  });

  // System Configuration
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}config`);
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_CONFIG;
  });

  // Bank Accounts
  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Advances
  const [advances, setAdvances] = useState<Advance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}advances`);
    return saved ? JSON.parse(saved) : INITIAL_ADVANCES;
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}dark_mode`, JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}current_role`, currentUser.role);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}accounts`, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}advances`, JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}config`, JSON.stringify(systemConfig));
  }, [systemConfig]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const switchUserRole = (role: UserRole) => {
    const matched = allUsers.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      addAuditLog('USER_LOGIN', 'USER', matched.id, `User persona switched to ${matched.name} (${matched.roleTitle}).`);
    }
  };

  const addAuditLog = (
    action: AuditRecord['action'],
    entityType: AuditRecord['entityType'],
    entityId: string,
    details: string,
    metadata?: any
  ) => {
    const newRecord: AuditRecord = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      ipAddress: '10.200.4.88',
      details,
      metadata,
    };
    setAuditLogs((prev) => [newRecord, ...prev]);
  };

  const addNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'] = 'INFO',
    linkToAdvanceId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      linkToAdvanceId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateSystemConfig = (newConfig: Partial<SystemConfig>) => {
    setSystemConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      addAuditLog(
        'SYSTEM_RULE_UPDATED',
        'SYSTEM_CONFIG',
        'SYS-CONFIG-01',
        `System credit & workflow parameters updated by ${currentUser.name}.`,
        newConfig
      );
      return updated;
    });
  };

  // Submit a new advance application
  const submitAdvanceApplication = (data: {
    purpose: AdvancePurpose;
    purposeNote: string;
    requestedAmount: number;
    tenureMonths: number;
    repaymentMethod: RepaymentMethod;
    documents: DocumentAttachment[];
  }) => {
    const customerUser = INITIAL_USERS[0];
    const activeBurden = advances
      .filter((a) => a.userId === customerUser.id && (a.status === 'DISBURSED' || a.status === 'ACTIVE'))
      .reduce((sum, a) => sum + a.outstandingTotal, 0);

    const evaluation = evaluateEligibility(
      customerUser,
      data.requestedAmount,
      data.tenureMonths,
      activeBurden,
      systemConfig
    );

    const calc = calculateAdvanceRepayment(
      data.requestedAmount,
      data.tenureMonths,
      systemConfig.baseInterestRatePct,
      systemConfig.processingFeePct
    );

    const tier = determineApprovalTier(data.requestedAmount, systemConfig);
    const newAppNo = `ADV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `adv-${Date.now()}`;

    const newAdvance: Advance = {
      id: newId,
      applicationNo: newAppNo,
      userId: customerUser.id,
      applicantName: customerUser.name,
      applicantEmail: customerUser.email,
      applicantRole: customerUser.roleTitle,
      purpose: data.purpose,
      purposeNote: data.purposeNote,
      requestedAmount: data.requestedAmount,
      tenureMonths: data.tenureMonths,
      interestRateAnnual: systemConfig.baseInterestRatePct,
      processingFee: calc.processingFee,
      totalRepaymentExpected: calc.totalRepaymentExpected,
      monthlyInstallment: calc.monthlyInstallment,
      repaymentMethod: data.repaymentMethod,
      status: 'SUBMITTED',
      currentStageName: tier === 1 ? 'Automated Pre-Approval' : 'Submitted (Awaiting Officer Verification)',
      requiredApprovalTier: tier,
      eligibilityScore: evaluation.overallScore,
      transparencyFactors: evaluation.factors,
      documents: data.documents,
      repaymentSchedule: calc.schedule,
      outstandingPrincipal: data.requestedAmount,
      outstandingTotal: calc.totalRepaymentExpected,
      totalPaid: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAdvances((prev) => [newAdvance, ...prev]);
    setSelectedAdvanceId(newId);

    addAuditLog(
      'APPLICATION_SUBMITTED',
      'ADVANCE',
      newAppNo,
      `Submitted application for $${data.requestedAmount.toLocaleString()} (${data.tenureMonths} mo). Tier: ${tier}. Score: ${evaluation.overallScore}/100.`,
      { requestedAmount: data.requestedAmount, purpose: data.purpose }
    );

    addNotification(
      'Application Successfully Submitted',
      `Advance request ${newAppNo} of $${data.requestedAmount.toLocaleString()} submitted for review.`,
      'SUCCESS',
      newId
    );

    return { success: true, advanceId: newId, message: 'Application registered successfully' };
  };

  // Bank Officer / Manager review
  const reviewApplication = (
    advanceId: string,
    decision: 'APPROVE' | 'REJECT',
    notes: string,
    approvedAmount?: number
  ) => {
    let targetAdvance: Advance | undefined;
    setAdvances((prev) =>
      prev.map((adv) => {
        if (adv.id !== advanceId) return adv;
        targetAdvance = adv;
        const finalAmount = approvedAmount || adv.requestedAmount;
        const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        const calc = calculateAdvanceRepayment(
          finalAmount,
          adv.tenureMonths,
          adv.interestRateAnnual,
          systemConfig.processingFeePct
        );

        return {
          ...adv,
          status: newStatus,
          approvedAmount: decision === 'APPROVE' ? finalAmount : undefined,
          currentStageName: decision === 'APPROVE' ? 'Approved (Pending Finance Release)' : 'Application Rejected',
          reviewNotes: notes,
          rejectionReason: decision === 'REJECT' ? notes : undefined,
          totalRepaymentExpected: calc.totalRepaymentExpected,
          monthlyInstallment: calc.monthlyInstallment,
          outstandingPrincipal: finalAmount,
          outstandingTotal: calc.totalRepaymentExpected,
          repaymentSchedule: calc.schedule,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (targetAdvance) {
      const actionName =
        decision === 'APPROVE'
          ? currentUser.role === 'approving_manager'
            ? 'MANAGER_APPROVAL_GRANTED'
            : 'OFFICER_REVIEW_PASSED'
          : 'MANAGER_REJECTION';

      addAuditLog(
        actionName,
        'ADVANCE',
        targetAdvance.applicationNo,
        `${decision === 'APPROVE' ? 'Approved' : 'Rejected'} by ${currentUser.name} (${currentUser.roleTitle}). Notes: ${notes}`,
        { decision, approvedAmount: approvedAmount || targetAdvance.requestedAmount }
      );

      addNotification(
        `Advance ${targetAdvance.applicationNo} ${decision === 'APPROVE' ? 'Approved' : 'Rejected'}`,
        `${decision === 'APPROVE' ? 'Approved for $' + (approvedAmount || targetAdvance.requestedAmount).toLocaleString() : 'Decision: Rejected. Reason: ' + notes}`,
        decision === 'APPROVE' ? 'SUCCESS' : 'ALERT',
        advanceId
      );
    }

    return true;
  };

  // Finance Officer executes disbursement
  const disburseAdvance = (advanceId: string, targetAccountId: string) => {
    let disbursedAdv: Advance | undefined;
    const refNo = `DISB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    setAdvances((prev) =>
      prev.map((adv) => {
        if (adv.id !== advanceId) return adv;
        disbursedAdv = adv;
        const amount = adv.approvedAmount || adv.requestedAmount;
        return {
          ...adv,
          status: 'DISBURSED',
          currentStageName: 'Active Servicing (0 Installments Paid)',
          disbursementDetails: {
            disbursedAt: new Date().toISOString(),
            referenceNo: refNo,
            targetAccount: accounts.find((a) => a.id === targetAccountId)?.accountNumber || 'NX-8829-4410-09',
            disbursedBy: currentUser.name,
            disbursedAmount: amount,
            channel: 'INSTANT_ACH',
          },
          nextDueDate: adv.repaymentSchedule[0]?.dueDate,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (disbursedAdv) {
      const amount = disbursedAdv.approvedAmount || disbursedAdv.requestedAmount;
      // Credit customer account
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === targetAccountId || acc.accountNumber === 'NX-8829-4410-09') {
            return {
              ...acc,
              balance: acc.balance + amount,
              availableBalance: acc.availableBalance + amount,
            };
          }
          return acc;
        })
      );

      // Record transaction
      const newTx: Transaction = {
        id: `tx-disb-${Date.now()}`,
        accountId: targetAccountId,
        userId: disbursedAdv.userId,
        type: 'ADVANCE_DISBURSEMENT',
        category: 'Advance Payout',
        amount: amount,
        direction: 'INFLOW',
        description: `Disbursement of ${disbursedAdv.applicationNo} (${disbursedAdv.purpose.replace(/_/g, ' ')})`,
        reference: refNo,
        counterparty: 'Nexora Advances Facility',
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        advanceId: disbursedAdv.id,
      };
      setTransactions((prev) => [newTx, ...prev]);

      addAuditLog(
        'DISBURSEMENT_COMPLETED',
        'ADVANCE',
        disbursedAdv.applicationNo,
        `Disbursed $${amount.toLocaleString()} to ${refNo} via Instant ACH by ${currentUser.name}.`,
        { amount, refNo, targetAccountId }
      );

      addNotification(
        'Funds Disbursed to Account',
        `$${amount.toLocaleString()} has been credited to your checking account (Ref: ${refNo}).`,
        'SUCCESS',
        advanceId
      );
    }

    return true;
  };

  // Repayment installment processing
  const makeRepayment = (advanceId: string, installmentNo: number, amount: number, paymentMethod: string) => {
    let advanceMatched: Advance | undefined;
    const txRef = `TX-REP-${Math.floor(100000 + Math.random() * 900000)}`;

    setAdvances((prev) =>
      prev.map((adv) => {
        if (adv.id !== advanceId) return adv;
        advanceMatched = adv;

        const updatedSchedule = adv.repaymentSchedule.map((inst) => {
          if (inst.installmentNo === installmentNo) {
            return {
              ...inst,
              status: 'PAID' as const,
              amountPaid: amount,
              paidDate: new Date().toISOString(),
              transactionRef: txRef,
            };
          }
          return inst;
        });

        const totalPaid = updatedSchedule.reduce((sum, i) => sum + i.amountPaid, 0);
        const remainingSchedule = updatedSchedule.filter((i) => i.status !== 'PAID');
        const remainingTotal = remainingSchedule.reduce((sum, i) => sum + i.totalDue, 0);
        const remainingPrincipal = remainingSchedule.reduce((sum, i) => sum + i.principal, 0);
        const isFullySettled = remainingSchedule.length === 0 || remainingTotal <= 0;

        return {
          ...adv,
          status: isFullySettled ? 'SETTLED' : adv.status,
          currentStageName: isFullySettled
            ? 'Fully Settled'
            : `Active Servicing (${updatedSchedule.filter((s) => s.status === 'PAID').length}/${adv.tenureMonths} Paid)`,
          repaymentSchedule: updatedSchedule,
          totalPaid: Math.round(totalPaid * 100) / 100,
          outstandingPrincipal: Math.round(remainingPrincipal * 100) / 100,
          outstandingTotal: Math.round(remainingTotal * 100) / 100,
          nextDueDate: remainingSchedule[0]?.dueDate,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (advanceMatched) {
      // Debit from checking account
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.accountNumber === 'NX-8829-4410-09') {
            return {
              ...acc,
              balance: Math.max(0, acc.balance - amount),
              availableBalance: Math.max(0, acc.availableBalance - amount),
            };
          }
          return acc;
        })
      );

      // Record transaction
      const newTx: Transaction = {
        id: `tx-rep-${Date.now()}`,
        accountId: 'acc-01',
        userId: advanceMatched.userId,
        type: 'ADVANCE_REPAYMENT',
        category: 'Advance Servicing',
        amount: amount,
        direction: 'OUTFLOW',
        description: `Installment #${installmentNo} for ${advanceMatched.applicationNo} (${paymentMethod})`,
        reference: txRef,
        counterparty: 'Nexora Credit Operations',
        timestamp: new Date().toISOString(),
        status: 'COMPLETED',
        advanceId: advanceMatched.id,
      };
      setTransactions((prev) => [newTx, ...prev]);

      addAuditLog(
        'INSTALLMENT_REPAID',
        'ADVANCE',
        advanceMatched.applicationNo,
        `Repayment of $${amount.toLocaleString()} received for installment #${installmentNo} (${paymentMethod}).`,
        { installmentNo, amount, txRef }
      );

      addNotification(
        'Repayment Received',
        `Payment of $${amount.toLocaleString()} for ${advanceMatched.applicationNo} confirmed.`,
        'SUCCESS',
        advanceId
      );
    }

    return true;
  };

  // Early settlement with interest rebate
  const executeEarlySettlement = (advanceId: string) => {
    const target = advances.find((a) => a.id === advanceId);
    if (!target) return { success: false, payoffAmount: 0, savings: 0 };

    const quote = calculateEarlySettlementQuote(
      advanceId,
      target.requestedAmount,
      target.repaymentSchedule,
      systemConfig.earlySettlementRebatePct
    );

    const txRef = `TX-SETTLE-${Math.floor(100000 + Math.random() * 900000)}`;

    setAdvances((prev) =>
      prev.map((adv) => {
        if (adv.id !== advanceId) return adv;
        const settledSchedule = adv.repaymentSchedule.map((inst) => {
          if (inst.status !== 'PAID') {
            return {
              ...inst,
              status: 'WAIVED' as const,
              amountPaid: 0,
            };
          }
          return inst;
        });

        return {
          ...adv,
          status: 'SETTLED',
          currentStageName: 'Facility Settled (Early Payoff with Rebate)',
          repaymentSchedule: settledSchedule,
          outstandingPrincipal: 0,
          outstandingTotal: 0,
          totalPaid: adv.totalPaid + quote.netSettlementPayoffAmount,
          nextDueDate: undefined,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Deduct from primary checking
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.accountNumber === 'NX-8829-4410-09') {
          return {
            ...acc,
            balance: Math.max(0, acc.balance - quote.netSettlementPayoffAmount),
            availableBalance: Math.max(0, acc.availableBalance - quote.netSettlementPayoffAmount),
          };
        }
        return acc;
      })
    );

    // Transaction
    const newTx: Transaction = {
      id: `tx-early-${Date.now()}`,
      accountId: 'acc-01',
      userId: target.userId,
      type: 'ADVANCE_REPAYMENT',
      category: 'Early Settlement',
      amount: quote.netSettlementPayoffAmount,
      direction: 'OUTFLOW',
      description: `Early Settlement Payoff for ${target.applicationNo} (Rebate Savings: $${quote.effectiveSavings.toLocaleString()})`,
      reference: txRef,
      counterparty: 'Nexora Credit Operations',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      advanceId: target.id,
    };
    setTransactions((prev) => [newTx, ...prev]);

    addAuditLog(
      'EARLY_SETTLEMENT_EXECUTED',
      'ADVANCE',
      target.applicationNo,
      `Early settlement completed. Net payoff: $${quote.netSettlementPayoffAmount.toLocaleString()}. Customer saved $${quote.effectiveSavings.toLocaleString()} in waived interest.`,
      { quote, txRef }
    );

    addNotification(
      'Early Settlement Completed!',
      `Facility ${target.applicationNo} closed in full. You saved $${quote.effectiveSavings.toLocaleString()} in interest rebate!`,
      'SUCCESS',
      advanceId
    );

    return {
      success: true,
      payoffAmount: quote.netSettlementPayoffAmount,
      savings: quote.effectiveSavings,
    };
  };

  const resetDemoData = () => {
    localStorage.clear();
    setAccounts(INITIAL_ACCOUNTS);
    setAdvances(INITIAL_ADVANCES);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSystemConfig(INITIAL_SYSTEM_CONFIG);
    setCurrentUser(INITIAL_USERS[0]);
    addAuditLog('USER_LOGIN', 'SYSTEM_CONFIG', 'SYS', 'Demo dataset refreshed to pristine factory benchmark.');
  };

  const primaryAccount = accounts[0] || INITIAL_ACCOUNTS[0];
  const selectedAdvance = advances.find((a) => a.id === selectedAdvanceId) || advances[0] || null;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <BankContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUserRole,
        accounts,
        transactions,
        primaryAccount,
        advances,
        selectedAdvance,
        setSelectedAdvanceId,
        auditLogs,
        addAuditLog,
        systemConfig,
        updateSystemConfig,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        isDarkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        submitAdvanceApplication,
        reviewApplication,
        disburseAdvance,
        makeRepayment,
        executeEarlySettlement,
        resetDemoData,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};
