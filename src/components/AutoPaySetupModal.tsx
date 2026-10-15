import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Lock,
  X,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CurrencyConfig, ActiveLoan, CustomerUser } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { SHOP_INFO } from '../data/loanProducts';

export interface AutoPayDetails {
  isEnabled: boolean;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  accountHolder: string;
  deductionDay: number;
  mandateLimit: number;
  mandateType: 'UPI_AUTOPAY' | 'ENACH_NETBANKING' | 'DEBIT_CARD';
  mandateId: string;
  status: 'ACTIVE' | 'PAUSED' | 'NOT_CONFIGURED';
  nextDeductionDate: string;
  activatedAt?: string;
}

interface AutoPaySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoan?: ActiveLoan | null;
  customer: CustomerUser;
  selectedCurrency: CurrencyConfig;
  currentConfig?: AutoPayDetails | null;
  onSave: (config: AutoPayDetails) => void;
}

const POPULAR_BANKS = [
  { name: 'State Bank of India', ifsc: 'SBIN0001429', defaultAcc: '•••• •••• 4910' },
  { name: 'HDFC Bank', ifsc: 'HDFC0000128', defaultAcc: '•••• •••• 8291' },
  { name: 'Punjab National Bank', ifsc: 'PUNB0182400', defaultAcc: '•••• •••• 3192' },
  { name: 'Axis Bank', ifsc: 'UTIB0000412', defaultAcc: '•••• •••• 7719' },
  { name: 'Bank of Baroda', ifsc: 'BARB0CHANCH', defaultAcc: '•••• •••• 6502' },
];

export const AutoPaySetupModal: React.FC<AutoPaySetupModalProps> = ({
  isOpen,
  onClose,
  selectedLoan,
  customer,
  selectedCurrency,
  currentConfig,
  onSave,
}) => {
  const [selectedBank, setSelectedBank] = useState<string>(
    currentConfig?.bankName || POPULAR_BANKS[0].name
  );
  const [accountNumber, setAccountNumber] = useState<string>(
    currentConfig?.accountNumberMasked || POPULAR_BANKS[0].defaultAcc
  );
  const [ifscCode, setIfscCode] = useState<string>(
    currentConfig?.ifscCode || POPULAR_BANKS[0].ifsc
  );
  const [mandateType, setMandateType] = useState<'UPI_AUTOPAY' | 'ENACH_NETBANKING' | 'DEBIT_CARD'>(
    currentConfig?.mandateType || 'UPI_AUTOPAY'
  );
  const [deductionDay, setDeductionDay] = useState<number>(currentConfig?.deductionDay || 5);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [step, setStep] = useState<'SETUP' | 'VERIFYING' | 'SUCCESS'>('SETUP');

  if (!isOpen) return null;

  const emiAmount = selectedLoan?.monthlyEmi || 1250;
  const mandateLimit = Math.max(5000, emiAmount * 2);

  const handleBankChange = (bankName: string) => {
    setSelectedBank(bankName);
    const bank = POPULAR_BANKS.find((b) => b.name === bankName);
    if (bank) {
      setIfscCode(bank.ifsc);
      setAccountNumber(bank.defaultAcc);
    }
  };

  const handleAuthorize = () => {
    if (!agreedToTerms) return;
    setStep('VERIFYING');
    setIsAuthorizing(true);

    setTimeout(() => {
      setIsAuthorizing(false);
      setStep('SUCCESS');

      try {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#6EE7B7'],
        });
      } catch {
        // confetti optional
      }

      const newConfig: AutoPayDetails = {
        isEnabled: true,
        bankName: selectedBank,
        accountNumberMasked: accountNumber,
        ifscCode: ifscCode,
        accountHolder: customer.fullName,
        deductionDay,
        mandateLimit,
        mandateType,
        mandateId: `UMRN-NSF-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'ACTIVE',
        nextDeductionDate: selectedLoan?.nextDueDate || 'Nov 05, 2026',
        activatedAt: new Date().toLocaleDateString('en-GB'),
      };

      setTimeout(() => {
        onSave(newConfig);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative text-white space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white">Set Up Auto-Pay</h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  e-MANDATE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Automated monthly EMI deduction from linked bank account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {step === 'VERIFYING' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
            <h4 className="text-sm font-black text-white">Authorizing Bank Mandate...</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Communicating with NPCI & {selectedBank} for automated debit registration.
            </p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-base font-black text-white">Auto-Pay Activated Successfully!</h4>
            <p className="text-xs text-emerald-300">
              Recurring EMI of {formatCurrency(emiAmount, selectedCurrency)} will be automatically debited on the {deductionDay}th of each month from {selectedBank}.
            </p>
          </div>
        )}

        {step === 'SETUP' && (
          <>
            {/* Target Loan Summary Card */}
            {selectedLoan && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Target Loan Account
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {selectedLoan.productName} ({selectedLoan.accountNumber})
                  </span>
                  <span className="text-[10px] text-amber-300 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    Next Due: {selectedLoan.nextDueDate}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Monthly EMI
                  </span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {formatCurrency(emiAmount, selectedCurrency)}
                  </span>
                </div>
              </div>
            )}

            {/* Bank Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>Select Bank Account for Auto-Debit:</span>
              </label>
              <select
                value={selectedBank}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-emerald-400 cursor-pointer"
              >
                {POPULAR_BANKS.map((bank) => (
                  <option key={bank.name} value={bank.name} className="bg-slate-900 text-white">
                    {bank.name} ({bank.defaultAcc})
                  </option>
                ))}
              </select>
            </div>

            {/* Account Details Box */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  Account Number
                </span>
                <span className="font-mono font-bold text-slate-200 mt-0.5 block">
                  {accountNumber}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  IFSC Code
                </span>
                <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
                  {ifscCode}
                </span>
              </div>
            </div>

            {/* Mandate Channel Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block">
                Authorization Method:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI_AUTOPAY', label: 'PhonePe UPI', icon: Zap },
                  { id: 'ENACH_NETBANKING', label: 'e-NACH', icon: Building },
                  { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMandateType(item.id as typeof mandateType)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        mandateType === item.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recurring Schedule Parameters */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Monthly Deduction Date</span>
                <span className="font-mono font-bold text-white">
                  {deductionDay}th of every month
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Monthly Debit Amount</span>
                <span className="font-mono font-black text-emerald-400">
                  {formatCurrency(emiAmount, selectedCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-400">NPCI Mandate Cap Limit</span>
                <span className="font-mono text-slate-300">
                  {formatCurrency(mandateLimit, selectedCurrency)} max
                </span>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-300">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-emerald-500 cursor-pointer"
              />
              <span>
                I authorize <strong>{SHOP_INFO.name}</strong> to debit my {selectedBank} account for monthly EMI repayments on the {deductionDay}th of each month. I understand I can pause or cancel auto-pay anytime.
              </span>
            </label>

            {/* Authorize Button */}
            <button
              type="button"
              onClick={handleAuthorize}
              disabled={!agreedToTerms || isAuthorizing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authorize Auto-Pay & Confirm Mandate</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
