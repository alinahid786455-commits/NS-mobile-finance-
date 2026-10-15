import React, { useState, useEffect } from 'react';
import {
  CurrencyConfig,
  LoanCategory,
  LoanProduct,
  LoanApplication,
  CustomerUser,
} from '../types/loan';
import { LOAN_PRODUCTS } from '../data/loanProducts';
import { calculateEmi, formatCurrency } from '../utils/calculator';
import { formatAadhaar, formatPan, isValidAadhaar, isValidPan } from '../data/customerData';
import {
  DocumentVerificationSection,
  VerifiedDocument,
} from './DocumentVerificationSection';
import { SanctionCertificateModal } from './SanctionCertificateModal';
import confetti from 'canvas-confetti';
import {
  User,
  Briefcase,
  FileText,
  UploadCloud,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Download,
  Award,
  Sparkles,
  CreditCard,
  UserCheck,
  PartyPopper,
} from 'lucide-react';

interface LoanApplicationFormProps {
  selectedCurrency: CurrencyConfig;
  initialProduct?: LoanProduct;
  initialAmount?: number;
  initialTenure?: number;
  onSubmitSuccess: (newApp: LoanApplication) => void;
  onGoToTracker: (appId: string) => void;
  currentCustomer?: CustomerUser | null;
}

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  selectedCurrency,
  initialProduct = LOAN_PRODUCTS[0],
  initialAmount = 15000,
  initialTenure = 24,
  onSubmitSuccess,
  onGoToTracker,
  currentCustomer,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Personal
  const [fullName, setFullName] = useState(currentCustomer?.fullName || 'Tariq Rahman');
  const [email, setEmail] = useState(currentCustomer?.email || 'tariq.rahman@email.com');
  const [phone, setPhone] = useState(currentCustomer?.phone || '9332504150');
  const [aadharNumber, setAadharNumber] = useState(currentCustomer?.aadharNumber || '5849 2039 1847');
  const [panNumber, setPanNumber] = useState(currentCustomer?.panNumber || 'ABCPR1294F');
  const [nid, setNid] = useState('19942691234500912');
  const [dob, setDob] = useState(currentCustomer?.dateOfBirth || '1992-05-14');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState(currentCustomer?.address || 'Chanchal State, Garage er Samne, Malda, West Bengal');

  // Step 2: Employment & Income
  const [employmentType, setEmploymentType] = useState<
    'Salaried' | 'Self-Employed' | 'Business Owner' | 'Freelancer'
  >('Salaried');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(2500);
  const [companyName, setCompanyName] = useState('Apex Technologies Ltd.');
  const [workExperience, setWorkExperience] = useState<number>(4);
  const [existingEmi, setExistingEmi] = useState<number>(200);

  // Step 3: Loan Details
  const [selectedCategory, setSelectedCategory] = useState<LoanCategory>(initialProduct.category);
  const [requestedAmount, setRequestedAmount] = useState<number>(initialAmount);
  const [tenureMonths, setTenureMonths] = useState<number>(initialTenure);
  const [purpose, setPurpose] = useState('Home Renovation & Family Expenses');

  // Step 4: Documents (Simulated)
  const [verifiedDocs, setVerifiedDocs] = useState<VerifiedDocument[]>([]);
  const [allRequiredDocsVerified, setAllRequiredDocsVerified] = useState<boolean>(true);

  // Submission / AI Evaluation state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedApplication, setCompletedApplication] = useState<LoanApplication | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [aiRemarks, setAiRemarks] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active product details
  const activeProduct =
    LOAN_PRODUCTS.find((p) => p.category === selectedCategory) || LOAN_PRODUCTS[0];

  const estimatedEmi = calculateEmi(requestedAmount, activeProduct.interestRate, tenureMonths);

  // Confetti celebratory animation for immediate positive feedback on submission
  const triggerSuccessConfetti = () => {
    try {
      // 1. Primary high-energy burst
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10b981', '#34d399', '#06b6d4', '#f59e0b', '#3b82f6', '#ffffff'],
        zIndex: 9999,
      });

      // 2. Dual side cannons for cinematic celebratory atmosphere
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.08, y: 0.6 },
          colors: ['#10b981', '#34d399', '#fbbf24', '#ffffff'],
          zIndex: 9999,
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.92, y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#fbbf24', '#ffffff'],
          zIndex: 9999,
        });
      }, 220);

      // 3. Falling gold and emerald cascade
      setTimeout(() => {
        confetti({
          particleCount: 45,
          spread: 100,
          decay: 0.92,
          scalar: 1.15,
          origin: { y: 0.35 },
          colors: ['#fbbf24', '#10b981', '#38bdf8', '#a855f7'],
          zIndex: 9999,
        });
      }, 480);
    } catch (err) {
      console.warn('Confetti trigger skipped:', err);
    }
  };

  // Trigger celebratory confetti animation whenever loan application reaches approval step
  useEffect(() => {
    if (currentStep === 5 && completedApplication) {
      triggerSuccessConfetti();
    }
  }, [currentStep, completedApplication]);

  // Handle Form Submission with AI Underwriting Appraisal
  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const generatedAppId = `NS-LN-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const response = await fetch('/api/assess-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          monthlyIncome,
          employmentType,
          requestedAmount,
          tenureMonths,
          existingEmi,
          loanCategory: selectedCategory,
          currencySymbol: selectedCurrency.symbol,
        }),
      });

      let evaluation = {
        decision: 'APPROVED',
        creditScore: 755,
        dtiPercentage: 26,
        underwriterRemarks: 'Excellent debt service ratio and consistent employment record.',
      };

      if (response.ok) {
        evaluation = await response.json();
      }

      const totalInterest = Math.max(0, estimatedEmi * tenureMonths - requestedAmount);

      const newApplication: LoanApplication = {
        id: generatedAppId,
        fullName,
        email,
        phone,
        nidOrPassport: aadharNumber || nid,
        aadharNumber,
        panNumber,
        dateOfBirth: dob,
        gender,
        address,
        employmentType,
        monthlyIncome,
        companyName,
        workExperienceYears: workExperience,
        existingMonthlyEmi: existingEmi,
        loanCategory: selectedCategory,
        requestedAmount,
        tenureMonths,
        purpose,
        currency: selectedCurrency.code,
        interestRate: activeProduct.interestRate,
        monthlyEmi: estimatedEmi,
        totalInterest,
        totalPayable: estimatedEmi * tenureMonths,
        creditScore: evaluation.creditScore || 740,
        dtiPercentage: evaluation.dtiPercentage || 30,
        status: evaluation.decision === 'APPROVED' ? 'APPROVED' : 'VERIFYING',
        appliedDate: new Date().toISOString().split('T')[0],
        remarks: evaluation.underwriterRemarks || 'Pre-approved subject to final signature.',
      };

      setCompletedApplication(newApplication);
      setAiRemarks(newApplication.remarks);
      onSubmitSuccess(newApplication);
      setCurrentStep(5);
      triggerSuccessConfetti();
    } catch (err: any) {
      console.warn('AI Assessment fallback triggered:', err);
      // Create valid application even if offline
      const newApplication: LoanApplication = {
        id: generatedAppId,
        fullName,
        email,
        phone,
        nidOrPassport: nid,
        dateOfBirth: dob,
        gender,
        address,
        employmentType,
        monthlyIncome,
        companyName,
        workExperienceYears: workExperience,
        existingMonthlyEmi: existingEmi,
        loanCategory: selectedCategory,
        requestedAmount,
        tenureMonths,
        purpose,
        currency: selectedCurrency.code,
        interestRate: activeProduct.interestRate,
        monthlyEmi: estimatedEmi,
        totalInterest: Math.max(0, estimatedEmi * tenureMonths - requestedAmount),
        totalPayable: estimatedEmi * tenureMonths,
        creditScore: 730,
        dtiPercentage: 32,
        status: 'APPROVED',
        appliedDate: new Date().toISOString().split('T')[0],
        remarks: 'Pre-sanctioned based on applicant credit appraisal criteria.',
      };
      setCompletedApplication(newApplication);
      onSubmitSuccess(newApplication);
      setCurrentStep(5);
      triggerSuccessConfetti();
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Employment' },
    { num: 3, label: 'Loan Customization' },
    { num: 4, label: 'KYC Documents' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Step Tracker Header */}
      {currentStep <= 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-4">
            {stepsList.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === s.num
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                        : currentStep > s.num
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {currentStep > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1 hidden sm:block ${
                      currentStep === s.num ? 'text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                      currentStep > s.num ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: Personal Profile */}
      {currentStep === 1 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <User className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">Step 1: Personal Profile</h3>
              <p className="text-xs text-slate-400">
                Please provide official identity information matching your government ID.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone / Mobile Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400 font-mono"
                placeholder="+880 1712 000000"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer Aadhaar Card (12 Digits) *</span>
                </label>
                {isValidAadhaar(aadharNumber) && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    ✓ UIDAI Valid
                  </span>
                )}
              </div>
              <input
                type="text"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(formatAadhaar(e.target.value))}
                maxLength={14}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400 font-mono tracking-wider"
                placeholder="XXXX XXXX XXXX"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Customer PAN Number (10 Chars) *</span>
                </label>
                {isValidPan(panNumber) && (
                  <span className="text-[10px] text-teal-300 font-bold bg-teal-500/10 px-1.5 py-0.2 rounded border border-teal-500/30">
                    ✓ PAN Valid
                  </span>
                )}
              </div>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(formatPan(e.target.value))}
                maxLength={10}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400 font-mono uppercase tracking-wider"
                placeholder="e.g. ABCPR1294F"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                National ID / Passport Number
              </label>
              <input
                type="text"
                value={nid}
                onChange={(e) => setNid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400 font-mono"
                placeholder="Alternative government ID"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Residential Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-400"
                placeholder="Street address, city, postal code"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              Next: Employment & Income
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Employment & Income */}
      {currentStep === 2 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <Briefcase className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">Step 2: Employment & Finances</h3>
              <p className="text-xs text-slate-400">
                Income details help N.S. Finance calibrate your maximum eligible credit limit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-cyan-400"
              >
                <option value="Salaried">Salaried (Full-Time)</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Self-Employed">Self-Employed Professional</option>
                <option value="Freelancer">Freelancer / Independent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Net Take-Home Income ({selectedCurrency.symbol}) *
              </label>
              <input
                type="number"
                min="300"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employer / Business Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-cyan-400"
                placeholder="Company or organization"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Work Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={workExperience}
                onChange={(e) => setWorkExperience(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Existing Monthly Loan Commitments / Other EMIs ({selectedCurrency.symbol})
              </label>
              <input
                type="number"
                min="0"
                value={existingEmi}
                onChange={(e) => setExistingEmi(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-cyan-400 font-mono"
                placeholder="0 if you have no current active loans"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Used to calculate your Debt-to-Income (DTI) ratio.
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              Next: Loan Customization
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Loan Customization */}
      {currentStep === 3 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">Step 3: Loan Customization</h3>
              <p className="text-xs text-slate-400">
                Select your loan product, amount, and comfortable repayment period.
              </p>
            </div>
          </div>

          {/* Loan Category Selector */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Loan Product
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {LOAN_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(prod.category);
                    setRequestedAmount(prod.defaultAmount);
                    setTenureMonths(prod.defaultTenureMonths);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedCategory === prod.category
                      ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">{prod.title}</div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-1">
                    {prod.interestRate}% APR
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Slider */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300">
                Requested Principal Amount
              </label>
              <span className="text-emerald-400 font-black font-mono text-lg">
                {formatCurrency(requestedAmount, selectedCurrency)}
              </span>
            </div>
            <input
              type="range"
              min={activeProduct.minAmount}
              max={activeProduct.maxAmount}
              step="500"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>Min: {formatCurrency(activeProduct.minAmount, selectedCurrency)}</span>
              <span>Max: {formatCurrency(activeProduct.maxAmount, selectedCurrency)}</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300">
                Repayment Tenure
              </label>
              <span className="text-amber-400 font-black font-mono text-lg">
                {tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} Years)
              </span>
            </div>
            <input
              type="range"
              min={activeProduct.minTenureMonths}
              max={activeProduct.maxTenureMonths}
              step="3"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Purpose of Loan */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Primary Purpose of Loan *
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-amber-400"
              placeholder="e.g. Wedding, Business inventory, Home renovation, Medical treatment"
            />
          </div>

          {/* Real-time Calculation Summary box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Estimated Monthly EMI
              </div>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                {formatCurrency(estimatedEmi, selectedCurrency)} / mo
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              <div>Interest: {activeProduct.interestRate}%</div>
              <div>Fee: {activeProduct.processingFeePercent}%</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              Next: KYC Documents
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: KYC & Uploads */}
      {currentStep === 4 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-3 rounded-2xl bg-teal-500/10 text-teal-400">
              <UploadCloud className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">Step 4: KYC & Document Verification Suite</h3>
              <p className="text-xs text-slate-400">
                Simulate uploading your proof of identity, proof of income, and residence documents with instant AI OCR validation.
              </p>
            </div>
          </div>

          {/* Interactive Document Verification Suite */}
          <DocumentVerificationSection
            applicantName={fullName}
            monthlyIncome={monthlyIncome}
            currencySymbol={selectedCurrency.symbol}
            onVerificationComplete={(docs, allMet) => {
              setVerifiedDocs(docs);
              setAllRequiredDocsVerified(allMet);
            }}
          />

          {/* Consent Checkbox */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 my-6 text-xs text-slate-400 leading-relaxed">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 accent-emerald-400 rounded-sm"
              />
              <span>
                I certify that the uploaded credentials and income statements are authentic. I authorize N.S. Finance to verify my credit record and proceed with digital loan sanctioning under secure banking guidelines.
              </span>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(3)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleSubmitApplication}
              disabled={isSubmitting || !allRequiredDocsVerified}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running AI Credit Appraisal...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Submit Application & Sanction
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Instant Pre-Approval & Sanction Certificate */}
      {currentStep === 5 && completedApplication && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-fadeIn text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            N.S. Finance Credit Decision
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Application Pre-Approved!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-6">
            Your application reference number is{' '}
            <strong className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded-md">
              {completedApplication.id}
            </strong>
          </p>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500">Sanctioned Amount</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {formatCurrency(completedApplication.requestedAmount, selectedCurrency)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500">Monthly EMI</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {formatCurrency(completedApplication.monthlyEmi, selectedCurrency)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500">Credit Score</div>
              <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                {completedApplication.creditScore} / 850
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500">DTI Ratio</div>
              <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                {completedApplication.dtiPercentage}%
              </div>
            </div>
          </div>

          {/* Verified Documents Checklist Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="font-bold text-slate-200">
                Verified Credentials:
              </span>
              <span className="text-slate-400">
                Government ID (OCR 99.8%) & Proof of Income (Bank Statement/Pay Slip) Authenticated
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              KYC Passed
            </span>
          </div>

          {/* Underwriter Remarks Box */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 mb-6 text-left">
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Underwriter Appraisal Remarks:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{aiRemarks || completedApplication.remarks}"
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onGoToTracker(completedApplication.id)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <ArrowRight className="w-4 h-4" />
              Track Real-Time Status
            </button>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              View Approval Sanction Certificate
            </button>

            <button
              type="button"
              onClick={triggerSuccessConfetti}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02]"
              title="Replay Celebration Confetti"
            >
              <PartyPopper className="w-4 h-4 text-amber-400 animate-bounce" />
              Celebrate! 🎉
            </button>
          </div>

          {/* Sanction Certificate Modal */}
          {showCertificateModal && (
            <SanctionCertificateModal
              application={completedApplication}
              selectedCurrency={selectedCurrency}
              onClose={() => setShowCertificateModal(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
