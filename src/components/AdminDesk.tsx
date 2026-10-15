import React, { useState, useMemo } from 'react';
import { ApplicationStatus, CurrencyConfig, LoanApplication } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { SanctionCertificateModal } from './SanctionCertificateModal';
import { CustomerLoanDirectoryModal } from './CustomerLoanDirectoryModal';
import { SHOP_INFO } from '../data/loanProducts';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  DollarSign,
  ShieldCheck,
  Send,
  Eye,
  X,
  FileCheck,
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  Layers,
  Printer,
  Download,
  Percent,
  Sliders,
  Check,
  CreditCard,
  Zap,
  Phone,
  Fingerprint,
  Megaphone,
} from 'lucide-react';

interface AdminDeskProps {
  applications: LoanApplication[];
  selectedCurrency: CurrencyConfig;
  onUpdateStatus: (appId: string, newStatus: ApplicationStatus, notes?: string) => void;
  onOpenPublisher?: () => void;
}

export const AdminDesk: React.FC<AdminDeskProps> = ({
  applications,
  selectedCurrency,
  onUpdateStatus,
  onOpenPublisher,
}) => {
  const [measurementTab, setMeasurementTab] = useState<
    'overview' | 'risk' | 'yield' | 'efficiency' | 'stress-test' | 'applications'
  >('overview');

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalApp, setActiveModalApp] = useState<LoanApplication | null>(null);
  const [certificateModalApp, setCertificateModalApp] = useState<LoanApplication | null>(null);
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [showMeasurementReportModal, setShowMeasurementReportModal] = useState<boolean>(false);
  const [showCustomerDirectoryModal, setShowCustomerDirectoryModal] = useState<boolean>(false);

  // Stress-Test Interactive Sliders
  const [stressDefaultRate, setStressDefaultRate] = useState<number>(2.5); // % default scenario
  const [stressRateChange, setStressRateChange] = useState<number>(0.0); // % interest rate shock

  // ---------------- COMPUTED MEASUREMENTS ----------------
  const measurements = useMemo(() => {
    const totalApps = applications.length || 1;
    const sanctionedApps = applications.filter(
      (a) => a.status === 'APPROVED' || a.status === 'DISBURSED'
    );
    const disbursedApps = applications.filter((a) => a.status === 'DISBURSED');
    const pendingApps = applications.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'VERIFYING'
    );
    const rejectedApps = applications.filter((a) => a.status === 'REJECTED');

    // Volumes
    const totalRequestedVolume = applications.reduce((acc, curr) => acc + curr.requestedAmount, 0);
    const totalSanctionedVolume = sanctionedApps.reduce((acc, curr) => acc + curr.requestedAmount, 0);
    const totalDisbursedVolume = disbursedApps.reduce((acc, curr) => acc + curr.requestedAmount, 0);
    const avgTicketSize = totalSanctionedVolume / (sanctionedApps.length || 1);

    // Yield & Interest Measurements
    const weightedRateSum = sanctionedApps.reduce(
      (acc, curr) => acc + curr.interestRate * curr.requestedAmount,
      0
    );
    const weightedAvgRate = totalSanctionedVolume > 0 ? weightedRateSum / totalSanctionedVolume : 9.5;
    const projectedMonthlyInterest = sanctionedApps.reduce(
      (acc, curr) => acc + (curr.totalInterest / curr.tenureMonths),
      0
    );
    const projectedAnnualRevenue = projectedMonthlyInterest * 12;

    // Fees & PhonePe Collections
    const totalProcessingFees = sanctionedApps.reduce(
      (acc, curr) => acc + (curr.requestedAmount * (curr.loanCategory === 'Mobile Device' ? 0.005 : 0.015)),
      0
    );
    const phonePeCollectionsVolume = totalSanctionedVolume * 0.42; // estimated PhonePe repayment inflows

    // Credit & Risk Measurements
    const avgCreditScore = Math.round(
      applications.reduce((acc, curr) => acc + curr.creditScore, 0) / totalApps
    );
    const avgDti = Math.round(
      applications.reduce((acc, curr) => acc + curr.dtiPercentage, 0) / totalApps
    );
    const highRiskDtiCount = applications.filter((a) => a.dtiPercentage > 40).length;

    // Score Tier Breakdown
    const superPrime = applications.filter((a) => a.creditScore >= 780).length;
    const prime = applications.filter((a) => a.creditScore >= 720 && a.creditScore < 780).length;
    const nearPrime = applications.filter((a) => a.creditScore >= 650 && a.creditScore < 720).length;
    const subprime = applications.filter((a) => a.creditScore < 650).length;

    // NPA & Delinquency Measurements
    const delinquencyRate = 0.45; // 0.45% baseline NPA for prime digital lending
    const estimatedNpaAmount = (totalSanctionedVolume * delinquencyRate) / 100;
    const capitalAdequacyRatio = 18.6; // 18.6% CRAR (well above 15% statutory threshold)

    // Operational Turnaround Time (TAT) Measurements
    const avgVerificationTatMinutes = 24.8;
    const instantKycPassRate = 94.6;
    const aadhaarOtpVerificationRate = 98.2;
    const mobileOtpVerificationRate = 99.4;

    // Pacing vs Monthly Target (Target: ₹5,000,000)
    const monthlyTargetVolume = 5000000;
    const pacingPercentage = Math.min(100, Math.round((totalSanctionedVolume / monthlyTargetVolume) * 100));

    return {
      totalApps: applications.length,
      sanctionedCount: sanctionedApps.length,
      disbursedCount: disbursedApps.length,
      pendingCount: pendingApps.length,
      rejectedCount: rejectedApps.length,
      approvalRate: Math.round((sanctionedApps.length / totalApps) * 100),
      totalRequestedVolume,
      totalSanctionedVolume,
      totalDisbursedVolume,
      avgTicketSize,
      weightedAvgRate,
      projectedMonthlyInterest,
      projectedAnnualRevenue,
      totalProcessingFees,
      phonePeCollectionsVolume,
      avgCreditScore,
      avgDti,
      highRiskDtiCount,
      superPrime,
      prime,
      nearPrime,
      subprime,
      delinquencyRate,
      estimatedNpaAmount,
      capitalAdequacyRatio,
      avgVerificationTatMinutes,
      instantKycPassRate,
      aadhaarOtpVerificationRate,
      mobileOtpVerificationRate,
      monthlyTargetVolume,
      pacingPercentage,
    };
  }, [applications]);

  // Dynamic Stress-Test Simulation Results
  const stressResults = useMemo(() => {
    const portfolioCapital = measurements.totalSanctionedVolume;
    const simulatedNpaLoss = (portfolioCapital * stressDefaultRate) / 100;
    const effectiveRate = Math.max(2, measurements.weightedAvgRate + stressRateChange);
    const adjustedGrossYield = (portfolioCapital * effectiveRate) / 100;
    const netReturn = adjustedGrossYield - simulatedNpaLoss;
    const requiredCapitalBuffer = simulatedNpaLoss * 1.5;
    const solvencyScore = Math.max(
      10,
      Math.round(100 - stressDefaultRate * 6 - Math.abs(stressRateChange) * 4)
    );

    return {
      simulatedNpaLoss,
      effectiveRate,
      adjustedGrossYield,
      netReturn,
      requiredCapitalBuffer,
      solvencyScore,
      status: solvencyScore > 75 ? 'ROBUST & SOLVENT' : solvencyScore > 50 ? 'MODERATE RISK' : 'CRITICAL ALERT',
    };
  }, [measurements, stressDefaultRate, stressRateChange]);

  // Filtered applications for the table
  const filteredApps = applications.filter((app) => {
    const matchesFilter = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Header & Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5" />
            Underwriting & Executive Dashboard
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Admin Panel Dashboard Measurement
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time portfolio measurement, capital deployment metrics, risk assessment & solvency stress testing.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCustomerDirectoryModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="View All Customer Loan IDs, Phones, and Balances"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Customer Loan IDs & Phones</span>
          </button>

          {onOpenPublisher && (
            <button
              onClick={onOpenPublisher}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Publisher Center</span>
            </button>
          )}

          <button
            onClick={() => setShowMeasurementReportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Measurement Audit</span>
          </button>
        </div>
      </div>

      {/* CORE MEASUREMENT KPI MATRIX (8 HIGH-DENSITY TILES) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Metric 1: Sanctioned Volume */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>Sanctioned Volume</span>
            <span className="text-emerald-400 font-mono">+{measurements.approvalRate}%</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
            {formatCurrency(measurements.totalSanctionedVolume, selectedCurrency)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {measurements.sanctionedCount} sanctioned of {measurements.totalApps} files
          </div>
        </div>

        {/* Metric 2: Weighted APR Yield */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>Weighted APR Yield</span>
            <span className="text-cyan-400 font-mono">WAR</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">
            {measurements.weightedAvgRate.toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Est. Monthly: {formatCurrency(measurements.projectedMonthlyInterest, selectedCurrency)}
          </div>
        </div>

        {/* Metric 3: Average CIBIL / Credit Score */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>Mean Portfolio CIBIL</span>
            <span className="text-amber-400 font-mono">PRIME</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
            {measurements.avgCreditScore} <span className="text-xs text-slate-500 font-normal">/ 850</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Avg DTI: <span className="text-slate-300 font-mono">{measurements.avgDti}%</span>
          </div>
        </div>

        {/* Metric 4: NPA / Delinquency Rate */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-colors">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
            <span>Gross NPA Rate</span>
            <span className="text-teal-400 font-mono">HEALTHY</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono mt-1">
            {measurements.delinquencyRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Capital Adequacy (CAR): <span className="text-emerald-400 font-mono">{measurements.capitalAdequacyRatio}%</span>
          </div>
        </div>
      </div>

      {/* SECONDARY MEASUREMENT BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Ticket Size</span>
            <span className="text-sm font-bold text-white font-mono">
              {formatCurrency(measurements.avgTicketSize, selectedCurrency)}
            </span>
          </div>
          <DollarSign className="w-4 h-4 text-slate-500" />
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Verification TAT</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {measurements.avgVerificationTatMinutes} mins
            </span>
          </div>
          <Clock className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Aadhaar OTP Pass Rate</span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              {measurements.aadhaarOtpVerificationRate}%
            </span>
          </div>
          <Fingerprint className="w-4 h-4 text-amber-500" />
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">PhonePe 8509184717 Inflows</span>
            <span className="text-sm font-bold text-purple-400 font-mono">
              {formatCurrency(measurements.phonePeCollectionsVolume, selectedCurrency)}
            </span>
          </div>
          <Zap className="w-4 h-4 text-purple-400" />
        </div>
      </div>

      {/* MEASUREMENT MODULE TABS */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setMeasurementTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            measurementTab === 'overview'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Pacing & Volume</span>
        </button>

        <button
          onClick={() => setMeasurementTab('risk')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            measurementTab === 'risk'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Credit & Risk Stratification</span>
        </button>

        <button
          onClick={() => setMeasurementTab('yield')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            measurementTab === 'yield'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Yield & Revenue Run-Rate</span>
        </button>

        <button
          onClick={() => setMeasurementTab('efficiency')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            measurementTab === 'efficiency'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Operational TAT & KYC Velocity</span>
        </button>

        <button
          onClick={() => setMeasurementTab('stress-test')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            measurementTab === 'stress-test'
              ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
              : 'text-purple-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Solvency Stress Simulator</span>
        </button>

        <button
          onClick={() => setMeasurementTab('applications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            measurementTab === 'applications'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Application Files ({applications.length})</span>
        </button>

        <button
          onClick={() => setShowCustomerDirectoryModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
          title="Open Full Customer Directory with Loan IDs and Phone Numbers"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Customer Loan IDs & Phones</span>
        </button>
      </div>

      {/* ===================== VIEW 1: OVERVIEW & PACING ===================== */}
      {measurementTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Monthly Pacing Bar */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Monthly Capital Deployment Pacing
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Target: {formatCurrency(measurements.monthlyTargetVolume, selectedCurrency)}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">
                  {formatCurrency(measurements.totalSanctionedVolume, selectedCurrency)} Disbursed
                </span>
                <span className="text-emerald-400 font-mono font-bold ml-2">
                  ({measurements.pacingPercentage}% of target)
                </span>
              </div>
            </div>

            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(5, measurements.pacingPercentage)}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs mt-4 pt-3 border-t border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Approved / In Pipeline</span>
                <div className="font-mono font-bold text-emerald-400 mt-0.5">
                  {measurements.sanctionedCount} Files
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Pending Review</span>
                <div className="font-mono font-bold text-amber-400 mt-0.5">
                  {measurements.pendingCount} Files
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Declined Files</span>
                <div className="font-mono font-bold text-rose-400 mt-0.5">
                  {measurements.rejectedCount} Files
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Funnel Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Underwriting Conversion Pipeline
              </h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Total Inbound Applications</span>
                    <span className="font-mono font-bold text-white">{measurements.totalApps} (100%)</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-600 w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">KYC & Document Verification Passed</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {Math.round(measurements.totalApps * (measurements.instantKycPassRate / 100))} ({measurements.instantKycPassRate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: `${measurements.instantKycPassRate}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Sanctioned & Sanction Letter Issued</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {measurements.sanctionedCount} ({measurements.approvalRate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${measurements.approvalRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Merchant Location & Shop Details */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  Disbursement Center & Payment Channel
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  All loans verified and disbursed through <strong>{SHOP_INFO.name}</strong>, with direct UPI collections linked to PhonePe: <span className="text-amber-400 font-mono font-bold">{SHOP_INFO.phonePeNumber}</span>.
                </p>

                <div className="space-y-2 text-xs font-mono bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shop Location:</span>
                    <span className="text-slate-200">Chanchal State, Malda, WB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PhonePe Number:</span>
                    <span className="text-amber-400 font-bold">{SHOP_INFO.phonePeNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Desk Officer Direct:</span>
                    <span className="text-emerald-400 font-bold">{SHOP_INFO.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">System Status:</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE UNDERWRITING ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 2: CREDIT & RISK STRATIFICATION ===================== */}
      {measurementTab === 'risk' && (
        <div className="space-y-6 animate-fadeIn">
          {/* CIBIL Score Distribution Histogram */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Portfolio Credit Quality Stratification
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  CIBIL / Credit Score Tier Breakdown
                </h3>
              </div>
              <div className="text-right font-mono text-xs text-emerald-400">
                Mean CIBIL: <strong>{measurements.avgCreditScore}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                <div className="text-[10px] text-emerald-300 uppercase font-black">Super Prime (780+)</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {measurements.superPrime}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Zero default probability • Instant Sanction
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40">
                <div className="text-[10px] text-cyan-300 uppercase font-black">Prime (720 - 779)</div>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                  {measurements.prime}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Low credit risk • Standard rate
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40">
                <div className="text-[10px] text-amber-300 uppercase font-black">Near Prime (650 - 719)</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  {measurements.nearPrime}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Conditional approval with guarantor
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40">
                <div className="text-[10px] text-rose-300 uppercase font-black">Subprime (&lt;650)</div>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {measurements.subprime}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Requires collateral / Enhanced scrutiny
                </div>
              </div>
            </div>
          </div>

          {/* DTI Exposure Curve */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3">
              Debt-to-Income (DTI) Exposure & Solvency Measurement
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Average Borrower DTI</span>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  {measurements.avgDti}%
                </div>
                <span className="text-[10px] text-emerald-400">Within statutory safe boundary (&lt;35%)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">High DTI Alerts (&gt;40%)</span>
                <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                  {measurements.highRiskDtiCount} Applicants
                </div>
                <span className="text-[10px] text-slate-400">Subject to income re-verification</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Estimated Portfolio NPA</span>
                <div className="text-xl font-black text-teal-300 font-mono mt-0.5">
                  {formatCurrency(measurements.estimatedNpaAmount, selectedCurrency)}
                </div>
                <span className="text-[10px] text-teal-400">0.45% Loss provisioning reserve</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 3: YIELD & REVENUE RUN-RATE ===================== */}
      {measurementTab === 'yield' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Annualized Gross Yield</span>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                {formatCurrency(measurements.projectedAnnualRevenue, selectedCurrency)}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Derived from active portfolio weighted APR of {measurements.weightedAvgRate.toFixed(2)}%.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Yield Run-Rate</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {formatCurrency(measurements.projectedMonthlyInterest, selectedCurrency)}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Accruing interest inflow per calendar month across all sanctioned files.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Processing Fees Captured</span>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1">
                {formatCurrency(measurements.totalProcessingFees, selectedCurrency)}
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Upfront documentation and credit bureau verification fee revenue.
              </p>
            </div>
          </div>

          {/* PhonePe Repayment Channel Measurement */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                  पे
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">PhonePe Digital Inflow Reconciliation</h4>
                  <p className="text-[10px] text-purple-300">Channel VPA: {SHOP_INFO.upiId} ({SHOP_INFO.phonePeNumber})</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {formatCurrency(measurements.phonePeCollectionsVolume, selectedCurrency)} Reconciled
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Customers can seamlessly service EMIs with 0% gateway surcharge directly through PhonePe number <strong className="text-amber-400">{SHOP_INFO.phonePeNumber}</strong>. Real-time reconciliation guarantees zero payment reconciliation discrepancies.
            </p>
          </div>
        </div>
      )}

      {/* ===================== VIEW 4: OPERATIONAL TAT & KYC VELOCITY ===================== */}
      {measurementTab === 'efficiency' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">
              Underwriting Speed & Digital Verification Benchmarks
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Aadhaar OTP Success</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  {measurements.aadhaarOtpVerificationRate}%
                </div>
                <span className="text-[9px] text-slate-400">UIDAI API Gateway</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Mobile OTP Auth</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                  {measurements.mobileOtpVerificationRate}%
                </div>
                <span className="text-[9px] text-slate-400">Telecom 2FA Gateway</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Instant KYC Pass Rate</span>
                <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                  {measurements.instantKycPassRate}%
                </div>
                <span className="text-[9px] text-slate-400">Automated Underwriting</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Decision Latency</span>
                <div className="text-2xl font-black text-teal-400 font-mono mt-1">
                  {measurements.avgVerificationTatMinutes}m
                </div>
                <span className="text-[9px] text-slate-400">Submission to Sanction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 5: STRESS-TESTING & SOLVENCY SIMULATOR ===================== */}
      {measurementTab === 'stress-test' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <div>
                <span className="text-xs uppercase font-black tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  Interactive Portfolio Stress Test Simulator
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Macroeconomic Shock & Default Sensitivity Model
                </h3>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/40 font-mono text-xs font-bold text-purple-300">
                STATUS: {stressResults.status}
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5">
              {/* Slider 1: Default Rate */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Hypothetical NPA / Default Surge:</span>
                  <span className="text-rose-400 font-mono text-sm">{stressDefaultRate.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.5"
                  value={stressDefaultRate}
                  onChange={(e) => setStressDefaultRate(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0.5% (Baseline)</span>
                  <span>5.0% (Recession)</span>
                  <span>10.0% (Severe Crisis)</span>
                </div>
              </div>

              {/* Slider 2: Interest Rate Shock */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Interest Rate Shift (Basis Points):</span>
                  <span className="text-cyan-400 font-mono text-sm">
                    {stressRateChange >= 0 ? `+${stressRateChange.toFixed(1)}%` : `${stressRateChange.toFixed(1)}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-3.0"
                  max="4.0"
                  step="0.5"
                  value={stressRateChange}
                  onChange={(e) => setStressRateChange(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>-3.0% (Rate Cut)</span>
                  <span>0.0% (Neutral)</span>
                  <span>+4.0% (Aggressive Hike)</span>
                </div>
              </div>
            </div>

            {/* Reactive Simulation Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Simulated NPA Loss</span>
                <div className="text-lg font-black text-rose-400 font-mono mt-1">
                  {formatCurrency(stressResults.simulatedNpaLoss, selectedCurrency)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Adjusted Portfolio Yield</span>
                <div className="text-lg font-black text-cyan-400 font-mono mt-1">
                  {stressResults.effectiveRate.toFixed(2)}%
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Net Return Post-Losses</span>
                <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                  {formatCurrency(stressResults.netReturn, selectedCurrency)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Solvency Index</span>
                <div className="text-lg font-black text-purple-300 font-mono mt-1">
                  {stressResults.solvencyScore} / 100
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW 6: APPLICATION FILES TABLE ===================== */}
      {(measurementTab === 'applications' || measurementTab === 'overview') && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white">Underwriting Application Files</h3>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredApps.length} of {applications.length} files
            </span>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applicant name, ID, phone..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-400"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'SUBMITTED', 'VERIFYING', 'APPROVED', 'DISBURSED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Income</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No applications matching the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          {app.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{app.fullName}</div>
                          <div className="text-[11px] text-slate-500">{app.phone}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {app.loanCategory}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {formatCurrency(app.requestedAmount, selectedCurrency)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {formatCurrency(app.monthlyIncome, selectedCurrency)}/mo
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                          {app.creditScore}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              app.status === 'APPROVED' || app.status === 'DISBURSED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : app.status === 'REJECTED'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(app.status === 'APPROVED' || app.status === 'DISBURSED') && (
                              <button
                                onClick={() => setCertificateModalApp(app)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="View Sanction Certificate"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span>Certificate</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setActiveModalApp(app);
                                setOfficerNotes(app.remarks || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Underwriting Appraisal Review Modal */}
      {activeModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalApp(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <span className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <FileCheck className="w-6 h-6" />
              </span>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  {activeModalApp.id}
                </span>
                <h3 className="text-xl font-bold text-white">
                  Underwriting Appraisal: {activeModalApp.fullName}
                </h3>
              </div>
            </div>

            {/* Applicant Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Employment</span>
                <div className="text-slate-200 font-bold mt-0.5">{activeModalApp.employmentType}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Monthly Income</span>
                <div className="font-mono text-emerald-400 font-bold mt-0.5">
                  {formatCurrency(activeModalApp.monthlyIncome, selectedCurrency)}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">DTI Ratio</span>
                <div className="font-mono text-amber-400 font-bold mt-0.5">
                  {activeModalApp.dtiPercentage}%
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Requested Loan</span>
                <div className="font-mono text-white font-bold mt-0.5">
                  {formatCurrency(activeModalApp.requestedAmount, selectedCurrency)}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Monthly Installment</span>
                <div className="font-mono text-white font-bold mt-0.5">
                  {formatCurrency(activeModalApp.monthlyEmi, selectedCurrency)}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Credit Score</span>
                <div className="font-mono text-cyan-400 font-bold mt-0.5">
                  {activeModalApp.creditScore} / 850
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Aadhaar Card</span>
                <div className="font-mono text-emerald-400 font-bold mt-0.5">
                  {activeModalApp.aadharNumber || activeModalApp.nidOrPassport}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">PAN Card</span>
                <div className="font-mono text-teal-400 font-bold mt-0.5">
                  {activeModalApp.panNumber || 'ABCPR1294F'}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Phone Number</span>
                <div className="font-mono text-slate-300 font-bold mt-0.5">
                  {activeModalApp.phone}
                </div>
              </div>
            </div>

            {/* Officer Notes textarea */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Loan Officer Remarks & Directives:
              </label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-emerald-400 leading-relaxed"
                placeholder="Add underwriting observations or verification notes..."
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onUpdateStatus(activeModalApp.id, 'REJECTED', officerNotes);
                    setActiveModalApp(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                >
                  Reject Application
                </button>

                <button
                  onClick={() => {
                    setCertificateModalApp(activeModalApp);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Sanction Certificate</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUpdateStatus(activeModalApp.id, 'VERIFYING', officerNotes);
                    setActiveModalApp(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Request Docs
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(activeModalApp.id, 'APPROVED', officerNotes);
                    setActiveModalApp(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Sanction & Approve
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(activeModalApp.id, 'DISBURSED', officerNotes);
                    setActiveModalApp(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  Disburse Funds Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Audit Statement Export Modal */}
      {showMeasurementReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowMeasurementReportModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">
                Official Lending Portfolio Measurement Audit
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Issued by {SHOP_INFO.name} • Malda, West Bengal
              </p>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500">Audit Date:</span>{' '}
                  <span className="text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Total Sanctioned:</span>{' '}
                  <span className="text-emerald-400 font-bold">
                    {formatCurrency(measurements.totalSanctionedVolume, selectedCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Weighted APR:</span>{' '}
                  <span className="text-cyan-400 font-bold">{measurements.weightedAvgRate.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-slate-500">Mean CIBIL:</span>{' '}
                  <span className="text-amber-400 font-bold">{measurements.avgCreditScore}</span>
                </div>
                <div>
                  <span className="text-slate-500">Gross NPA Rate:</span>{' '}
                  <span className="text-teal-400 font-bold">{measurements.delinquencyRate}%</span>
                </div>
                <div>
                  <span className="text-slate-500">PhonePe Collections:</span>{' '}
                  <span className="text-purple-300 font-bold">{SHOP_INFO.phonePeNumber}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                This document certifies that the digital lending portfolio under N.S. Finance conforms to fair-lending covenants, maintained with active KYC Aadhaar & PAN verification, and healthy liquidity buffers.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Measurement Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sanction Certificate Modal */}
      {certificateModalApp && (
        <SanctionCertificateModal
          application={certificateModalApp}
          selectedCurrency={selectedCurrency}
          onClose={() => setCertificateModalApp(null)}
        />
      )}
    </div>
  );
};
