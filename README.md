# Nexora Bank | Next-Generation Banking & Smart Advances Management

Nexora Bank is an original, production-grade financial web platform featuring a signature **Smart Advances Management System**. Engineered with institutional-grade underwriting transparency, multi-tier approval workflows, financial wellness scoring, and automated early settlement rebates.

---

## 🌟 Signature Differentiators & Innovative Features

1. **Advance Journey Timeline**: A real-time visual progress tracker tracing each advance through 6 sequential lifecycle gates: *Application Submitted ➔ Officer Verification ➔ Executive Sanction ➔ Treasury Disbursement ➔ Active Servicing ➔ Early/Final Settlement*.
2. **Financial Wellness Indicator**: An interactive semi-circle gauge providing an understandable overview of repayment affordability (Debt-to-Income, discretionary liquidity buffer) with non-judgmental guidance.
3. **What-If Advance Simulator**: Real-time slider simulator calculating estimated repayments, fee breakdowns, APR, and comparing fast payoff vs. balanced vs. low monthly installments.
4. **Smart Document Checklist**: Contextual missing document detection based on advance purpose (Salary Advance, Equipment Purchase, Medical Emergency) with simulated OCR verification.
5. **Transparent Decision Summary**: Explainable underwriting factors (Income adequacy, credit reputation, active debt obligations, employment stability).
6. **Early Settlement Calculator with Guaranteed Rebate**: Automatic 60% rebate discount on unearned future interest when paying off facilities ahead of schedule, with zero prepayment penalty fees.
7. **Repayment Calendar View**: Interactive monthly calendar highlighting upcoming installment deadlines and payroll deduction days.
8. **One-Click Repeat Application**: Pre-populates verified parameters from past settled facilities for 60-second re-application.
9. **Interactive 6-Role Persona Switcher**: Top banner allowing instant switching between:
   - **Customer (Applicant)**: Sarah Jenkins
   - **Bank Officer (≤$5k)**: David Miller
   - **Approving Manager (≤$50k)**: Elena Rostova
   - **Finance Officer (Disbursement)**: Marcus Vance
   - **System Administrator (Governance)**: Sophia Chen
   - **Compliance Auditor**: Alex Thorne
10. **Built-in Automated Test Runner**: UI-embedded test harness executing automated assertions on PMT math, early settlement rebates, DTI limits, and RBAC authorization.

---

## 🏗️ Architecture & Domain Schema

```
nexora-banking-system/
├── src/
│   ├── types/
│   │   └── index.ts                 # Core entities (UserProfile, BankAccount, Advance, Repayment, Audit, Config)
│   ├── data/
│   │   └── mockData.ts              # Pre-seeded multi-stage accounts, advances, and logs
│   ├── lib/
│   │   ├── advanceCalculator.ts     # Amortization, PMT formulas, early settlement rebates
│   │   ├── eligibilityEngine.ts     # Multi-factor algorithmic credit assessment & wellness scoring
│   │   ├── workflowRouter.ts        # Limit-based approval routing & RBAC permission checks
│   │   └── formatters.ts            # Currency, dates, statuses, account masking
│   ├── context/
│   │   └── BankContext.tsx          # Central state management, audit logging, & persistence
│   ├── components/
│   │   ├── common/                  # Navbar, Sidebar, RoleSwitcherBar, Notifications
│   │   ├── dashboard/               # Financial overview, multi-bar cashflow chart, wellness gauge, quick actions
│   │   ├── advances/                # Multi-step wizard, What-If simulator, checklist, tracking timeline
│   │   ├── repayments/              # Amortization table, monthly calendar, early settlement modal
│   │   ├── workflow/                # Officer review desk & Finance disbursement desk
│   │   ├── audit/                   # Compliance logs viewer with CSV export & Admin rules editor
│   │   ├── accounts/                # Depository accounts & virtual card controls
│   │   └── testrunner/              # Live automated test runner
│   ├── tests/
│   │   └── advanceRules.test.ts     # Vitest unit & integration test suites
│   ├── App.tsx                      # Primary tab controller & responsive layout
│   └── main.tsx                     # Entrypoint & provider mounting
```

---

## 🚀 Running the Project

```bash
# 1. Navigate to the project directory
cd "C:\Users\chaud\.gemini\antigravity\scratch\nexora-banking-system"

# 2. Run automated test suite
npm test

# 3. Start development server
npm run dev
```

Server runs locally on: **`http://127.0.0.1:5173/`**
