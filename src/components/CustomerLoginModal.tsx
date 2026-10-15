import React, { useState, useEffect } from 'react';
import { CustomerUser } from '../types/loan';
import {
  DEMO_CUSTOMERS,
  formatAadhaar,
  formatPan,
  isValidAadhaar,
  isValidPan,
} from '../data/customerData';
import { SHOP_INFO } from '../data/loanProducts';
import {
  Lock,
  ShieldCheck,
  CreditCard,
  UserCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ArrowRight,
  Sparkles,
  Building,
  Send,
  MessageSquare,
  Timer,
  Check,
  Copy,
  RotateCw,
  Bell,
  Fingerprint,
  FileText,
} from 'lucide-react';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (customer: CustomerUser) => void;
  currentCustomer?: CustomerUser | null;
}

type LoginTab = 'aadhar-otp' | 'mobile-otp' | 'aadhaar-pan';

export const CustomerLoginModal: React.FC<CustomerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<LoginTab>('aadhar-otp');
  const [aadharInput, setAadharInput] = useState<string>('5849 2039 1847');
  const [phoneInput, setPhoneInput] = useState<string>('9332504150');
  const [panInput, setPanInput] = useState<string>('ABCPR1294F');
  const [fullNameInput, setFullNameInput] = useState<string>('Tariq Rahman');

  // OTP State
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpType, setOtpType] = useState<'aadhar' | 'mobile'>('aadhar');
  const [otpCode, setOtpCode] = useState<string>('786455');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  const [smsToast, setSmsToast] = useState<{
    visible: boolean;
    sender: string;
    phoneOrAadhaar: string;
    code: string;
    time: string;
    type: 'aadhar' | 'mobile';
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const aadharValid = isValidAadhaar(aadharInput);
  const panValid = isValidPan(panInput);
  const phoneClean = phoneInput.replace(/\D/g, '');
  const phoneValid = phoneClean.length === 10;

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadharInput(formatAadhaar(e.target.value));
    setErrorMsg(null);
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPanInput(formatPan(e.target.value));
    setErrorMsg(null);
  };

  // SEND AADHAAR OTP ("aadhar OTP send me")
  const handleSendAadharOtp = () => {
    if (!aadharValid) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar Card number.');
      return;
    }

    setErrorMsg(null);
    setIsSendingOtp(true);
    setOtpType('aadhar');

    // Generate fresh 6-digit Aadhaar OTP
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(generated);

    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(`UIDAI Aadhaar OTP successfully dispatched for ${aadharInput}!`);

      // Trigger realistic live UIDAI SMS popup notification
      setSmsToast({
        visible: true,
        sender: 'AD-UIDAI (Govt of India)',
        phoneOrAadhaar: aadharInput,
        code: generated,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'aadhar',
      });
    }, 600);
  };

  // SEND OTP TO MOBILE NUMBER ("Mobile manber OTP send me")
  const handleSendMobileOtp = (customPhone?: string) => {
    const targetPhone = (customPhone || phoneClean).replace(/\D/g, '');
    if (targetPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number to receive OTP.');
      return;
    }

    setErrorMsg(null);
    setIsSendingOtp(true);
    setOtpType('mobile');

    // Generate fresh 6-digit OTP
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(generated);

    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(`OTP successfully dispatched via SMS to +91 ${targetPhone}!`);

      // Trigger realistic live SMS popup notification
      setSmsToast({
        visible: true,
        sender: 'VK-NSLOAN (NS Finance)',
        phoneOrAadhaar: `+91 ${targetPhone}`,
        code: generated,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'mobile',
      });
    }, 600);
  };

  // Auto-fill OTP from SMS notification
  const handleAutoFillOtp = (code: string) => {
    setEnteredOtp(code);
    setErrorMsg(null);
  };

  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Submit Login with Aadhaar OTP
  const handleVerifyAadharOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadharValid) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar Card number.');
      return;
    }
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit UIDAI Aadhaar OTP.');
      return;
    }

    if (enteredOtp.trim() !== otpCode) {
      setErrorMsg(`Incorrect Aadhaar OTP. Please enter "${otpCode}" or click Auto-fill OTP.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const matched = DEMO_CUSTOMERS.find(
        (c) => c.aadharNumber.replace(/\s/g, '') === aadharInput.replace(/\s/g, '')
      );

      const customerToLogin: CustomerUser = matched || {
        id: `cust_${Date.now()}`,
        fullName: fullNameInput || 'UIDAI Aadhaar Verified Customer',
        aadharNumber: aadharInput,
        panNumber: panInput || 'ABCPR1294F',
        phone: phoneClean || SHOP_INFO.phone,
        email: 'customer@nsloan.in',
        address: 'Chanchal State, Malda, West Bengal',
        dateOfBirth: '1992-05-14',
        isVerified: true,
      };

      setIsLoading(false);
      onLoginSuccess(customerToLogin);
      onClose();
    }, 450);
  };

  // Submit Login with Mobile Number & OTP
  const handleVerifyMobileOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP sent to your mobile number.');
      return;
    }

    if (enteredOtp.trim() !== otpCode) {
      setErrorMsg(`Incorrect OTP entered. Enter "${otpCode}" or click Auto-fill OTP.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const matched = DEMO_CUSTOMERS.find(
        (c) => c.phone.replace(/\D/g, '') === phoneClean
      );

      const customerToLogin: CustomerUser = matched || {
        id: `cust_${Date.now()}`,
        fullName: fullNameInput || 'Verified Mobile Customer',
        aadharNumber: aadharInput || '5849 2039 1847',
        panNumber: panInput || 'ABCPR1294F',
        phone: phoneClean || SHOP_INFO.phone,
        email: 'customer@nsloan.in',
        address: 'Chanchal, Malda, West Bengal',
        dateOfBirth: '1992-05-14',
        isVerified: true,
      };

      setIsLoading(false);
      onLoginSuccess(customerToLogin);
      onClose();
    }, 450);
  };

  // Submit Login with Aadhaar + PAN
  const handleAadhaarPanLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aadharValid) {
      setErrorMsg('Please enter a valid 12-digit Aadhaar Card number.');
      return;
    }
    if (!panValid) {
      setErrorMsg('Please enter a valid 10-character PAN Card number (e.g. ABCPR1294F).');
      return;
    }

    if (!otpSent) {
      handleSendAadharOtp();
      return;
    }

    if (enteredOtp.trim() !== otpCode && enteredOtp.length !== 6) {
      setErrorMsg(`Please enter the 6-digit OTP code (${otpCode}) sent to your registered mobile.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const matched = DEMO_CUSTOMERS.find(
        (c) =>
          c.aadharNumber.replace(/\s/g, '') === aadharInput.replace(/\s/g, '') ||
          c.panNumber.toUpperCase() === panInput.toUpperCase()
      );

      const customerToLogin: CustomerUser = matched || {
        id: `cust_${Date.now()}`,
        fullName: fullNameInput || 'Verified Customer',
        aadharNumber: aadharInput,
        panNumber: panInput,
        phone: phoneClean || SHOP_INFO.phone,
        email: 'customer@nsloan.in',
        address: 'Chanchal, Malda, West Bengal',
        dateOfBirth: '1992-05-14',
        isVerified: true,
      };

      setIsLoading(false);
      onLoginSuccess(customerToLogin);
      onClose();
    }, 450);
  };

  const handleSelectDemo = (demo: CustomerUser) => {
    setAadharInput(demo.aadharNumber);
    setPanInput(demo.panNumber);
    setPhoneInput(demo.phone);
    setFullNameInput(demo.fullName);
    setErrorMsg(null);
    setSuccessMsg(`Selected demo profile: ${demo.fullName}`);
  };

  const handleDirectDemoLogin = (demo: CustomerUser) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(demo);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* REALISTIC FLOATING SIMULATED SMS NOTIFICATION TOAST */}
      {smsToast && smsToast.visible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 w-full max-w-md px-3 animate-bounce">
          <div className="bg-slate-900 border-2 border-emerald-500/90 rounded-2xl p-4 shadow-2xl text-white shadow-emerald-500/30 flex items-start gap-3">
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
                  SMS from {smsToast.sender}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">{smsToast.time}</span>
              </div>
              <p className="text-xs text-slate-200 leading-snug">
                {smsToast.type === 'aadhar' ? (
                  <>
                    [UIDAI] Your Aadhaar verification OTP is{' '}
                    <strong className="text-amber-300 font-mono text-base underline tracking-wider">
                      {smsToast.code}
                    </strong>
                    {' '}for NS LOAN & FINANCE authentication. Do not share. Valid for 10 min.
                  </>
                ) : (
                  <>
                    [VK-NSLOAN] Your OTP for mobile login is{' '}
                    <strong className="text-emerald-300 font-mono text-base underline tracking-wider">
                      {smsToast.code}
                    </strong>
                    . PhonePe: {SHOP_INFO.phonePeNumber}, Bank A/C: {SHOP_INFO.bankDetails.accountNumber}.
                  </>
                )}
              </p>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleAutoFillOtp(smsToast.code)}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-fill OTP ({smsToast.code})</span>
                </button>
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

      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official Customer Portal
              </span>
              <span className="text-[10px] text-slate-400 font-mono">UIDAI & NSDL 256-Bit</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Customer Secure Login
            </h3>
          </div>
        </div>

        {/* Official Bank Account & PhonePe Trust Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
            <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              North East Small Finance Bank (NESFB)
            </span>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">
              IFSC: {SHOP_INFO.bankDetails.ifscCode}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-mono text-[11px]">
              A/C: <strong className="text-white text-xs">{SHOP_INFO.bankDetails.accountNumber}</strong>
            </span>
            <span className="text-purple-300 font-mono text-[11px] font-bold flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-purple-600 text-[9px] text-white inline-flex items-center justify-center">पे</span>
              PhonePe: {SHOP_INFO.phonePeNumber}
            </span>
          </div>
        </div>

        {/* 3 LOGIN TABS: Aadhaar OTP | Mobile OTP | Aadhaar + PAN */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('aadhar-otp');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'aadhar-otp'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Aadhaar OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('mobile-otp');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'mobile-otp'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('aadhaar-pan');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'aadhaar-pan'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Aadhaar + PAN</span>
          </button>
        </div>

        {/* TAB 1: AADHAAR CARD OTP LOGIN ("aadhar OTP send me") */}
        {activeTab === 'aadhar-otp' && (
          <form onSubmit={handleVerifyAadharOtpLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                  Customer 12-Digit Aadhaar Card Number
                </label>
                {aadharValid ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Aadhaar
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">12 digits (UIDAI)</span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={14}
                  value={aadharInput}
                  onChange={handleAadharChange}
                  placeholder="5849 2039 1847"
                  required
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-hidden focus:border-amber-400 transition-colors"
                />

                <button
                  type="button"
                  onClick={handleSendAadharOtp}
                  disabled={!aadharValid || isSendingOtp || countdown > 0}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  {isSendingOtp ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {countdown > 0 ? `Resend (${countdown}s)` : 'Send Aadhaar OTP'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                OTP will be sent to mobile linked with Aadhaar. Real SMS simulation enabled.
              </p>
            </div>

            {/* OTP Entry Section */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Enter 6-Digit Aadhaar Verification OTP
                </label>
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => handleAutoFillOtp(otpCode)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-fill ({otpCode})</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP (e.g. 786455)"
                  required
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-center text-lg font-black tracking-widest focus:outline-hidden focus:border-amber-400"
                />

                {otpSent && (
                  <button
                    type="button"
                    onClick={() => handleCopyOtp(otpCode)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                    title="Copy OTP"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {!otpSent && (
                <div className="text-[11px] text-amber-300/80 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Click <strong>"Send Aadhaar OTP"</strong> above to receive your 6-digit verification code.</span>
                </div>
              )}
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !aadharValid}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Aadhaar e-KYC...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Verify Aadhaar & Download / Print Full File</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: MOBILE NUMBER OTP LOGIN */}
        {activeTab === 'mobile-otp' && (
          <form onSubmit={handleVerifyMobileOtpLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  Customer 10-Digit Mobile Number
                </label>
                {phoneValid ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Indian Mobile
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">10 digits</span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value.replace(/\D/g, ''));
                      setErrorMsg(null);
                    }}
                    placeholder="9332504150"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-hidden focus:border-emerald-400 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSendMobileOtp(phoneInput)}
                  disabled={!phoneValid || isSendingOtp || countdown > 0}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                >
                  {isSendingOtp ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {countdown > 0 ? `Resend (${countdown}s)` : 'Send OTP'}
                  </span>
                </button>
              </div>
            </div>

            {/* OTP Entry Section */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Enter 6-Digit Mobile SMS OTP
                </label>
                {otpSent && (
                  <button
                    type="button"
                    onClick={() => handleAutoFillOtp(otpCode)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-fill ({otpCode})</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP (e.g. 482910)"
                  required
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-center text-lg font-black tracking-widest focus:outline-hidden focus:border-emerald-400"
                />

                {otpSent && (
                  <button
                    type="button"
                    onClick={() => handleCopyOtp(otpCode)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {!otpSent && (
                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Click <strong>"Send OTP"</strong> above to dispatch SMS to your phone.</span>
                </div>
              )}
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !phoneValid}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Mobile OTP...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Verify OTP & Open Dashboard</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: AADHAAR + PAN KYC LOGIN */}
        {activeTab === 'aadhaar-pan' && (
          <form onSubmit={handleAadhaarPanLogin} className="space-y-4">
            {/* Aadhaar Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Customer Aadhaar Card Number
                </label>
                {aadharValid && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid (12 Digits)
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={14}
                value={aadharInput}
                onChange={handleAadharChange}
                placeholder="5849 2039 1847"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm tracking-wider focus:outline-hidden focus:border-emerald-400"
              />
            </div>

            {/* PAN Card Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Customer PAN Number (Permanent Account Number)
                </label>
                {panValid && (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid NSDL PAN
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={10}
                value={panInput}
                onChange={handlePanChange}
                placeholder="ABCPR1294F"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono uppercase text-sm tracking-wider focus:outline-hidden focus:border-cyan-400"
              />
            </div>

            {/* Aadhaar OTP trigger in Tab 3 */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">
                  Step 2: Authenticate Aadhaar OTP
                </span>
                <button
                  type="button"
                  onClick={handleSendAadharOtp}
                  disabled={!aadharValid || countdown > 0}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{countdown > 0 ? `Sent (${countdown}s)` : 'Send Aadhaar OTP'}</span>
                </button>
              </div>

              {otpSent && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder={`Enter OTP (${otpCode})`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-center text-sm font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoFillOtp(otpCode)}
                    className="px-2.5 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !aadharValid || !panValid}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying e-KYC Records...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Login with Verified Aadhaar & PAN</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* DEMO ACCOUNTS FOR INSTANT 1-CLICK TESTING */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Demo Verified Profiles
            </span>
            <span className="text-[10px] text-slate-500">Tap to load / login</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEMO_CUSTOMERS.map((cust) => (
              <div
                key={cust.id}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate">
                      {cust.fullName}
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                      KYC ✓
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-400 mt-1">
                    AADHAAR: {cust.aadharNumber.slice(-4)}
                  </div>
                  <div className="font-mono text-[10px] text-purple-300">
                    Phone: {cust.phone}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectDemo(cust)}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold cursor-pointer"
                  >
                    Prefill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectDemoLogin(cust)}
                    className="flex-1 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
