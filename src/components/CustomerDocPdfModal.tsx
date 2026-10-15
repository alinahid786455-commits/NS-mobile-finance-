import React, { useState, useEffect } from 'react';
import { LoanApplication, ActiveLoan, CurrencyConfig, CustomerUser } from '../types/loan';
import { SHOP_INFO } from '../data/loanProducts';
import { formatCurrency } from '../utils/calculator';
import { maskAadhaar, maskPan } from '../data/customerData';
import {
  Printer,
  Download,
  X,
  FileText,
  Award,
  Calendar,
  Receipt,
  ShieldCheck,
  Building,
  Smartphone,
  Phone,
  Mail,
  MapPin,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  User,
  Send,
  Bell,
  MessageSquare,
  Fingerprint,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

export type CustomerDocType = 'full-file' | 'sanction' | 'agreement' | 'schedule' | 'receipt' | 'yearly-statement';

interface CustomerDocPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerUser;
  application?: LoanApplication | null;
  activeLoan?: ActiveLoan | null;
  selectedCurrency: CurrencyConfig;
  initialDocType?: CustomerDocType;
}

export const CustomerDocPdfModal: React.FC<CustomerDocPdfModalProps> = ({
  isOpen,
  onClose,
  customer,
  application,
  activeLoan,
  selectedCurrency,
  initialDocType = 'full-file',
}) => {
  const [currentDoc, setCurrentDoc] = useState<CustomerDocType>(initialDocType);

  useEffect(() => {
    if (initialDocType) {
      setCurrentDoc(initialDocType);
    }
  }, [initialDocType]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [smsToast, setSmsToast] = useState<{
    phoneOrAadhaar: string;
    code: string;
    time: string;
    type: 'aadhar' | 'mobile';
  } | null>(null);

  const handleSendAadharOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsToast({
      phoneOrAadhaar: customer.aadharNumber,
      code,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'aadhar',
    });
  };

  const handleSendMobileOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const phone = customer.phone || SHOP_INFO.phone;
    setSmsToast({
      phoneOrAadhaar: `+91 ${phone}`,
      code,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'mobile',
    });
  };

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const loanAmount = activeLoan
    ? activeLoan.principalAmount
    : application
    ? application.requestedAmount
    : 25000;

  const interestRate = activeLoan
    ? activeLoan.interestRate
    : application
    ? application.interestRate
    : 10.5;

  const monthlyEmi = activeLoan
    ? activeLoan.monthlyEmi
    : application
    ? application.monthlyEmi
    : 1200;

  const tenureMonths = activeLoan
    ? activeLoan.totalTenureMonths
    : application
    ? application.tenureMonths
    : 24;

  const loanCategory = application?.loanCategory || 'Smartphone & Personal';
  const loanId = activeLoan?.accountNumber || application?.id || 'NS-LN-849201';
  const issueDate = application?.appliedDate || '2026-10-08';
  const sanctionRefNo = `NS/SANC/2026/${loanId.replace(/[^0-9]/g, '').slice(-6) || '849201'}`;

  // Generate 12-month schedule for demonstration
  const scheduleRows = Array.from({ length: Math.min(12, tenureMonths) }).map((_, idx) => {
    const monthNum = idx + 1;
    const isPaid = activeLoan ? monthNum <= activeLoan.completedEmis : monthNum <= 2;
    const principalPart = Math.round(monthlyEmi * 0.75);
    const interestPart = Math.round(monthlyEmi * 0.25);
    const remaining = Math.max(0, loanAmount - principalPart * monthNum);

    return {
      month: monthNum,
      dueDate: `2026-${String(((idx + 10) % 12) + 1).padStart(2, '0')}-05`,
      principal: principalPart,
      interest: interestPart,
      emi: monthlyEmi,
      balance: remaining,
      status: isPaid ? 'PAID' : monthNum === (activeLoan ? activeLoan.completedEmis + 1 : 3) ? 'DUE' : 'UPCOMING',
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* FLOATING REALISTIC SMS NOTIFICATION TOAST */}
      {smsToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 w-full max-w-md px-3 animate-bounce">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl text-white shadow-emerald-500/30 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black shadow-md ${
              smsToast.type === 'aadhar' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}>
              {smsToast.type === 'aadhar' ? <Fingerprint className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={`font-extrabold flex items-center gap-1 ${
                  smsToast.type === 'aadhar' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  <Bell className="w-3 h-3" />
                  {smsToast.type === 'aadhar' ? 'SMS from AD-UIDAI' : 'SMS from VK-NSLOAN'}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">{smsToast.time}</span>
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                {smsToast.type === 'aadhar' ? (
                  <>
                    [UIDAI] Dear {customer.fullName}, Aadhaar OTP is{' '}
                    <strong className="text-amber-300 font-mono text-base underline tracking-wider">
                      {smsToast.code}
                    </strong>
                    {' '}for NS LOAN file verification. Ref: {sanctionRefNo}. Valid for 10 min.
                  </>
                ) : (
                  <>
                    Dear {customer.fullName}, OTP for your NS Loan Document File is{' '}
                    <strong className="text-emerald-300 font-mono text-base underline tracking-wider">
                      {smsToast.code}
                    </strong>
                    . Bank A/C: {SHOP_INFO.bankDetails.accountNumber}. PhonePe: {SHOP_INFO.phonePeNumber}.
                  </>
                )}
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  Delivered to {smsToast.phoneOrAadhaar}
                </span>
                <button
                  type="button"
                  onClick={() => setSmsToast(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 md:p-8 shadow-2xl relative my-auto max-h-[95vh] overflow-y-auto">
        {/* TOP MODAL BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-extrabold uppercase border border-emerald-500/30">
                Official PDF Document Center
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {sanctionRefNo}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Customer Full Master File & Official PDF Desk
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSendAadharOtp}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Send UIDAI Aadhaar Verification OTP"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Send Aadhaar OTP</span>
            </button>

            <button
              onClick={handleSendMobileOtp}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Send Verification OTP to Mobile Number"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Send Mobile OTP</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
              title="Print Document or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Switcher Tabs - Hidden in Print */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 mb-6 overflow-x-auto print:hidden">
          <button
            onClick={() => setCurrentDoc('full-file')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              currentDoc === 'full-file'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>⭐ Customer Full File (Master Dossier PDF)</span>
          </button>

          <button
            onClick={() => setCurrentDoc('sanction')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              currentDoc === 'sanction'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>1. Sanction Certificate</span>
          </button>

          <button
            onClick={() => setCurrentDoc('agreement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              currentDoc === 'agreement'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. Loan Agreement Contract</span>
          </button>

          <button
            onClick={() => setCurrentDoc('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              currentDoc === 'schedule'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>3. EMI Repayment Schedule</span>
          </button>

          <button
            onClick={() => setCurrentDoc('receipt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              currentDoc === 'receipt'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>4. Payment Receipt</span>
          </button>

          <button
            onClick={() => setCurrentDoc('yearly-statement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              currentDoc === 'yearly-statement'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>5. Yearly Loan Statement (FY 2025-26)</span>
          </button>
        </div>

        {/* PRINTABLE CONTAINER - Clean White Standard A4 Look */}
        <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border-4 border-double border-slate-300 shadow-inner relative overflow-hidden font-serif">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
            <div className="text-8xl font-black text-slate-900 rotate-[-25deg] tracking-widest uppercase">
              NS FINANCE
            </div>
          </div>

          {/* DOCUMENT HEADER: LETTERHEAD */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b-2 border-slate-900 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center font-black text-2xl border-2 border-slate-800 shadow-md">
                NS
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950 uppercase font-sans">
                  {SHOP_INFO.name}
                </h2>
                <p className="text-[11px] text-slate-600 font-sans">
                  Chanchal State, Garage er Samne, Malda, West Bengal, India - 732123
                </p>
                <p className="text-[10px] text-slate-500 font-sans">
                  Phone: {SHOP_INFO.formattedPhone} • PhonePe: {SHOP_INFO.phonePeNumber} • Email: {SHOP_INFO.email}
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-sans text-slate-700 space-y-0.5">
              <div className="font-bold text-slate-950">REF: {sanctionRefNo}</div>
              <div className="text-slate-500 text-[10px]">Date of Issue: {issueDate}</div>
              <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                UIDAI & NSDL Verified e-Dossier
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* DOCUMENT: ⭐ CUSTOMER FULL FILE (COMPLETE MASTER DOSSIER PDF) */}
          {/* ============================================================== */}
          {currentDoc === 'full-file' && (
            <div className="pt-5 animate-fadeIn font-sans space-y-6">
              {/* Dossier Banner */}
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Government of India e-KYC Compliant • Master Loan Portfolio
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2 tracking-tight uppercase font-serif">
                  CUSTOMER COMPLETE MASTER LOAN DOSSIER
                </h1>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  Consolidated Dossier: Borrower e-KYC Record, Sanction Order, Loan Agreement, Bank Disbursal & Repayment Ledger
                </p>
              </div>

              {/* SECTION 1: BORROWER e-KYC IDENTITY VERIFICATION DOSSIER */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <Fingerprint className="w-4 h-4 text-emerald-700" />
                    Section 1: Verified Borrower Identity & e-KYC Record
                  </span>
                  <span className="text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    UIDAI & Income Tax Verified ✓
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Borrower Name</span>
                    <span className="font-bold text-slate-950 text-sm">{customer.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Aadhaar Card (UIDAI)</span>
                    <span className="font-mono font-bold text-emerald-800 block text-sm">
                      {customer.aadharNumber}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">Aadhaar OTP Authenticated ✓</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">PAN Card (Income Tax)</span>
                    <span className="font-mono font-bold text-cyan-900 block text-sm">
                      {customer.panNumber}
                    </span>
                    <span className="text-[9px] text-cyan-800 font-bold">NSDL Status: Active ✓</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Mobile / SMS Contact</span>
                    <span className="font-mono font-bold text-slate-950 block text-sm">
                      +91 {customer.phone}
                    </span>
                    <span className="text-[9px] text-slate-500">Linked to Aadhaar</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Residential Address</span>
                    <span className="font-medium text-slate-800">{customer.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Date of Birth & Status</span>
                    <span className="font-medium text-slate-800">{customer.dateOfBirth} • Verified Indian Citizen</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: APPROVED LOAN SANCTION PARTICULARS */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    Section 2: Sanction Order & Credit Assessment
                  </span>
                  <span className="text-[10px] font-bold font-mono text-slate-600">
                    AC: {loanId}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800 text-[10px] uppercase font-bold block">Sanctioned Amount</span>
                    <span className="font-mono font-black text-emerald-900 text-lg">
                      {formatCurrency(loanAmount, selectedCurrency)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Interest Rate</span>
                    <span className="font-mono font-bold text-slate-900 text-lg">{interestRate}% p.a.</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Tenor</span>
                    <span className="font-mono font-bold text-slate-900 text-lg">{tenureMonths} Months</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800 text-[10px] uppercase font-bold block">Monthly Installment (EMI)</span>
                    <span className="font-mono font-black text-emerald-900 text-lg">
                      {formatCurrency(monthlyEmi, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BANK DISBURSEMENT & PHONEPE OFFICIAL PAYMENT CHANNELS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Official Bank Account */}
                <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-slate-950 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-700" />
                      Designated Bank Account (NESFB)
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                      Disbursement & RTGS
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Bank Name</span>
                      <strong className="text-slate-950">{SHOP_INFO.bankDetails.bankName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Beneficiary Account Name</span>
                      <strong className="text-slate-950">{SHOP_INFO.bankDetails.accountName}</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <span className="text-slate-500 text-[10px] block font-bold">Bank Account Number</span>
                      <span className="font-mono font-black text-emerald-900 text-base tracking-wider block">
                        {SHOP_INFO.bankDetails.accountNumber}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <span className="text-slate-500 text-[10px] block font-bold">IFSC Code & Branch</span>
                      <span className="font-mono font-black text-cyan-900 text-sm tracking-wider block">
                        {SHOP_INFO.bankDetails.ifscCode} • {SHOP_INFO.bankDetails.branch}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Official PhonePe Payment Gateway */}
                <div className="p-4 rounded-xl bg-purple-50/70 border-2 border-purple-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-purple-950 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-purple-700 text-white font-bold text-[9px] flex items-center justify-center">पे</span>
                      Official PhonePe & UPI Channel
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-purple-200 px-1.5 py-0.5 rounded text-purple-900">
                      Instant EMI
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-purple-950">
                    <div className="bg-white p-2.5 rounded-lg border border-purple-200">
                      <span className="text-purple-600 text-[10px] block font-bold">Official PhonePe Mobile Number</span>
                      <span className="font-mono font-black text-purple-900 text-lg tracking-wider block">
                        {SHOP_INFO.phonePeNumber}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-purple-200">
                      <span className="text-purple-600 text-[10px] block font-bold">PhonePe UPI VPA ID</span>
                      <span className="font-mono font-black text-purple-900 text-sm tracking-wider block">
                        {SHOP_INFO.upiId}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-14 h-14 bg-white border border-purple-300 rounded-lg p-1 flex items-center justify-center shrink-0">
                        <QrCode className="w-11 h-11 text-purple-900" />
                      </div>
                      <div className="text-[11px] text-purple-900 leading-snug">
                        <strong>Scan or Pay to PhonePe:</strong> {SHOP_INFO.phonePeNumber}. Zero gateway fees. Instant receipt generated.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: MASTER LEGAL COVENANTS & UNDERTAKING */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 text-xs">
                <span className="text-xs font-black uppercase text-slate-900 block mb-2">
                  Section 4: Master Credit Agreement & Legal Covenants
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed mb-2">
                  1. The Borrower (<strong>{customer.fullName}</strong>) acknowledges receipt of credit approval for <strong>{formatCurrency(loanAmount, selectedCurrency)}</strong> from <strong>{SHOP_INFO.name}</strong>.
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed mb-2">
                  2. Monthly installments of <strong>{formatCurrency(monthlyEmi, selectedCurrency)}</strong> are due on the 5th day of every calendar month. Payments must be routed exclusively to designated Bank A/C (033325224746089, NESFB) or verified PhonePe number ({SHOP_INFO.phonePeNumber}).
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  3. Identity verification confirmed via Aadhaar Card ({customer.aadharNumber}) and PAN ({customer.panNumber}). This electronic document is executed in accordance with the Information Technology Act, 2000.
                </p>
              </div>

              {/* SECTION 5: AMORTIZATION REPAYMENT BREAKDOWN */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <span className="text-xs font-black uppercase text-slate-900">
                    Section 5: Complete 12-Month Repayment Schedule
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">EMI: {formatCurrency(monthlyEmi, selectedCurrency)}/mo</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-200/60 border-y border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="py-1.5 px-2">Month</th>
                        <th className="py-1.5 px-2">Due Date</th>
                        <th className="py-1.5 px-2">Principal</th>
                        <th className="py-1.5 px-2">Interest</th>
                        <th className="py-1.5 px-2">Installment</th>
                        <th className="py-1.5 px-2">Balance</th>
                        <th className="py-1.5 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      {scheduleRows.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-100/50">
                          <td className="py-1.5 px-2 font-bold text-slate-900">M-{row.month}</td>
                          <td className="py-1.5 px-2 text-slate-600 font-sans">{row.dueDate}</td>
                          <td className="py-1.5 px-2">{formatCurrency(row.principal, selectedCurrency)}</td>
                          <td className="py-1.5 px-2">{formatCurrency(row.interest, selectedCurrency)}</td>
                          <td className="py-1.5 px-2 font-bold text-emerald-800">{formatCurrency(row.emi, selectedCurrency)}</td>
                          <td className="py-1.5 px-2">{formatCurrency(row.balance, selectedCurrency)}</td>
                          <td className="py-1.5 px-2 text-right">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-sans font-bold ${
                              row.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- DOCUMENT 1: SANCTION CERTIFICATE ---------------- */}
          {currentDoc === 'sanction' && (
            <div className="pt-5 animate-fadeIn">
              <div className="text-center mb-6">
                <span className="text-[10px] font-sans uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Form NS-CR-01 • Official Approval Order
                </span>
                <h1 className="text-2xl font-black text-slate-950 mt-2 tracking-tight uppercase">
                  Approval Sanction Certificate
                </h1>
                <p className="text-xs text-slate-600 font-sans mt-0.5">
                  Issued under the N.S. Finance & NS Mobile Lending Protocol
                </p>
              </div>

              {/* Borrower & ID Verification Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      Customer Name
                    </span>
                    <span className="font-bold text-slate-900">{customer.fullName}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      Customer Aadhaar Card
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      {customer.aadharNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      Customer PAN Card
                    </span>
                    <span className="font-mono font-bold text-emerald-800">
                      {customer.panNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      Customer Mobile
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      +91 {customer.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Salutation */}
              <div className="text-xs font-sans text-slate-700 leading-relaxed mb-5">
                <p>
                  Dear <strong>{customer.fullName}</strong>,
                </p>
                <p className="mt-1">
                  We are pleased to inform you that your application for the <strong>{loanCategory} Facility</strong> under Account Number <strong className="font-mono">{loanId}</strong> has been formally assessed and <strong>APPROVED</strong>.
                </p>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-sans text-xs">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 text-[10px] uppercase font-bold block">
                    Sanctioned Principal
                  </span>
                  <span className="font-mono font-black text-emerald-950 text-base">
                    {formatCurrency(loanAmount, selectedCurrency)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">
                    Interest Rate
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {interestRate}% p.a.
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">
                    Tenor Period
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-base">
                    {tenureMonths} Months
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-800 text-[10px] uppercase font-bold block">
                    Monthly Installment (EMI)
                  </span>
                  <span className="font-mono font-black text-emerald-950 text-base">
                    {formatCurrency(monthlyEmi, selectedCurrency)}
                  </span>
                </div>
              </div>

              {/* Bank & PhonePe Details */}
              <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-900 mb-6 font-sans">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-slate-950 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-700" />
                    Company Designated Bank Account & PhonePe Gateway
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-800">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Bank Name</span>
                    <strong className="text-slate-950">{SHOP_INFO.bankDetails.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Branch</span>
                    <strong className="text-slate-950">{SHOP_INFO.bankDetails.branch}</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-300">
                    <span className="text-slate-500 text-[10px] block font-bold">Account Number</span>
                    <span className="font-mono font-black text-emerald-800 text-base tracking-wider block">
                      {SHOP_INFO.bankDetails.accountNumber}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-300">
                    <span className="text-slate-500 text-[10px] block font-bold">IFSC Code</span>
                    <span className="font-mono font-black text-cyan-800 text-base tracking-wider block">
                      {SHOP_INFO.bankDetails.ifscCode}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center">
                      पे
                    </span>
                    <span>
                      PhonePe Number: <strong>{SHOP_INFO.phonePeNumber}</strong> (UPI: {SHOP_INFO.upiId})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- DOCUMENT 2: LOAN AGREEMENT ---------------- */}
          {currentDoc === 'agreement' && (
            <div className="pt-5 animate-fadeIn font-sans">
              <div className="text-center mb-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Legal Instrument • Master Contract
                </span>
                <h1 className="text-2xl font-black text-slate-950 mt-2 tracking-tight uppercase font-serif">
                  Consumer Credit & Loan Agreement
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Executed between NS MOBILE SHOP & N.S. FINANCE and the Borrower
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5 text-xs space-y-2 leading-relaxed text-slate-800">
                <p>
                  <strong>PARTIES:</strong> This Loan Covenant is entered into by <strong>{SHOP_INFO.name}</strong>, Chanchal, Malda (hereinafter "Lender") and <strong>{customer.fullName}</strong>, residing at {customer.address} (hereinafter "Borrower").
                </p>
                <p>
                  <strong>CREDIT PRINCIPAL:</strong> The Lender agrees to extend a term loan of <strong>{formatCurrency(loanAmount, selectedCurrency)}</strong> at an interest rate of <strong>{interestRate}% p.a.</strong> for a tenure of <strong>{tenureMonths} months</strong>.
                </p>
                <p>
                  <strong>DESIGNATED BANK REPAYMENT:</strong> The Borrower promises to pay monthly installments of <strong>{formatCurrency(monthlyEmi, selectedCurrency)}</strong> directly to <strong>{SHOP_INFO.bankDetails.bankName}</strong> (A/C: <span className="font-mono font-bold">{SHOP_INFO.bankDetails.accountNumber}</span>, IFSC: <span className="font-mono font-bold">{SHOP_INFO.bankDetails.ifscCode}</span>) or authorized PhonePe number <strong>{SHOP_INFO.phonePeNumber}</strong>.
                </p>
                <p>
                  <strong>e-KYC UNDERTAKING:</strong> The Borrower confirms Aadhaar card ({customer.aadharNumber}) and PAN ({customer.panNumber}) were electronically validated via Aadhaar OTP and NSDL services.
                </p>
              </div>
            </div>
          )}

          {/* ---------------- DOCUMENT 3: REPAYMENT SCHEDULE ---------------- */}
          {currentDoc === 'schedule' && (
            <div className="pt-5 animate-fadeIn font-sans">
              <div className="text-center mb-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Amortization Statement
                </span>
                <h1 className="text-2xl font-black text-slate-950 mt-2 tracking-tight uppercase font-serif">
                  EMI Repayment Schedule & Statement
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Account No: <strong className="font-mono">{loanId}</strong> • Borrower: {customer.fullName} • Aadhaar: {customer.aadharNumber}
                </p>
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Inst. #</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Principal</th>
                      <th className="py-2.5 px-3">Interest</th>
                      <th className="py-2.5 px-3">Total EMI</th>
                      <th className="py-2.5 px-3">Bal. Principal</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {scheduleRows.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">Month {row.month}</td>
                        <td className="py-2 px-3 text-slate-600 font-sans">{row.dueDate}</td>
                        <td className="py-2 px-3 text-slate-800">
                          {formatCurrency(row.principal, selectedCurrency)}
                        </td>
                        <td className="py-2 px-3 text-slate-800">
                          {formatCurrency(row.interest, selectedCurrency)}
                        </td>
                        <td className="py-2 px-3 font-bold text-emerald-800">
                          {formatCurrency(row.emi, selectedCurrency)}
                        </td>
                        <td className="py-2 px-3 text-slate-800">
                          {formatCurrency(row.balance, selectedCurrency)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                              row.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.status === 'DUE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- DOCUMENT 4: PAYMENT RECEIPT ---------------- */}
          {currentDoc === 'receipt' && (
            <div className="pt-5 animate-fadeIn font-sans">
              <div className="text-center mb-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Official Acknowledgment
                </span>
                <h1 className="text-2xl font-black text-slate-950 mt-2 tracking-tight uppercase font-serif">
                  EMI Installment Payment Receipt
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Issued by NS MOBILE SHOP & N.S. FINANCE Repayment Desk
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-300 mb-6">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                      Receipt Number
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      RCT-NS-2026-88192
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                      Transaction Status
                    </span>
                    <span className="font-bold text-emerald-800 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESSFUL / CREDITED
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-bold">Received From</span>
                    <span className="font-bold text-slate-900">{customer.fullName}</span>
                    <span className="text-[10px] text-slate-600 font-mono block">
                      Aadhaar: {customer.aadharNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-bold">Amount Received</span>
                    <span className="font-mono font-black text-emerald-800 text-base">
                      {formatCurrency(monthlyEmi, selectedCurrency)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-bold">Payment Channel</span>
                    <span className="font-bold text-slate-900">PhonePe / Indian Bank A/C</span>
                    <span className="text-[10px] text-slate-600 font-mono block">
                      PhonePe: {SHOP_INFO.phonePeNumber} • NESFB: {SHOP_INFO.bankDetails.accountNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block font-bold">Receipt Date</span>
                    <span className="font-bold text-slate-900">{issueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== DOCUMENT 5: YEARLY LOAN STATEMENT & INTEREST CERTIFICATE ===================== */}
          {(currentDoc === 'yearly-statement' || currentDoc === 'full-file') && (
            <div className={`space-y-6 ${currentDoc === 'full-file' ? 'pt-8 border-t-2 border-dashed border-slate-300' : ''}`}>
              {/* Document Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-3">
                <span className="text-[10px] font-sans font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-300">
                  STATUTORY TAX CERTIFICATE & REPAYMENT RECORD
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 font-sans">
                  ANNUAL LOAN STATEMENT & INTEREST CERTIFICATE
                </h3>
                <p className="text-xs text-slate-600 font-sans">
                  Financial Year: <strong>2025–2026 (April 01, 2025 to March 31, 2026)</strong> • Assessment Year: 2026–2027
                </p>
                <p className="text-[10px] text-slate-500 font-sans">
                  Certificate issued under Section 24(b) (Interest) and Section 80C (Principal) of the Income Tax Act, 1961
                </p>
              </div>

              {/* Account & Borrower Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans">
                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">Borrower Name</span>
                  <span className="font-bold text-slate-900">{customer.fullName}</span>
                  <span className="text-[10px] text-slate-600 font-mono block">
                    UID: {customer.aadharNumber}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">Loan Account No.</span>
                  <span className="font-mono font-black text-emerald-800">{loanId}</span>
                  <span className="text-[10px] text-slate-600 block">{loanCategory}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">PAN Number</span>
                  <span className="font-mono font-bold text-slate-900">{customer.panNumber || 'ABCPR1294F'}</span>
                  <span className="text-[10px] text-slate-600 block">Phone: +91 {customer.phone || SHOP_INFO.phone}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-bold">Sanctioned Principal</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(loanAmount, selectedCurrency)}
                  </span>
                  <span className="text-[10px] text-slate-600 block">ROI: {interestRate}% APR</span>
                </div>
              </div>

              {/* Financial Year Aggregated Summary Box */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 font-sans">
                <div className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Annual Repayment Totals for FY 2025–26</span>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold">12 of 12 EMIs Paid (100% On-Time)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                    <span className="text-[10px] text-slate-500 uppercase font-sans block">Total Principal Repaid</span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(Math.round(monthlyEmi * 0.75 * 12), selectedCurrency)}
                    </span>
                    <span className="text-[9px] text-emerald-700 block font-sans">Eligible u/s 80C</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                    <span className="text-[10px] text-slate-500 uppercase font-sans block">Total Interest Paid</span>
                    <span className="text-sm font-black text-emerald-800">
                      {formatCurrency(Math.round(monthlyEmi * 0.25 * 12), selectedCurrency)}
                    </span>
                    <span className="text-[9px] text-emerald-700 block font-sans">Eligible u/s 24(b)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                    <span className="text-[10px] text-slate-500 uppercase font-sans block">Total Amount Paid</span>
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(monthlyEmi * 12, selectedCurrency)}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-sans">12 Monthly Instalments</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-emerald-100">
                    <span className="text-[10px] text-slate-500 uppercase font-sans block">Closing Principal Balance</span>
                    <span className="text-sm font-black text-amber-700">
                      {formatCurrency(Math.max(0, loanAmount - Math.round(monthlyEmi * 0.75 * 12)), selectedCurrency)}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-sans">As on 31-Mar-2026</span>
                  </div>
                </div>
              </div>

              {/* Itemized 12-Month Paid EMI Ledger */}
              <div className="space-y-2 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-900">Monthly EMI Repayment Breakdown (FY 2025–26)</h4>
                  <span className="text-[10px] text-slate-500 font-mono">Channel: PhonePe UPI & Bank NACH AutoPay</span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Month</th>
                        <th className="py-2 px-2.5">Due Date</th>
                        <th className="py-2 px-2.5">Payment Date</th>
                        <th className="py-2 px-2.5">UPI / Txn Ref</th>
                        <th className="py-2 px-2.5 text-right">Principal</th>
                        <th className="py-2 px-2.5 text-right">Interest</th>
                        <th className="py-2 px-2.5 text-right">Total EMI</th>
                        <th className="py-2 px-2.5 text-right">Balance</th>
                        <th className="py-2 px-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {[
                        { m: 'Apr 2025', due: '05-Apr-2025', paid: '05-Apr-2025', ref: 'UPI-PP-819201' },
                        { m: 'May 2025', due: '05-May-2025', paid: '04-May-2025', ref: 'UPI-PP-829104' },
                        { m: 'Jun 2025', due: '05-Jun-2025', paid: '05-Jun-2025', ref: 'UPI-PP-839210' },
                        { m: 'Jul 2025', due: '05-Jul-2025', paid: '05-Jul-2025', ref: 'UPI-PP-849102' },
                        { m: 'Aug 2025', due: '05-Aug-2025', paid: '03-Aug-2025', ref: 'UPI-PP-859301' },
                        { m: 'Sep 2025', due: '05-Sep-2025', paid: '05-Sep-2025', ref: 'UPI-PP-869402' },
                        { m: 'Oct 2025', due: '05-Oct-2025', paid: '05-Oct-2025', ref: 'UPI-PP-879503' },
                        { m: 'Nov 2025', due: '05-Nov-2025', paid: '05-Nov-2025', ref: 'UPI-PP-889604' },
                        { m: 'Dec 2025', due: '05-Dec-2025', paid: '04-Dec-2025', ref: 'UPI-PP-899705' },
                        { m: 'Jan 2026', due: '05-Jan-2026', paid: '05-Jan-2026', ref: 'UPI-PP-909806' },
                        { m: 'Feb 2026', due: '05-Feb-2026', paid: '05-Feb-2026', ref: 'UPI-PP-919907' },
                        { m: 'Mar 2026', due: '05-Mar-2026', paid: '05-Mar-2026', ref: 'UPI-PP-929008' },
                      ].map((item, idx) => {
                        const princ = Math.round(monthlyEmi * 0.75);
                        const intr = Math.round(monthlyEmi * 0.25);
                        const bal = Math.max(0, loanAmount - princ * (idx + 1));
                        return (
                          <tr key={item.m} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2.5 font-sans font-bold text-slate-900">{item.m}</td>
                            <td className="py-1.5 px-2.5 text-slate-600">{item.due}</td>
                            <td className="py-1.5 px-2.5 text-slate-600">{item.paid}</td>
                            <td className="py-1.5 px-2.5 text-slate-500 text-[10px]">{item.ref}</td>
                            <td className="py-1.5 px-2.5 text-right text-slate-900">{formatCurrency(princ, selectedCurrency)}</td>
                            <td className="py-1.5 px-2.5 text-right text-emerald-800 font-bold">{formatCurrency(intr, selectedCurrency)}</td>
                            <td className="py-1.5 px-2.5 text-right text-slate-900 font-bold">{formatCurrency(monthlyEmi, selectedCurrency)}</td>
                            <td className="py-1.5 px-2.5 text-right text-slate-600">{formatCurrency(bal, selectedCurrency)}</td>
                            <td className="py-1.5 px-2.5 text-center">
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 font-sans">
                                PAID
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 font-bold font-mono border-t border-slate-300">
                      <tr>
                        <td colSpan={4} className="py-2 px-2.5 font-sans text-slate-800">
                          Total Paid in FY 2025–26 (12 Months):
                        </td>
                        <td className="py-2 px-2.5 text-right text-slate-900">
                          {formatCurrency(Math.round(monthlyEmi * 0.75 * 12), selectedCurrency)}
                        </td>
                        <td className="py-2 px-2.5 text-right text-emerald-800">
                          {formatCurrency(Math.round(monthlyEmi * 0.25 * 12), selectedCurrency)}
                        </td>
                        <td className="py-2 px-2.5 text-right text-slate-950 font-black">
                          {formatCurrency(monthlyEmi * 12, selectedCurrency)}
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Statutory Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-sans space-y-1">
                <div className="font-bold text-slate-900">Income Tax Declaration & Covenants:</div>
                <p>
                  This annual certificate confirms total repayments received towards Loan Account {loanId}. Interest component is eligible for rebate under Section 24(b) and principal component under Section 80C. Issued with computer-generated tamper-proof verification stamp and digital signing.
                </p>
              </div>
            </div>
          )}

          {/* OFFICIAL STAMP & SIGNATURE FOOTER (PRESENT ON ALL PRINTED DOCUMENTS) */}
          <div className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans text-xs">
            {/* QR Verification Seal */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-lg p-1 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div className="text-[10px] text-slate-600 space-y-0.5">
                <div className="font-bold text-slate-900">Scan to Verify Authenticity</div>
                <div>Doc ID: NS-DOC-{loanId.replace(/[^0-9]/g, '')}</div>
                <div>Aadhaar: {customer.aadharNumber} (Verified)</div>
                <div>PhonePe: {SHOP_INFO.phonePeNumber} • Bank: {SHOP_INFO.bankDetails.accountNumber}</div>
              </div>
            </div>

            {/* Official Stamp & Signatures */}
            <div className="flex items-center gap-8 text-center">
              <div>
                <div className="w-32 border-b border-slate-400 mb-1 h-8 flex items-end justify-center">
                  <span className="font-serif italic text-slate-700 text-sm">{customer.fullName}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Borrower Signature
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  UIDAI eSign Authenticated
                </span>
              </div>

              <div>
                <div className="w-32 border-b border-slate-900 mb-1 h-8 flex items-end justify-center">
                  <span className="font-sans font-black text-emerald-800 text-xs uppercase tracking-tight">
                    NS MOBILE SHOP
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-900 block">
                  Authorized Signatory
                </span>
                <span className="text-[9px] text-slate-600">
                  N.S. Finance • Chanchal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
