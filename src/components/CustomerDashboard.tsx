import React, { useState } from 'react';
import { ActiveLoan, CurrencyConfig, LoanApplication, CustomerUser } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { SanctionCertificateModal } from './SanctionCertificateModal';
import { CustomerDocPdfModal, CustomerDocType } from './CustomerDocPdfModal';
import { PlayStoreAppModal } from './PlayStoreAppModal';
import { DEMO_CUSTOMERS, maskAadhaar, maskPan } from '../data/customerData';
import { SHOP_INFO } from '../data/loanProducts';
import {
  Wallet,
  Calendar,
  CreditCard,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Receipt,
  Download,
  AlertTriangle,
  Smartphone,
  Building,
  Award,
  Lock,
  User,
  ShieldCheck,
  UserCheck,
  Printer,
  FileText,
  Copy,
  Check,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Send,
  Bell,
  MessageSquare,
  Phone,
  Fingerprint,
  Layers,
  QrCode,
} from 'lucide-react';

interface CustomerDashboardProps {
  activeLoans: ActiveLoan[];
  selectedCurrency: CurrencyConfig;
  onMakePayment: (loanId: string, amount: number) => void;
  currentCustomer?: CustomerUser | null;
  onOpenCustomerLogin: () => void;
  onLogoutCustomer?: () => void;
  onSelectCustomer?: (customer: CustomerUser) => void;
  applications?: LoanApplication[];
  onOpenMobileApp?: () => void;
  onOpenPlayStorePublic?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  activeLoans,
  selectedCurrency,
  onMakePayment,
  currentCustomer,
  onOpenCustomerLogin,
  onLogoutCustomer,
  onSelectCustomer,
  applications = [],
  onOpenMobileApp,
  onOpenPlayStorePublic,
}) => {
  const [selectedLoan, setSelectedLoan] = useState<ActiveLoan>(activeLoans[0]);
  const [paymentAmount, setPaymentAmount] = useState<number>(selectedLoan?.monthlyEmi || 500);
  const [paymentMethod, setPaymentMethod] = useState<'Mobile' | 'Card' | 'Bank'>('Mobile');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  // State for Customer Doc PDF Modal
  const [activePdfDoc, setActivePdfDoc] = useState<CustomerDocType | null>(null);
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState<boolean>(false);

  // Masked visibility toggles
  const [showFullAadhaar, setShowFullAadhaar] = useState<boolean>(false);
  const [showFullPan, setShowFullPan] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live OTP SMS Notification state (Aadhaar or Mobile)
  const [smsToast, setSmsToast] = useState<{
    phoneOrAadhaar: string;
    code: string;
    time: string;
    type: 'aadhar' | 'mobile';
  } | null>(null);

  // Trigger simulated Aadhaar OTP ("aadhar OTP send me")
  const handleSendAadharOtp = (aadhar: string, name: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsToast({
      phoneOrAadhaar: aadhar,
      code,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'aadhar',
    });
  };

  // Trigger simulated Mobile OTP ("Mobile manber OTP send me")
  const handleSendMobileOtp = (phone: string, name: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsToast({
      phoneOrAadhaar: `+91 ${phone}`,
      code,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'mobile',
    });
  };

  const [lastReceipt, setLastReceipt] = useState<{
    txId: string;
    amount: number;
    date: string;
    account: string;
  } | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePayEmi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setIsProcessing(true);
    setTimeout(() => {
      onMakePayment(selectedLoan.id, paymentAmount);
      setLastReceipt({
        txId: `TX-NS-${Math.floor(10000000 + Math.random() * 90000000)}`,
        amount: paymentAmount,
        date: new Date().toLocaleString(),
        account: selectedLoan.accountNumber,
      });
      setIsProcessing(false);
    }, 800);
  };

  // Safe fallback customer if none logged in
  const activeCustomer: CustomerUser = currentCustomer || DEMO_CUSTOMERS[0];

  // Matching application for customer
  const customerApp =
    applications.find(
      (app) =>
        app.fullName.toLowerCase() === activeCustomer.fullName.toLowerCase() ||
        app.phone.includes(activeCustomer.phone)
    ) || applications[0];

  // If customer is not logged in, show customer login prompt screen
  if (!currentCustomer) {
    return (
      <div className="w-full max-w-4xl mx-auto py-10 px-4 animate-fadeIn">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-4">
            <Lock className="w-8 h-8 text-slate-950" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Customer Portal Authentication
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Customer Login Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Please log in with your <strong className="text-amber-400">Aadhaar Card OTP</strong>,{' '}
            <strong className="text-emerald-400">Mobile OTP</strong>, or{' '}
            <strong className="text-teal-400">Customer PAN Number</strong> to view your active loan, repay EMIs, and download or print the complete customer master file PDF.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenCustomerLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Aadhaar Card OTP Login (Send Aadhaar OTP)</span>
            </button>
            <button
              onClick={onOpenCustomerLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile OTP Login (Send Me OTP)</span>
            </button>
          </div>

          {/* Quick Demo Customer Selection */}
          <div className="mt-10 pt-8 border-t border-slate-800 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Or Instant 1-Click Demo Customer Access:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_CUSTOMERS.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => onSelectCustomer && onSelectCustomer(cust)}
                  className="p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white group-hover:text-emerald-300">
                      {cust.fullName}
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      KYC OK
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                    <div>Aadhaar: {cust.aadharNumber}</div>
                    <div className="text-teal-400">PAN: {cust.panNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = selectedLoan
    ? Math.min(100, Math.round((selectedLoan.completedEmis / selectedLoan.totalTenureMonths) * 100))
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 animate-fadeIn">
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
                  {smsToast.type === 'aadhar' ? 'SMS from AD-UIDAI (Govt of India)' : 'SMS from VK-NSLOAN'}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">{smsToast.time}</span>
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                {smsToast.type === 'aadhar' ? (
                  <>
                    [UIDAI] Dear {currentCustomer.fullName}, Your Aadhaar e-KYC OTP is{' '}
                    <strong className="text-amber-300 font-mono text-base underline tracking-wider">
                      {smsToast.code}
                    </strong>
                    {' '}for NS LOAN & FINANCE authentication. Valid for 10 min. Do not share.
                  </>
                ) : (
                  <>
                    Dear {currentCustomer.fullName}, Your mobile verification OTP is{' '}
                    <strong className="text-emerald-300 font-mono text-base underline tracking-wider">
                      {smsToast.code}
                    </strong>
                    . PhonePe: {SHOP_INFO.phonePeNumber}, Bank A/C: {SHOP_INFO.bankDetails.accountNumber}.
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

      {/* Logged-In Customer Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Customer Avatar & Bio */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-emerald-500/20">
              {currentCustomer.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{currentCustomer.fullName}</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Customer
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mobile: <strong className="text-slate-300 font-mono">+91 {currentCustomer.phone}</strong> • {currentCustomer.email}
              </p>
            </div>
          </div>

          {/* Customer Aadhaar, PAN Badges & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Aadhaar Card Badge */}
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">
                  Aadhaar Card
                </span>
                <span className="font-mono text-xs font-bold text-amber-300">
                  {showFullAadhaar ? currentCustomer.aadharNumber : maskAadhaar(currentCustomer.aadharNumber)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullAadhaar(!showFullAadhaar)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title={showFullAadhaar ? 'Hide Aadhaar' : 'Show Full Aadhaar'}
              >
                {showFullAadhaar ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>

            {/* PAN Card Badge */}
            <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">
                  PAN Number
                </span>
                <span className="font-mono text-xs font-bold text-teal-300">
                  {showFullPan ? currentCustomer.panNumber : maskPan(currentCustomer.panNumber)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullPan(!showFullPan)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title={showFullPan ? 'Hide PAN' : 'Show Full PAN'}
              >
                {showFullPan ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>

            {/* Send Aadhaar OTP Button ("aadhar OTP send me") */}
            <button
              type="button"
              onClick={() => handleSendAadharOtp(currentCustomer.aadharNumber, currentCustomer.fullName)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
              title="Send UIDAI Aadhaar Verification OTP"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Send Aadhaar OTP</span>
            </button>

            {/* Send Mobile OTP Button ("Mobile manber OTP send me") */}
            <button
              type="button"
              onClick={() => handleSendMobileOtp(currentCustomer.phone, currentCustomer.fullName)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
              title="Send Verification OTP to Mobile Number"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Send Mobile OTP</span>
            </button>

            {/* Launch Customer Mobile App Button */}
            {onOpenMobileApp && (
              <button
                type="button"
                onClick={onOpenMobileApp}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer transition-all"
                title="Launch simulated Customer Mobile App"
              >
                <Smartphone className="w-3.5 h-3.5 text-purple-200" />
                <span>Mobile App View 📱</span>
              </button>
            )}

            {/* Google Play Store App Download Button */}
            <button
              type="button"
              onClick={() => setIsPlayStoreModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600/25 via-teal-600/25 to-cyan-600/25 hover:from-emerald-600/35 hover:to-teal-600/35 text-emerald-300 hover:text-white text-xs font-black flex items-center gap-1.5 border border-emerald-500/40 shadow-sm cursor-pointer transition-all"
              title="Official Google Play Store Android app listing and APK download"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512">
                <path
                  fill="#00C1A6"
                  d="M325.3 234.3L10.7 41.6C4.4 45.4 0 52.3 0 60.8v390.4c0 8.5 4.4 15.4 10.7 19.2l314.6-192.8c4.6-2.8 7.3-7.5 7.3-12.8s-2.7-10-7.3-10.5z"
                />
                <path
                  fill="#0083D6"
                  d="M10.7 41.6L325.3 234.3l94-57.6L67.1 7.4c-18.4-11.2-41.2-2.5-56.4 34.2z"
                />
                <path
                  fill="#FF3333"
                  d="M10.7 470.4c15.2 36.7 38 45.4 56.4 34.2l352.2-215.7-94-57.6L10.7 470.4z"
                />
                <path
                  fill="#FFBA00"
                  d="M504.6 245.2l-85.3-52.2-94 57.6 94 57.6 85.3-52.2c10.3-6.3 10.3-16.5 0-22.8z"
                />
              </svg>
              <span>Play Store</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/30 text-emerald-200 font-bold">
                4.8★
              </span>
            </button>

            {/* Direct APK Download URL Link Button */}
            <a
              href="/download/NS_Mobile_Finance_v2.4.1.apk"
              download="NS_Mobile_Finance_v2.4.1.apk"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-teal-500/30 transition-all cursor-pointer"
              title="Direct APK Download URL link (v2.4.1)"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download APK</span>
            </a>

            {/* Logout / Switch User */}
            {onLogoutCustomer && (
              <button
                onClick={onLogoutCustomer}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Log out or switch customer profile"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch / Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Bank & PhonePe Quick Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              NESFB A/C: <strong className="text-white font-mono">{SHOP_INFO.bankDetails.accountNumber}</strong>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono">
              IFSC: <strong className="text-emerald-400">{SHOP_INFO.bankDetails.ifscCode}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-600 text-[9px] text-white flex items-center justify-center font-bold">पे</span>
              PhonePe: {SHOP_INFO.phonePeNumber} (UPI: {SHOP_INFO.upiId})
            </span>
          </div>
        </div>
      </div>

      {/* DOCUMENT CENTER: DOWNLOAD & PRINT PDF SECTION */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-emerald-400" />
              Download & Print Official PDF Documents
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Access and print certified documents verified with Aadhaar ({maskAadhaar(currentCustomer.aadharNumber)}) and PAN ({maskPan(currentCustomer.panNumber)}).
            </p>
          </div>

          {/* Prominent Full File Print Button */}
          <button
            onClick={() => setActivePdfDoc('full-file')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Layers className="w-4 h-4" />
            <span>Download & Print Customer Full File (PDF)</span>
          </button>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Card 0: ⭐ Customer Full File */}
          <div
            onClick={() => setActivePdfDoc('full-file')}
            className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-900 border-2 border-emerald-500/60 hover:border-emerald-400 hover:scale-[1.02] transition-all cursor-pointer group flex flex-col justify-between sm:col-span-2 lg:col-span-1 shadow-lg shadow-emerald-500/10"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center mb-2.5 font-black shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-xs text-white group-hover:text-emerald-300">
                  Customer Full File (Master Dossier)
                </h4>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-1 leading-relaxed">
                Complete all-in-one PDF dossier with Aadhaar, PAN, Sanction, NESFB Bank & PhonePe (8509184717).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-500/30 flex items-center justify-between text-[11px] font-black text-emerald-400">
              <span>Print Full Dossier</span>
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Document 1: Sanction Certificate */}
          <div
            onClick={() => setActivePdfDoc('sanction')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-emerald-300">
                Approval Sanction Certificate
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Official loan sanction order with NESFB A/C (033325224746089) and official stamp.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span>Print / PDF</span>
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Document 2: Loan Agreement */}
          <div
            onClick={() => setActivePdfDoc('agreement')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-purple-300">
                Loan Agreement Contract
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Legal master credit covenant with Aadhaar & PAN authentication and signatures.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-purple-400">
              <span>Print / PDF</span>
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Document 3: Repayment Schedule */}
          <div
            onClick={() => setActivePdfDoc('schedule')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-teal-300">
                EMI Repayment Schedule
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Complete monthly amortization table with due dates, principal, interest & status.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-teal-400">
              <span>Print / PDF</span>
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Document 4: Payment Receipt */}
          <div
            onClick={() => setActivePdfDoc('receipt')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-amber-300">
                Payment Receipt Slip
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Official acknowledgment slip for EMI installments paid via PhonePe or Bank.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-amber-400">
              <span>Print / PDF</span>
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE LOAN & REPAYMENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Loan Overview Card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                  Active Loan Account
                </span>
                <h3 className="text-xl font-black text-white">
                  {selectedLoan ? selectedLoan.productName : 'N.S. Personal Loan'}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                {selectedLoan ? selectedLoan.accountNumber : 'NS-ACT-99201'}
              </span>
            </div>

            {/* Balances & Progress */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-5">
              <div>
                <span className="text-slate-400 text-xs block">Remaining Principal</span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {formatCurrency(selectedLoan ? selectedLoan.remainingBalance : 9800, selectedCurrency)}
                </div>
                <span className="text-[10px] text-slate-500">
                  of {formatCurrency(selectedLoan ? selectedLoan.principalAmount : 15000, selectedCurrency)} original
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Monthly Installment (EMI)</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {formatCurrency(selectedLoan ? selectedLoan.monthlyEmi : 696, selectedCurrency)}
                </div>
                <span className="text-[10px] text-slate-500">
                  Due on 5th of every month
                </span>
              </div>
            </div>

            {/* Repayment Progress Bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>Repayment Tenure Progress</span>
                <span className="font-mono font-bold text-white">
                  {selectedLoan ? selectedLoan.completedEmis : 8} / {selectedLoan ? selectedLoan.totalTenureMonths : 24} EMIs ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Loan Specs Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Tenure Months</span>
                <div className="font-bold text-white font-mono mt-0.5">
                  {selectedLoan ? selectedLoan.totalTenureMonths : 24} Mo
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Interest Rate</span>
                <div className="font-bold text-cyan-400 font-mono mt-0.5">
                  {selectedLoan ? selectedLoan.interestRate : 10.5}% p.a.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Next Due Date</span>
                <div className="font-bold text-amber-400 font-mono mt-0.5">
                  {selectedLoan ? selectedLoan.nextDueDate : 'Nov 05, 2026'}
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400">
                Ref: <strong className="text-emerald-400 font-mono">NS/SANC/{selectedLoan?.accountNumber || '99201'}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePdfDoc('full-file')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Full Master PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePdfDoc('schedule')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Schedule</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Payment Receipt Alert */}
          {lastReceipt && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-emerald-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Installment Payment Successful!
                </span>
                <span className="font-mono">{lastReceipt.txId}</span>
              </div>
              <p className="text-slate-300">
                Paid {formatCurrency(lastReceipt.amount, selectedCurrency)} for loan account {lastReceipt.account} on {lastReceipt.date}.
              </p>
              <div className="mt-2 pt-2 border-t border-emerald-500/20 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActivePdfDoc('receipt')}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print Payment Receipt PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pay Installment Desk (PhonePe 8509184717 & Bank A/C) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Pay Monthly Installment (EMI)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Instant electronic receipt & automatic ledger update.
            </p>

            <form onSubmit={handlePayEmi} className="space-y-4">
              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Amount ({selectedCurrency.symbol})
                </label>
                <input
                  type="number"
                  min="10"
                  max={selectedLoan?.remainingBalance || 100000}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-lg font-bold focus:outline-hidden focus:border-emerald-400"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Payment Method (PhonePe / India Account)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Mobile')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'Mobile'
                        ? 'bg-purple-500/20 border-purple-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                    <span className="text-[11px] font-bold block">PhonePe</span>
                    <span className="text-[9px] text-purple-300 font-mono">{SHOP_INFO.phonePeNumber}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Bank')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'Bank'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="text-[11px] font-bold block">India Bank A/C</span>
                    <span className="text-[9px] text-slate-400">NESFB / IMPS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    <span className="text-[11px] font-bold block">Card / Net</span>
                    <span className="text-[9px] text-slate-500">Debit/Credit</span>
                  </button>
                </div>

                {paymentMethod === 'Mobile' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-[11px] text-purple-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <span className="w-4 h-4 rounded bg-purple-600 text-white font-bold text-[9px] flex items-center justify-center">पे</span>
                        Pay via PhonePe: <strong className="font-mono text-white text-xs">{SHOP_INFO.phonePeNumber}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(SHOP_INFO.phonePeNumber, 'phonepe')}
                        className="text-[10px] font-bold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'phonepe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'phonepe' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-purple-300 font-mono">
                      UPI VPA ID: <strong className="text-white">{SHOP_INFO.upiId}</strong>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Bank' && (
                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-200 space-y-1">
                    <div>Bank: <strong>{SHOP_INFO.bankDetails.bankName}</strong></div>
                    <div className="text-[10px] text-emerald-300 font-mono flex items-center justify-between">
                      <span>A/C: <strong className="text-white text-xs">{SHOP_INFO.bankDetails.accountNumber}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCopy(SHOP_INFO.bankDetails.accountNumber, 'acct')}
                        className="text-[10px] font-bold text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'acct' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'acct' ? 'Copied' : 'Copy A/C'}</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-emerald-300 font-mono">
                      IFSC: <strong className="text-white">{SHOP_INFO.bankDetails.ifscCode}</strong> • {SHOP_INFO.bankDetails.branch}
                    </div>
                  </div>
                )}
              </div>

              {/* Security info */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero transaction processing fee on N.S. installments.</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing || (selectedLoan && selectedLoan.remainingBalance <= 0)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing
                  ? 'Processing Transaction...'
                  : `Confirm Payment of ${formatCurrency(paymentAmount, selectedCurrency)}`}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => setActivePdfDoc('full-file')}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download & Print Customer Master Full File (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Customer Doc PDF Modal */}
      {activePdfDoc && (
        <CustomerDocPdfModal
          isOpen={true}
          onClose={() => setActivePdfDoc(null)}
          customer={currentCustomer}
          activeLoan={selectedLoan}
          application={customerApp}
          selectedCurrency={selectedCurrency}
          initialDocType={activePdfDoc}
        />
      )}

      {/* Sanction Certificate Modal fallback */}
      {showCertificate && selectedLoan && (
        <SanctionCertificateModal
          application={customerApp}
          selectedCurrency={selectedCurrency}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Google Play Store Official Listing & Install Modal */}
      <PlayStoreAppModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        onOpenMobileApp={onOpenMobileApp}
        onOpenPlayStorePublic={onOpenPlayStorePublic}
      />
    </div>
  );
};
