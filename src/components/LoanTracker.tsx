import React, { useState } from 'react';
import { CurrencyConfig, LoanApplication } from '../types/loan';
import { formatCurrency } from '../utils/calculator';
import { SanctionCertificateModal } from './SanctionCertificateModal';
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  Download,
  User,
  Phone,
  Banknote,
  Send,
  Award,
} from 'lucide-react';

interface LoanTrackerProps {
  applications: LoanApplication[];
  selectedCurrency: CurrencyConfig;
  defaultSearchId?: string;
}

export const LoanTracker: React.FC<LoanTrackerProps> = ({
  applications,
  selectedCurrency,
  defaultSearchId = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(defaultSearchId || (applications[0]?.id || ''));
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(
    applications.find((a) => a.id === searchQuery) || applications[0] || null
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const query = searchQuery.trim().toUpperCase();

    const found = applications.find(
      (a) => a.id.toUpperCase() === query || a.phone.includes(query) || a.email.toLowerCase() === query.toLowerCase()
    );

    if (found) {
      setSelectedApp(found);
    } else {
      setSearchError(`No application found matching "${searchQuery}". Please check your Application ID or phone number.`);
    }
  };

  const getStepStatus = (stepIndex: number, appStatus: string) => {
    // 0: Submitted, 1: KYC, 2: Credit, 3: Sanction, 4: Disbursed
    if (appStatus === 'REJECTED') {
      return stepIndex === 0 ? 'completed' : stepIndex === 1 ? 'rejected' : 'upcoming';
    }
    if (appStatus === 'DISBURSED') return 'completed';
    if (appStatus === 'APPROVED') {
      return stepIndex <= 3 ? 'completed' : 'in-progress';
    }
    if (appStatus === 'VERIFYING') {
      return stepIndex === 0 ? 'completed' : stepIndex === 1 ? 'in-progress' : 'upcoming';
    }
    // SUBMITTED
    return stepIndex === 0 ? 'completed' : 'upcoming';
  };

  const trackerStages = [
    { title: 'Application Submitted', desc: 'Online profile & KYC docs received' },
    { title: 'Document Verification', desc: 'Identity & income statement verified' },
    { title: 'Credit Appraisal', desc: 'Debt-to-Income and credit bureau scoring' },
    { title: 'Sanction Letter Issued', desc: 'Loan terms sanctioned by underwriting' },
    { title: 'Disbursement of Funds', desc: 'Electronic bank / mobile wallet transfer' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Search className="w-3.5 h-3.5 text-emerald-400" />
          Real-Time Tracker
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Track Your N.S. Loan Status
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Enter your Application ID (e.g. NS-LN-104928) or registered mobile number.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. NS-LN-104928 or phone number"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-hidden focus:border-emerald-400 uppercase font-mono placeholder:normal-case placeholder:font-sans"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
          >
            Track Status
          </button>
        </div>

        {searchError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </form>

      {/* Tracked Application Card */}
      {selectedApp ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {selectedApp.id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Applied: {selectedApp.appliedDate}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedApp.fullName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                <span className="text-slate-400">
                  {selectedApp.loanCategory} Loan • {formatCurrency(selectedApp.requestedAmount, selectedCurrency)} over {selectedApp.tenureMonths} Months
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Aadhaar: {selectedApp.aadharNumber || selectedApp.nidOrPassport}
                </span>
                {selectedApp.panNumber && (
                  <span className="font-mono text-[11px] text-teal-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    PAN: {selectedApp.panNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedApp.status === 'APPROVED' || selectedApp.status === 'DISBURSED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedApp.status === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                ● Status: {selectedApp.status}
              </span>
            </div>
          </div>

          {/* Visual 5-Stage Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
              Application Milestones & Live Progress
            </h4>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {trackerStages.map((stage, idx) => {
                const stageStatus = getStepStatus(idx, selectedApp.status);

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Step Icon Indicator */}
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        stageStatus === 'completed'
                          ? 'bg-emerald-500 text-slate-950'
                          : stageStatus === 'in-progress'
                          ? 'bg-amber-400 text-slate-950 animate-pulse ring-4 ring-amber-400/20'
                          : stageStatus === 'rejected'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-950 border border-slate-700 text-slate-500'
                      }`}
                    >
                      {stageStatus === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">
                          {stage.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                            stageStatus === 'completed'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : stageStatus === 'in-progress'
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-slate-500'
                          }`}
                        >
                          {stageStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Underwriter Details & Remarks */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px]">Monthly Installment</span>
              <div className="font-mono font-bold text-white text-sm mt-0.5">
                {formatCurrency(selectedApp.monthlyEmi, selectedCurrency)}
              </div>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px]">Assigned Officer</span>
              <div className="font-bold text-slate-200 text-sm mt-0.5">
                N.S. Loan Desk #4
              </div>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px]">Credit Score</span>
              <div className="font-mono font-bold text-cyan-400 text-sm mt-0.5">
                {selectedApp.creditScore} / 850
              </div>
            </div>
          </div>

          {/* Download & View Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowCertificate(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Award className="w-4 h-4" />
              View & Print Approval Sanction Certificate
            </button>
          </div>

          {/* Sanction Certificate Modal */}
          {showCertificate && selectedApp && (
            <SanctionCertificateModal
              application={selectedApp}
              selectedCurrency={selectedCurrency}
              onClose={() => setShowCertificate(false)}
            />
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-3xl border border-slate-800">
          <FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p className="text-sm">No loan application selected.</p>
        </div>
      )}
    </div>
  );
};
