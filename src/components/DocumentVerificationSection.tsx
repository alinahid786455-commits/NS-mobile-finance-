import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  ShieldCheck,
  Loader2,
  FileCheck2,
  ScanLine,
  X,
  CreditCard,
  Building,
  Home,
  Check,
} from 'lucide-react';

export interface VerifiedDocument {
  id: string;
  category: 'identity' | 'income' | 'address';
  type: string; // e.g. "National ID Card", "Salary Pay Slip"
  fileName: string;
  fileSize: string;
  fileDataUrl: string; // Base64 or sample SVG preview
  status: 'scanning' | 'verified' | 'flagged';
  extractedDetails: {
    label: string;
    value: string;
  }[];
  uploadedAt: string;
}

interface DocumentVerificationSectionProps {
  applicantName: string;
  monthlyIncome: number;
  currencySymbol: string;
  onVerificationComplete: (documents: VerifiedDocument[], allRequiredMet: boolean) => void;
}

// Sample mock visual documents for 1-click testing
const SAMPLE_DOCS = {
  nid: {
    fileName: 'National_ID_Card_Front_Back.pdf',
    fileSize: '1.8 MB',
    type: 'National ID (NID)',
    preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" rx="16" fill="%230f172a" stroke="%23334155" stroke-width="2"/><rect x="20" y="20" width="360" height="40" rx="8" fill="%231e293b"/><text x="40" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2310b981">PEOPLE S REPUBLIC - NATIONAL IDENTITY</text><circle cx="65" cy="120" r="35" fill="%23334155"/><text x="65" y="125" text-anchor="middle" font-family="sans-serif" font-size="28" fill="%2394a3b8">👤</text><text x="120" y="100" font-family="sans-serif" font-size="12" fill="%2364748b">NAME</text><text x="120" y="118" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23f8fafc">APPLICANT VERIFIED</text><text x="120" y="145" font-family="sans-serif" font-size="12" fill="%2364748b">NID NO.</text><text x="120" y="163" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2310b981">19942691234500912</text><rect x="20" y="195" width="360" height="25" rx="4" fill="%23022c22"/><text x="35" y="212" font-family="sans-serif" font-size="11" fill="%2334d399">OFFICIAL CHIP ENCRYPTED - VERIFIED</text></svg>',
  },
  salary: {
    fileName: 'Apex_Tech_Salary_Slip_3Months.pdf',
    fileSize: '2.4 MB',
    type: 'Salary Pay Slip',
    preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" rx="16" fill="%230f172a" stroke="%23334155" stroke-width="2"/><rect x="20" y="20" width="360" height="40" rx="8" fill="%231e293b"/><text x="40" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2338bdf8">APEX TECH - MONTHLY SALARY STATEMENT</text><text x="30" y="90" font-family="sans-serif" font-size="12" fill="%2394a3b8">Employer: Apex Technologies Ltd.</text><text x="30" y="115" font-family="sans-serif" font-size="12" fill="%2394a3b8">Designation: Senior Lead</text><text x="30" y="140" font-family="sans-serif" font-size="12" fill="%2394a3b8">Net Take-Home Pay:</text><text x="160" y="140" font-family="sans-serif" font-size="14" font-weight="bold" fill="%2310b981">$2,500.00 / Month</text><line x1="20" y1="160" x2="380" y2="160" stroke="%23334155" stroke-width="1"/><text x="30" y="185" font-family="sans-serif" font-size="11" fill="%2364748b">Verified Stamp: CORPORATE HR & PAYROLL CERTIFIED</text><text x="30" y="205" font-family="sans-serif" font-size="10" fill="%2310b981">✓ Direct Bank Deposit Confirmed</text></svg>',
  },
  address: {
    fileName: 'Electricity_Utility_Bill_Dhaka.pdf',
    fileSize: '1.2 MB',
    type: 'Utility Bill (Address Proof)',
    preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" rx="16" fill="%230f172a" stroke="%23334155" stroke-width="2"/><rect x="20" y="20" width="360" height="40" rx="8" fill="%231e293b"/><text x="40" y="45" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23fbbf24">POWER DISTRIBUTION CO - UTILITY BILL</text><text x="30" y="95" font-family="sans-serif" font-size="12" fill="%2394a3b8">Account: RES-0941203</text><text x="30" y="120" font-family="sans-serif" font-size="12" fill="%2394a3b8">Premises: House 42, Road 11, Banani</text><text x="30" y="145" font-family="sans-serif" font-size="12" fill="%2310b981">Status: Paid in Full</text><rect x="20" y="185" width="360" height="30" rx="6" fill="%231e293b"/><text x="35" y="205" font-family="sans-serif" font-size="11" fill="%2338bdf8">✓ Geo-Location Validated - Matches Residential Address</text></svg>',
  },
};

