import React from 'react';
import { CurrencyConfig, LoanProduct } from '../types/loan';
import { LOAN_PRODUCTS, SHOP_INFO } from '../data/loanProducts';
import { formatCurrency } from '../utils/calculator';
import {
  ShieldCheck,
  Zap,
  Clock,
  Award,
  ArrowRight,
  CheckCircle2,
  Percent,
  Phone,
  MapPin,
  Smartphone,
  Scale,
  Download,
} from 'lucide-react';

interface LoanHeroProps {
  selectedCurrency: CurrencyConfig;
  onApplyProduct: (product: LoanProduct) => void;
  onOpenCalculator: () => void;
  onOpenCompare?: () => void;
  onOpenPlayStore?: () => void;
}

export const LoanHero: React.FC<LoanHeroProps> = ({
  selectedCurrency,
  onApplyProduct,
  onOpenCalculator,
  onOpenCompare,
  onOpenPlayStore,
}) => {
  return (
    <div className="w-full py-8 sm:py-12">
      {/* Hero Headline */}
      <div className="text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {SHOP_INFO.name} • Certified Lending & Device Store
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-3">
          Smart Loans & Smartphone EMI with <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            NS MOBILE & N.S. FINANCE
          </span>
        </h1>

        {/* Shop Location & Timings Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 mb-6 font-medium">
          <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Chanchal State, Garage er samne</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Open: 10:00 AM – 10:00 PM</span>
          </span>
          <a
            href={`tel:${SHOP_INFO.phone}`}
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{SHOP_INFO.formattedPhone}</span>
          </a>
          <span className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full font-bold">
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>PhonePe & India A/C Accepted</span>
          </span>
        </div>

        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
          Get mobile phones on 0% EMI or quick personal cash loans with direct payment to your Indian Bank Account or PhonePe. Same-day shop approval in 15 minutes!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto mb-10">
          <button
            onClick={() => onApplyProduct(LOAN_PRODUCTS[0])}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
          >
            Apply for Smartphone / Cash Loan
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCalculator}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm transition-all cursor-pointer"
          >
            Calculate EMI
          </button>

          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/5"
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              Compare Loans
            </button>
          )}

          {onOpenPlayStore && (
            <button
              onClick={onOpenPlayStore}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-cyan-500/15 hover:from-teal-500/25 hover:to-cyan-500/25 border border-teal-500/40 text-teal-200 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-500/10 group"
            >
              <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 512 512">
                <path fill="#00C1A6" d="M325.3 234.3L10.7 41.6C4.4 45.4 0 52.3 0 60.8v390.4c0 8.5 4.4 15.4 10.7 19.2l314.6-192.8c4.6-2.8 7.3-7.5 7.3-12.8s-2.7-10-7.3-10.5z" />
                <path fill="#0083D6" d="M10.7 41.6L325.3 234.3l94-57.6L67.1 7.4c-18.4-11.2-41.2-2.5-56.4 34.2z" />
                <path fill="#FF3333" d="M10.7 470.4c15.2 36.7 38 45.4 56.4 34.2l352.2-215.7-94-57.6L10.7 470.4z" />
                <path fill="#FFBA00" d="M504.6 245.2l-85.3-52.2-94 57.6 94 57.6 85.3-52.2c10.3-6.3 10.3-16.5 0-22.8z" />
              </svg>
              <span>Play Store App</span>
              <span className="text-[10px] bg-teal-400/20 text-teal-300 px-1.5 py-0.5 rounded font-black border border-teal-400/30">
                4.8★
              </span>
            </button>
          )}

          <a
            href="/download/NS_Mobile_Finance_v2.4.1.apk"
            download="NS_Mobile_Finance_v2.4.1.apk"
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-teal-500/30 text-teal-300 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/5"
            title="Download verified Android APK installer file"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Download APK</span>
          </a>
        </div>

        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-white">15 Min Decision</div>
              <div className="text-[11px] text-slate-400">Instant AI Underwriting</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Percent className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-white">Low 8.5% APR</div>
              <div className="text-[11px] text-slate-400">Fixed Transparent Rates</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-white">Same-Day Transfer</div>
              <div className="text-[11px] text-slate-400">Direct to Bank Account</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-white">256-Bit SSL</div>
              <div className="text-[11px] text-slate-400">Bank-Grade Privacy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Loan Products Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              N.S. Loan Categories & Financing Plans
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Choose a tailored financing solution designed for your lifestyle or business.
            </p>
          </div>
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compare Any 2 Products</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOAN_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                      {product.category} Loan
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5 group-hover:text-emerald-300 transition-colors">
                      {product.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-emerald-400">
                      {product.interestRate}% <span className="text-[10px] text-slate-400 font-normal">p.a.</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {product.tagline}
                </p>

                {/* Amount & Tenure range */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 text-xs">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Max Limit</div>
                    <div className="font-extrabold text-slate-200 mt-0.5">
                      {formatCurrency(product.maxAmount, selectedCurrency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Max Tenure</div>
                    <div className="font-extrabold text-slate-200 mt-0.5">
                      {product.maxTenureMonths} Months
                    </div>
                  </div>
                </div>

                {/* Features Checklist */}
                <ul className="space-y-1.5 mb-6 text-xs text-slate-400">
                  {product.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onApplyProduct(product)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Apply for {product.title.split(' ')[1]} Loan
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
