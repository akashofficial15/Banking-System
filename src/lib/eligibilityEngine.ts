import { TransparencyFactor, FinancialWellnessSummary, SystemConfig, UserProfile } from '../types';

export interface EligibilityEvaluation {
  overallScore: number; // 0 - 100
  isEligible: boolean;
  maxEligibleAmount: number;
  recommendedTenureMonths: number;
  preliminaryTier: 1 | 2 | 3 | 4;
  approvalConfidence: 'HIGH' | 'MODERATE' | 'LOW' | 'INELIGIBLE';
  factors: TransparencyFactor[];
  summaryNote: string;
}

export function evaluateEligibility(
  user: UserProfile,
  requestedAmount: number,
  tenureMonths: number,
  existingActiveAdvancesTotal: number,
  config: SystemConfig
): EligibilityEvaluation {
  const factors: TransparencyFactor[] = [];
  let score = 0;

  // 1. Income to Requested Amount Rule
  // Advance cannot exceed 3.5x net monthly income
  const maxAllowableByIncome = user.monthlyIncome * 3.5;
  const incomeRatio = requestedAmount / user.monthlyIncome;

  if (requestedAmount <= user.monthlyIncome * 1.5) {
    score += 25;
    factors.push({
      factor: 'Income Adequacy',
      category: 'INCOME',
      score: 25,
      maxScore: 25,
      status: 'PASS',
      impact: 'POSITIVE',
      explanation: `Requested amount ($${requestedAmount.toLocaleString()}) is comfortably within 1.5x monthly income ($${user.monthlyIncome.toLocaleString()}).`,
    });
  } else if (requestedAmount <= maxAllowableByIncome) {
    score += 18;
    factors.push({
      factor: 'Income Adequacy',
      category: 'INCOME',
      score: 18,
      maxScore: 25,
      status: 'PASS',
      impact: 'POSITIVE',
      explanation: `Requested amount represents ${(incomeRatio).toFixed(1)}x monthly income. Supported with standard verification.`,
    });
  } else {
    score += 5;
    factors.push({
      factor: 'Income Adequacy',
      category: 'INCOME',
      score: 5,
      maxScore: 25,
      status: 'FAIL',
      impact: 'NEGATIVE',
      explanation: `Requested amount exceeds the maximum allowable 3.5x monthly earnings ceiling ($${maxAllowableByIncome.toLocaleString()}).`,
    });
  }

  // 2. Credit Score & Repayment Track Record
  if (user.creditScore >= 720) {
    score += 30;
    factors.push({
      factor: 'Credit Reputation & History',
      category: 'CREDIT_SCORE',
      score: 30,
      maxScore: 30,
      status: 'PASS',
      impact: 'POSITIVE',
      explanation: `Prime credit rating (${user.creditScore}) qualifies for premium advance terms and expedited processing.`,
    });
  } else if (user.creditScore >= config.minCreditScore) {
    score += 20;
    factors.push({
      factor: 'Credit Reputation & History',
      category: 'CREDIT_SCORE',
      score: 20,
      maxScore: 30,
      status: 'PASS',
      impact: 'POSITIVE',
      explanation: `Credit score (${user.creditScore}) satisfies minimum threshold (${config.minCreditScore}). Standard underwriting applies.`,
    });
  } else {
    score += 5;
    factors.push({
      factor: 'Credit Reputation & History',
      category: 'CREDIT_SCORE',
      score: 5,
      maxScore: 30,
      status: 'FAIL',
      impact: 'NEGATIVE',
      explanation: `Credit score (${user.creditScore}) is below statutory baseline (${config.minCreditScore}). May require collateral or cosigner.`,
    });
  }

  // 3. Existing Debt Burden & Outstanding Advances
  const totalBurden = existingActiveAdvancesTotal + requestedAmount;
  const debtToIncomeRatio = Math.round(((totalBurden / (user.monthlyIncome * (tenureMonths || 6))) * 100) * 10) / 10;

  if (existingActiveAdvancesTotal === 0) {
    score += 20;
    factors.push({
      factor: 'Active Debt Obligations',
      category: 'EXISTING_DEBT',
      score: 20,
      maxScore: 20,
      status: 'PASS',
      impact: 'POSITIVE',
      explanation: 'No outstanding advances on file. Clean active balance allows maximum borrowing capacity.',
    });
  } else if (existingActiveAdvancesTotal <= user.monthlyIncome * 0.8) {
    score += 12;
    factors.push({
      factor: 'Active Debt Obligations',
      category: 'EXISTING_DEBT',
      score: 12,
      maxScore: 20,
      status: 'WARN',
      impact: 'NEUTRAL',
      explanation: `Active advance balance ($${existingActiveAdvancesTotal.toLocaleString()}) exists. Repayments remain within manageable limits.`,
    });
  } else {
    score += 4;
    factors.push({
      factor: 'Active Debt Obligations',
      category: 'EXISTING_DEBT',
      score: 4,
      maxScore: 20,
      status: 'FAIL',
      impact: 'NEGATIVE',
      explanation: `High outstanding active advances ($${existingActiveAdvancesTotal.toLocaleString()}) elevate repayment risk.`,
    });
  }

  // 4. KYC & Employment Verification
  if (user.kycVerified) {
    score += 15;
    factors.push({
      factor: 'Identity & Employment Status',
      category: 'EMPLOYMENT_TENURE',
      score: 15,
      maxScore: 15,
      status: 'PASS',
      impact: 'POSITIVE',
      explanation: 'Level 3 KYC verification active. Verified payroll deposit account confirmed.',
    });
  } else {
    score += 5;
    factors.push({
      factor: 'Identity & Employment Status',
      category: 'EMPLOYMENT_TENURE',
      score: 5,
      maxScore: 15,
      status: 'WARN',
      impact: 'NEGATIVE',
      explanation: 'Identity verification documentation pending renewal.',
    });
  }

  // 5. Account Stability & Repayment Capacity
  const estimatedMonthlyCommitment = (requestedAmount / (tenureMonths || 6)) + (existingActiveAdvancesTotal * 0.15);
  const commitmentRatio = (estimatedMonthlyCommitment / user.monthlyIncome) * 100;

  if (commitmentRatio <= config.maxDebtToIncomeRatioPct * 0.7) {
    score += 10;
    factors.push({
      factor: 'Repayment Capacity (Affordability)',
      category: 'BANKING_HISTORY',
      score: 10,
      maxScore: 10,
      status: 'PASS',
      impact: 'POSITIVE',
      explanation: `Estimated monthly installment ($${Math.round(estimatedMonthlyCommitment).toLocaleString()}) consumes only ${commitmentRatio.toFixed(1)}% of income (ceiling is ${config.maxDebtToIncomeRatioPct}%).`,
    });
  } else if (commitmentRatio <= config.maxDebtToIncomeRatioPct) {
    score += 6;
    factors.push({
      factor: 'Repayment Capacity (Affordability)',
      category: 'BANKING_HISTORY',
      score: 6,
      maxScore: 10,
      status: 'WARN',
      impact: 'NEUTRAL',
      explanation: `Estimated monthly installment is ${commitmentRatio.toFixed(1)}% of income. Approaching the upper boundary of safe affordability.`,
    });
  } else {
    score += 0;
    factors.push({
      factor: 'Repayment Capacity (Affordability)',
      category: 'BANKING_HISTORY',
      score: 0,
      maxScore: 10,
      status: 'FAIL',
      impact: 'NEGATIVE',
      explanation: `Monthly commitment (${commitmentRatio.toFixed(1)}%) exceeds regulatory safety cap of ${config.maxDebtToIncomeRatioPct}%.`,
    });
  }

  // Calculate Tier
  let preliminaryTier: 1 | 2 | 3 | 4 = 2;
  if (requestedAmount <= config.tier1AutoApprovalLimit && score >= 85) {
    preliminaryTier = 1; // Auto approval possible
  } else if (requestedAmount <= config.tier2OfficerLimit) {
    preliminaryTier = 2; // Bank Officer approval
  } else if (requestedAmount <= config.tier3ManagerLimit) {
    preliminaryTier = 3; // Approving Manager required
  } else {
    preliminaryTier = 4; // Executive / Committee review
  }

  // Confidence & Eligibility
  const isEligible = score >= 60 && commitmentRatio <= config.maxDebtToIncomeRatioPct;
  let approvalConfidence: 'HIGH' | 'MODERATE' | 'LOW' | 'INELIGIBLE' = 'INELIGIBLE';
  if (score >= 80 && isEligible) approvalConfidence = 'HIGH';
  else if (score >= 65 && isEligible) approvalConfidence = 'MODERATE';
  else if (isEligible) approvalConfidence = 'LOW';

  const maxEligibleAmount = Math.min(config.maxAdvanceLimit, Math.round((user.monthlyIncome * 2.8) / 100) * 100);

  let summaryNote = '';
  if (approvalConfidence === 'HIGH') {
    summaryNote = 'Strong profile! Low credit risk with high affordability margin.';
  } else if (approvalConfidence === 'MODERATE') {
    summaryNote = 'Standard qualification profile. Supporting pay slips will ensure rapid approval.';
  } else if (approvalConfidence === 'LOW') {
    summaryNote = 'Marginal qualification. Consider reducing requested amount or extending tenure.';
  } else {
    summaryNote = 'Preliminary criteria not met due to debt capacity or minimum credit threshold.';
  }

  return {
    overallScore: score,
    isEligible,
    maxEligibleAmount,
    recommendedTenureMonths: requestedAmount > 5000 ? 12 : 6,
    preliminaryTier,
    approvalConfidence,
    factors,
    summaryNote,
  };
}

