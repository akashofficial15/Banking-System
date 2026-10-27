import { RepaymentInstallment } from '../types';

export interface AdvanceCalculationResult {
  requestedAmount: number;
  tenureMonths: number;
  interestRateAnnual: number;
  processingFee: number;
  totalInterest: number;
  totalRepaymentExpected: number;
  monthlyInstallment: number;
  apr: number;
  schedule: RepaymentInstallment[];
}

export interface EarlySettlementQuote {
  advanceId: string;
  originalAmount: number;
  totalPaidSoFar: number;
  remainingPrincipal: number;
  accruedInterestToDate: number;
  unaccruedFutureInterest: number;
  rebateDiscountAmount: number; // savings!
  earlySettlementFee: number;
  netSettlementPayoffAmount: number;
  effectiveSavings: number;
}

/**
 * Calculates standard amortization schedule and installment amounts
 */
export function calculateAdvanceRepayment(
  principal: number,
  tenureMonths: number,
  interestRateAnnual: number = 4.5,
  processingFeePct: number = 1.0,
  startDate: Date = new Date()
): AdvanceCalculationResult {
  const safeTenure = Math.max(1, Math.min(36, tenureMonths));
  const safePrincipal = Math.max(100, principal);
  
  // Processing fee (fixed or % based)
  const processingFee = Math.round((safePrincipal * (processingFeePct / 100)) * 100) / 100;
  
  // Monthly interest rate
  const monthlyRate = (interestRateAnnual / 100) / 12;
  
  let monthlyInstallment = 0;
  let totalRepaymentExpected = 0;
  let totalInterest = 0;
  
  if (monthlyRate === 0) {
    monthlyInstallment = Math.round((safePrincipal / safeTenure) * 100) / 100;
    totalInterest = 0;
    totalRepaymentExpected = safePrincipal + processingFee;
  } else {
    // Standard PMT formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, safeTenure);
    monthlyInstallment = Math.round(((safePrincipal * monthlyRate * factor) / (factor - 1)) * 100) / 100;
    totalInterest = Math.round(((monthlyInstallment * safeTenure) - safePrincipal) * 100) / 100;
    totalRepaymentExpected = Math.round((safePrincipal + totalInterest + processingFee) * 100) / 100;
  }

  // Generate amortization schedule
  let remainingBalance = safePrincipal;
  const schedule: RepaymentInstallment[] = [];

  for (let i = 1; i <= safeTenure; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const interestForMonth = monthlyRate === 0 ? 0 : Math.round((remainingBalance * monthlyRate) * 100) / 100;
    let principalForMonth = Math.round((monthlyInstallment - interestForMonth) * 100) / 100;

    // Handle rounding for the last installment
    if (i === safeTenure || principalForMonth > remainingBalance) {
      principalForMonth = Math.round(remainingBalance * 100) / 100;
      monthlyInstallment = Math.round((principalForMonth + interestForMonth) * 100) / 100;
    }

    remainingBalance = Math.max(0, Math.round((remainingBalance - principalForMonth) * 100) / 100);

    schedule.push({
      installmentNo: i,
      dueDate: dueDate.toISOString(),
      principal: principalForMonth,
      interest: interestForMonth,
      fee: i === 1 ? processingFee : 0, // Fee billed with first installment
      totalDue: Math.round((principalForMonth + interestForMonth + (i === 1 ? processingFee : 0)) * 100) / 100,
      amountPaid: 0,
      status: 'UPCOMING',
    });
  }

  // APR approximation: ((Total Cost / Principal) / (Tenure / 12)) * 100
  const totalFinanceCharge = totalInterest + processingFee;
  const apr = Math.round((((totalFinanceCharge / safePrincipal) / (safeTenure / 12)) * 100) * 10) / 10;

  return {
    requestedAmount: safePrincipal,
    tenureMonths: safeTenure,
    interestRateAnnual,
    processingFee,
    totalInterest,
    totalRepaymentExpected,
    monthlyInstallment,
    apr,
    schedule,
  };
}

/**
 * Calculates Early Settlement payoff and interest rebate savings
 */
export function calculateEarlySettlementQuote(
  advanceId: string,
  originalPrincipal: number,
  schedule: RepaymentInstallment[],
  rebatePercentage: number = 60 // 60% rebate on unearned interest
): EarlySettlementQuote {
  let totalPaidSoFar = 0;
  let remainingPrincipal = 0;
  let futureUnearnedInterest = 0;

  schedule.forEach((item) => {
    if (item.status === 'PAID') {
      totalPaidSoFar += item.amountPaid;
    } else {
      remainingPrincipal += item.principal;
      futureUnearnedInterest += item.interest;
    }
  });

  remainingPrincipal = Math.round(remainingPrincipal * 100) / 100;
  futureUnearnedInterest = Math.round(futureUnearnedInterest * 100) / 100;

  // Rebate discount granted to the user for paying ahead
  const rebateDiscountAmount = Math.round((futureUnearnedInterest * (rebatePercentage / 100)) * 100) / 100;
  const earlySettlementFee = 0; // Nexora provides fee-free early settlement as a customer-first benefit

  const netSettlementPayoffAmount = Math.max(
    0,
    Math.round((remainingPrincipal + (futureUnearnedInterest - rebateDiscountAmount) + earlySettlementFee) * 100) / 100
  );

  return {
    advanceId,
    originalAmount: originalPrincipal,
    totalPaidSoFar: Math.round(totalPaidSoFar * 100) / 100,
    remainingPrincipal,
    accruedInterestToDate: Math.round((originalPrincipal * 0.01) * 100) / 100,
    unaccruedFutureInterest: futureUnearnedInterest,
    rebateDiscountAmount,
    earlySettlementFee,
    netSettlementPayoffAmount,
    effectiveSavings: rebateDiscountAmount,
  };
}
