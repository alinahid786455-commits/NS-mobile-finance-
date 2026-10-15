import React from 'react';
import { CurrencyCode, CurrencyConfig, CustomerUser } from '../types/loan';
import { CURRENCIES } from '../data/loanProducts';
import { maskAadhaar } from '../data/customerData';
import {
  ShieldCheck,
  Calculator,
  FileText,
  Search,
  Wallet,
  Bot,
  Zap,
  Globe,
  Users,
  UserCheck,
  User,
  Lock,
  Scale,
  Smartphone,
  Megaphone,
} from 'lucide-react';

interface LoanNavbarProps {
  activeTab: 'apply' | 'calculator' | 'compare' | 'track' | 'my-loans' | 'admin' | 'customer-app' | 'publisher' | 'playstore';
  onSelectTab: (tab: 'apply' | 'calculator' | 'compare' | 'track' | 'my-loans' | 'admin' | 'customer-app' | 'publisher' | 'playstore') => void;
  selectedCurrency: CurrencyConfig;
  onChangeCurrency: (code: CurrencyCode) => void;
  onOpenAiAdvisor: () => void;
  onOpenShopContact?: () => void;
  currentCustomer?: CustomerUser | null;
  onOpenCustomerLogin: () => void;
}

export const LoanNavbar: React.FC<LoanNavbarProps> = ({
  activeTab,
  onSelectTab,
  selectedCurrency,
  onChangeCurrency,
  onOpenAiAdvisor,
  onOpenShopContact,
  currentCustomer,
  onOpenCustomerLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('apply')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-xl">
            NS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white">
                N.S. <span className="text-emerald-400">LOAN</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Finance
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Fast, Fair & Transparent Digital Lending
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => onSelectTab('apply')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Apply For Loan
          </button>

          <button
            onClick={() => onSelectTab('calculator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            EMI Calculator
          </button>

          <button
            onClick={() => onSelectTab('compare')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'compare'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Compare Loans
          </button>

          <button
            onClick={() => onSelectTab('track')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'track'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Track Status
          </button>

          <button
            onClick={() => onSelectTab('my-loans')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my-loans'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            Repayment Portal
          </button>

          <button
            onClick={() => onSelectTab('customer-app')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'customer-app'
                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 text-white shadow-md shadow-purple-500/20'
                : 'text-purple-300 hover:text-white hover:bg-purple-900/30 border border-purple-500/30'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Customer App</span>
          </button>

          <button
            onClick={() => onSelectTab('playstore')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'playstore'
                ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                : 'text-teal-300 hover:text-white hover:bg-teal-900/30 border border-teal-500/30'
            }`}
            title="Official Google Play Store Public Listing & Download"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512">
              <path fill="#00C1A6" d="M325.3 234.3L10.7 41.6C4.4 45.4 0 52.3 0 60.8v390.4c0 8.5 4.4 15.4 10.7 19.2l314.6-192.8c4.6-2.8 7.3-7.5 7.3-12.8s-2.7-10-7.3-10.5z" />
              <path fill="#0083D6" d="M10.7 41.6L325.3 234.3l94-57.6L67.1 7.4c-18.4-11.2-41.2-2.5-56.4 34.2z" />
              <path fill="#FF3333" d="M10.7 470.4c15.2 36.7 38 45.4 56.4 34.2l352.2-215.7-94-57.6L10.7 470.4z" />
              <path fill="#FFBA00" d="M504.6 245.2l-85.3-52.2-94 57.6 94 57.6 85.3-52.2c10.3-6.3 10.3-16.5 0-22.8z" />
            </svg>
            <span>Play Store</span>
            <span className="text-[9px] bg-teal-400/20 text-teal-300 px-1 py-0.2 rounded font-black border border-teal-400/30">
              PUBLIC
            </span>
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Officer Desk
          </button>

          <button
            onClick={() => onSelectTab('publisher')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'publisher'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
            }`}
            title="Digital Publishing & Notice Broadcast Bureau"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Publisher</span>
            <span className="text-[9px] bg-amber-500/30 text-amber-200 px-1 py-0.2 rounded font-black">
              📢
            </span>
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={selectedCurrency.code}
              onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {Object.values(CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code} className="bg-slate-900 text-white">
                  {curr.symbol} {curr.code}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Login / User Profile Button */}
          {currentCustomer ? (
            <button
              onClick={() => onSelectTab('my-loans')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
              title={`Logged in as ${currentCustomer.fullName} • Click to open Borrower Portal`}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {currentCustomer.fullName.charAt(0)}
              </div>
              <span className="hidden sm:inline font-bold">
                {currentCustomer.fullName.split(' ')[0]}
              </span>
              <span className="hidden md:inline text-[10px] font-mono text-emerald-400">
                ({maskAadhaar(currentCustomer.aadharNumber).slice(-4)})
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenCustomerLogin}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              title="Customer Login with Aadhaar Card & PAN Number"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customer Login</span>
            </button>
          )}

          {/* Shop Contact & PhonePe Button */}
          {onOpenShopContact && (
            <button
              onClick={onOpenShopContact}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all cursor-pointer"
              title="NS MOBILE Shop Contact & PhonePe Info"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Contact & PhonePe</span>
            </button>
          )}

          {/* AI Loan Advisor Button */}
          <button
            onClick={onOpenAiAdvisor}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
            title="Ask AI Loan Consultant"
          >
            <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">AI Advisor</span>
          </button>

          {/* Quick Apply button for mobile */}
          <button
            onClick={() => onSelectTab('apply')}
            className="lg:hidden p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
            title="Apply Now"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/90 py-2 px-1 text-[11px] overflow-x-auto">
        <button
          onClick={() => onSelectTab('apply')}
          className={`px-2.5 py-1 rounded-lg font-bold ${activeTab === 'apply' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'}`}
        >
          Apply
        </button>
        <button
          onClick={() => onSelectTab('calculator')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 ${activeTab === 'calculator' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'}`}
        >
          EMI Calc
        </button>
        <button
          onClick={() => onSelectTab('compare')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 ${activeTab === 'compare' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'}`}
        >
          Compare
        </button>
        <button
          onClick={() => onSelectTab('track')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 ${activeTab === 'track' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'}`}
        >
          Track Status
        </button>
        <button
          onClick={() => onSelectTab('my-loans')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 ${activeTab === 'my-loans' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'}`}
        >
          My Loans
        </button>
        <button
          onClick={() => onSelectTab('customer-app')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 ${activeTab === 'customer-app' ? 'text-purple-300 bg-purple-950 border border-purple-500/40' : 'text-purple-400'}`}
        >
          <Smartphone className="w-3 h-3" />
          <span>App</span>
        </button>
        <button
          onClick={() => onSelectTab('playstore')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 ${activeTab === 'playstore' ? 'text-teal-300 bg-teal-950 border border-teal-500/40' : 'text-teal-400'}`}
        >
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 512 512">
            <path fill="#00C1A6" d="M325.3 234.3L10.7 41.6C4.4 45.4 0 52.3 0 60.8v390.4c0 8.5 4.4 15.4 10.7 19.2l314.6-192.8c4.6-2.8 7.3-7.5 7.3-12.8s-2.7-10-7.3-10.5z" />
            <path fill="#0083D6" d="M10.7 41.6L325.3 234.3l94-57.6L67.1 7.4c-18.4-11.2-41.2-2.5-56.4 34.2z" />
            <path fill="#FF3333" d="M10.7 470.4c15.2 36.7 38 45.4 56.4 34.2l352.2-215.7-94-57.6L10.7 470.4z" />
            <path fill="#FFBA00" d="M504.6 245.2l-85.3-52.2-94 57.6 94 57.6 85.3-52.2c10.3-6.3 10.3-16.5 0-22.8z" />
          </svg>
          <span>Play Store</span>
        </button>
        <button
          onClick={() => onSelectTab('admin')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 ${activeTab === 'admin' ? 'text-emerald-400 bg-slate-900' : 'text-slate-400'}`}
        >
          Officer Desk
        </button>
        <button
          onClick={() => onSelectTab('publisher')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 flex items-center gap-1 ${activeTab === 'publisher' ? 'text-amber-300 bg-amber-950 border border-amber-500/40' : 'text-amber-400'}`}
        >
          <Megaphone className="w-3 h-3" />
          <span>Publisher</span>
        </button>
      </div>
    </header>
  );
};
