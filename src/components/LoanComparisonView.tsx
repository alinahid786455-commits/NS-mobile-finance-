import React, { useState, useMemo } from 'react';
import { CurrencyConfig, LoanProduct } from '../types/loan';
import { LOAN_PRODUCTS } from '../data/loanProducts';
import { calculateEmi, formatCurrency } from '../utils/calculator';
import {
  Scale,
  ArrowRight,
  ArrowLeftRight,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Percent,
  Calendar,
  Sparkles,
  Info,
  DollarSign,
  Smartphone,
  UserCheck,
  Briefcase,
  Home,
  Car,
  Zap,
  GraduationCap,
  ShieldCheck,
  Award,
} from 'lucide-react';

interface LoanComparisonViewProps {
  selectedCurrency: CurrencyConfig;
  onApplyProductWithValues: (product: LoanProduct, amount: number, tenureMonths: number) => void;
}

// Preset product pairs for quick comparison
const COMPARISON_PRESETS = [
  {
    label: '0% Smartphone EMI vs Personal Cash',
    prodA: 'mobile_device',
    prodB: 'personal',
    amount: 30000,
    tenure: 12,
  },
  {
    label: 'Personal Loan vs Emergency Cash',
    prodA: 'personal',
    prodB: 'emergency',
    amount: 15000,
    tenure: 12,
  },
  {
    label: 'Personal Loan vs Business Growth',
    prodA: 'personal',
    prodB: 'business',
    amount: 75000,
    tenure: 24,
  },
  {
    label: 'Home Loan vs Auto Loan',
    prodA: 'home',
    prodB: 'vehicle',
    amount: 60000,
    tenure: 36,
  },
];

// Helper to get matching icon for product
function getProductIcon(iconName: string) {
  switch (iconName) {
    case 'Smartphone':
      return <Smartphone className="w-5 h-5 text-purple-400" />;
    case 'UserCheck':
      return <UserCheck className="w-5 h-5 text-emerald-400" />;
    case 'Briefcase':
      return <Briefcase className="w-5 h-5 text-blue-400" />;
    case 'Home':
      return <Home className="w-5 h-5 text-amber-400" />;
    case 'Car':
      return <Car className="w-5 h-5 text-rose-400" />;
    case 'Zap':
      return <Zap className="w-5 h-5 text-yellow-400" />;
    case 'GraduationCap':
      return <GraduationCap className="w-5 h-5 text-cyan-400" />;
    default:
      return <DollarSign className="w-5 h-5 text-emerald-400" />;
  }
}

