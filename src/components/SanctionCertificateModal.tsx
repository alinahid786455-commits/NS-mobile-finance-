import React, { useState } from 'react';
import { LoanApplication, CurrencyConfig } from '../types/loan';
import { SHOP_INFO } from '../data/loanProducts';
import { formatCurrency } from '../utils/calculator';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  X,
  Building,
  Smartphone,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  QrCode,
  FileCheck,
  Copy,
  Check,
  Send,
  Bell,
  MessageSquare,
  Fingerprint,
} from 'lucide-react';

interface SanctionCertificateModalProps {
  application: LoanApplication;
  selectedCurrency: CurrencyConfig;
  onClose: () => void;
  onOpenPayment?: () => void;
}

export const SanctionCertificateModal: React.FC<SanctionCertificateModalProps> = ({
  application,
  selectedCurrency,
  onClose,
  onOpenPayment,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [smsToast, setSmsToast] = useState<{
    phone: string;
    code: string;
    time: string;
    type: 'aadhar' | 'mobile';
  } | null>(null);
  const [otpVerified, setOtpVerified] = useState<boolean>(true);

  const handleSendSanctionOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const phone = application.phone || SHOP_INFO.phone;
    setSmsToast({
      phone,
      code,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'mobile',
    });
    setOtpVerified(true);
  };

  const handleSendAadharOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const aadhar = application.aadharNumber || '5849 2039 1847';
    setSmsToast({
      phone: aadhar,
      code,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'aadhar',
    });
    setOtpVerified(true);
  };
  const sanctionRefNo = `NS/SANC/2026/${application.id.replace('NS-LN-', '')}`;
  const issueDate = application.appliedDate || new Date().toISOString().split('T')[0];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
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
                    [UIDAI] Dear {application.fullName}, Aadhaar OTP is{' '}
                    <strong className="text-amber-300 font-mono text-base underline tracking-wider">
                      {smsToast.code}
                    </strong>
                    {' '}for NS Sanction authentication. Valid for 10 min.
                  </>
                ) : (
                  <>
                    Dear {application.fullName}, Sanction Ref {sanctionRefNo} is approved. Authentication OTP is{' '}
                    <strong className="text-emerald-300 font-mono text-base underline tracking-wider">
                      {smsToast.code}
                    </strong>
                    . Bank A/C: {SHOP_INFO.bankDetails.accountNumber}, IFSC: {SHOP_INFO.bankDetails.ifscCode}.
                  </>
                )}
              </p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  Delivered to {smsToast.phone}
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

      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3 print:hidden">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Digital Sanction Certificate</span>
            {otpVerified && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                OTP Verified ✓
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* SEND AADHAAR OTP BUTTON */}
            <button
              onClick={handleSendAadharOtp}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Send Verification OTP to Customer Aadhaar"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Send Aadhaar OTP</span>
            </button>

            {/* SEND OTP TO MOBILE NUMBER BUTTON */}
            <button
              onClick={handleSendSanctionOtp}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Send Verification OTP to Customer Mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Send Mobile OTP</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE DOCUMENT BODY */}
        <div
          id="sanction-certificate-print"
          className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl border-4 border-double border-slate-300 shadow-inner relative overflow-hidden font-serif"
        >
          {/* Subtle Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none">
            <div className="text-8xl font-black text-slate-900 rotate-[-25deg] tracking-widest uppercase">
              NS FINANCE
            </div>
          </div>

          {/* Letterhead Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b-2 border-slate-900 gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-950 text-white font-black flex items-center justify-center text-2xl font-sans">
                NS
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 font-sans">
                  {SHOP_INFO.name}
                </h2>
                <p className="text-xs text-slate-600 font-sans">
                  Digital Credit & Microfinance Lending Division
                </p>
                <p className="text-[11px] text-slate-500 font-sans flex items-center gap-1 justify-center sm:justify-start">
                  <MapPin className="w-3 h-3 text-rose-600" />
                  {SHOP_INFO.address}
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-sans">
              <div className="font-mono font-bold text-slate-900">
                Ref: {sanctionRefNo}
              </div>
              <div className="text-slate-600">Date: {issueDate}</div>
              <div className="text-slate-600">Phone: {SHOP_INFO.formattedPhone}</div>
              <div className="text-slate-600">Email: {SHOP_INFO.email}</div>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center my-6">
            <span className="text-[11px] font-sans uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Form NS-CR-01 • Sanction Approval Order
            </span>
            <h1 className="text-2xl font-black text-slate-950 mt-2 tracking-tight uppercase">
              Loan Sanction & Disbursal Order
            </h1>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Subject to terms of the credit underwriting agreement.
            </p>
          </div>

          {/* Salutation & Borrower Profile */}
          <div className="font-sans text-xs mb-4 space-y-1 text-slate-800 leading-relaxed">
            <p>
              Dear <strong>{application.fullName}</strong>,
            </p>
            <p>
              With reference to your loan application Ref No. <strong>{application.id}</strong>, we are pleased to inform you that your credit application has been formally assessed and <strong>APPROVED</strong> by the credit committee of NS Mobile & N.S. Finance.
            </p>
          </div>

          {/* Customer Aadhaar & PAN Card Verification Identity Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-5 font-sans">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer Name</span>
                <span className="font-bold text-slate-950">{application.fullName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer Aadhaar Card</span>
                <span className="font-mono font-bold text-emerald-800">
                  {application.aadharNumber || application.nidOrPassport || '5849 2039 1847'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer PAN Number</span>
                <span className="font-mono font-bold text-emerald-800">
                  {application.panNumber || 'ABCPR1294F'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer Mobile</span>
                <span className="font-mono font-bold text-slate-950">{application.phone}</span>
              </div>
            </div>
          </div>

          {/* Sanction Financial Terms Table */}
          <div className="mb-6 font-sans">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-700 mb-2 border-b border-slate-300 pb-1">
              Sanctioned Terms & Financial Structure
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Loan Facility</span>
                <span className="font-bold text-slate-900">{application.loanCategory} Loan</span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase block font-bold">Sanctioned Amount</span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {formatCurrency(application.requestedAmount, selectedCurrency)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Rate of Interest</span>
                <span className="font-mono font-bold text-slate-900">{application.interestRate}% p.a.</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Monthly Installment (EMI)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(application.monthlyEmi, selectedCurrency)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Tenure</span>
                <span className="font-bold text-slate-900">{application.tenureMonths} Months</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Credit Score Verified</span>
                <span className="font-mono font-bold text-cyan-800">{application.creditScore} / 850</span>
              </div>
            </div>
          </div>

          {/* OFFICIAL DESIGNATED REPAYMENT & DISBURSEMENT BANK ACCOUNT BOX */}
          <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-900 font-sans mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-slate-950 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-700" />
                Designated Company Bank & Repayment Details
              </span>
              <span className="text-[10px] uppercase font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                Verified Branch A/C
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">Bank Name</span>
                <span className="font-bold text-slate-950">
                  {SHOP_INFO.bankDetails.bankName}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">Branch</span>
                <span className="font-bold text-slate-950">
                  {SHOP_INFO.bankDetails.branch}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-300 relative">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] block font-bold">Bank Account Number</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(SHOP_INFO.bankDetails.accountNumber, 'acct')}
                    className="text-[10px] font-sans font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer print:hidden"
                  >
                    {copiedField === 'acct' ? (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <Copy className="w-3 h-3" /> Copy
                      </span>
                    )}
                  </button>
                </div>
                <span className="font-mono font-black text-emerald-800 text-base tracking-wider block mt-0.5">
                  {SHOP_INFO.bankDetails.accountNumber}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-300 relative">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] block font-bold">IFSC Code</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(SHOP_INFO.bankDetails.ifscCode, 'ifsc')}
                    className="text-[10px] font-sans font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer print:hidden"
                  >
                    {copiedField === 'ifsc' ? (
                      <span className="text-emerald-700 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <Copy className="w-3 h-3" /> Copy
                      </span>
                    )}
                  </button>
                </div>
                <span className="font-mono font-black text-cyan-800 text-base tracking-wider block mt-0.5">
                  {SHOP_INFO.bankDetails.ifscCode}
                </span>
              </div>
            </div>

            {/* PhonePe Detail Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  पे
                </span>
                <span>
                  PhonePe / UPI Installments: <strong>{SHOP_INFO.upiId}</strong> (PhonePe: {SHOP_INFO.phonePeNumber})
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(SHOP_INFO.phonePeNumber, 'phonepe')}
                className="text-[10px] font-sans font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer print:hidden self-end sm:self-auto"
              >
                {copiedField === 'phonepe' ? (
                  <span className="text-emerald-700 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Copied PhonePe
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Copy className="w-3 h-3" /> Copy PhonePe
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Underwriter Observations */}
          <div className="text-xs font-sans text-slate-700 mb-6 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
            <strong>Underwriter Findings:</strong> {application.remarks || 'Applicant verified through digital KYC and income statement check. Sanction is confirmed for electronic disbursal.'}
          </div>

          {/* Signature & Seal Footer */}
          <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between font-sans text-xs">
            <div>
              <div className="w-16 h-16 rounded-xl border border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center p-1 mb-1">
                <QrCode className="w-8 h-8 text-slate-700" />
                <span className="text-[8px] font-mono text-slate-500">AUTHENTIC</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Verification Key: {application.id}
              </span>
            </div>

            <div className="text-right">
              {/* Simulated Signature */}
              <div className="font-serif italic text-base font-bold text-slate-900 border-b border-slate-900 pb-1 mb-1">
                Alinahid / Credit Officer
              </div>
              <div className="font-bold text-slate-950 text-xs">
                Authorized Credit Signatory
              </div>
              <div className="text-[10px] text-slate-600">
                NS MOBILE & N.S. FINANCE CORPORATION
              </div>
              <div className="text-[10px] text-emerald-700 font-bold">
                Chanchal State Branch, Malda
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-400">
            Need assistance with this sanction? Call{' '}
            <strong className="text-white font-mono">{SHOP_INFO.formattedPhone}</strong>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {onOpenPayment && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPayment();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Smartphone className="w-4 h-4" />
                Pay via PhonePe
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              Download / Print PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
