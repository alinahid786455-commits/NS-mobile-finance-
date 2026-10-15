import { PublishedItem } from '../types/loan';
import { SHOP_INFO } from './loanProducts';

export const PUBLISHER_DETAILS = {
  entityName: SHOP_INFO.name, // 'NS MOBILE SHOP & N.S. FINANCE'
  shortName: SHOP_INFO.shortName, // 'NS MOBILE'
  authorizedSignatory: 'Nahid Enterprise (Managing Director)',
  licenseId: 'PUB-NSF-WB-2026-8849',
  department: 'Public Information, Loan Sanctions & Digital Notices Division',
  registeredAddress: SHOP_INFO.address,
  helpline: SHOP_INFO.formattedPhone,
  email: SHOP_INFO.email,
  officialUpi: SHOP_INFO.upiId,
  jurisdiction: 'Government of West Bengal & District Finance Circle, Malda',
  digitalSealHash: 'SHA256:8f49b2c8901ae4f390d819e09d12a8849c719e34',
  establishedYear: '2021',
};

export const INITIAL_PUBLICATIONS: PublishedItem[] = [
  {
    id: 'PUB-2026-0105',
    type: 'BROADCAST_NOTICE',
    title: '⏰ Advance EMI Due Date Notification & 1-Tap PhonePe Auto-Credit',
    summary: 'Borrowers with EMI dates between 10th and 15th of the month are requested to utilize PhonePe instant settlement for zero late charges.',
    content: `All active microfinance and smartphone EMI borrowers under NS Mobile Shop & N.S. Finance are hereby notified that monthly installment settlements for the current cycle are now open. 

Borrowers can settle directly through PhonePe UPI (${SHOP_INFO.upiId}) or in cash at the Chanchal State counter. Instant digital receipt and SMS acknowledgment are generated in real-time.`,
    targetAudience: 'ACTIVE_BORROWERS',
    priority: 'HIGH',
    publisherEntity: PUBLISHER_DETAILS.entityName,
    authorizedSignatory: PUBLISHER_DETAILS.authorizedSignatory,
    licenseId: PUBLISHER_DETAILS.licenseId,
    publishDate: '2026-10-10',
    channels: ['APP_PUSH', 'SMS_BROADCAST', 'WHATSAPP', 'PUBLIC_PORTAL'],
    viewsCount: 1420,
    status: 'ACTIVE',
    digitalSignatureHash: '8f49a02931bc77210e',
  },
  {
    id: 'PUB-2026-0104',
    type: 'BROADCAST_NOTICE',
    title: '🎉 Special Festive 0% EMI Scheme on 5G Smartphones & Tablets',
    summary: 'Zero down payment and 0% interest on selected Samsung, Vivo, and OnePlus handsets available exclusively at NS Mobile Shop counter.',
    content: `Under our seasonal consumer financing directive, walk-in customers and verified Aadhaar card holders can avail 0% Interest installments on selected 5G Smartphones up to ₹1,50,000. 

Approval takes under 10 minutes with instant paperless biometric or Aadhaar OTP check. Valid until stock lasts at Chanchal Branch.`,
    targetAudience: 'ALL_CUSTOMERS',
    priority: 'NORMAL',
    publisherEntity: PUBLISHER_DETAILS.entityName,
    authorizedSignatory: PUBLISHER_DETAILS.authorizedSignatory,
    licenseId: PUBLISHER_DETAILS.licenseId,
    publishDate: '2026-10-09',
    channels: ['APP_PUSH', 'WHATSAPP', 'PUBLIC_PORTAL'],
    viewsCount: 2890,
    status: 'ACTIVE',
    digitalSignatureHash: '39bc18401aa884192d',
  },
  {
    id: 'PUB-2026-0103',
    type: 'SANCTION_BULLETIN',
    title: '📜 Loan Sanction Notice: Application #NS-LN-849201 (Tariq Rahman)',
    summary: 'Official sanction certificate issued for ₹18,000 Personal Cash Loan under prime applicant credit evaluation.',
    content: `This is an official sanction bulletin issued by the Loan Underwriting Desk of NS Mobile Shop & N.S. Finance.

Applicant: Tariq Rahman (Aadhaar: XXXX-XXXX-1847, PAN: ABCPR1294F)
Sanctioned Amount: ₹18,000 (INR)
Tenure: 24 Months @ 10.5% p.a.
Monthly Installment: ₹835
Disbursement Mode: Direct Bank Transfer / PhonePe

This document is tamper-evident and digitally validated by Nahid Enterprise.`,
    targetAudience: 'PUBLIC',
    priority: 'HIGH',
    publisherEntity: PUBLISHER_DETAILS.entityName,
    authorizedSignatory: PUBLISHER_DETAILS.authorizedSignatory,
    licenseId: PUBLISHER_DETAILS.licenseId,
    publishDate: '2026-10-08',
    channels: ['APP_PUSH', 'SMS_BROADCAST', 'PUBLIC_PORTAL'],
    viewsCount: 420,
    status: 'ACTIVE',
    relatedLoanId: 'NS-LN-849201',
    relatedApplicantName: 'Tariq Rahman',
    amount: 18000,
    digitalSignatureHash: '5e0192bc93847aa102',
  },
  {
    id: 'PUB-2026-0102',
    type: 'RATE_SHEET',
    title: '📊 Official Microfinance & Retail Lending Rate Card (Q4 2026)',
    summary: 'Comprehensive annual percentage rates, processing fees, and tenure limits published for public transparency.',
    content: `Pursuant to the Fair Lending & Transparent Credit Practices Code, NS Mobile Shop & N.S. Finance discloses all active financing products:

1. NS Mobile Smartphone & Device EMI: 0.0% - 8.5% p.a. | Zero processing fee | 3 - 24 months
2. N.S. Personal Cash Loan: 10.5% p.a. | 1.0% processing fee | 6 - 48 months
3. N.S. Business Growth Loan: 11.5% p.a. | 1.25% processing fee | 12 - 84 months
4. Emergency Micro Cash: 13.5% p.a. | 0.5% processing fee | 1 - 6 months

No hidden surcharges. All repayments accepted via official UPI: 8509184717@ybl.`,
    targetAudience: 'ALL_CUSTOMERS',
    priority: 'NORMAL',
    publisherEntity: PUBLISHER_DETAILS.entityName,
    authorizedSignatory: PUBLISHER_DETAILS.authorizedSignatory,
    licenseId: PUBLISHER_DETAILS.licenseId,
    publishDate: '2026-10-05',
    channels: ['PUBLIC_PORTAL'],
    viewsCount: 3640,
    status: 'ACTIVE',
    digitalSignatureHash: '918fa220bb3381a100',
  },
  {
    id: 'PUB-2026-0101',
    type: 'REGULATORY_KFS',
    title: '🛡️ Regulatory Consumer Advisory: Beware of Fake QR Codes & Impersonators',
    summary: 'Official security advisory instructing customers to verify PhonePe recipient as "NS MOBILE SHOP" (8509184717).',
    content: `Security Advisory: Always verify the merchant name when transferring loan EMIs.

The ONLY authorized PhonePe UPI ID for N.S. Finance is 8509184717@ybl (Linked Name: NS MOBILE SHOP & N.S. FINANCE). 

Never transfer repayments to personal accounts of unauthorized agents. In case of any doubt, call shop hotline 9332504150 immediately.`,
    targetAudience: 'ALL_CUSTOMERS',
    priority: 'URGENT',
    publisherEntity: PUBLISHER_DETAILS.entityName,
    authorizedSignatory: PUBLISHER_DETAILS.authorizedSignatory,
    licenseId: PUBLISHER_DETAILS.licenseId,
    publishDate: '2026-10-01',
    channels: ['APP_PUSH', 'SMS_BROADCAST', 'WHATSAPP', 'PUBLIC_PORTAL'],
    viewsCount: 5120,
    status: 'ACTIVE',
    digitalSignatureHash: '11aa887462bcde3390',
  },
];
