export type LoanCategory =
  | 'Mobile Device'
  | 'Personal'
  | 'Business'
  | 'Home'
  | 'Vehicle'
  | 'Emergency Micro'
  | 'Education';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'VERIFYING'
  | 'APPROVED'
  | 'DISBURSED'
  | 'REJECTED';

export type CurrencyCode = 'USD' | 'BDT' | 'INR' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateMultiplier: number;
}

export interface LoanProduct {
  id: string;
  title: string;
  category: LoanCategory;
  tagline: string;
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  defaultTenureMonths: number;
  interestRate: number; // annual percentage
  processingFeePercent: number;
  iconName: string;
  features: string[];
  eligibilityCriteria: string[];
}

export interface CustomerUser {
  id: string;
  fullName: string;
  aadharNumber: string; // 12-digit Aadhaar Card, e.g. "5849 2039 1847"
  panNumber: string; // 10-char PAN Card, e.g. "ABCPR1294F"
  phone: string;
  email: string;
  address: string;
  dateOfBirth?: string;
  isVerified: boolean;
  primaryLoanId?: string; // Loan ID / Account number e.g. "NS-ACT-99201"
  loanCategory?: string;
}

export interface LoanApplication {
  id: string; // e.g. NS-LN-104928
  // Personal
  fullName: string;
  email: string;
  phone: string;
  nidOrPassport: string;
  aadharNumber?: string;
  panNumber?: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  // Employment
  employmentType: 'Salaried' | 'Self-Employed' | 'Business Owner' | 'Freelancer';
  monthlyIncome: number;
  companyName: string;
  workExperienceYears: number;
  existingMonthlyEmi: number;
  // Loan Request
  loanCategory: LoanCategory;
  requestedAmount: number;
  tenureMonths: number;
  purpose: string;
  currency: CurrencyCode;
  // Financial Evaluation
  interestRate: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
  creditScore: number;
  dtiPercentage: number;
  status: ApplicationStatus;
  appliedDate: string;
  remarks: string;
  disbursedDate?: string;
}

export interface ActiveLoan {
  id: string;
  accountNumber: string; // The Loan ID number / Account number
  customerId?: string;
  customerPhone?: string;
  productName: string;
  principalAmount: number;
  remainingBalance: number;
  monthlyEmi: number;
  interestRate: number;
  nextDueDate: string;
  totalTenureMonths: number;
  completedEmis: number;
  currency: CurrencyCode;
  status: 'ACTIVE' | 'CLOSED' | 'OVERDUE';
  customerName?: string;
  customerAadhar?: string;
  customerPan?: string;
}

export interface AmortizationRow {
  month: number;
  beginningBalance: number;
  emi: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

export type PublicationType =
  | 'BROADCAST_NOTICE'
  | 'SANCTION_BULLETIN'
  | 'RATE_SHEET'
  | 'REGULATORY_KFS'
  | 'NOC_CERTIFICATE';

export type TargetAudience =
  | 'ALL_CUSTOMERS'
  | 'ACTIVE_BORROWERS'
  | 'OVERDUE_ACCOUNTS'
  | 'STORE_WALKINS'
  | 'PUBLIC';

export interface PublishedItem {
  id: string; // e.g. "PUB-2026-0105"
  type: PublicationType;
  title: string;
  summary: string;
  content: string;
  targetAudience: TargetAudience;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  publisherEntity: string; // e.g. "NS MOBILE SHOP & N.S. FINANCE"
  authorizedSignatory: string; // e.g. "Nahid Enterprise (Managing Director)"
  licenseId: string; // e.g. "PUB-NSF-WB-2026-8849"
  publishDate: string;
  expiryDate?: string;
  channels: ('APP_PUSH' | 'SMS_BROADCAST' | 'WHATSAPP' | 'PUBLIC_PORTAL')[];
  viewsCount: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'SCHEDULED';
  relatedLoanId?: string;
  relatedApplicantName?: string;
  amount?: number;
  digitalSignatureHash?: string;
}
