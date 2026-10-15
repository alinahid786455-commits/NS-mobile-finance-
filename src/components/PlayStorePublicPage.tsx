import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
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
  Search,
  Grid,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Phone,
  MapPin,
  Mail,
  Calendar,
  CreditCard,
  Award,
  Clock,
} from 'lucide-react';
import { SHOP_INFO } from '../data/loanProducts';

interface PlayStorePublicPageProps {
  onOpenCustomerApp: () => void;
  onOpenLoanApply?: () => void;
  onOpenCalculator?: () => void;
}

export const PlayStorePublicPage: React.FC<PlayStorePublicPageProps> = ({
  onOpenCustomerApp,
  onOpenLoanApply,
  onOpenCalculator,
}) => {
  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'chromebook'>('phone');
  const [installState, setInstallState] = useState<'IDLE' | 'DOWNLOADING' | 'INSTALLING' | 'INSTALLED'>('IDLE');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<number>(0);
  const [isApkDownloaded, setIsApkDownloaded] = useState<boolean>(false);

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.nsmobile.customerapp';

  // Interactive Installation Simulation
  const handleInstallApp = () => {
    if (installState === 'INSTALLED') {
      onOpenCustomerApp();
      return;
    }

    setInstallState('DOWNLOADING');
    setDownloadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 16) + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setDownloadProgress(100);
        setInstallState('INSTALLING');

        setTimeout(() => {
          setInstallState('INSTALLED');
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.4 },
          });
        }, 1200);
      } else {
        setDownloadProgress(progress);
      }
    }, 220);
  };

  const [copiedApkUrl, setCopiedApkUrl] = useState<boolean>(false);

  const apkDownloadUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/download/NS_Mobile_Finance_v2.4.1.apk`
    : '/download/NS_Mobile_Finance_v2.4.1.apk';

  // Direct APK Download
  const handleDownloadApk = () => {
    const a = document.createElement('a');
    a.href = '/download/NS_Mobile_Finance_v2.4.1.apk';
    a.download = 'NS_Mobile_Finance_v2.4.1.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setIsApkDownloaded(true);
    setTimeout(() => setIsApkDownloaded(false), 4000);
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

  const screenshots = [
    {
      title: 'Borrower Dashboard',
      tag: 'LIVE BALANCE & EMI',
      desc: 'Real-time loan balance, countdown to due date, monthly EMI breakdown, and repayment tenure progress.',
      icon: '📱',
      badge: 'Dashboard',
    },
    {
      title: 'PhonePe Direct Pay',
      tag: 'INSTANT 0% FEE UPI',
      desc: 'Pay directly via PhonePe merchant 8509184717. Intelligently highlights exact overdue amounts in red.',
      icon: 'पे',
      badge: 'PhonePe',
    },
    {
      title: 'Yearly Loan Statement PDF',
      tag: 'TAX VALID CERTIFICATES',
      desc: 'Download FY 2025–26 official statement covering all 12 monthly EMIs with Section 80C and 24(b) certificates.',
      icon: '📄',
      badge: 'Tax PDF',
    },
    {
      title: 'NPCI Auto-Pay e-Mandate',
      tag: 'ZERO PENALTY RECURRING',
      desc: 'Authorize recurring bank auto-debits via UPI AutoPay, Netbanking or Debit Card with official UMRN mandate.',
      icon: '⚡',
      badge: 'Auto-Pay',
    },
    {
      title: 'Biometric Security Vault',
      tag: 'FACE ID & FINGERPRINT',
      desc: 'Hardware-backed biometric verification safeguards financial records and PhonePe transactions from unauthorized access.',
      icon: '🔒',
      badge: 'Security',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 py-4 px-3 sm:px-6 animate-fadeIn font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Google Play Store Top Bar Mockup */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Google Play Vector Logo */}
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7 shrink-0" viewBox="0 0 512 512">
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
              <span className="font-black text-base tracking-tight text-white flex items-center gap-1">
                Google <span className="text-slate-300 font-normal">Play</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 w-64">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search apps & games...</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              PUBLIC STORE LISTING
            </span>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              title="Copy Play Store Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              title="Scan QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] hidden sm:inline">QR Scan</span>
            </button>

            <button
              type="button"
              onClick={onOpenCustomerApp}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Launch App View</span>
            </button>
          </div>
        </div>

        {/* Main App Hero Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
            {/* App Icon */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-emerald-500 p-0.5 shadow-2xl shadow-purple-500/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center text-center p-2">
                <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  NS
                </span>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mt-0.5">
                  MOBILE
                </span>
                <div className="w-6 h-1 bg-emerald-400 rounded-full mt-1" />
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  NS Mobile Finance - Loan & EMI
                </h1>
              </div>

              <p className="text-sm text-emerald-400 font-bold flex items-center gap-2 flex-wrap">
                <span>NS Mobile Infotech Ltd.</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300 font-normal">Chanchal, Malda, West Bengal</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-normal">Finance #1 Free</span>
              </p>

              <p className="text-xs text-slate-400 mt-1">
                In-app loan repayment • PhonePe 8509184717 • Aadhaar & Mobile OTP • Verified digital lender
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 divide-x divide-slate-800 bg-slate-950/80 border border-slate-800 rounded-2xl py-3 px-2 text-center mt-4 max-w-lg">
                <div className="px-1.5">
                  <div className="flex items-center justify-center gap-1 text-sm font-black text-white">
                    <span>4.8</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">12.4K reviews</span>
                </div>
                <div className="px-1.5">
                  <div className="text-sm font-black text-white font-mono">24.8 MB</div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Size</span>
                </div>
                <div className="px-1.5">
                  <div className="w-5 h-5 rounded border border-slate-700 bg-slate-900 text-[10px] font-bold text-slate-300 flex items-center justify-center mx-auto">
                    3+
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Rated 3+</span>
                </div>
                <div className="px-1.5">
                  <div className="text-sm font-black text-white font-mono">50K+</div>
                  <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Downloads</span>
                </div>
              </div>

              {/* Device Tabs */}
              <div className="flex items-center gap-2 mt-4 text-xs">
                <span className="text-slate-400 text-[11px]">Available on:</span>
                {[
                  { id: 'phone', label: 'Phone' },
                  { id: 'tablet', label: 'Tablet' },
                  { id: 'chromebook', label: 'Chromebook' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDeviceType(d.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      deviceType === d.id
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-5">
                {installState === 'DOWNLOADING' ? (
                  <div className="w-full sm:w-80 space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-emerald-500/30">
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
                    className="px-6 py-3.5 rounded-2xl bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Installing on device...</span>
                  </button>
                ) : installState === 'INSTALLED' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenCustomerApp}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Smartphone className="w-4 h-4 text-slate-950" />
                      <span>Open Customer App Now</span>
                    </button>
                    <button
                      onClick={() => setInstallState('IDLE')}
                      className="px-4 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleInstallApp}
                      className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-102 group"
                    >
                      <Download className="w-4 h-4 text-slate-950 group-hover:translate-y-0.5 transition-transform" />
                      <span>Install via Google Play</span>
                    </button>

                    <button
                      onClick={handleDownloadApk}
                      className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      title="Direct standalone Android APK package"
                    >
                      {isApkDownloaded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">APK Downloaded!</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span>Direct APK (v2.4.1)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={onOpenCustomerApp}
                      className="px-5 py-3.5 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <span>Launch Web App</span>
                    </button>
                  </>
                )}
              </div>

              {/* Verified Security Notice */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Verified by <strong className="text-white">Google Play Protect</strong>. All APK binaries signed and certified.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct APK Download URL Link Card */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>Direct Android APK Download URL</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
                    v2.4.1 (Build 20401)
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Direct link to download the official verified Android APK package for manual sideloading or installation on any Android phone (8.0 to 15).
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="/download/NS_Mobile_Finance_v2.4.1.apk"
                download="NS_Mobile_Finance_v2.4.1.apk"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APK File</span>
              </a>
              <button
                type="button"
                onClick={handleCopyApkUrl}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy Direct APK Download Link"
              >
                {copiedApkUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* URL Box */}
          <div className="mt-3.5 flex items-center justify-between gap-2 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-xs font-mono">
            <div className="text-emerald-400 select-all truncate text-[11px] sm:text-xs">
              {apkDownloadUrl}
            </div>
            <button
              type="button"
              onClick={handleCopyApkUrl}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 uppercase tracking-wider font-bold shrink-0 transition-colors"
            >
              {copiedApkUrl ? 'COPIED' : 'COPY LINK'}
            </button>
          </div>
        </div>

        {/* Screenshot Showcase Carousel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>App Showcase & Visual Features</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  5 SCREENS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive preview of borrower dashboards, PhonePe payments, tax statements & Auto-Pay
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {screenshots.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedScreenshot(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    selectedScreenshot === idx ? 'bg-emerald-400 w-6' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Screenshot ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {screenshots.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedScreenshot(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-56 select-none ${
                  selectedScreenshot === idx
                    ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {s.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs leading-snug">{s.title}</h3>
                  <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase mt-0.5">
                    {s.tag}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mt-2 line-clamp-3">
                  {s.desc}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Screen {idx + 1} of 5</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    View <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Screen Detailed Callout */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-lg font-black shrink-0">
                {screenshots[selectedScreenshot].icon}
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>{screenshots[selectedScreenshot].title}</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    ({screenshots[selectedScreenshot].tag})
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {screenshots[selectedScreenshot].desc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCustomerApp}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <span>Test Live in Customer App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* About This App Description & Financial Transparency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span>About this app</span>
              <span className="text-[10px] font-mono text-emerald-400 font-normal">Official Release v2.4.1</span>
            </h2>

            <p className="text-slate-300 leading-relaxed">
              <strong>NS Mobile Finance</strong> is the official customer and borrower companion application for
              <strong> NS Mobile & Loan Finance Shop (Chanchal, Malda, West Bengal)</strong>. Designed to provide 100%
              digital transparency, this application empowers customers to manage smartphone financing EMIs, micro-cash
              loans, and business credit accounts directly from their Android devices.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                RBI & Regulatory Transparency Standard
              </h3>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                <li><strong>Loan Repayment Tenure:</strong> Minimum 6 months to maximum 36 months.</li>
                <li><strong>Annual Percentage Rate (APR):</strong> Transparent fixed rates ranging from 8.5% to 13.5% APR.</li>
                <li><strong>Representative Example:</strong> Borrow ₹18,000 for 24 months at 10.5% APR: Monthly EMI = ₹835, Total Interest = ₹2,040, Total Repayment = ₹20,040. Zero hidden processing deductions.</li>
                <li><strong>No Prepayment Penalty:</strong> Clear your balance anytime via PhonePe with 0% foreclosure surcharge.</li>
              </ul>
            </div>

            {/* What's New Box */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <h3 className="text-xs font-black text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                What's New in Version 2.4.1 (October 2026)
              </h3>
              <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                <li><strong>Intelligent Overdue Engine:</strong> PhonePe payment section intelligently detects past-due dates, calculates days overdue and auto-fills exact overdue amounts with bright red highlight.</li>
                <li><strong>Download Yearly Loan Statement:</strong> 1-Tap PDF download of FY 2025–26 official repayment statement with Income Tax Section 80C & 24(b) certificates.</li>
                <li><strong>System Web Push Notifications:</strong> Integrated Web Notification API for OS-level reminders.</li>
                <li><strong>Auto-Pay e-Mandate:</strong> Recurring auto-debit authorizations for SBI, HDFC, PNB, and Bank of Baroda.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Data Safety & Developer Contact */}
          <div className="space-y-6">
            {/* Data Safety Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 text-xs">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Data safety</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Safety starts with understanding how developers collect and share your data.
              </p>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">No data shared with third parties</strong>
                    <span>Your Aadhaar & PAN credentials remain strictly localized to NS Mobile.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-slate-300">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">256-Bit SSL Encryption</strong>
                    <span>All payment transactions and statements are encrypted in transit.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Data deletion available</strong>
                    <span>You can request account clearance once your loan is closed.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer Contact Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 text-xs">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span>Developer contact</span>
              </h2>

              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Chanchal State, Garage er Samne, Malda - 732123</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href={`tel:${SHOP_INFO.phonePeNumber}`} className="text-amber-400 font-mono font-bold hover:underline">
                    +91 {SHOP_INFO.phonePeNumber} (PhonePe & Support)
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-mono text-slate-400">support@nsmobile.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Store Hours: 10:00 AM – 10:00 PM (All 7 Days)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Public Play Store URL'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Borrower Ratings & Reviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Verified Borrower Reviews</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  4.8 ★ OUT OF 5
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ratings verified from local borrowers across Chanchal, Ashapur, and Malda
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-white font-mono flex items-center justify-end gap-1">
                <span>4.8</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[11px] text-slate-400">12,410 total verified ratings</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    TR
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">Tariq Rahman</span>
                    <span className="text-[9px] text-slate-500">Verified Salaried Borrower • Oct 2026</span>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "The PhonePe 1-tap payment feature is a lifesaver. And being able to download my 12-month loan statement and interest certificate for tax filing right on my mobile in 5 seconds is unmatched."
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                    FZ
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">Fatima Zohra</span>
                    <span className="text-[9px] text-slate-500">Business Growth Borrower • Oct 2026</span>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Best digital lending app in Malda district! Setting up recurring monthly auto-debit with my SBI bank account was effortless. Zero hassle, zero extra fees."
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                    NI
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">Nahid Islam</span>
                    <span className="text-[9px] text-slate-500">Smart Device Customer • Oct 2026</span>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "When my due date passed, the app intelligently highlighted the exact overdue amount in red with late fee waiver details, so I cleared it immediately on PhonePe. Highly recommend!"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Scan Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Scan to Install on Android</span>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* QR Mockup */}
            <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-full h-full border-4 border-slate-900 rounded-lg p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs" />
                  </div>
                  <div className="flex-1 px-1 grid grid-cols-4 gap-0.5">
                    <div className="bg-slate-950 h-2" />
                    <div className="bg-slate-950 h-2" />
                    <div className="bg-slate-950 h-2" />
                  </div>
                  <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-1 my-1">
                  <div className="h-2 bg-slate-950 rounded-xs" />
                  <div className="h-2 bg-slate-950 rounded-xs" />
                  <div className="h-2 bg-slate-950 rounded-xs" />
                  <div className="h-2 bg-slate-950 rounded-xs" />
                  <div className="h-2 bg-slate-950 rounded-xs" />
                  <div className="h-2 bg-slate-950 rounded-xs" />
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-xs" />
                  </div>
                  <div className="text-[9px] font-black font-mono text-slate-900">
                    PLAY STORE
                  </div>
                  <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-xs" />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Point your smartphone camera at this code to open the public Google Play Store page.
            </p>

            <button
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
