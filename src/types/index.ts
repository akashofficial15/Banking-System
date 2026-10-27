export type UserRole =
  | 'customer'
  | 'bank_officer'
  | 'approving_manager'
  | 'finance_officer'
  | 'admin'
  | 'auditor';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  department?: string;
  employeeId?: string;
  monthlyIncome: number;
  creditScore: number;
  activeAccountNo: string;
  kycVerified: boolean;
  mfaEnabled: boolean;
  approvalLimit?: number; // for bank_officer ($5,000) and approving_manager ($50,000)
}

export type AccountType = 'CHECKING' | 'SAVINGS' | 'BUSINESS_TREASURY' | 'ESCROW';

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  accountName: string;
  type: AccountType;
  currency: string;
  balance: number;
  availableBalance: number;
  heldAmount: number;
  routingNumber: string;
  status: 'ACTIVE' | 'DORMANT' | 'FROZEN';
  openedDate: string;
}

export type TransactionType =
  | 'SALARY_DEPOSIT'
  | 'ADVANCE_DISBURSEMENT'
  | 'ADVANCE_REPAYMENT'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN'
  | 'BILL_PAYMENT'
  | 'CARD_PURCHASE';

export interface Transaction {
  id: string;
  accountId: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  direction: 'INFLOW' | 'OUTFLOW';
  description: string;
  reference: string;
  counterparty: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'RECONCILED';
  advanceId?: string;
}

export type AdvanceStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'SETTLED'
  | 'DEFAULTED';

export type AdvancePurpose =
  | 'SALARY_ADVANCE'
  | 'MEDICAL_EMERGENCY'
  | 'EQUIPMENT_PURCHASE'
  | 'EDUCATION_TRAINING'
  | 'WORKING_CAPITAL'
  | 'RELOCATION_HOUSING'
  | 'OTHER_PERSONAL';

export type RepaymentMethod = 'SALARY_DEDUCTION' | 'DIRECT_DEBIT' | 'MANUAL_TRANSFER';

export interface DocumentAttachment {
  id: string;
  name: string;
  type: 'PAYSLIP' | 'BANK_STATEMENT' | 'NATIONAL_ID' | 'EMPLOYMENT_CONTRACT' | 'INVOICE' | 'OTHER';
  url: string;
  size: string;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  notes?: string;
}

export interface TransparencyFactor {
  factor: string;
  category: 'INCOME' | 'CREDIT_SCORE' | 'EXISTING_DEBT' | 'EMPLOYMENT_TENURE' | 'BANKING_HISTORY';
  score: number;
  maxScore: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  explanation: string;
}

export interface RepaymentInstallment {
  installmentNo: number;
  dueDate: string;
  principal: number;
  interest: number;
  fee: number;
  totalDue: number;
  amountPaid: number;
  status: 'PAID' | 'UPCOMING' | 'DUE' | 'OVERDUE' | 'WAIVED';
  paidDate?: string;
  transactionRef?: string;
}

export interface AdvanceJourneyStep {
  stage: string;
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
  actorRole?: string;
  actorName?: string;
  notes?: string;
}

export interface Advance {
  id: string;
  applicationNo: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  applicantRole: string;
  purpose: AdvancePurpose;
  purposeNote: string;
  requestedAmount: number;
  approvedAmount?: number;
  tenureMonths: number;
  interestRateAnnual: number;
  processingFee: number;
  totalRepaymentExpected: number;
  monthlyInstallment: number;
  repaymentMethod: RepaymentMethod;
  status: AdvanceStatus;
  currentStageName: string;
  requiredApprovalTier: 1 | 2 | 3 | 4;
  
  // Scoring & Transparency
  eligibilityScore: number; // 0 - 100
  transparencyFactors: TransparencyFactor[];
  rejectionReason?: string;
  reviewNotes?: string;
  
  // Supporting documents
  documents: DocumentAttachment[];
  
  // Disbursement records
  disbursementDetails?: {
    disbursedAt: string;
    referenceNo: string;
    targetAccount: string;
    disbursedBy: string;
    disbursedAmount: number;
    channel: 'INSTANT_ACH' | 'WIRE' | 'INTERNAL_TRANSFER';
  };

  // Repayment tracking
  repaymentSchedule: RepaymentInstallment[];
  outstandingPrincipal: number;
  outstandingTotal: number;
  totalPaid: number;
  nextDueDate?: string;
  earlySettlementRebateEstimate?: number;

  createdAt: string;
  updatedAt: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action:
    | 'USER_LOGIN'
    | 'APPLICATION_DRAFTED'
    | 'APPLICATION_SUBMITTED'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_VERIFIED'
    | 'OFFICER_REVIEW_PASSED'
    | 'MANAGER_APPROVAL_GRANTED'
    | 'MANAGER_REJECTION'
    | 'DISBURSEMENT_INITIATED'
    | 'DISBURSEMENT_COMPLETED'
    | 'INSTALLMENT_REPAID'
    | 'EARLY_SETTLEMENT_REQUESTED'
    | 'EARLY_SETTLEMENT_EXECUTED'
    | 'SYSTEM_RULE_UPDATED';
  entityType: 'ADVANCE' | 'ACCOUNT' | 'USER' | 'SYSTEM_CONFIG';
  entityId: string;
  ipAddress: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface SystemConfig {
  maxAdvanceLimit: number;
  tier1AutoApprovalLimit: number;
  tier2OfficerLimit: number;
  tier3ManagerLimit: number;
  baseInterestRatePct: number;
  processingFeePct: number;
  maxDebtToIncomeRatioPct: number;
  minCreditScore: number;
  earlySettlementRebatePct: number; // e.g. 50% discount on unearned interest
  allowSalaryDeduction: boolean;
  gracePeriodDays: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  timestamp: string;
  read: boolean;
  linkToAdvanceId?: string;
  actionLabel?: string;
}

export interface FinancialWellnessSummary {
  overallScore: number; // 0 - 100
  tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'ATTENTION_NEEDED';
  debtToIncomeRatio: number; // percentage
  monthlyNetIncome: number;
  monthlyFixedCommitments: number;
  discretionaryBuffer: number;
  recommendedMaxAdvance: number;
  insights: string[];
}
