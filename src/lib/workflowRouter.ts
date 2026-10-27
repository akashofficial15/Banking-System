import { Advance, UserRole, SystemConfig, AdvanceJourneyStep } from '../types';

export function determineApprovalTier(amount: number, config: SystemConfig): 1 | 2 | 3 | 4 {
  if (amount <= config.tier1AutoApprovalLimit) return 1;
  if (amount <= config.tier2OfficerLimit) return 2;
  if (amount <= config.tier3ManagerLimit) return 3;
  return 4;
}

export function canUserReviewAdvance(role: UserRole, advance: Advance): boolean {
  if (role === 'admin') return true;
  if (role === 'bank_officer') {
    return advance.status === 'SUBMITTED' || (advance.status === 'UNDER_REVIEW' && advance.requestedAmount <= 10000);
  }
  if (role === 'approving_manager') {
    return advance.status === 'UNDER_REVIEW' || advance.status === 'SUBMITTED';
  }
  return false;
}

export function canUserDisburseAdvance(role: UserRole, advance: Advance): boolean {
  if (role === 'admin' || role === 'finance_officer') {
    return advance.status === 'APPROVED';
  }
  return false;
}

export function canUserSettleAdvance(role: UserRole, advance: Advance): boolean {
  return (
    (role === 'customer' || role === 'finance_officer' || role === 'admin') &&
    (advance.status === 'DISBURSED' || advance.status === 'ACTIVE') &&
    advance.outstandingTotal > 0
  );
}

export function generateJourneyTimeline(advance: Advance): AdvanceJourneyStep[] {
  const steps: AdvanceJourneyStep[] = [
    {
      stage: 'SUBMITTED',
      title: 'Application Submitted',
      description: 'Applicant provided purpose, requested funds, tenure, and initial documents.',
      timestamp: advance.createdAt,
      completed: true,
      current: false,
      actorRole: 'Customer',
      actorName: advance.applicantName,
    },
    {
      stage: 'UNDER_REVIEW',
      title: 'Credit & Document Verification',
      description: 'Bank Officer verified KYC, income documentation, and repayment affordability.',
      timestamp: advance.status !== 'SUBMITTED' && advance.status !== 'DRAFT' ? advance.updatedAt : undefined,
      completed: ['UNDER_REVIEW', 'APPROVED', 'DISBURSED', 'SETTLED'].includes(advance.status),
      current: advance.status === 'UNDER_REVIEW',
      actorRole: 'Bank Officer',
      notes: advance.reviewNotes,
    },
    {
      stage: 'APPROVED',
      title: 'Manager Approval',
      description: `Risk assessment cleared for Tier ${advance.requiredApprovalTier} (${advance.requestedAmount > 5000 ? 'Approving Manager' : 'Authorized Officer'}).`,
      timestamp: ['APPROVED', 'DISBURSED', 'SETTLED'].includes(advance.status) ? advance.updatedAt : undefined,
      completed: ['APPROVED', 'DISBURSED', 'SETTLED'].includes(advance.status),
      current: advance.status === 'APPROVED',
      actorRole: advance.requiredApprovalTier > 2 ? 'Approving Manager' : 'Bank Officer',
    },
    {
      stage: 'DISBURSED',
      title: 'Disbursement & Fund Release',
      description: advance.disbursementDetails
        ? `Transferred ${advance.disbursementDetails.disbursedAmount ? '$' + advance.disbursementDetails.disbursedAmount.toLocaleString() : 'funds'} to ${advance.disbursementDetails.targetAccount} (Ref: ${advance.disbursementDetails.referenceNo})`
        : 'Finance Officer authorizes settlement & credits applicant banking account.',
      timestamp: advance.disbursementDetails?.disbursedAt,
      completed: ['DISBURSED', 'SETTLED'].includes(advance.status),
      current: advance.status === 'APPROVED', // next pending action
      actorRole: 'Finance Officer',
    },
    {
      stage: 'ACTIVE_SERVICING',
      title: 'Repayment Servicing',
      description: `${advance.repaymentSchedule.filter((s) => s.status === 'PAID').length} of ${advance.tenureMonths} installments completed. Outstanding: $${advance.outstandingTotal.toLocaleString()}.`,
      timestamp: advance.disbursementDetails?.disbursedAt,
      completed: advance.status === 'SETTLED',
      current: advance.status === 'DISBURSED' && advance.outstandingTotal > 0,
      actorRole: 'System Auto-Deduction',
    },
    {
      stage: 'SETTLED',
      title: 'Facility Settled & Closed',
      description: 'Advance fully satisfied with zero remaining balance. Credit clearance issued.',
      timestamp: advance.status === 'SETTLED' ? advance.updatedAt : undefined,
      completed: advance.status === 'SETTLED',
      current: false,
      actorRole: 'System Reconciler',
    },
  ];

  if (advance.status === 'REJECTED') {
    steps.push({
      stage: 'REJECTED',
      title: 'Application Rejected',
      description: advance.rejectionReason || 'Application was not approved based on current credit guidelines.',
      timestamp: advance.updatedAt,
      completed: true,
      current: true,
      actorRole: 'Approving Officer',
    });
  }

  return steps;
}
