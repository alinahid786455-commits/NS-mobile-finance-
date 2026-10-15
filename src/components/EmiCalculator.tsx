import React, { useState, useMemo } from 'react';
import { CurrencyConfig } from '../types/loan';
import { calculateEmi, generateAmortizationSchedule, formatCurrency } from '../utils/calculator';
import {
  Calculator,
  PieChart,
  Calendar,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  Scale,
} from 'lucide-react';

interface EmiCalculatorProps {
  selectedCurrency: CurrencyConfig;
  onApplyWithValues?: (amount: number, tenureMonths: number, rate: number) => void;
  onOpenCompare?: () => void;
  initialAmount?: number;
  initialTenure?: number;
  initialRate?: number;
}

export const EmiCalculator: React.FC<EmiCalculatorProps> = ({
  selectedCurrency,
  onApplyWithValues,
  onOpenCompare,
  initialAmount = 20000,
  initialTenure = 24,
  initialRate = 10.5,
}) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [tenureMonths, setTenureMonths] = useState<number>(initialTenure);
  const [interestRate, setInterestRate] = useState<number>(initialRate);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  // Computed financial numbers
  const emi = useMemo(
    () => calculateEmi(amount, interestRate, tenureMonths),
    [amount, interestRate, tenureMonths]
  );

  const totalPayment = emi * tenureMonths;
  const totalInterest = Math.max(0, totalPayment - amount);
  const principalPercentage = Math.round((amount / (totalPayment || 1)) * 100);
  const interestPercentage = 100 - principalPercentage;

  const schedule = useMemo(
    () => generateAmortizationSchedule(amount, interestRate, tenureMonths),
    [amount, interestRate, tenureMonths]
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          Interactive Loan Planner
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          N.S. Loan EMI & Interest Calculator
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Adjust the sliders to simulate your monthly installment and total repayment breakdown.
        </p>
        {onOpenCompare && (
          <div className="mt-3">
            <button
              onClick={onOpenCompare}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>Want to compare two products? Try Side-by-Side Comparison ➜</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Input Panel */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          {/* Slider 1: Loan Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                Loan Amount
              </label>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-emerald-400 font-black font-mono text-sm">
                <span>{selectedCurrency.symbol}</span>
                <input
                  type="number"
                  min="500"
                  max="500000"
                  step="500"
                  value={Math.round(amount * selectedCurrency.rateMultiplier)}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setAmount(Math.round(val / selectedCurrency.rateMultiplier));
                  }}
                  className="w-24 bg-transparent text-right focus:outline-hidden text-white"
                />
              </div>
            </div>

            <input
              type="range"
              min="500"
              max="200000"
              step="500"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>{formatCurrency(500, selectedCurrency)}</span>
              <span>{formatCurrency(50000, selectedCurrency)}</span>
              <span>{formatCurrency(200000, selectedCurrency)}</span>
            </div>
          </div>

          {/* Slider 2: Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                Annual Interest Rate (% p.a.)
              </label>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-cyan-400 font-black font-mono text-sm">
                <input
                  type="number"
                  min="6"
                  max="24"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value) || 6)}
                  className="w-16 bg-transparent text-right focus:outline-hidden text-white"
                />
                <span>%</span>
              </div>
            </div>

            <input
              type="range"
              min="6"
              max="24"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>6.0% (Special Home)</span>
              <span>10.5% (Personal)</span>
              <span>24.0% (Max)</span>
            </div>
          </div>

          {/* Slider 3: Loan Tenure */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase text-slate-300 tracking-wider">
                Loan Tenure (Months)
              </label>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-amber-400 font-black font-mono text-sm">
                <span>{tenureMonths}</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({(tenureMonths / 12).toFixed(1)} Yrs)
                </span>
              </div>
            </div>

            <input
              type="range"
              min="3"
              max="120"
              step="3"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>3 Mos</span>
              <span>24 Mos (2 Yrs)</span>
              <span>60 Mos (5 Yrs)</span>
              <span>120 Mos (10 Yrs)</span>
            </div>
          </div>

          {/* Quick tenure shortcut pills */}
          <div className="flex gap-2 pt-2">
            {[12, 24, 36, 48, 60].map((m) => (
              <button
                key={m}
                onClick={() => setTenureMonths(m)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  tenureMonths === m
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {m / 12} Yr
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Result Summary Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
              Estimated Monthly Installment
            </span>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 tracking-tight">
              {formatCurrency(emi, selectedCurrency)}
              <span className="text-xs text-slate-400 font-medium ml-1">/ month</span>
            </div>

            {/* Split breakdown visual bar */}
            <div className="mt-6 mb-4">
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>Principal ({principalPercentage}%)</span>
                <span>Interest ({interestPercentage}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${principalPercentage}%` }}
                />
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${interestPercentage}%` }}
                />
              </div>
            </div>

            {/* Financial Details Table */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Principal Borrowed</span>
                <span className="font-bold text-white font-mono">
                  {formatCurrency(amount, selectedCurrency)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Total Interest Payable</span>
                <span className="font-bold text-cyan-400 font-mono">
                  {formatCurrency(totalInterest, selectedCurrency)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-400">Total Repayment Amount</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {formatCurrency(totalPayment, selectedCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            {onApplyWithValues && (
              <button
                onClick={() => onApplyWithValues(amount, tenureMonths, interestRate)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Apply With This Plan
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setShowAmortization(!showAmortization)}
              className="w-full mt-2 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{showAmortization ? 'Hide' : 'View'} Amortization Schedule</span>
              {showAmortization ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Amortization Table */}
      {showAmortization && (
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Month-by-Month Amortization Schedule
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total {schedule.length} Months
            </span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Beginning Balance</th>
                  <th className="py-2.5 px-3">EMI Payment</th>
                  <th className="py-2.5 px-3 text-emerald-400">Principal</th>
                  <th className="py-2.5 px-3 text-cyan-400">Interest</th>
                  <th className="py-2.5 px-3">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {schedule.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-800/40 text-slate-200">
                    <td className="py-2 px-3 font-bold text-white">#{row.month}</td>
                    <td className="py-2 px-3">{formatCurrency(row.beginningBalance, selectedCurrency)}</td>
                    <td className="py-2 px-3">{formatCurrency(row.emi, selectedCurrency)}</td>
                    <td className="py-2 px-3 text-emerald-400">+{formatCurrency(row.principal, selectedCurrency)}</td>
                    <td className="py-2 px-3 text-cyan-400">{formatCurrency(row.interest, selectedCurrency)}</td>
                    <td className="py-2 px-3 font-semibold">{formatCurrency(row.endingBalance, selectedCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