export function computeFinancialWellness(
  user: UserProfile,
  existingActiveAdvancesTotal: number,
  upcomingMonthlyRepayment: number
): FinancialWellnessSummary {
  const fixedCommitments = 2200 + upcomingMonthlyRepayment; // e.g. housing, utilities, active advances
  const dti = Math.round((fixedCommitments / user.monthlyIncome) * 100);
  const buffer = Math.max(0, user.monthlyIncome - fixedCommitments);

  let score = 75;
  if (user.creditScore > 740) score += 12;
  if (dti < 35) score += 10;
  else if (dti > 45) score -= 15;

  score = Math.max(30, Math.min(98, score));

  let tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'ATTENTION_NEEDED' = 'GOOD';
  if (score >= 88) tier = 'EXCELLENT';
  else if (score >= 72) tier = 'GOOD';
  else if (score >= 55) tier = 'FAIR';
  else tier = 'ATTENTION_NEEDED';

  const insights: string[] = [];
  if (dti < 35) {
    insights.push(`Your debt-to-income ratio (${dti}%) is exceptionally healthy, preserving strong borrowing capacity.`);
  } else {
    insights.push(`Your monthly obligations represent ${dti}% of income. Maintaining payments helps maintain credit health.`);
  }

  if (buffer > 2000) {
    insights.push(`Healthy discretionary surplus of $${buffer.toLocaleString()} per month provides strong financial resilience.`);
  } else {
    insights.push(`Discretionary cashflow is $${buffer.toLocaleString()}/mo. Consider short-tenure advances to minimize total fees.`);
  }

  insights.push(`On-time repayments directly strengthen your advance eligibility limit for future requests.`);

  return {
    overallScore: score,
    tier,
    debtToIncomeRatio: dti,
    monthlyNetIncome: user.monthlyIncome,
    monthlyFixedCommitments: fixedCommitments,
    discretionaryBuffer: buffer,
    recommendedMaxAdvance: Math.min(18000, user.monthlyIncome * 2.5),
    insights,
  };
}
