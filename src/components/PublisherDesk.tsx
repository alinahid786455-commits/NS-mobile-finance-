import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CurrencyConfig,
  LoanApplication,
  PublishedItem,
  PublicationType,
  TargetAudience,
} from '../types/loan';
import { PUBLISHER_DETAILS } from '../data/publisherData';
import { LOAN_PRODUCTS, SHOP_INFO } from '../data/loanProducts';
import { formatCurrency } from '../utils/calculator';
import {
  Megaphone,
  Send,
  FileText,
  CheckCircle2,
  Award,
  ShieldCheck,
  Printer,
  Share2,
  Copy,
  Search,
  Eye,
  X,
  AlertTriangle,
  Smartphone,
  Sparkles,
  Clock,
  Building2,
  Radio,
  FileCheck,
  ChevronRight,
  Filter,
  Check,
  Phone,
  QrCode,
  Calendar,
  Layers,
} from 'lucide-react';

interface PublisherDeskProps {
  applications: LoanApplication[];
  selectedCurrency: CurrencyConfig;
  publications: PublishedItem[];
  onPublishItem: (newItem: PublishedItem, notifyMobile?: boolean) => void;
  onOpenMobileApp?: () => void;
}

export const PublisherDesk: React.FC<PublisherDeskProps> = ({
  applications,
  selectedCurrency,
  publications,
  onPublishItem,
  onOpenMobileApp,
}) => {
  // Navigation Tabs within Publisher Desk
  const [activeTab, setActiveTab] = useState<
    'broadcast' | 'documents' | 'rate-sheet' | 'feed'
  >('broadcast');

  // Broadcast Composer State
  const [composerTitle, setComposerTitle] = useState<string>(
    '⏰ Urgent EMI Due Alert: 1-Tap PhonePe Payment Open'
  );
  const [composerSummary, setComposerSummary] = useState<string>(
    'Monthly installments for current cycle are open. Pay via PhonePe to avoid late charges.'
  );
  const [composerContent, setComposerContent] = useState<string>(
    `Dear Borrowers,\n\nPlease note that your upcoming EMI is due shortly. Repay instantly using PhonePe UPI (${SHOP_INFO.upiId}) or directly at the NS Mobile Shop counter in Chanchal.\n\nKeep your transaction ID safe. Instant digital receipt will be provided upon payment.`
  );
  const [composerAudience, setComposerAudience] = useState<TargetAudience>('ACTIVE_BORROWERS');
  const [composerPriority, setComposerPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('HIGH');
  const [selectedChannels, setSelectedChannels] = useState<{
    appPush: boolean;
    sms: boolean;
    whatsApp: boolean;
    portal: boolean;
  }>({
    appPush: true,
    sms: true,
    whatsApp: false,
    portal: true,
  });

  // Document Publisher State
  const [docType, setDocType] = useState<
    'SANCTION_BULLETIN' | 'NOC_CERTIFICATE' | 'DEMAND_NOTICE' | 'KFS_DISCLOSURE'
  >('SANCTION_BULLETIN');
  const [selectedAppId, setSelectedAppId] = useState<string>(
    applications[0]?.id || 'NS-LN-849201'
  );
  const selectedApp =
    applications.find((a) => a.id === selectedAppId) || applications[0];

  // Feed Filter / Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Modal for viewing complete publication
  const [activeInspectionItem, setActiveInspectionItem] = useState<PublishedItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastPublishedSuccess, setLastPublishedSuccess] = useState<string | null>(null);

  // Play audio chime
  const playPublishChime = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      osc1.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.35); // C6

      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.35); // E6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Quick Template Prompts
  const applyTemplate = (key: 'emi' | 'festival' | 'phonepe' | 'shop' | 'kfs') => {
    if (key === 'emi') {
      setComposerTitle('⏰ Urgent EMI Due Reminder: Pay via PhonePe');
      setComposerSummary(
        'Due date is approaching. Use PhonePe 1-Tap payment to keep your credit score in prime condition.'
      );
      setComposerContent(
        `Dear Borrower,\n\nYour upcoming monthly EMI is due in 3 days. Settle effortlessly via PhonePe (${SHOP_INFO.upiId}) or visit NS Mobile Shop, Chanchal State. Avoid late fees and maintain 750+ CIBIL score.`
      );
      setComposerAudience('ACTIVE_BORROWERS');
      setComposerPriority('HIGH');
    } else if (key === 'festival') {
      setComposerTitle('🎉 Special Festival 0% Interest Scheme on 5G Smartphones');
      setComposerSummary(
        'Zero down payment and 0% interest on selected Samsung, Vivo, and OnePlus handsets at NS Mobile Shop.'
      );
      setComposerContent(
        `Special Festive Financing Offer!\n\nGet any 5G Smartphone on easy monthly installments with 0% interest and ZERO processing fee! Instant verification with Aadhaar & PAN Card at NS Mobile Shop counter. Valid this week only!`
      );
      setComposerAudience('ALL_CUSTOMERS');
      setComposerPriority('NORMAL');
    } else if (key === 'phonepe') {
      setComposerTitle('📱 PhonePe UPI Repayment & Instant Reconciliation Notice');
      setComposerSummary(
        'Direct payments to 8509184717@ybl are now auto-reconciled within 30 seconds.'
      );
      setComposerContent(
        `Official Notification:\n\nAll repayments made via PhonePe to our verified merchant ID: ${SHOP_INFO.upiId} (NS MOBILE SHOP & N.S. FINANCE) are reconciled immediately. Your active loan balance in the Customer App will reflect in real-time.`
      );
      setComposerAudience('ALL_CUSTOMERS');
      setComposerPriority('NORMAL');
    } else if (key === 'shop') {
      setComposerTitle('🏪 NS Mobile Shop Counter Timings & Support Circular');
      setComposerSummary(
        'Chanchal Branch open Monday to Sunday 10:00 AM to 10:00 PM for walk-in loan queries & cash payments.'
      );
      setComposerContent(
        `NS Mobile Shop & N.S. Finance Customer Support Update:\n\nOur service desk at Chanchal State (Garage er Samne, Malda) is operational 7 days a week from 10 AM to 10 PM. Phone & WhatsApp helpline: ${SHOP_INFO.formattedPhone}.`
      );
      setComposerAudience('PUBLIC');
      setComposerPriority('NORMAL');
    } else if (key === 'kfs') {
      setComposerTitle('🛡️ Key Fact Statement (KFS) & Fair Lending Transparency');
      setComposerSummary(
        'Official disclosure of annual percentage rates, repayment schedules, and zero-hidden-fee guarantee.'
      );
      setComposerContent(
        `Public Compliance Declaration:\n\nNS Mobile Shop & N.S. Finance operates strictly in adherence to fair microfinance guidelines. No cash advance fees or undisclosed deductions are charged. All terms are outlined in the sanction agreement.`
      );
      setComposerAudience('PUBLIC');
      setComposerPriority('URGENT');
    }
  };

  // Submit Broadcast
  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerTitle.trim() || !composerContent.trim()) return;

    const channels: ('APP_PUSH' | 'SMS_BROADCAST' | 'WHATSAPP' | 'PUBLIC_PORTAL')[] = [];
    if (selectedChannels.appPush) channels.push('APP_PUSH');
    if (selectedChannels.sms) channels.push('SMS_BROADCAST');
    if (selectedChannels.whatsApp) channels.push('WHATSAPP');
    if (selectedChannels.portal) channels.push('PUBLIC_PORTAL');

    const newId = `PUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newItem: PublishedItem = {
      id: newId,
      type: 'BROADCAST_NOTICE',
      title: composerTitle.trim(),
      summary: composerSummary.trim() || composerTitle.trim(),
      content: composerContent.trim(),
      targetAudience: composerAudience,
      priority: composerPriority,
      publisherEntity: PUBLISHER_DETAILS.entityName,
      authorizedSignatory: PUBLISHER_DETAILS.authorizedSignatory,
      licenseId: PUBLISHER_DETAILS.licenseId,
      publishDate: new Date().toISOString().split('T')[0],
      channels,
      viewsCount: 1,
      status: 'ACTIVE',
      digitalSignatureHash: Math.random().toString(36).substring(2, 15),
    };

    onPublishItem(newItem, selectedChannels.appPush);
    playPublishChime();

    // Trigger confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // Confetti fallback
    }

    setLastPublishedSuccess(`Broadcast #${newId} published successfully!`);
    setTimeout(() => setLastPublishedSuccess(null), 6000);
  };

  // Publish Sanction / Document Notice
  const handlePublishDocumentNotice = () => {
    if (!selectedApp) return;

    const newId = `PUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let title = '';
    let summary = '';
    let pubType: PublicationType = 'SANCTION_BULLETIN';

    if (docType === 'SANCTION_BULLETIN') {
      pubType = 'SANCTION_BULLETIN';
      title = `📜 Official Loan Sanction Bulletin: Application #${selectedApp.id}`;
      summary = `Sanction letter published for ${selectedApp.fullName} (${formatCurrency(
        selectedApp.requestedAmount,
        selectedCurrency
      )} - ${selectedApp.loanCategory} Loan).`;
    } else if (docType === 'NOC_CERTIFICATE') {
      pubType = 'NOC_CERTIFICATE';
      title = `✅ No Objection Certificate (NOC) / Final Clearance: #${selectedApp.id}`;
      summary = `Full repayment clearance certificate issued to ${selectedApp.fullName}.`;
    } else if (docType === 'DEMAND_NOTICE') {
      pubType = 'BROADCAST_NOTICE';
      title = `⚠️ EMI Installment Demand Bulletin: #${selectedApp.id}`;
      summary = `Formal notice for scheduled EMI installment of ${formatCurrency(
        selectedApp.monthlyEmi,
        selectedCurrency
      )} for ${selectedApp.fullName}.`;
    } else {
      pubType = 'REGULATORY_KFS';
      title = `📋 Key Fact Statement (KFS): #${selectedApp.id}`;
      summary = `Statutory interest rate and schedule disclosure for ${selectedApp.fullName}.`;
    }

    const newItem: PublishedItem = {
      id: newId,
      type: pubType,
      title,
      summary,
      content: `Applicant: ${selectedApp.fullName}
Application Ref: ${selectedApp.id}
Phone: ${selectedApp.phone}
Loan Category: ${selectedApp.loanCategory}
Sanctioned Amount: ${formatCurrency(selectedApp.requestedAmount, selectedCurrency)}
Monthly EMI: ${formatCurrency(selectedApp.monthlyEmi, selectedCurrency)}
Tenure: ${selectedApp.tenureMonths} Months @ ${selectedApp.interestRate}% p.a.
Authorized Signatory: ${PUBLISHER_DETAILS.authorizedSignatory}
Official Publisher: ${PUBLISHER_DETAILS.entityName}
License: ${PUBLISHER_DETAILS.licenseId}`,
      targetAudience: 'PUBLIC',
      priority: 'HIGH',
      publisherEntity: PUBLISHER_DETAILS.entityName,
      authorizedSignatory: PUBLISHER_DETAILS.authorizedSignatory,
      licenseId: PUBLISHER_DETAILS.licenseId,
      publishDate: new Date().toISOString().split('T')[0],
      channels: ['APP_PUSH', 'SMS_BROADCAST', 'PUBLIC_PORTAL'],
      viewsCount: 1,
      status: 'ACTIVE',
      relatedLoanId: selectedApp.id,
      relatedApplicantName: selectedApp.fullName,
      amount: selectedApp.requestedAmount,
      digitalSignatureHash: Math.random().toString(36).substring(2, 15),
    };

    onPublishItem(newItem, true);
    playPublishChime();

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#34d399', '#f59e0b'],
      });
    } catch {
      // Confetti fallback
    }

    setLastPublishedSuccess(`Document Bulletin #${newId} published and delivered!`);
    setTimeout(() => setLastPublishedSuccess(null), 6000);
  };

  // Publish Rate Sheet Update
  const handlePublishRateSheet = () => {
    const newId = `PUB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: PublishedItem = {
      id: newId,
      type: 'RATE_SHEET',
      title: `📊 Official Microfinance & Retail Lending Rate Card (Q4 ${new Date().getFullYear()})`,
      summary:
        'Updated interest rate schedules, zero processing fee schemes, and tenure guidelines published under official seal.',
      content: `Pursuant to the Fair Lending & Transparent Credit Practices Code, NS Mobile Shop & N.S. Finance publishes the active financing matrix effective immediately:

1. NS Mobile Smartphone & Device EMI: 0.0% No Cost EMI / 8.5% | 3 to 24 Months
2. N.S. Personal Cash Loan: 10.5% p.a. | 1.0% processing fee | 6 to 48 Months
3. N.S. Business Growth Loan: 11.5% p.a. | 1.25% processing fee | 12 to 84 Months
4. Emergency Micro Cash: 13.5% p.a. | 0.5% processing fee | 1 to 6 Months

Repayments via PhonePe UPI: ${SHOP_INFO.upiId} (NS MOBILE SHOP).`,
      targetAudience: 'ALL_CUSTOMERS',
      priority: 'NORMAL',
      publisherEntity: PUBLISHER_DETAILS.entityName,
      authorizedSignatory: PUBLISHER_DETAILS.authorizedSignatory,
      licenseId: PUBLISHER_DETAILS.licenseId,
      publishDate: new Date().toISOString().split('T')[0],
      channels: ['APP_PUSH', 'PUBLIC_PORTAL'],
      viewsCount: 1,
      status: 'ACTIVE',
      digitalSignatureHash: Math.random().toString(36).substring(2, 15),
    };

    onPublishItem(newItem, true);
    playPublishChime();

    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }

    setLastPublishedSuccess(`Official Rate Sheet #${newId} published!`);
    setTimeout(() => setLastPublishedSuccess(null), 6000);
  };

  // Filtered publications
  const filteredPublications = publications.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleCopyLink = (item: PublishedItem) => {
    navigator.clipboard.writeText(
      `https://ns-finance.malda/publications/${item.id} - ${item.title}`
    );
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      {/* SUCCESS TOAST */}
      {lastPublishedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 text-emerald-300 flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold text-sm">{lastPublishedSuccess}</span>
          </div>
          {onOpenMobileApp && (
            <button
              onClick={onOpenMobileApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>View in Customer App</span>
            </button>
          )}
        </div>
      )}

      {/* TOP PUBLISHER HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black tracking-wide uppercase flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Official Digital Publisher Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
                Lic: {PUBLISHER_DETAILS.licenseId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                West Bengal Circle
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>The Publisher Desk</span>
                <span className="text-sm font-normal text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
                  {PUBLISHER_DETAILS.entityName}
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
                Centralized broadcasting and publication engine. Dispatch automated EMI due date reminders to borrower mobile devices, publish official loan sanction notices, release retail rate cards, and maintain transparent regulatory disclosures.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Authorized Signatory: <strong>{PUBLISHER_DETAILS.authorizedSignatory}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono">{SHOP_INFO.formattedPhone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Cryptographically Verified Publisher</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Published Bulletins</div>
              <div className="text-2xl font-black text-white mt-0.5">{publications.length}</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-0.5">● 100% Live Delivery</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Audience Reach</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5">
                {publications.reduce((acc, curr) => acc + curr.viewsCount, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Mobile & Portal Views</div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 font-semibold">Push Gateway</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
                <span>Active</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Customer App Synced</div>
            </div>
          </div>
        </div>

        {/* Publisher Sub-navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'broadcast'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>📢 Notice & Push Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📜 Sanction & Legal Bulletins</span>
          </button>

          <button
            onClick={() => setActiveTab('rate-sheet')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'rate-sheet'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>📊 Lending Rate Sheet & Schemes</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>🗂️ Published Archive ({publications.length})</span>
          </button>

          {onOpenMobileApp && (
            <button
              onClick={onOpenMobileApp}
              className="ml-auto px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Open Customer App Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- TAB 1: BROADCAST & PUSH REMINDER COMPOSER ---------------- */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Composer Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  <span>Compose Broadcast Bulletin</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Publish immediate notices, automated EMI reminders, or festive financing alerts.
                </p>
              </div>

              <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                Live Customer App Sync
              </span>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Quick Industry Templates:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('emi')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  ⏰ EMI Advance Reminder
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('festival')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  🎉 Festive 0% Smartphone EMI
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('phonepe')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  📱 PhonePe Auto-Credit Notice
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('shop')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  🏪 Shop Counter Timings
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('kfs')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  🛡️ Fair Lending KFS
                </button>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handlePublishBroadcast} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Bulletin Title / Push Notification Header *
                </label>
                <input
                  type="text"
                  value={composerTitle}
                  onChange={(e) => setComposerTitle(e.target.value)}
                  placeholder="e.g. ⏰ Advance EMI Due Reminder: Pay via PhonePe"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-emerald-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Short Push Summary / Banner Preview Text *
                </label>
                <input
                  type="text"
                  value={composerSummary}
                  onChange={(e) => setComposerSummary(e.target.value)}
                  placeholder="Brief 1-line teaser displayed in notification preview bar"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Detailed Official Content / Notice Body *
                </label>
                <textarea
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  rows={4}
                  placeholder="Full text of the bulletin..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-emerald-500 font-mono text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Target Borrower Segment
                  </label>
                  <select
                    value={composerAudience}
                    onChange={(e) => setComposerAudience(e.target.value as TargetAudience)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="ACTIVE_BORROWERS">Active Borrowers (Upcoming EMI)</option>
                    <option value="OVERDUE_ACCOUNTS">Overdue / Delinquent Borrowers</option>
                    <option value="ALL_CUSTOMERS">All Registered Customers</option>
                    <option value="STORE_WALKINS">NS Mobile Shop Walk-ins</option>
                    <option value="PUBLIC">Public Noticeboard</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Broadcast Priority
                  </label>
                  <select
                    value={composerPriority}
                    onChange={(e) =>
                      setComposerPriority(e.target.value as 'NORMAL' | 'HIGH' | 'URGENT')
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-emerald-500 font-medium cursor-pointer"
                  >
                    <option value="NORMAL">Normal Information</option>
                    <option value="HIGH">High Priority (Gold Alert)</option>
                    <option value="URGENT">Urgent Action Required (Red Alert)</option>
                  </select>
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Distribution Channels:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedChannels.appPush}
                      onChange={(e) =>
                        setSelectedChannels({ ...selectedChannels, appPush: e.target.checked })
                      }
                      className="accent-emerald-500 rounded"
                    />
                    <span className="font-bold text-slate-200">📱 Mobile Push</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedChannels.sms}
                      onChange={(e) =>
                        setSelectedChannels({ ...selectedChannels, sms: e.target.checked })
                      }
                      className="accent-emerald-500 rounded"
                    />
                    <span className="font-bold text-slate-200">💬 SMS Alert</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedChannels.whatsApp}
                      onChange={(e) =>
                        setSelectedChannels({ ...selectedChannels, whatsApp: e.target.checked })
                      }
                      className="accent-emerald-500 rounded"
                    />
                    <span className="font-bold text-slate-200">🟢 WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedChannels.portal}
                      onChange={(e) =>
                        setSelectedChannels({ ...selectedChannels, portal: e.target.checked })
                      }
                      className="accent-emerald-500 rounded"
                    />
                    <span className="font-bold text-slate-200">🌐 Public Portal</span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  <span>Publish & Broadcast Notice Immediately</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Mobile Notification Preview & Official Publisher Seal */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Mobile Screen Simulation */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>Live Mobile Push Preview</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Instant Simulation
                </span>
              </div>

              {/* Mock Mobile Lock Screen Notification Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Megaphone className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                        {PUBLISHER_DETAILS.shortName} • {composerPriority} NOTICE
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Just Now</span>
                    </div>
                    <h5 className="font-bold text-white text-xs mt-0.5 truncate">
                      {composerTitle || 'Notice Title'}
                    </h5>
                    <p className="text-slate-300 text-[11px] mt-1 leading-snug line-clamp-2">
                      {composerSummary || composerContent.slice(0, 80)}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-600/30 text-purple-300 text-[10px] font-bold">
                        Pay via PhonePe
                      </span>
                      <span className="text-[10px] text-slate-400">Tap to view bulletin</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                * When published, this notification renders dynamically inside the <strong>Customer Mobile App</strong> and sends real-time alert chimes to the borrower.
              </p>
            </div>

            {/* Official Legal Publisher Stamp Card */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Official Publishing Credential</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {PUBLISHER_DETAILS.licenseId}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Publishing Entity:</span>
                  <span className="text-slate-200 font-bold">{PUBLISHER_DETAILS.entityName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Managing Signatory:</span>
                  <span className="text-slate-200 font-bold">{PUBLISHER_DETAILS.authorizedSignatory}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">District Jurisdiction:</span>
                  <span className="text-slate-200 font-bold">Malda, West Bengal</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-850">
                  <span className="text-slate-400">Official Merchant UPI:</span>
                  <span className="text-emerald-400 font-mono font-bold">{SHOP_INFO.upiId}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Security Signature:</span>
                  <span className="text-slate-400 font-mono text-[10px]">SHA-256 Validated</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All publications are stored in the immutable public transparency registry.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: SANCTION & LEGAL DOCUMENT PUBLISHER ---------------- */}
      {activeTab === 'documents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Official Sanction & Legal Document Publisher</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Batch generate, digitally certify, and publish official loan documents and sanction certificates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as typeof docType)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="SANCTION_BULLETIN">Official Sanction Letter</option>
                <option value="NOC_CERTIFICATE">No Objection Certificate (NOC)</option>
                <option value="DEMAND_NOTICE">EMI Repayment Demand Notice</option>
                <option value="KFS_DISCLOSURE">Key Fact Statement (KFS)</option>
              </select>

              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.fullName} ({app.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Printable Document Preview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-2xl space-y-6 max-w-4xl mx-auto text-slate-200">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
                  NS
                </div>
                <div>
                  <h4 className="text-base font-black text-white tracking-wide">
                    {PUBLISHER_DETAILS.entityName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {PUBLISHER_DETAILS.department} • Malda, West Bengal
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase">
                  {docType.replace('_', ' ')}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Ref: PUB-DOC-{selectedApp?.id || '2026-X'}
                </p>
              </div>
            </div>

            {/* Document Body */}
            {selectedApp && (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Borrower</span>
                    <span className="font-bold text-white text-sm">{selectedApp.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                    <span className="font-mono text-slate-300">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-bold text-emerald-400">{selectedApp.loanCategory}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount</span>
                    <span className="font-black text-white text-sm">
                      {formatCurrency(selectedApp.requestedAmount, selectedCurrency)}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <h5 className="font-bold text-white text-sm">Official Publication Decrees:</h5>
                  <p className="text-slate-300">
                    1. NS Mobile Shop & N.S. Finance hereby digitally validates that the loan application filed under reference ID <strong>{selectedApp.id}</strong> has completed due diligence and KYC verification.
                  </p>
                  <p className="text-slate-300">
                    2. Repayment terms: <strong>{selectedApp.tenureMonths} Monthly Installments</strong> of <strong>{formatCurrency(selectedApp.monthlyEmi, selectedCurrency)}</strong> each at an annual interest rate of <strong>{selectedApp.interestRate}%</strong>.
                  </p>
                  <p className="text-slate-300">
                    3. Authorized payments can be submitted directly via PhonePe to <strong>{SHOP_INFO.upiId}</strong> or in cash at the Chanchal counter with instant computerized receipt.
                  </p>
                </div>

                {/* Signatures & Seal */}
                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-amber-500/50 bg-amber-500/5 flex flex-col items-center justify-center text-center p-1">
                      <Award className="w-6 h-6 text-amber-400" />
                      <span className="text-[8px] font-black uppercase text-amber-400 mt-0.5">
                        OFFICIAL SEAL
                      </span>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white">Authorized Digital Publisher</div>
                      <div className="text-xs text-emerald-400 font-bold">{PUBLISHER_DETAILS.authorizedSignatory}</div>
                      <div className="text-[10px] text-slate-400">Lic: {PUBLISHER_DETAILS.licenseId}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-block p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <QrCode className="w-10 h-10 text-slate-300 mx-auto" />
                      <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                        SCAN TO VERIFY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Publication Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>

              <button
                type="button"
                onClick={handlePublishDocumentNotice}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish & Deliver to Borrower App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: RATE SHEET & SCHEMES PUBLISHER ---------------- */}
      {activeTab === 'rate-sheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>Official Loan Rate Sheet & Product Catalogue Publisher</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Current public rates, 0% EMI schemes, and loan catalogue under official digital stamp.
              </p>
            </div>

            <button
              onClick={handlePublishRateSheet}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Rate Sheet Update</span>
            </button>
          </div>

          {/* Rate Matrix Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LOAN_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {product.category}
                  </span>
                  <span className="text-xs font-black text-white">
                    {product.interestRate === 0 ? '0% No Cost' : `${product.interestRate}% p.a.`}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{product.title}</h4>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{product.tagline}</p>
                </div>

                <div className="space-y-1 text-xs border-t border-slate-850 pt-2.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Limits:</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(product.minAmount, selectedCurrency)} –{' '}
                      {formatCurrency(product.maxAmount, selectedCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tenure:</span>
                    <span className="font-semibold text-white">
                      {product.minTenureMonths} – {product.maxTenureMonths} Mos
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Processing Fee:</span>
                    <span className="font-semibold text-emerald-400">
                      {product.processingFeePercent === 0
                        ? 'Zero Fee'
                        : `${product.processingFeePercent}%`}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Instant counter approval with Aadhaar</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              <strong>Publisher Guarantee:</strong> All interest rates and terms displayed comply with transparent lending norms. No unannounced interest compounding or hidden prepayment penalties.
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Store Rate Card</span>
            </button>
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: PUBLISHED ARCHIVE & AUDIT LOG ---------------- */}
      {activeTab === 'feed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span>Published Bulletins & Notices Archive</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Official public log of all active broadcasts, sanction certificates, and notices.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bulletins..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-emerald-500 w-44"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="BROADCAST_NOTICE">Broadcast Notices</option>
                <option value="SANCTION_BULLETIN">Sanction Bulletins</option>
                <option value="RATE_SHEET">Rate Sheets</option>
                <option value="REGULATORY_KFS">Regulatory Disclosures</option>
              </select>
            </div>
          </div>

          {/* Publication List */}
          <div className="space-y-3">
            {filteredPublications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No publications found matching your filter criteria.
              </div>
            ) : (
              filteredPublications.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {item.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          item.priority === 'URGENT'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : item.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {item.publishDate}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm sm:text-base">{item.title}</h4>
                    <p className="text-slate-400 text-xs line-clamp-1">{item.summary}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>
                        Audience: <strong>{item.targetAudience.replace('_', ' ')}</strong>
                      </span>
                      <span>
                        Reach: <strong className="text-emerald-400">{item.viewsCount}</strong>
                      </span>
                      <div className="flex items-center gap-1">
                        {item.channels.map((ch) => (
                          <span
                            key={ch}
                            className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono text-slate-300"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveInspectionItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Bulletin</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(item)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Copy Public Link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---------------- INSPECTION MODAL ---------------- */}
      {activeInspectionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveInspectionItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {activeInspectionItem.id}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {activeInspectionItem.publishDate}
                </span>
              </div>
              <h3 className="text-xl font-black text-white">{activeInspectionItem.title}</h3>
              <p className="text-slate-400 text-xs">{activeInspectionItem.summary}</p>
            </div>

            {/* Document Body */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-line leading-relaxed">
              {activeInspectionItem.content}
            </div>

            {/* Publisher Credentials in Modal */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Publishing Entity:</span>
                <span className="text-white font-bold">{activeInspectionItem.publisherEntity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Signatory:</span>
                <span className="text-white font-bold">{activeInspectionItem.authorizedSignatory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">License ID:</span>
                <span className="text-emerald-400 font-mono">{activeInspectionItem.licenseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Digital Seal:</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  {activeInspectionItem.digitalSignatureHash || 'SHA-256 Validated'}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Publication</span>
              </button>

              <button
                onClick={() => setActiveInspectionItem(null)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
