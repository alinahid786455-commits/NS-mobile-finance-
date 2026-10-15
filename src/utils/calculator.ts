import { AmortizationRow, CurrencyConfig, ActiveLoan } from '../types/loan';

/**
 * Calculate Monthly EMI using standard amortization formula:
 * EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
 * where P = principal, r = monthly interest rate (annual / 12 / 100), n = tenure in months
 */
export function calculateEmi(principal: number, annualInterestRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualInterestRate <= 0) return Math.round(principal / tenureMonths);

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

/**
 * Generate full month-by-month Amortization Schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const emi = calculateEmi(principal, annualInterestRate, tenureMonths);
  const monthlyRate = annualInterestRate / 12 / 100;

  let balance = principal;

  for (let m = 1; m <= tenureMonths; m++) {
    const interest = Math.round(balance * monthlyRate);
    let principalPaid = emi - interest;

    // Handle last month rounding
    if (m === tenureMonths || principalPaid > balance) {
      principalPaid = balance;
    }

    const endingBalance = Math.max(0, balance - principalPaid);

    schedule.push({
      month: m,
      beginningBalance: Math.round(balance),
      emi: emi,
      principal: Math.round(principalPaid),
      interest: Math.round(interest),
      endingBalance: Math.round(endingBalance),
    });

    balance = endingBalance;
    if (balance <= 0) break;
  }

  return schedule;
}

/**
 * Format currency with selected symbol and locale
 */
export function formatCurrency(amount: number, currency: CurrencyConfig): string {
  const converted = Math.round(amount * currency.rateMultiplier);
  return `${currency.symbol}${converted.toLocaleString()}`;
}

export interface LoanOverdueDetails {
  isPastDueDate: boolean;
  isOverdue: boolean;
  dueDate: Date | null;
  formattedDueDate: string;
  currentDate: Date;
  daysOverdue: number;
  monthlyEmi: number;
  lateFee: number;
  exactOverdueAmount: number;
  remainingBalance: number;
  statusLabel: 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING';
}

/**
 * Intelligently analyzes if the loan's EMI due date is past the current date,
 * calculates days overdue, late penalty, and returns the exact overdue amount.
 */
export function getLoanOverdueStatus(
  loan?: ActiveLoan | null,
  customReferenceDate?: Date | null
): LoanOverdueDetails {
  const now = customReferenceDate || new Date();

  if (!loan) {
    return {
      isPastDueDate: false,
      isOverdue: false,
      dueDate: null,
      formattedDueDate: '',
      currentDate: now,
      daysOverdue: 0,
      monthlyEmi: 0,
      lateFee: 0,
      exactOverdueAmount: 0,
      remainingBalance: 0,
      statusLabel: 'UPCOMING',
    };
  }

  let dueDate: Date | null = null;
  if (loan.nextDueDate) {
    const parsed = new Date(loan.nextDueDate);
    if (!isNaN(parsed.getTime())) {
      dueDate = parsed;
    }
  }

  let isPastDueDate = false;
  let isDueToday = false;
  let daysOverdue = 0;

  if (dueDate) {
    // Normalize to calendar day boundary for fair comparison
    const dueMidnight = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (nowMidnight > dueMidnight) {
      isPastDueDate = true;
      daysOverdue = Math.max(1, Math.round((nowMidnight - dueMidnight) / (1000 * 60 * 60 * 24)));
    } else if (nowMidnight === dueMidnight) {
      isDueToday = true;
    }
  }

  const isOverdue = isPastDueDate || loan.status === 'OVERDUE';
  const monthlyEmi = loan.monthlyEmi || 0;

  // Exact overdue calculation:
  // Base monthly EMI + standard statutory late surcharge (₹150)
  const lateFee = isOverdue ? 150 : 0;
  const exactOverdueAmount = isOverdue ? monthlyEmi + lateFee : monthlyEmi;

  return {
    isPastDueDate,
    isOverdue,
    dueDate,
    formattedDueDate: loan.nextDueDate || 'Not Scheduled',
    currentDate: now,
    daysOverdue: isOverdue ? (daysOverdue > 0 ? daysOverdue : 5) : 0,
    monthlyEmi,
    lateFee,
    exactOverdueAmount,
    remainingBalance: loan.remainingBalance || 0,
    statusLabel: isOverdue ? 'OVERDUE' : isDueToday ? 'DUE_TODAY' : 'UPCOMING',
  };
}
