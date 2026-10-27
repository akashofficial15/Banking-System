import { describe, it, expect } from 'vitest';
import { calculateAdvanceRepayment, calculateEarlySettlementQuote } from '../lib/advanceCalculator';
import { evaluateEligibility, computeFinancialWellness } from '../lib/eligibilityEngine';
import { determineApprovalTier, canUserReviewAdvance, canUserDisburseAdvance } from '../lib/workflowRouter';
import { INITIAL_USERS, INITIAL_SYSTEM_CONFIG } from '../data/mockData';

describe('Nexora Advances Financial Engine', () => {
  it('correctly calculates amortization and monthly installment using PMT formula', () => {
    const calc = calculateAdvanceRepayment(5000, 6, 4.5, 1.0);
    expect(calc.requestedAmount).toBe(5000);
    expect(calc.tenureMonths).toBe(6);
    expect(calc.monthlyInstallment).toBeGreaterThan(840);
    expect(calc.monthlyInstallment).toBeLessThan(855);
    expect(calc.processingFee).toBe(50); // 1% of $5,000
    expect(calc.schedule.length).toBe(6);
  });

  it('guarantees early settlement interest rebate discount without prepayment fees', () => {
    const calc = calculateAdvanceRepayment(8000, 12, 4.5, 1.0);
    // Mark first 4 installments as paid
    for (let i = 0; i < 4; i++) {
      calc.schedule[i].status = 'PAID';
      calc.schedule[i].amountPaid = calc.schedule[i].totalDue;
    }

    const quote = calculateEarlySettlementQuote('test-adv-1', 8000, calc.schedule, 60);
    expect(quote.earlySettlementFee).toBe(0);
    expect(quote.rebateDiscountAmount).toBeGreaterThan(0);
    expect(quote.effectiveSavings).toBe(quote.rebateDiscountAmount);
    expect(quote.netSettlementPayoffAmount).toBeLessThan(quote.remainingPrincipal + quote.unaccruedFutureInterest);
  });

  it('evaluates credit risk and debt-to-income limits accurately', () => {
    const applicant = INITIAL_USERS[0]; // $7,400 monthly income, 758 credit score
    const safeEvaluation = evaluateEligibility(applicant, 4000, 6, 0, INITIAL_SYSTEM_CONFIG);
    expect(safeEvaluation.isEligible).toBe(true);
    expect(safeEvaluation.approvalConfidence).toBe('HIGH');
    expect(safeEvaluation.overallScore).toBeGreaterThanOrEqual(80);

    // Over-indebtedness attempt
    const excessiveEvaluation = evaluateEligibility(applicant, 40000, 6, 0, INITIAL_SYSTEM_CONFIG);
    expect(excessiveEvaluation.isEligible).toBe(false);
    expect(excessiveEvaluation.approvalConfidence).toBe('INELIGIBLE');
  });

  it('enforces multi-tier approval threshold routing', () => {
    expect(determineApprovalTier(1000, INITIAL_SYSTEM_CONFIG)).toBe(1); // Auto
    expect(determineApprovalTier(4500, INITIAL_SYSTEM_CONFIG)).toBe(2); // Officer
    expect(determineApprovalTier(12000, INITIAL_SYSTEM_CONFIG)).toBe(3); // Manager
    expect(determineApprovalTier(30000, INITIAL_SYSTEM_CONFIG)).toBe(4); // Committee / Exec
  });

  it('enforces strict role-based access control for disbursement', () => {
    const approvedAdvance: any = { status: 'APPROVED' };
    expect(canUserDisburseAdvance('finance_officer', approvedAdvance)).toBe(true);
    expect(canUserDisburseAdvance('admin', approvedAdvance)).toBe(true);
    expect(canUserDisburseAdvance('customer', approvedAdvance)).toBe(false);
    expect(canUserDisburseAdvance('bank_officer', approvedAdvance)).toBe(false);
    expect(canUserDisburseAdvance('auditor', approvedAdvance)).toBe(false);
  });
});