export const LoanComparisonView: React.FC<LoanComparisonViewProps> = ({
  selectedCurrency,
  onApplyProductWithValues,
}) => {
  // State: selected product IDs
  const [productAId, setProductAId] = useState<string>('mobile_device');
  const [productBId, setProductBId] = useState<string>('personal');

  // Mode: 'synced' (identical amount & tenure) vs 'independent' (separate amount & tenure)
  const [comparisonMode, setComparisonMode] = useState<'synced' | 'independent'>('synced');

  // Synced comparison parameters (in base currency INR)
  const [syncedAmount, setSyncedAmount] = useState<number>(30000);
  const [syncedTenure, setSyncedTenure] = useState<number>(12);

  // Independent parameters
  const [amountA, setAmountA] = useState<number>(30000);
  const [tenureA, setTenureA] = useState<number>(12);

  const [amountB, setAmountB] = useState<number>(30000);
  const [tenureB, setTenureB] = useState<number>(18);

  // Active product objects
  const productA = useMemo(
    () => LOAN_PRODUCTS.find((p) => p.id === productAId) || LOAN_PRODUCTS[0],
    [productAId]
  );
  const productB = useMemo(
    () => LOAN_PRODUCTS.find((p) => p.id === productBId) || LOAN_PRODUCTS[1] || LOAN_PRODUCTS[0],
    [productBId]
  );

  // Resolved values depending on mode
  const effectiveAmountA = comparisonMode === 'synced' ? syncedAmount : amountA;
  const effectiveTenureA = comparisonMode === 'synced' ? syncedTenure : tenureA;

  const effectiveAmountB = comparisonMode === 'synced' ? syncedAmount : amountB;
  const effectiveTenureB = comparisonMode === 'synced' ? syncedTenure : tenureB;

  // Financial calculations for Product A
  const emiA = useMemo(
    () => calculateEmi(effectiveAmountA, productA.interestRate, effectiveTenureA),
    [effectiveAmountA, productA.interestRate, effectiveTenureA]
  );
  const totalPaymentA = emiA * effectiveTenureA;
  const totalInterestA = Math.max(0, totalPaymentA - effectiveAmountA);
  const feeA = Math.round((effectiveAmountA * productA.processingFeePercent) / 100);
  const totalCostA = totalPaymentA + feeA;

  // Financial calculations for Product B
  const emiB = useMemo(
    () => calculateEmi(effectiveAmountB, productB.interestRate, effectiveTenureB),
    [effectiveAmountB, productB.interestRate, effectiveTenureB]
  );
  const totalPaymentB = emiB * effectiveTenureB;
  const totalInterestB = Math.max(0, totalPaymentB - effectiveAmountB);
  const feeB = Math.round((effectiveAmountB * productB.processingFeePercent) / 100);
  const totalCostB = totalPaymentB + feeB;

  // Differences
  const emiDiff = emiB - emiA; // positive means A is lower EMI than B
  const interestDiff = totalInterestB - totalInterestA; // positive means A is cheaper in interest
  const tenureDiff = effectiveTenureB - effectiveTenureA;
  const totalCostDiff = totalCostB - totalCostA;

  // Swap products A and B
  const handleSwap = () => {
    const tempId = productAId;
    setProductAId(productBId);
    setProductBId(tempId);

    if (comparisonMode === 'independent') {
      const tempAmt = amountA;
      const tempTen = tenureA;
      setAmountA(amountB);
      setTenureA(tenureB);
      setAmountB(tempAmt);
      setTenureB(tempTen);
    }
  };

  // Load a quick preset
  const handleSelectPreset = (preset: (typeof COMPARISON_PRESETS)[0]) => {
    setProductAId(preset.prodA);
    setProductBId(preset.prodB);
    setSyncedAmount(preset.amount);
    setSyncedTenure(preset.tenure);
    setAmountA(preset.amount);
    setTenureA(preset.tenure);
    setAmountB(preset.amount);
    setTenureB(preset.tenure);
  };

  // Visual bar scales
  const maxEmi = Math.max(emiA, emiB, 1);
  const barWidthA = Math.min(100, Math.max(15, Math.round((emiA / maxEmi) * 100)));
  const barWidthB = Math.min(100, Math.max(15, Math.round((emiB / maxEmi) * 100)));

  const maxInterest = Math.max(totalInterestA, totalInterestB, 1);
  const interestBarA = Math.min(100, Math.max(5, Math.round((totalInterestA / maxInterest) * 100)));
  const interestBarB = Math.min(100, Math.max(5, Math.round((totalInterestB / maxInterest) * 100)));

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Scale className="w-3.5 h-3.5 text-emerald-400" />
          Side-by-Side Product Analyzer
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Compare Loan Products Side-by-Side
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-1">
          Select any two loan options to evaluate differences in monthly installments (EMI),
          cumulative interest, total repayment expense, and repayment terms.
        </p>
      </div>

      {/* Quick Comparison Presets */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Popular Comparisons
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">Click to auto-configure</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {COMPARISON_PRESETS.map((preset, idx) => {
            const isActive =
              (productAId === preset.prodA && productBId === preset.prodB) ||
              (productAId === preset.prodB && productBId === preset.prodA);
            return (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-2.5 rounded-2xl text-left border text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <span className="truncate">{preset.label}</span>
                <ArrowRight className="w-3 h-3 shrink-0 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Toolbar: Mode selector & Global Synced Sliders */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Comparison Configuration Mode
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {comparisonMode === 'synced'
                ? 'Applies the identical loan amount and tenure to both products for an accurate interest & EMI comparison.'
                : 'Fine-tune independent loan amounts and tenures for each product separately.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center">
              <button
                onClick={() => setComparisonMode('synced')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  comparisonMode === 'synced'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Synced (Apple-to-Apple)
              </button>
              <button
                onClick={() => setComparisonMode('independent')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  comparisonMode === 'independent'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Independent Values
              </button>
            </div>

            <button
              onClick={handleSwap}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Swap Product A and Product B"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Swap A ⇄ B</span>
            </button>
          </div>
        </div>

        {/* Synced Sliders */}
        {comparisonMode === 'synced' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                  Shared Loan Amount
                </label>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-emerald-400 font-black font-mono text-xs">
                  <span>{selectedCurrency.symbol}</span>
                  <input
                    type="number"
                    min="5000"
                    max="300000"
                    step="5000"
                    value={Math.round(syncedAmount * selectedCurrency.rateMultiplier)}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setSyncedAmount(Math.round(val / selectedCurrency.rateMultiplier));
                    }}
                    className="w-24 bg-transparent text-right focus:outline-hidden text-white font-bold"
                  />
                </div>
              </div>
              <input
                type="range"
                min="5000"
                max="300000"
                step="5000"
                value={syncedAmount}
                onChange={(e) => setSyncedAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>{formatCurrency(5000, selectedCurrency)}</span>
                <span>{formatCurrency(150000, selectedCurrency)}</span>
                <span>{formatCurrency(300000, selectedCurrency)}</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                  Shared Repayment Tenure
                </label>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-emerald-400 font-black font-mono text-xs">
                  <input
                    type="number"
                    min="3"
                    max="84"
                    step="3"
                    value={syncedTenure}
                    onChange={(e) => setSyncedTenure(Number(e.target.value) || 3)}
                    className="w-12 bg-transparent text-right focus:outline-hidden text-white font-bold"
                  />
                  <span>Months ({(syncedTenure / 12).toFixed(1)} yr)</span>
                </div>
              </div>
              <input
                type="range"
                min="3"
                max="84"
                step="3"
                value={syncedTenure}
                onChange={(e) => setSyncedTenure(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>3 Mo</span>
                <span>24 Mo (2 yr)</span>
                <span>48 Mo (4 yr)</span>
                <span>84 Mo (7 yr)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 text-xs text-slate-400 text-center">
            Independent sliders are available directly inside each product column below.
          </div>
        )}
      </div>

      {/* Side-by-Side Product Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ================= Product A Column ================= */}
        <div
          className={`rounded-3xl p-6 border transition-all shadow-xl flex flex-col justify-between ${
            emiA <= emiB
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-500/5 ring-1 ring-emerald-500/20'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  A
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Option A
                </span>
              </div>
              {emiA < emiB && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                  <TrendingDown className="w-3 h-3" />
                  Lower Monthly EMI
                </span>
              )}
              {totalInterestA < totalInterestB && emiA >= emiB && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                  <Award className="w-3 h-3" />
                  Lower Total Interest
                </span>
              )}
            </div>

            {/* Product Selector Dropdown */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Select Product A
              </label>
              <div className="relative">
                <select
                  value={productAId}
                  onChange={(e) => setProductAId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-hidden focus:border-emerald-500 cursor-pointer appearance-none pr-10"
                >
                  {LOAN_PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.id} className="bg-slate-900 text-white">
                      {prod.title} ({prod.interestRate}% p.a.)
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Product Meta Header */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-5">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {getProductIcon(productA.iconName)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                  {productA.category}
                </span>
                <h4 className="text-base font-extrabold text-white mt-1">{productA.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{productA.tagline}</p>
              </div>
            </div>

            {/* Independent Sliders for Option A if in independent mode */}
            {comparisonMode === 'independent' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-4 mb-5">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400 font-bold">Loan Amount A</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(effectiveAmountA, selectedCurrency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={productA.minAmount}
                    max={productA.maxAmount}
                    step={1000}
                    value={amountA}
                    onChange={(e) => setAmountA(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400 font-bold">Tenure A</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {effectiveTenureA} Months
                    </span>
                  </div>
                  <input
                    type="range"
                    min={productA.minTenureMonths}
                    max={productA.maxTenureMonths}
                    step={1}
                    value={tenureA}
                    onChange={(e) => setTenureA(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Primary Calculated Financial Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                  <span>Monthly EMI</span>
                  <Percent className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                  {formatCurrency(emiA, selectedCurrency)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  @ {productA.interestRate}% interest rate
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                  <span>Total Interest</span>
                  <Calendar className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
                  {formatCurrency(totalInterestA, selectedCurrency)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Over {effectiveTenureA} months tenure
                </div>
              </div>
            </div>

            {/* Detailed Financial Breakdown List */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 mb-5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Principal Requested</span>
                <span className="font-bold text-slate-200 font-mono">
                  {formatCurrency(effectiveAmountA, selectedCurrency)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Repayment Tenure</span>
                <span className="font-bold text-slate-200 font-mono">
                  {effectiveTenureA} Months ({(effectiveTenureA / 12).toFixed(1)} yrs)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Processing Fee ({productA.processingFeePercent}%)</span>
                <span className="font-bold text-slate-200 font-mono">
                  {formatCurrency(feeA, selectedCurrency)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 pt-2 font-bold">
                <span className="text-white">Total Outflow (Payable)</span>
                <span className="text-emerald-400 font-mono text-sm">
                  {formatCurrency(totalCostA, selectedCurrency)}
                </span>
              </div>
            </div>

            {/* Features Checklist */}
            <div className="mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Included Features
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {productA.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTA */}
          <button
            onClick={() => onApplyProductWithValues(productA, effectiveAmountA, effectiveTenureA)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            Apply for {productA.title}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ================= Product B Column ================= */}
        <div
          className={`rounded-3xl p-6 border transition-all shadow-xl flex flex-col justify-between ${
            emiB < emiA
              ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-500/5 ring-1 ring-emerald-500/20'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  B
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Option B
                </span>
              </div>
              {emiB < emiA && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                  <TrendingDown className="w-3 h-3" />
                  Lower Monthly EMI
                </span>
              )}
              {totalInterestB < totalInterestA && emiB >= emiA && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                  <Award className="w-3 h-3" />
                  Lower Total Interest
                </span>
              )}
            </div>

            {/* Product Selector Dropdown */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Select Product B
              </label>
              <div className="relative">
                <select
                  value={productBId}
                  onChange={(e) => setProductBId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-white focus:outline-hidden focus:border-teal-500 cursor-pointer appearance-none pr-10"
                >
                  {LOAN_PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.id} className="bg-slate-900 text-white">
                      {prod.title} ({prod.interestRate}% p.a.)
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Product Meta Header */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 mb-5">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {getProductIcon(productB.iconName)}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                  {productB.category}
                </span>
                <h4 className="text-base font-extrabold text-white mt-1">{productB.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{productB.tagline}</p>
              </div>
            </div>

            {/* Independent Sliders for Option B if in independent mode */}
            {comparisonMode === 'independent' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-4 mb-5">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400 font-bold">Loan Amount B</span>
                    <span className="font-mono font-bold text-teal-400">
                      {formatCurrency(effectiveAmountB, selectedCurrency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={productB.minAmount}
                    max={productB.maxAmount}
                    step={1000}
                    value={amountB}
                    onChange={(e) => setAmountB(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-400 font-bold">Tenure B</span>
                    <span className="font-mono font-bold text-teal-400">
                      {effectiveTenureB} Months
                    </span>
                  </div>
                  <input
                    type="range"
                    min={productB.minTenureMonths}
                    max={productB.maxTenureMonths}
                    step={1}
                    value={tenureB}
                    onChange={(e) => setTenureB(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Primary Calculated Financial Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                  <span>Monthly EMI</span>
                  <Percent className="w-3 h-3 text-teal-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                  {formatCurrency(emiB, selectedCurrency)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  @ {productB.interestRate}% interest rate
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                  <span>Total Interest</span>
                  <Calendar className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
                  {formatCurrency(totalInterestB, selectedCurrency)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Over {effectiveTenureB} months tenure
                </div>
              </div>
            </div>

            {/* Detailed Financial Breakdown List */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 mb-5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Principal Requested</span>
                <span className="font-bold text-slate-200 font-mono">
                  {formatCurrency(effectiveAmountB, selectedCurrency)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Repayment Tenure</span>
                <span className="font-bold text-slate-200 font-mono">
                  {effectiveTenureB} Months ({(effectiveTenureB / 12).toFixed(1)} yrs)
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Processing Fee ({productB.processingFeePercent}%)</span>
                <span className="font-bold text-slate-200 font-mono">
                  {formatCurrency(feeB, selectedCurrency)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 pt-2 font-bold">
                <span className="text-white">Total Outflow (Payable)</span>
                <span className="text-teal-400 font-mono text-sm">
                  {formatCurrency(totalCostB, selectedCurrency)}
                </span>
              </div>
            </div>

            {/* Features Checklist */}
            <div className="mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Included Features
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {productB.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTA */}
          <button
            onClick={() => onApplyProductWithValues(productB, effectiveAmountB, effectiveTenureB)}
            className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
          >
            Apply for {productB.title}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= Visual Difference & Savings Summary Banner ================= */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Head-to-Head Difference Analysis
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {emiDiff > 0
                  ? `${productA.title.split(' ')[1]} saves ${formatCurrency(Math.abs(emiDiff), selectedCurrency)}/month on EMI`
                  : emiDiff < 0
                  ? `${productB.title.split(' ')[1]} saves ${formatCurrency(Math.abs(emiDiff), selectedCurrency)}/month on EMI`
                  : 'Identical monthly installments for both loan options'}
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {interestDiff > 0
                  ? `Option A yields a cumulative interest savings of ${formatCurrency(interestDiff, selectedCurrency)} across your loan journey.`
                  : interestDiff < 0
                  ? `Option B yields a cumulative interest savings of ${formatCurrency(Math.abs(interestDiff), selectedCurrency)} across your loan journey.`
                  : 'Both products accumulate the same total interest for this configuration.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">EMI Delta</div>
              <div
                className={`text-sm font-black font-mono mt-0.5 ${
                  emiDiff === 0
                    ? 'text-slate-300'
                    : emiDiff > 0
                    ? 'text-emerald-400'
                    : 'text-teal-400'
                }`}
              >
                {emiDiff === 0
                  ? '₹0 difference'
                  : emiDiff > 0
                  ? `A is ${formatCurrency(emiDiff, selectedCurrency)} lower`
                  : `B is ${formatCurrency(Math.abs(emiDiff), selectedCurrency)} lower`}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Interest Delta</div>
              <div
                className={`text-sm font-black font-mono mt-0.5 ${
                  interestDiff === 0
                    ? 'text-slate-300'
                    : interestDiff > 0
                    ? 'text-emerald-400'
                    : 'text-teal-400'
                }`}
              >
                {interestDiff === 0
                  ? '₹0 difference'
                  : interestDiff > 0
                  ? `Save ${formatCurrency(interestDiff, selectedCurrency)} with A`
                  : `Save ${formatCurrency(Math.abs(interestDiff), selectedCurrency)} with B`}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Tenure Delta</div>
              <div className="text-sm font-black font-mono text-slate-200 mt-0.5">
                {tenureDiff === 0
                  ? 'Equal (0 mo)'
                  : tenureDiff > 0
                  ? `A is ${tenureDiff} mo shorter`
                  : `B is ${Math.abs(tenureDiff)} mo shorter`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Visual Progress / Bar Chart Breakdown ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
        <h3 className="text-base font-extrabold text-white mb-1 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          Comparative Visualizer: Monthly EMI & Total Interest
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Direct graphical representation comparing monthly obligations and total borrowing expense.
        </p>

        {/* 1. Monthly Installment Comparison Bars */}
        <div className="space-y-4 mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Monthly Installment (EMI) Comparison
          </div>

          {/* Option A bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                {productA.title} (A)
              </span>
              <span className="font-mono text-white">
                {formatCurrency(emiA, selectedCurrency)}/mo
              </span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${barWidthA}%` }}
              />
            </div>
          </div>

          {/* Option B bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="text-teal-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                {productB.title} (B)
              </span>
              <span className="font-mono text-white">
                {formatCurrency(emiB, selectedCurrency)}/mo
              </span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${barWidthB}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Total Interest Burden Comparison Bars */}
        <div className="space-y-4 mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Total Interest Paid Over Loan Lifetime
          </div>

          {/* Interest A bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                {productA.title} (A)
              </span>
              <span className="font-mono text-amber-400">
                {formatCurrency(totalInterestA, selectedCurrency)}
              </span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${interestBarA}%` }}
              />
            </div>
          </div>

          {/* Interest B bar */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
              <span className="text-teal-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                {productB.title} (B)
              </span>
              <span className="font-mono text-amber-400">
                {formatCurrency(totalInterestB, selectedCurrency)}
              </span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${interestBarB}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Stacked Cost-of-Credit Breakdown (Principal vs Interest vs Processing Fee) */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Total Payment Composition (Principal vs Interest vs Fee)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product A composition */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs font-bold text-white mb-2 flex justify-between">
                <span>{productA.title}</span>
                <span className="text-emerald-400 font-mono">
                  {formatCurrency(totalCostA, selectedCurrency)} Total
                </span>
              </div>
              {/* Stacked bar */}
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex mb-3">
                <div
                  title="Principal"
                  style={{
                    width: `${Math.round((effectiveAmountA / (totalCostA || 1)) * 100)}%`,
                  }}
                  className="bg-emerald-500 h-full"
                />
                <div
                  title="Total Interest"
                  style={{
                    width: `${Math.round((totalInterestA / (totalCostA || 1)) * 100)}%`,
                  }}
                  className="bg-amber-400 h-full"
                />
                <div
                  title="Processing Fee"
                  style={{
                    width: `${Math.max(1, Math.round((feeA / (totalCostA || 1)) * 100))}%`,
                  }}
                  className="bg-purple-500 h-full"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Principal (
                  {Math.round((effectiveAmountA / (totalCostA || 1)) * 100)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Interest (
                  {Math.round((totalInterestA / (totalCostA || 1)) * 100)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> Fee (
                  {productA.processingFeePercent}%)
                </span>
              </div>
            </div>

            {/* Product B composition */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs font-bold text-white mb-2 flex justify-between">
                <span>{productB.title}</span>
                <span className="text-teal-400 font-mono">
                  {formatCurrency(totalCostB, selectedCurrency)} Total
                </span>
              </div>
              {/* Stacked bar */}
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex mb-3">
                <div
                  title="Principal"
                  style={{
                    width: `${Math.round((effectiveAmountB / (totalCostB || 1)) * 100)}%`,
                  }}
                  className="bg-teal-500 h-full"
                />
                <div
                  title="Total Interest"
                  style={{
                    width: `${Math.round((totalInterestB / (totalCostB || 1)) * 100)}%`,
                  }}
                  className="bg-amber-400 h-full"
                />
                <div
                  title="Processing Fee"
                  style={{
                    width: `${Math.max(1, Math.round((feeB / (totalCostB || 1)) * 100))}%`,
                  }}
                  className="bg-purple-500 h-full"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span> Principal (
                  {Math.round((effectiveAmountB / (totalCostB || 1)) * 100)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Interest (
                  {Math.round((totalInterestB / (totalCostB || 1)) * 100)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> Fee (
                  {productB.processingFeePercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Side-by-Side Detailed Matrix Table ================= */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl mb-8">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-extrabold text-white">
            Full Specification & Eligibility Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare all underlying limits, interest terms, and borrower eligibility rules.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-bold">Feature / Specification</th>
                <th className="py-3 px-4 font-bold text-emerald-400">
                  Option A: {productA.title}
                </th>
                <th className="py-3 px-4 font-bold text-teal-400">
                  Option B: {productB.title}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30">Category</td>
                <td className="py-3.5 px-4">{productA.category}</td>
                <td className="py-3.5 px-4">{productB.category}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30">Annual Interest Rate (APR)</td>
                <td className="py-3.5 px-4 font-black text-emerald-400">
                  {productA.interestRate}% p.a.
                </td>
                <td className="py-3.5 px-4 font-black text-teal-400">
                  {productB.interestRate}% p.a.
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30">Calculated Monthly EMI</td>
                <td className="py-3.5 px-4 font-black font-mono text-white">
                  {formatCurrency(emiA, selectedCurrency)}
                </td>
                <td className="py-3.5 px-4 font-black font-mono text-white">
                  {formatCurrency(emiB, selectedCurrency)}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30">Total Interest Payable</td>
                <td className="py-3.5 px-4 font-black font-mono text-amber-400">
                  {formatCurrency(totalInterestA, selectedCurrency)}
                </td>
                <td className="py-3.5 px-4 font-black font-mono text-amber-400">
                  {formatCurrency(totalInterestB, selectedCurrency)}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30">Total Cost (Principal + Interest + Fee)</td>
                <td className="py-3.5 px-4 font-black font-mono text-white">
                  {formatCurrency(totalCostA, selectedCurrency)}
                </td>
                <td className="py-3.5 px-4 font-black font-mono text-white">
                  {formatCurrency(totalCostB, selectedCurrency)}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30">Permitted Amount Range</td>
                <td className="py-3.5 px-4 font-mono">
                  {formatCurrency(productA.minAmount, selectedCurrency)} –{' '}
                  {formatCurrency(productA.maxAmount, selectedCurrency)}
                </td>
                <td className="py-3.5 px-4 font-mono">
                  {formatCurrency(productB.minAmount, selectedCurrency)} –{' '}
                  {formatCurrency(productB.maxAmount, selectedCurrency)}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30">Permitted Tenure Range</td>
                <td className="py-3.5 px-4 font-mono">
                  {productA.minTenureMonths} – {productA.maxTenureMonths} Months
                </td>
                <td className="py-3.5 px-4 font-mono">
                  {productB.minTenureMonths} – {productB.maxTenureMonths} Months
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30">Processing Fee %</td>
                <td className="py-3.5 px-4">
                  {productA.processingFeePercent === 0 ? '0% (Free)' : `${productA.processingFeePercent}%`}
                </td>
                <td className="py-3.5 px-4">
                  {productB.processingFeePercent === 0 ? '0% (Free)' : `${productB.processingFeePercent}%`}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-white bg-slate-950/30 align-top">
                  Eligibility Criteria
                </td>
                <td className="py-3.5 px-4 align-top">
                  <ul className="space-y-1">
                    {productA.eligibilityCriteria.map((c, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <ul className="space-y-1">
                    {productB.eligibilityCriteria.map((c, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
