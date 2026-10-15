import { CustomerUser, ActiveLoan } from '../types/loan';

export const DEMO_CUSTOMERS: CustomerUser[] = [
  {
    id: 'cust_tariq_01',
    fullName: 'Tariq Rahman',
    aadharNumber: '5849 2039 1847',
    panNumber: 'ABCPR1294F',
    phone: '9332504150',
    email: 'tariq.rahman@email.com',
    address: 'Chanchal State, Garage er Samne, Malda, West Bengal - 732123',
    dateOfBirth: '1992-05-14',
    isVerified: true,
    primaryLoanId: 'NS-ACT-99201',
    loanCategory: 'Personal Loan',
  },
  {
    id: 'cust_fatima_02',
    fullName: 'Fatima Zohra',
    aadharNumber: '7823 9102 3845',
    panNumber: 'BNMPZ8821K',
    phone: '9876543210',
    email: 'fatima.zohra@fashioncraft.com',
    address: 'Main Market Road, Chanchal, Malda, West Bengal - 732123',
    dateOfBirth: '1989-11-20',
    isVerified: true,
    primaryLoanId: 'NS-ACT-50291',
    loanCategory: 'Business Growth Loan',
  },
  {
    id: 'cust_kamal_03',
    fullName: 'Kamal Hossain',
    aadharNumber: '4910 8274 9182',
    panNumber: 'CKLPM3310Q',
    phone: '9123456789',
    email: 'kamal.hossain@logisticspro.com',
    address: 'Station Road, Malda, West Bengal - 732101',
    dateOfBirth: '1995-02-10',
    isVerified: true,
    primaryLoanId: 'NS-ACT-31980',
    loanCategory: 'Two-Wheeler Loan',
  },
  {
    id: 'cust_nahid_04',
    fullName: 'Nahid Islam',
    aadharNumber: '8291 4019 8509',
    panNumber: 'NSPLN8509M',
    phone: '8509184717',
    email: 'nahid.islam@nsmobile.com',
    address: 'NS Mobile Shop, Chanchal Bus Stand, Malda, West Bengal - 732123',
    dateOfBirth: '1994-08-15',
    isVerified: true,
    primaryLoanId: 'NS-ACT-85091',
    loanCategory: 'Smart Device Financing (iPhone EMI)',
  },
  {
    id: 'cust_anisur_05',
    fullName: 'Anisur Mondal',
    aadharNumber: '6192 8402 1982',
    panNumber: 'AMOPR5512B',
    phone: '9434012876',
    email: 'anisur.mondal@kisanagro.in',
    address: 'Vill: Ashapur, PO: Chanchal, Dist: Malda - 732123',
    dateOfBirth: '1991-03-22',
    isVerified: true,
    primaryLoanId: 'NS-ACT-44210',
    loanCategory: 'Emergency Micro Cash',
  },
  {
    id: 'cust_rubina_06',
    fullName: 'Rubina Khatun',
    aadharNumber: '9201 3481 7712',
    panNumber: 'RKMPZ9941L',
    phone: '9733055412',
    email: 'rubina.khatun@selfhelp.org',
    address: 'Bhatol Road, Chanchal, Malda, West Bengal - 732123',
    dateOfBirth: '1996-07-09',
    isVerified: true,
    primaryLoanId: 'NS-ACT-66129',
    loanCategory: 'Women Sewing Microfinance',
  },
];

