import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Star,
  Download,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  QrCode,
  Smartphone,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Lock,
  FileText,
  Zap,
  Building,
  Info,
  ThumbsUp,
} from 'lucide-react';

interface PlayStoreAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMobileApp?: () => void;
  onOpenPlayStorePublic?: () => void;
}

export const PlayStoreAppModal: React.FC<PlayStoreAppModalProps> = ({
  isOpen,
  onClose,
  onOpenMobileApp,
  onOpenPlayStorePublic,
}) => {
  const [installState, setInstallState] = useState<'IDLE' | 'DOWNLOADING' | 'INSTALLING' | 'INSTALLED'>('IDLE');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'ABOUT' | 'SCREENSHOTS' | 'REVIEWS' | 'QR'>('ABOUT');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [apkDownloaded, setApkDownloaded] = useState<boolean>(false);

  if (!isOpen) return null;

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.nsmobile.customerapp';

  // Simulate Google Play Interactive App Installation
  const handleInstallApp = () => {
    if (installState === 'INSTALLED') {
      if (onOpenMobileApp) {
        onOpenMobileApp();
      }
      onClose();
      return;
    }

    setInstallState('DOWNLOADING');
    setDownloadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDownloadProgress(100);
        setInstallState('INSTALLING');

        setTimeout(() => {
          setInstallState('INSTALLED');
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.5 },
          });
        }, 1200);
      } else {
        setDownloadProgress(progress);
      }
    }, 250);
  };

  const [copiedApkUrl, setCopiedApkUrl] = useState<boolean>(false);

  const apkDownloadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/download/NS_Mobile_Finance_v2.4.1.apk`
    : '/download/NS_Mobile_Finance_v2.4.1.apk';

  // Real Android APK Download Trigger
  const handleDownloadApk = () => {
    const a = document.createElement('a');
    a.href = '/download/NS_Mobile_Finance_v2.4.1.apk';
    a.download = 'NS_Mobile_Finance_v2.4.1.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setApkDownloaded(true);
    setTimeout(() => setApkDownloaded(false), 4000);
  };

  const handleCopyApkUrl = () => {
    navigator.clipboard.writeText(apkDownloadUrl);
    setCopiedApkUrl(true);
    setTimeout(() => setCopiedApkUrl(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(playStoreUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Google Play Store Top Navigation Bar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Google Play Icon Vector */}
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 512 512">
                <path
                  fill="#00C1A6"
                  d="M325.3 234.3L10.7 41.6C4.4 45.4 0 52.3 0 60.8v390.4c0 8.5 4.4 15.4 10.7 19.2l314.6-192.8c4.6-2.8 7.3-7.5 7.3-12.8s-2.7-10-7.3-10.5z"
                />
                <path
                  fill="#0083D6"
                  d="M10.7 41.6L325.3 234.3l94-57.6L67.1 7.4c-18.4-11.2-41.2-2.5-56.4 34.2z"
                />
                <path
                  fill="#FF3333"
                  d="M10.7 470.4c15.2 36.7 38 45.4 56.4 34.2l352.2-215.7-94-57.6L10.7 470.4z"
                />
                <path
                  fill="#FFBA00"
                  d="M504.6 245.2l-85.3-52.2-94 57.6 94 57.6 85.3-52.2c10.3-6.3 10.3-16.5 0-22.8z"
                />
              </svg>
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                Google <span className="text-slate-300 font-normal">Play</span>
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold ml-1">
              OFFICIAL STORE
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPlayStorePublic && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPlayStorePublic();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 hover:text-white border border-teal-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Open Public Web Store Page"
              >
                <ExternalLink className="w-3 h-3 text-teal-400" />
                <span className="hidden sm:inline">Public Page</span>
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Copy Play Store Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* App Header Box */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-emerald-500 p-0.5 shadow-xl shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center text-center p-2">
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  NS
                </span>
                <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">
                  MOBILE
                </span>
                <div className="w-5 h-1 bg-emerald-500 rounded-full mt-0.5"></div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
                NS Mobile Finance - Loan & EMI
              </h1>
              <p className="text-xs text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                <span>NS Mobile Infotech Ltd.</span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] text-slate-400 font-normal">Chanchal, Malda</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Contains ads • In-app loan payments • Verified merchant
              </p>

              {/* Verified badge */}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-slate-400">
                  Verified by <strong className="text-slate-200">Google Play Protect</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 divide-x divide-slate-800 bg-slate-950/70 border border-slate-800/80 rounded-2xl py-2.5 text-center">
            <div className="px-1">
              <div className="flex items-center justify-center gap-1 text-xs font-black text-white">
                <span>4.8</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[9px] text-slate-400 font-medium block mt-0.5">12.4K reviews</span>
            </div>
            <div className="px-1">
              <div className="text-xs font-black text-white font-mono">24.8 MB</div>
              <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Download size</span>
            </div>
            <div className="px-1">
              <div className="w-5 h-5 rounded border border-slate-700 bg-slate-900 text-[9px] font-bold text-slate-300 flex items-center justify-center mx-auto">
                3+
              </div>
              <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Rated for 3+</span>
            </div>
            <div className="px-1">
              <div className="text-xs font-black text-white font-mono">50K+</div>
              <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Downloads</span>
            </div>
          </div>

          {/* Install & Download Primary Buttons */}
          <div className="space-y-2">
            {installState === 'DOWNLOADING' ? (
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Downloading from Google Play...</span>
                  </span>
                  <span className="font-mono">{downloadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 text-right font-mono">
                  {(24.8 * (downloadProgress / 100)).toFixed(1)} MB / 24.8 MB
                </div>
              </div>
            ) : installState === 'INSTALLING' ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center gap-2 border border-slate-700"
              >
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Installing NS Mobile Finance on device...</span>
              </button>
            ) : installState === 'INSTALLED' ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (onOpenMobileApp) onOpenMobileApp();
                    onClose();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  <span>Open App Now</span>
                </button>
                <button
                  onClick={() => setInstallState('IDLE')}
                  className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Uninstall / Reset
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleInstallApp}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all group"
                >
                  <Download className="w-4 h-4 text-slate-950 group-hover:translate-y-0.5 transition-transform" />
                  <span>Install on Android Device</span>
                </button>

                <button
                  onClick={handleDownloadApk}
                  className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  title="Direct standalone APK download file"
                >
                  {apkDownloaded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">APK Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Download APK (v2.4.1)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Direct APK Link Box */}
            <div className="flex items-center justify-between gap-2 p-2 px-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono">
              <span className="text-slate-400 truncate select-all">{apkDownloadUrl}</span>
              <button
                type="button"
                onClick={handleCopyApkUrl}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold shrink-0 cursor-pointer transition-colors"
              >
                {copiedApkUrl ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-800 text-xs">
            {[
              { id: 'ABOUT', label: 'About App' },
              { id: 'SCREENSHOTS', label: 'Screenshots' },
              { id: 'REVIEWS', label: 'Reviews & Ratings' },
              { id: 'QR', label: 'QR Scan' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 sm:px-4 font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: ABOUT APP */}
          {activeTab === 'ABOUT' && (
            <div className="space-y-4 text-xs animate-fadeIn">
              <div>
                <h3 className="font-bold text-white text-sm mb-1.5 flex items-center gap-2">
                  <span>About this app</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-normal">#1 Finance</span>
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Official Android mobile application for <strong>N.S. Mobile & Loan Finance (Chanchal, Malda)</strong>.
                  Manage active loans, track outstanding principal, make 1-tap PhonePe payments, set up automated
                  monthly bank auto-pay deductions, and download signed yearly loan tax statements instantly.
                </p>
              </div>

              {/* What's New Box */}
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    What's New in Version 2.4.1
                  </span>
                  <span className="text-[10px] font-mono text-purple-300">Updated Oct 2026</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-white">PhonePe Direct Pay:</strong> 1-Tap payments to merchant 8509184717 with zero fee.
                  </li>
                  <li>
                    <strong className="text-white">Intelligent Overdue Detection:</strong> Automatically suggests exact overdue amounts with late fee breakdown in highlighted red.
                  </li>
                  <li>
                    <strong className="text-white">Yearly Loan Statement PDF:</strong> Download FY 2025–26 official repayment certificate & Section 80C/24(b) tax summary.
                  </li>
                  <li>
                    <strong className="text-white">Web Notification API:</strong> System-level browser push notifications for upcoming EMI reminders.
                  </li>
                  <li>
                    <strong className="text-white">NPCI Auto-Pay e-Mandate:</strong> Recurring auto-debit authorizations for SBI, HDFC, PNB, and Bank of Baroda.
                  </li>
                </ul>
              </div>

              {/* App Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Version</span>
                  <span className="text-white font-mono font-bold">2.4.1 (Oct 2026)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Requires Android</span>
                  <span className="text-white font-mono font-bold">8.0 and up</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Developer</span>
                  <span className="text-white font-bold truncate block">NS Mobile Infotech</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Package ID</span>
                  <span className="text-white font-mono font-bold truncate block">com.nsmobile.customerapp</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Interactive Elements</span>
                  <span className="text-white font-bold">UPI Payments, Digital PDF</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Customer Support</span>
                  <span className="text-white font-mono font-bold">+91 8509184717</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCREENSHOTS */}
          {activeTab === 'SCREENSHOTS' && (
            <div className="space-y-3 animate-fadeIn">
              <h4 className="text-xs font-bold text-white">App Features & Visual Preview</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Screen 1 */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between h-48 text-center">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 mx-auto flex items-center justify-center font-bold text-xs">
                    📱
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Home Dashboard</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Live loan balance, due date timer & EMI progress</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 py-0.5 rounded">
                    Loan Status
                  </span>
                </div>

                {/* Screen 2 */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between h-48 text-center">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-300 mx-auto flex items-center justify-center font-bold text-xs">
                    पे
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">PhonePe 1-Tap Pay</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Merchant UPI 8509184717 with overdue highlights in red</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-purple-400 bg-purple-500/10 py-0.5 rounded">
                    Instant Credit
                  </span>
                </div>

                {/* Screen 3 */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between h-48 text-center">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-300 mx-auto flex items-center justify-center font-bold text-xs">
                    📄
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Yearly Statement</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Download FY 2025-26 12-month EMI & 80C/24b tax PDF</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-teal-400 bg-teal-500/10 py-0.5 rounded">
                    Govt Tax Valid
                  </span>
                </div>

                {/* Screen 4 */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between h-48 text-center">
                  <div className="w-8 h-8 rounded-xl bg-amber-600/30 text-amber-300 mx-auto flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Auto-Pay Mandate</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Recurring bank auto-debit with NPCI e-Mandate UMRN</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 py-0.5 rounded">
                    Zero Penalty
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'REVIEWS' && (
            <div className="space-y-3.5 animate-fadeIn text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Ratings & Reviews</h4>
                  <p className="text-[10px] text-slate-400">Ratings are verified from loan customers in Malda</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white font-mono flex items-center justify-end gap-1">
                    <span>4.8</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">12,410 total ratings</span>
                </div>
              </div>

              {/* User Review 1 */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      TR
                    </div>
                    <div>
                      <span className="font-bold text-white block">Tariq Rahman</span>
                      <span className="text-[9px] text-slate-500">Verified Borrower • Oct 10, 2026</span>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">
                  "PhonePe payment takes literally 5 seconds, and my loan balance updates immediately. The new feature to download the 12-month yearly loan statement PDF for income tax is extremely useful!"
                </p>
              </div>

              {/* User Review 2 */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">
                      FZ
                    </div>
                    <div>
                      <span className="font-bold text-white block">Fatima Zohra</span>
                      <span className="text-[9px] text-slate-500">Verified Business Borrower • Oct 07, 2026</span>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">
                  "Setting up Auto-Pay with my bank account was super easy. Now I don't have to worry about missing the 5th of every month. Highly recommended for everyone in Chanchal."
                </p>
              </div>

              {/* User Review 3 */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                      NI
                    </div>
                    <div>
                      <span className="font-bold text-white block">Nahid Islam</span>
                      <span className="text-[9px] text-slate-500">Verified Customer • Oct 04, 2026</span>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-300">
                  "The overdue amount suggestion is genius — it automatically showed me the exact overdue amount highlighted in red when my due date passed, so I was able to clear it right away with PhonePe!"
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: QR SCAN */}
          {activeTab === 'QR' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3 animate-fadeIn">
              <h4 className="text-xs font-bold text-white">Scan to Install on Android Mobile</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Open your Android phone camera or Google Lens to scan the QR code and install the app from Google Play directly.
              </p>

              {/* Realistic QR Mockup */}
              <div className="w-44 h-44 mx-auto p-3 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <div className="w-full h-full border-4 border-slate-900 rounded-lg p-1.5 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-xs"></div>
                    </div>
                    <div className="flex-1 px-1 grid grid-cols-4 gap-0.5">
                      <div className="bg-slate-950 h-2"></div>
                      <div className="bg-slate-950 h-2"></div>
                      <div className="bg-slate-950 h-2"></div>
                    </div>
                    <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-xs"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-6 gap-1 my-1">
                    <div className="h-2 bg-slate-950 rounded-xs"></div>
                    <div className="h-2 bg-slate-950 rounded-xs"></div>
                    <div className="h-2 bg-slate-950 rounded-xs"></div>
                    <div className="h-2 bg-slate-950 rounded-xs"></div>
                    <div className="h-2 bg-slate-950 rounded-xs"></div>
                    <div className="h-2 bg-slate-950 rounded-xs"></div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-xs"></div>
                    </div>
                    <div className="text-[8px] font-black font-mono text-slate-900">
                      PLAY STORE
                    </div>
                    <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-xs"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-mono text-slate-400 block break-all">
                  {playStoreUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Play Store Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Google Play Protect Verified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onOpenMobileApp) onOpenMobileApp();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold border border-purple-500/30 transition-colors cursor-pointer"
            >
              Launch PWA App View
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