export const DocumentVerificationSection: React.FC<DocumentVerificationSectionProps> = ({
  applicantName,
  monthlyIncome,
  currencySymbol,
  onVerificationComplete,
}) => {
  const [documents, setDocuments] = useState<VerifiedDocument[]>([
    {
      id: 'doc_id',
      category: 'identity',
      type: 'National ID (NID)',
      fileName: 'National_ID_Card_Front_Back.pdf',
      fileSize: '1.8 MB',
      fileDataUrl: SAMPLE_DOCS.nid.preview,
      status: 'verified',
      extractedDetails: [
        { label: 'Name on ID', value: applicantName || 'Rahman Ali' },
        { label: 'ID Number', value: '19942691234500912' },
        { label: 'Name Match Score', value: '99.4% (Verified)' },
        { label: 'Security Seal', value: 'Authentic Hologram Detected' },
      ],
      uploadedAt: 'Just now',
    },
    {
      id: 'doc_income',
      category: 'income',
      type: 'Salary Pay Slip',
      fileName: 'Apex_Tech_Salary_Slip_3Months.pdf',
      fileSize: '2.4 MB',
      fileDataUrl: SAMPLE_DOCS.salary.preview,
      status: 'verified',
      extractedDetails: [
        { label: 'Employer Verified', value: 'Apex Technologies Ltd.' },
        { label: 'Net Monthly Earnings', value: `${currencySymbol}${monthlyIncome.toLocaleString()}` },
        { label: 'Bank Credit Record', value: 'Consistent 3-Month Deposits' },
        { label: 'Income Variance', value: '0% (Exact Match)' },
      ],
      uploadedAt: 'Just now',
    },
  ]);

  const [previewDoc, setPreviewDoc] = useState<VerifiedDocument | null>(null);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(false);
  const [scanningCategory, setScanningCategory] = useState<string | null>(null);

  // Notify parent of readiness
  const isIdentityVerified = documents.some((d) => d.category === 'identity' && d.status === 'verified');
  const isIncomeVerified = documents.some((d) => d.category === 'income' && d.status === 'verified');
  const allRequiredMet = isIdentityVerified && isIncomeVerified;

  // Simulate upload & AI OCR scanning
  const simulateUploadAndScan = (
    category: 'identity' | 'income' | 'address',
    docType: string,
    sampleKey: 'nid' | 'salary' | 'address',
    customFileName?: string,
    customDataUrl?: string
  ) => {
    setIsScanningActive(true);
    setScanningCategory(category);

    const docId = `doc_${category}_${Date.now()}`;
    const sample = SAMPLE_DOCS[sampleKey];

    const newDoc: VerifiedDocument = {
      id: docId,
      category,
      type: docType,
      fileName: customFileName || sample.fileName,
      fileSize: customFileName ? '1.5 MB' : sample.fileSize,
      fileDataUrl: customDataUrl || sample.preview,
      status: 'scanning',
      extractedDetails: [],
      uploadedAt: 'Scanning...',
    };

    // Update list with scanning status
    setDocuments((prev) => [...prev.filter((d) => d.category !== category), newDoc]);

    // Simulate multi-stage AI OCR scanning delay
    setTimeout(() => {
      let extracted: { label: string; value: string }[] = [];

      if (category === 'identity') {
        extracted = [
          { label: 'Name on ID', value: applicantName || 'Applicant Verified' },
          { label: 'Doc Type', value: docType },
          { label: 'OCR Match Score', value: '99.8% (Exact Match)' },
          { label: 'Hologram Check', value: 'Passed Anti-Tamper Filter' },
        ];
      } else if (category === 'income') {
        extracted = [
          { label: 'Document Type', value: docType },
          { label: 'Verified Income', value: `${currencySymbol}${monthlyIncome.toLocaleString()}/mo` },
          { label: 'Employer / Turnover', value: 'Verified via Corporate Database' },
          { label: 'Payroll Stamp', value: 'Valid Digital Signature' },
        ];
      } else {
        extracted = [
          { label: 'Address Type', value: docType },
          { label: 'Address Status', value: 'Matches Residence on Profile' },
          { label: 'Utility Account', value: 'Active & In Good Standing' },
        ];
      }

      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: 'verified',
                extractedDetails: extracted,
                uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            : d
        )
      );

      setIsScanningActive(false);
      setScanningCategory(null);
    }, 1200);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: 'identity' | 'income' | 'address',
    docType: string,
    sampleKey: 'nid' | 'salary' | 'address'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      simulateUploadAndScan(category, docType, sampleKey, file.name, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDoc = (category: string) => {
    setDocuments((prev) => prev.filter((d) => d.category !== category));
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ScanLine className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              Automated KYC & AI Document Scanner
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                OCR Active
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulate uploading proof of identity and income. Our digital scanner instantly extracts and cross-references your credentials.
            </p>
          </div>
        </div>

        {/* Verification Checklist Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold shrink-0">
          <span
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              allRequiredMet
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
          >
            {allRequiredMet ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> All Required Docs Verified
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" /> Needs Identity & Income Docs
              </>
            )}
          </span>
        </div>
      </div>

      {/* Grid of 3 Document Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* DOCUMENT 1: Proof of Identity */}
        {(() => {
          const doc = documents.find((d) => d.category === 'identity');
          const isScanningThis = isScanningActive && scanningCategory === 'identity';

          return (
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
              {/* Scan laser line animation when scanning */}
              {isScanningThis && (
                <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex flex-col justify-between">
                  <div className="w-full h-1 bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500" />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800">
                      <CreditCard className="w-4 h-4" />
                    </span>
                    <div>
                      <h5 className="font-bold text-white text-sm">1. Proof of Identity</h5>
                      <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                        Mandatory
                      </span>
                    </div>
                  </div>

                  {doc?.status === 'verified' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  ) : isScanningThis ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Scanning
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  National ID card (NID), Passport, or Government Driving License.
                </p>

                {/* Uploaded state preview */}
                {doc ? (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 truncate pr-2">
                        {doc.fileName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {doc.fileSize}
                      </span>
                    </div>

                    {/* OCR Results breakdown */}
                    {doc.status === 'verified' && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                        {doc.extractedDetails.map((detail, idx) => (
                          <div key={idx} className="flex justify-between text-slate-400">
                            <span>{detail.label}:</span>
                            <span className="font-bold text-emerald-400">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc('identity')}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-800 text-center mb-4 bg-slate-900/40">
                    <UploadCloud className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                    <span className="text-xs text-slate-400 font-medium block">
                      Drag & Drop or Choose ID file
                    </span>
                    <span className="text-[10px] text-slate-600">JPG, PNG, PDF up to 10MB</span>
                  </div>
                )}
              </div>

              {/* Actions: Real Upload or 1-Click Simulation */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold text-center block cursor-pointer transition-colors">
                  <span>Browse Device Files</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'identity', 'National ID (NID)', 'nid')}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => simulateUploadAndScan('identity', 'National ID (NID)', 'nid')}
                  disabled={isScanningThis}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Simulate Sample NID Upload
                </button>
              </div>
            </div>
          );
        })()}

        {/* DOCUMENT 2: Proof of Income */}
        {(() => {
          const doc = documents.find((d) => d.category === 'income');
          const isScanningThis = isScanningActive && scanningCategory === 'income';

          return (
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
              {isScanningThis && (
                <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none flex flex-col justify-between">
                  <div className="w-full h-1 bg-cyan-400 animate-pulse shadow-lg shadow-cyan-500" />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800">
                      <Building className="w-4 h-4" />
                    </span>
                    <div>
                      <h5 className="font-bold text-white text-sm">2. Proof of Income</h5>
                      <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">
                        Mandatory
                      </span>
                    </div>
                  </div>

                  {doc?.status === 'verified' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  ) : isScanningThis ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Scanning
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Salary pay slip, 3-month bank statement, or certified trade turnover.
                </p>

                {doc ? (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 truncate pr-2">
                        {doc.fileName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {doc.fileSize}
                      </span>
                    </div>

                    {doc.status === 'verified' && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                        {doc.extractedDetails.map((detail, idx) => (
                          <div key={idx} className="flex justify-between text-slate-400">
                            <span>{detail.label}:</span>
                            <span className="font-bold text-cyan-400">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc('income')}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-800 text-center mb-4 bg-slate-900/40">
                    <UploadCloud className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                    <span className="text-xs text-slate-400 font-medium block">
                      Drag & Drop Pay Slip / Statement
                    </span>
                    <span className="text-[10px] text-slate-600">PDF, JPG, Excel or CSV</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold text-center block cursor-pointer transition-colors">
                  <span>Browse Device Files</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'income', 'Salary Pay Slip', 'salary')}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => simulateUploadAndScan('income', 'Salary Pay Slip', 'salary')}
                  disabled={isScanningThis}
                  className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Simulate Pay Slip Upload
                </button>
              </div>
            </div>
          );
        })()}

        {/* DOCUMENT 3: Address Proof (Optional / Boosts Approval) */}
        {(() => {
          const doc = documents.find((d) => d.category === 'address');
          const isScanningThis = isScanningActive && scanningCategory === 'address';

          return (
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between relative overflow-hidden group">
              {isScanningThis && (
                <div className="absolute inset-0 bg-amber-500/10 pointer-events-none flex flex-col justify-between">
                  <div className="w-full h-1 bg-amber-400 animate-pulse shadow-lg shadow-amber-500" />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
                      <Home className="w-4 h-4" />
                    </span>
                    <div>
                      <h5 className="font-bold text-white text-sm">3. Proof of Address</h5>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        Fast-Track Bonus
                      </span>
                    </div>
                  </div>

                  {doc?.status === 'verified' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  ) : isScanningThis ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Scanning
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                      Optional
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Electricity, water, gas utility bill or registered tenancy contract.
                </p>

                {doc ? (
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 truncate pr-2">
                        {doc.fileName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {doc.fileSize}
                      </span>
                    </div>

                    {doc.status === 'verified' && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                        {doc.extractedDetails.map((detail, idx) => (
                          <div key={idx} className="flex justify-between text-slate-400">
                            <span>{detail.label}:</span>
                            <span className="font-bold text-amber-300">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc('address')}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-800 text-center mb-4 bg-slate-900/40">
                    <UploadCloud className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                    <span className="text-xs text-slate-400 font-medium block">
                      Upload Utility Bill
                    </span>
                    <span className="text-[10px] text-slate-600">Within last 3 months</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold text-center block cursor-pointer transition-colors">
                  <span>Browse Device Files</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'address', 'Utility Bill', 'address')}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => simulateUploadAndScan('address', 'Utility Bill (Address Proof)', 'address')}
                  disabled={isScanningThis}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Simulate Utility Bill Upload
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Document Preview Lightbox Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-white text-base">
                  {previewDoc.type} Preview
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {previewDoc.fileName} • {previewDoc.fileSize}
                </span>
              </div>
            </div>

            {/* Document Rendered Preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 mb-4 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={previewDoc.fileDataUrl}
                alt={previewDoc.fileName}
                className="w-full h-auto rounded-xl object-contain max-h-72"
              />
            </div>

            {/* Extracted Details Table */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 mb-4 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                AI OCR Extracted Metadata:
              </span>
              {previewDoc.extractedDetails.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-300">
                  <span className="text-slate-400">{item.label}:</span>
                  <span className="font-bold text-emerald-400 font-mono">{item.value}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Document Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