export const CUSTOMER_ACTIVE_LOANS: Record<string, ActiveLoan[]> = {
  cust_tariq_01: [
    {
      id: 'loan_tariq_1',
      accountNumber: 'NS-ACT-99201',
      customerId: 'cust_tariq_01',
      customerPhone: '9332504150',
      customerName: 'Tariq Rahman',
      productName: 'N.S. Personal Loan',
      principalAmount: 18000,
      remainingBalance: 9800,
      monthlyEmi: 835,
      interestRate: 10.5,
      nextDueDate: 'Nov 05, 2026',
      totalTenureMonths: 24,
      completedEmis: 8,
      currency: 'INR',
      status: 'ACTIVE',
    },
    {
      id: 'loan_tariq_2',
      accountNumber: 'NS-ACT-88412',
      customerId: 'cust_tariq_01',
      customerPhone: '9332504150',
      customerName: 'Tariq Rahman',
      productName: 'Emergency Micro Cash',
      principalAmount: 3000,
      remainingBalance: 650,
      monthlyEmi: 345,
      interestRate: 13.5,
      nextDueDate: 'Oct 08, 2026',
      totalTenureMonths: 6,
      completedEmis: 4,
      currency: 'INR',
      status: 'OVERDUE',
    },
  ],
  cust_fatima_02: [
    {
      id: 'loan_fatima_1',
      accountNumber: 'NS-ACT-50291',
      customerId: 'cust_fatima_02',
      customerPhone: '9876543210',
      customerName: 'Fatima Zohra',
      productName: 'Business Growth Loan',
      principalAmount: 45000,
      remainingBalance: 32400,
      monthlyEmi: 1484,
      interestRate: 11.5,
      nextDueDate: 'Nov 12, 2026',
      totalTenureMonths: 36,
      completedEmis: 9,
      currency: 'INR',
      status: 'ACTIVE',
    },
  ],
  cust_kamal_03: [
    {
      id: 'loan_kamal_1',
      accountNumber: 'NS-ACT-31980',
      customerId: 'cust_kamal_03',
      customerPhone: '9123456789',
      customerName: 'Kamal Hossain',
      productName: 'Two-Wheeler Delivery Loan',
      principalAmount: 12000,
      remainingBalance: 8400,
      monthlyEmi: 383,
      interestRate: 9.2,
      nextDueDate: 'Nov 18, 2026',
      totalTenureMonths: 36,
      completedEmis: 11,
      currency: 'INR',
      status: 'ACTIVE',
    },
  ],
  cust_nahid_04: [
    {
      id: 'loan_nahid_1',
      accountNumber: 'NS-ACT-85091',
      customerId: 'cust_nahid_04',
      customerPhone: '8509184717',
      customerName: 'Nahid Islam',
      productName: 'Smart Device Financing (iPhone 16 Pro)',
      principalAmount: 25000,
      remainingBalance: 11250,
      monthlyEmi: 1250,
      interestRate: 0.0,
      nextDueDate: 'Nov 05, 2026',
      totalTenureMonths: 12,
      completedEmis: 5,
      currency: 'INR',
      status: 'ACTIVE',
    },
  ],
  cust_anisur_05: [
    {
      id: 'loan_anisur_1',
      accountNumber: 'NS-ACT-44210',
      customerId: 'cust_anisur_05',
      customerPhone: '9434012876',
      customerName: 'Anisur Mondal',
      productName: 'Emergency Micro Cash',
      principalAmount: 5000,
      remainingBalance: 1800,
      monthlyEmi: 495,
      interestRate: 12.0,
      nextDueDate: 'Oct 05, 2026',
      totalTenureMonths: 10,
      completedEmis: 6,
      currency: 'INR',
      status: 'OVERDUE',
    },
  ],
  cust_rubina_06: [
    {
      id: 'loan_rubina_1',
      accountNumber: 'NS-ACT-66129',
      customerId: 'cust_rubina_06',
      customerPhone: '9733055412',
      customerName: 'Rubina Khatun',
      productName: 'Women Sewing Microfinance',
      principalAmount: 20000,
      remainingBalance: 14500,
      monthlyEmi: 620,
      interestRate: 8.5,
      nextDueDate: 'Nov 20, 2026',
      totalTenureMonths: 24,
      completedEmis: 7,
      currency: 'INR',
      status: 'ACTIVE',
    },
  ],
};

export function getCustomerLoans(customerId: string): ActiveLoan[] {
  return CUSTOMER_ACTIVE_LOANS[customerId] || CUSTOMER_ACTIVE_LOANS['cust_tariq_01'] || [];
}

export function getAllCustomerDirectory() {
  return DEMO_CUSTOMERS.map((cust) => {
    const loans = getCustomerLoans(cust.id);
    const primaryLoan = loans[0];
    const totalBalance = loans.reduce((sum, l) => sum + l.remainingBalance, 0);
    const totalEmi = loans.reduce((sum, l) => sum + l.monthlyEmi, 0);

    return {
      customerId: cust.id,
      fullName: cust.fullName,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      aadharNumber: cust.aadharNumber,
      panNumber: cust.panNumber,
      primaryLoanId: cust.primaryLoanId || primaryLoan?.accountNumber || 'N/A',
      loanCategory: cust.loanCategory || primaryLoan?.productName || 'General',
      activeLoansCount: loans.length,
      allLoanIds: loans.map((l) => l.accountNumber),
      totalBalance,
      totalEmi,
      nextDueDate: primaryLoan?.nextDueDate || 'Nov 10, 2026',
      status: primaryLoan?.status || 'ACTIVE',
    };
  });
}

/**
 * Format Aadhaar number to XXXX XXXX XXXX
 */
export function formatAadhaar(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 12);
  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Clean Aadhaar string to 12 digits
 */
export function cleanAadhaar(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Format PAN number to uppercase 10 alphanumeric characters
 */
export function formatPan(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}

/**
 * Validate Aadhaar card (must have 12 numeric digits)
 */
export function isValidAadhaar(value: string): boolean {
  const cleaned = cleanAadhaar(value);
  return cleaned.length === 12;
}

/**
 * Validate PAN card (5 letters, 4 digits, 1 letter)
 */
export function isValidPan(value: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(value.toUpperCase().trim());
}

/**
 * Mask Aadhaar number for security (shows last 4 digits)
 */
export function maskAadhaar(value: string): string {
  const cleaned = cleanAadhaar(value);
  if (cleaned.length < 4) return value;
  return `•••• •••• ${cleaned.slice(-4)}`;
}

/**
 * Mask PAN number for privacy (shows first 2 and last 2 characters)
 */
export function maskPan(value: string): string {
  const pan = value.trim().toUpperCase();
  if (pan.length < 5) return pan;
  return `${pan.slice(0, 2)}••••••${pan.slice(-2)}`;
}
