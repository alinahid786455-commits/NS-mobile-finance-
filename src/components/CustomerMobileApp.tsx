import React, { useState, useEffect, useMemo } from 'react';
import { ActiveLoan, CurrencyConfig, LoanApplication, CustomerUser, PublishedItem } from '../types/loan';
import { formatCurrency, getLoanOverdueStatus, LoanOverdueDetails } from '../utils/calculator';
import { CustomerDocPdfModal, CustomerDocType } from './CustomerDocPdfModal';
import { SanctionCertificateModal } from './SanctionCertificateModal';
import { BiometricAuthOverlay, BiometricTarget } from './BiometricAuthOverlay';
import { AutoPaySetupModal, AutoPayDetails } from './AutoPaySetupModal';
import { CustomerLoanDirectoryModal } from './CustomerLoanDirectoryModal';
import { PlayStoreAppModal } from './PlayStoreAppModal';
import { DEMO_CUSTOMERS, maskAadhaar, maskPan } from '../data/customerData';
import { SHOP_INFO } from '../data/loanProducts';
import confetti from 'canvas-confetti';
import {
  Smartphone,
  Wifi,
  Battery,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  Download,
  Printer,
  QrCode,
  ArrowRight,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Lock,
  Unlock,
  Bell,
  BellRing,
  Clock,
  Volume2,
  VolumeX,
  Sliders,
  MessageSquare,
  Fingerprint,
  ScanFace,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  Send,
  Zap,
  Award,
  FileText,
  User,
  LogOut,
  Maximize2,
  Minimize2,
  Share2,
  History,
  TrendingUp,
  Megaphone,
  Building,
  FileSpreadsheet,
  Globe,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

interface CustomerMobileAppProps {
  currentCustomer?: CustomerUser | null;
  activeLoans: ActiveLoan[];
  applications: LoanApplication[];
  selectedCurrency: CurrencyConfig;
  onMakePayment: (loanId: string, amount: number) => void;
  onOpenCustomerLogin: () => void;
  onOpenApply: () => void;
  onOpenEmiCalculator: () => void;
  onSwitchToDesktopPortal: () => void;
  onSelectCustomer?: (customer: CustomerUser) => void;
  publishedNotices?: PublishedItem[];
  onOpenPublisherDesk?: () => void;
  onOpenPlayStorePublic?: () => void;
}

export const CustomerMobileApp: React.FC<CustomerMobileAppProps> = ({
  currentCustomer,
  activeLoans,
  applications,
  selectedCurrency,
  onMakePayment,
  onOpenCustomerLogin,
  onOpenApply,
  onOpenEmiCalculator,
  onSwitchToDesktopPortal,
  onSelectCustomer,
  publishedNotices = [],
  onOpenPublisherDesk,
  onOpenPlayStorePublic,
}) => {
  // Mobile app tab states
  const [mobileTab, setMobileTab] = useState<'home' | 'loans' | 'phonepe' | 'kyc' | 'profile'>('home');
  const [isDeviceFrame, setIsDeviceFrame] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [batteryLevel] = useState<number>(98);

  // Active loan in focus
  const [selectedLoanId, setSelectedLoanId] = useState<string>(activeLoans[0]?.id || '');
  const selectedLoan = activeLoans.find((l) => l.id === selectedLoanId) || activeLoans[0];

  // Document PDF Modal
  const [activePdfDoc, setActivePdfDoc] = useState<CustomerDocType | null>(null);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [isPublisherBulletinsOpen, setIsPublisherBulletinsOpen] = useState<boolean>(false);

  // Security / Unmasking
  const [showAadhaarNumber, setShowAadhaarNumber] = useState<boolean>(false);
  const [showPanNumber, setShowPanNumber] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulated Biometric Authentication (Face ID / Fingerprint) for PhonePe & Loan Details
  const [biometricTarget, setBiometricTarget] = useState<BiometricTarget | null>(null);
  const [unlockedTabs, setUnlockedTabs] = useState<{ phonepe: boolean; loans: boolean }>({
    phonepe: false,
    loans: false,
  });

  // Navigation with Biometric Shield
  const handleNavigateWithBiometric = (targetTab: 'home' | 'loans' | 'phonepe' | 'kyc' | 'profile') => {
    if (targetTab === 'phonepe' || targetTab === 'loans') {
      if (isBiometricEnabled && !unlockedTabs[targetTab]) {
        // Intercept navigation and prompt biometric scan overlay
        setBiometricTarget(targetTab);
        return;
      }
    }
    setMobileTab(targetTab);
  };

  const handleBiometricSuccess = (target: BiometricTarget) => {
    setUnlockedTabs((prev) => ({ ...prev, [target]: true }));
    setMobileTab(target);
    setBiometricTarget(null);
    setMobileNotification({
      id: `bio_ok_${Date.now()}`,
      title: '🛡️ Biometric Verification Complete',
      message: `Identity confirmed for ${activeCustomer.fullName}. Access granted to ${
        target === 'phonepe' ? 'PhonePe Direct Payment' : 'Loan Details & Ledger'
      }.`,
      time: 'Just now',
      type: 'system',
    });
  };

  const handleBiometricCancel = () => {
    setBiometricTarget(null);
  };

  const handleRelockTab = (target: BiometricTarget) => {
    setUnlockedTabs((prev) => ({ ...prev, [target]: false }));
    setMobileTab('home');
    setMobileNotification({
      id: `bio_lock_${Date.now()}`,
      title: '🔒 Biometric Protection Re-locked',
      message: `${
        target === 'phonepe' ? 'PhonePe payment' : 'Loan details'
      } is now secured. Biometric scan required for next access.`,
      time: 'Just now',
      type: 'system',
    });
  };

  // Real-time Push Notification / OTP SMS banner inside the mobile app
  const [mobileNotification, setMobileNotification] = useState<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'otp-aadhar' | 'otp-mobile' | 'payment' | 'system' | 'emi-reminder' | 'publisher-notice';
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // Automated EMI Due Date Push Notification Reminder State
  const [emiReminderConfig, setEmiReminderConfig] = useState<{
    isEnabled: boolean;
    leadDays: number; // 0: on due date, 1: 1 day before, 3: 3 days before, 5: 5 days before
    timeOfDay: string;
    soundEnabled: boolean;
    browserPushEnabled: boolean;
    mirrorSms: boolean;
    mirrorWhatsApp: boolean;
    repeatMonthly: boolean;
  }>({
    isEnabled: true,
    leadDays: 3,
    timeOfDay: '09:00 AM',
    soundEnabled: true,
    browserPushEnabled: true,
    mirrorSms: true,
    mirrorWhatsApp: false,
    repeatMonthly: true,
  });

  // Web Notification API (Browser System-Level Push Notification)
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const [isReminderSheetOpen, setIsReminderSheetOpen] = useState<boolean>(false);
  const [simulateCountdown, setSimulateCountdown] = useState<number | null>(null);
  const [scheduledTriggerCount, setScheduledTriggerCount] = useState<number>(0);

  // Interactive Overdue Demo Simulator (Enables testing past due date on any loan)
  const [simulatePastDueDate, setSimulatePastDueDate] = useState<boolean>(false);

  // Intelligently calculate overdue details for the currently selected loan
  const overdueInfo: LoanOverdueDetails = useMemo(() => {
    if (simulatePastDueDate && selectedLoan?.nextDueDate) {
      const parsed = new Date(selectedLoan.nextDueDate);
      if (!isNaN(parsed.getTime())) {
        // Set reference date 7 days past the due date
        const simulatedDate = new Date(parsed.getTime() + 7 * 24 * 60 * 60 * 1000);
        return getLoanOverdueStatus(selectedLoan, simulatedDate);
      }
    }
    return getLoanOverdueStatus(selectedLoan);
  }, [selectedLoan, simulatePastDueDate]);

  // PhonePe quick pay interactive state
  const [customPayAmount, setCustomPayAmount] = useState<number>(
    overdueInfo.isPastDueDate || overdueInfo.isOverdue
      ? overdueInfo.exactOverdueAmount
      : selectedLoan?.monthlyEmi || 1250
  );
  const [isPayingPhonePe, setIsPayingPhonePe] = useState<boolean>(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<{
    txId: string;
    amount: number;
    time: string;
    upiRef: string;
    isOverduePayment?: boolean;
  } | null>(null);

  // Recurring Auto-Pay (e-Mandate / Bank Auto-Debit)
  const [isAutoPayModalOpen, setIsAutoPayModalOpen] = useState<boolean>(false);
  const [autoPayConfig, setAutoPayConfig] = useState<AutoPayDetails>({
    isEnabled: false,
    bankName: 'State Bank of India',
    accountNumberMasked: '•••• •••• 4910',
    ifscCode: 'SBIN0001429',
    accountHolder: currentCustomer?.fullName || 'Tariq Rahman',
    deductionDay: 5,
    mandateLimit: selectedLoan?.monthlyEmi ? selectedLoan.monthlyEmi * 2 : 5000,
    mandateType: 'UPI_AUTOPAY',
    mandateId: 'UMRN-NSF-2026-849201',
    status: 'NOT_CONFIGURED',
    nextDeductionDate: selectedLoan?.nextDueDate || 'Nov 05, 2026',
  });

  // Customer Directory and App Download Modals
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState<boolean>(false);
  const [isAppInstallModalOpen, setIsAppInstallModalOpen] = useState<boolean>(false);

  // Synchronize system clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update payment amount when loan changes or overdue status updates
  useEffect(() => {
    if (selectedLoan) {
      if (overdueInfo.isPastDueDate || overdueInfo.isOverdue) {
        setCustomPayAmount(overdueInfo.exactOverdueAmount);
      } else {
        setCustomPayAmount(selectedLoan.monthlyEmi);
      }
    }
  }, [selectedLoan, overdueInfo.isPastDueDate, overdueInfo.isOverdue, overdueInfo.exactOverdueAmount]);

  const activeCustomer: CustomerUser = currentCustomer || DEMO_CUSTOMERS[0];
  const customerApp =
    applications.find(
      (app) =>
        app.fullName.toLowerCase() === activeCustomer.fullName.toLowerCase() ||
        app.phone.includes(activeCustomer.phone)
    ) || applications[0];

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Trigger simulated Aadhaar OTP ("aadhar OTP send me")
  const triggerAadhaarOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setMobileNotification({
      id: `notif_${Date.now()}`,
      title: 'AD-UIDAI (Govt of India)',
      message: `Your OTP for Aadhaar authentication is ${code}. Valid for 10 minutes. Do not share with anyone. - UIDAI`,
      time: 'Just now',
      type: 'otp-aadhar',
    });
  };

  // Trigger simulated Mobile OTP ("Mobile manber OTP send me")
  const triggerMobileOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setMobileNotification({
      id: `notif_${Date.now()}`,
      title: 'VK-NSLOAN Verification',
      message: `Your NS Mobile Loan login OTP is ${code}. Enter to authenticate account +91 ${activeCustomer.phone}. - NS FINANCE`,
      time: 'Just now',
      type: 'otp-mobile',
    });
  };

  // Play subtle mobile notification chime via Web Audio API
  const playNotificationSound = () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext not permitted or supported
    }
  };

  // Check and sync browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserNotificationPermission(Notification.permission);
    } else {
      setBrowserNotificationPermission('unsupported');
    }
  }, []);

  // Request Web Notification API permission
  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserNotificationPermission('unsupported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserNotificationPermission(permission);
      if (permission === 'granted') {
        try {
          const testNotif = new Notification('🔔 Browser Push Notifications Active', {
            body: `Web Notification API permission granted. You will now receive system-level OS notifications for EMI due dates.`,
            icon: 'https://api.iconify.design/lucide:shield-check.svg?color=%2310b981',
            badge: 'https://api.iconify.design/lucide:bell-ring.svg?color=%23f59e0b',
            tag: 'browser-notification-welcome',
          });
          testNotif.onclick = () => {
            window.focus();
            testNotif.close();
          };
        } catch {
          // ignore
        }
        return true;
      }
      return false;
    } catch {
      return new Promise<boolean>((resolve) => {
        try {
          Notification.requestPermission((perm) => {
            setBrowserNotificationPermission(perm);
            resolve(perm === 'granted');
          });
        } catch {
          resolve(false);
        }
      });
    }
  };

  // Trigger actual system-level browser push notification using Web Notification API
  const triggerBrowserNotification = (data: {
    title: string;
    body: string;
    amount?: number;
  }) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // If permission is already granted, fire system notification immediately
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(data.title, {
          body: data.body,
          icon: 'https://api.iconify.design/lucide:bell-ring.svg?color=%23f59e0b',
          badge: 'https://api.iconify.design/lucide:shield-check.svg?color=%2310b981',
          tag: `emi-due-notif-${Date.now()}`,
          requireInteraction: true,
          silent: !emiReminderConfig.soundEnabled,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
          if (data.amount) {
            setCustomPayAmount(data.amount);
          }
          handleNavigateWithBiometric('phonepe');
        };
      } catch (err) {
        console.warn('System browser notification could not be created:', err);
      }
    } else if (Notification.permission === 'default') {
      // Prompt for permission if user has not yet decided
      Notification.requestPermission().then((perm) => {
        setBrowserNotificationPermission(perm);
        if (perm === 'granted') {
          triggerBrowserNotification(data);
        }
      });
    }
  };

  // Trigger automated or manual EMI due date push notification reminder using existing banner AND system browser push
  const triggerEmiReminder = (daysBeforeOverride?: number) => {
    if (!selectedLoan) return;

    if (emiReminderConfig.soundEnabled) {
      playNotificationSound();
    }

    const leadDays = daysBeforeOverride !== undefined ? daysBeforeOverride : emiReminderConfig.leadDays;
    const leadLabel =
      leadDays === 0
        ? 'DUE TODAY'
        : leadDays === 1
        ? 'DUE TOMORROW (1 day remaining)'
        : `DUE IN ${leadDays} DAYS`;

    const formattedAmount = formatCurrency(selectedLoan.monthlyEmi, selectedCurrency);

    // 1. In-App Mobile Frame Notification Banner
    setMobileNotification({
      id: `emi_remind_${Date.now()}`,
      title: `Upcoming EMI Reminder: ${formattedAmount}`,
      message: `Dear ${activeCustomer.fullName}, your monthly EMI of ${formattedAmount} for ${selectedLoan.productName} (${selectedLoan.accountNumber}) is ${leadLabel} on ${selectedLoan.nextDueDate}. Pay on PhonePe (${SHOP_INFO.phonePeNumber}) to maintain a 100% on-time CIBIL score.`,
      time: 'Just now',
      type: 'emi-reminder',
      actionLabel: `Pay ${formattedAmount} via PhonePe`,
      onAction: () => {
        setCustomPayAmount(selectedLoan.monthlyEmi);
        setMobileNotification(null);
        handleNavigateWithBiometric('phonepe');
      },
    });

    // 2. System-Level Browser Push Notification via Web Notification API
    if (emiReminderConfig.browserPushEnabled) {
      triggerBrowserNotification({
        title: `⏰ EMI Due Reminder: ${formattedAmount}`,
        body: `Dear ${activeCustomer.fullName}, your monthly EMI for ${selectedLoan.productName} is ${leadLabel} on ${selectedLoan.nextDueDate}. Click to open PhonePe & pay.`,
        amount: selectedLoan.monthlyEmi,
      });
    }

    setScheduledTriggerCount((c) => c + 1);
  };

  // Handle countdown simulation for automated push notification
  useEffect(() => {
    if (simulateCountdown === null) return;
    if (simulateCountdown <= 0) {
      triggerEmiReminder();
      setSimulateCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setSimulateCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [simulateCountdown]);

  // Handle PhonePe payment
  const handlePhonePePay = () => {
    if (!selectedLoan || customPayAmount <= 0) return;
    setIsPayingPhonePe(true);

    setTimeout(() => {
      setIsPayingPhonePe(false);
      onMakePayment(selectedLoan.id, customPayAmount);

      const txId = `T${Date.now().toString().slice(-8)}`;
      const upiRef = `UPI${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      const isOverdue = overdueInfo.isPastDueDate || overdueInfo.isOverdue;
      setPaymentSuccessReceipt({
        txId,
        amount: customPayAmount,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        upiRef,
        isOverduePayment: isOverdue,
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Push notification
      setMobileNotification({
        id: `pay_${Date.now()}`,
        title: isOverdue ? '🚨 Overdue EMI Cleared via PhonePe' : 'PhonePe: Money Sent Successfully',
        message: isOverdue
          ? `Overdue payment of ₹${customPayAmount.toLocaleString('en-IN')} received for ${selectedLoan.productName}. Late fees waived & credit score safeguarded!`
          : `Paid ₹${customPayAmount.toLocaleString('en-IN')} to NS MOBILE (${SHOP_INFO.phonePeNumber}). Txn ID: ${txId}`,
        time: 'Just now',
        type: 'payment',
      });
    }, 1200);
  };

  const progressPercentage = selectedLoan
    ? Math.min(100, Math.round((selectedLoan.completedEmis / selectedLoan.totalTenureMonths) * 100))
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-2 sm:px-4 animate-fadeIn">
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                Customer Mobile App
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PWA Native Edition
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live mobile borrower dashboard, PhonePe 8509184717 payments & Aadhaar/Mobile OTP
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Customer Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={activeCustomer.id}
              onChange={(e) => {
                const target = DEMO_CUSTOMERS.find((c) => c.id === e.target.value);
                if (target && onSelectCustomer) onSelectCustomer(target);
              }}
              className="bg-transparent text-xs font-bold text-white focus:outline-hidden cursor-pointer"
            >
              {DEMO_CUSTOMERS.map((cust) => (
                <option key={cust.id} value={cust.id} className="bg-slate-900 text-white">
                  {cust.fullName} ({cust.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Customer Directory Modal Button */}
          <button
            onClick={() => setIsDirectoryModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-purple-500/30"
            title="View All Customer Loan ID Numbers & Registered Phone Contacts"
          >
            <Phone className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">All Customer Loan IDs & Phones</span>
            <span className="sm:hidden">Directory</span>
          </button>

          {/* Google Play Store / App Download Button */}
          <button
            onClick={() => setIsAppInstallModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-500/40 shadow-sm"
            title="Download from Google Play Store or Direct Android APK"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512">
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
            <span>Play Store</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 font-black">
              4.8★
            </span>
          </button>

          {/* Direct APK Download URL Button */}
          <a
            href="/download/NS_Mobile_Finance_v2.4.1.apk"
            download="NS_Mobile_Finance_v2.4.1.apk"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-teal-500/30"
            title="Download direct Android APK file (v2.4.1)"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Download APK</span>
            <span className="sm:hidden">APK</span>
          </a>

          {/* Toggle Device Frame vs Fullscreen view */}
          <button
            onClick={() => setIsDeviceFrame(!isDeviceFrame)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
            title="Toggle between phone mockup frame and full mobile view"
          >
            {isDeviceFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>{isDeviceFrame ? 'Full View' : 'Phone Frame'}</span>
          </button>

          {/* Switch to Desktop Repayment Portal */}
          <button
            onClick={onSwitchToDesktopPortal}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-500/40"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Web Portal View</span>
          </button>
        </div>
      </div>

      {/* Main Container - Either Phone Frame Mockup or Full Screen Mobile View */}
      <div className={`mx-auto transition-all duration-300 ${isDeviceFrame ? 'max-w-[410px]' : 'max-w-2xl'}`}>
        {/* SMARTPHONE FRAME CONTAINER */}
        <div
          className={`relative bg-slate-950 text-slate-100 overflow-hidden shadow-2xl transition-all ${
            isDeviceFrame
              ? 'rounded-[50px] border-[10px] border-slate-800 ring-1 ring-slate-700 shadow-purple-500/10 min-h-[760px] pb-6'
              : 'rounded-3xl border border-slate-800 min-h-[720px] pb-4'
          }`}
        >
          {/* HARDWARE SPEAKER / DYNAMIC ISLAND */}
          {isDeviceFrame && (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
              <div className="w-28 h-6 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-between px-3 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-500/60 animate-pulse"></div>
                </div>
                <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
                <div className="w-2 h-2 rounded-full bg-slate-950"></div>
              </div>
            </div>
          )}

          {/* MOBILE STATUS BAR */}
          <div className="w-full pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-slate-300 select-none bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
            <span className="font-mono text-[13px] tracking-tight font-black text-white">
              {currentTime}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-1 rounded">5G</span>
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <span>{batteryLevel}%</span>
                <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
              </div>
            </div>
          </div>

          {/* SIMULATED PUSH NOTIFICATION POP-UP BANNER */}
          {mobileNotification && (
            <div
              className={`mx-4 mt-1 mb-2 p-3 rounded-2xl bg-slate-900/95 border-2 shadow-xl animate-slideDown z-30 ${
                mobileNotification.type === 'publisher-notice'
                  ? 'border-amber-400/90 shadow-amber-500/20 ring-1 ring-amber-400/30'
                  : mobileNotification.type === 'emi-reminder'
                  ? 'border-amber-400/90 shadow-amber-500/20'
                  : mobileNotification.type.includes('aadhar')
                  ? 'border-amber-500/80 shadow-amber-500/20'
                  : 'border-emerald-500/80 shadow-emerald-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black shadow-md ${
                      mobileNotification.type === 'publisher-notice'
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 animate-bounce'
                        : mobileNotification.type === 'emi-reminder'
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 animate-bounce'
                        : mobileNotification.type.includes('aadhar')
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950'
                        : mobileNotification.type.includes('mobile')
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950'
                    }`}
                  >
                    {mobileNotification.type === 'publisher-notice' ? (
                      <Megaphone className="w-4 h-4 text-slate-950" />
                    ) : mobileNotification.type === 'emi-reminder' ? (
                      <BellRing className="w-4 h-4 text-slate-950" />
                    ) : mobileNotification.type.includes('aadhar') ? (
                      <Fingerprint className="w-4 h-4" />
                    ) : mobileNotification.type.includes('mobile') ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold text-white">
                        {mobileNotification.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{mobileNotification.time}</span>
                      {mobileNotification.type === 'publisher-notice' && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          PUBLISHER
                        </span>
                      )}
                      {mobileNotification.type === 'emi-reminder' && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          SCHEDULED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      {mobileNotification.message}
                    </p>

                    {/* Quick Action Buttons inside Notification Banner */}
                    {mobileNotification.onAction && (
                      <div className="mt-2.5 flex items-center gap-2 pt-1.5 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={mobileNotification.onAction}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm cursor-pointer transition-transform active:scale-95"
                        >
                          <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                          <span>{mobileNotification.actionLabel || 'Pay Now via PhonePe'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileNotification(null)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setMobileNotification(null)}
                  className="text-slate-400 hover:text-white text-xs p-1 shrink-0"
                  title="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* MOBILE APP HEADER */}
          <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-slate-900 bg-slate-950">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20">
                NS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-white tracking-tight">
                    N.S. Mobile Pay
                  </h1>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>
                <div
                  onClick={() => setIsDirectoryModalOpen(true)}
                  className="cursor-pointer group"
                  title="View All Customer Loan IDs & Phone Directory"
                >
                  <p className="text-[10px] text-slate-300 font-bold group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <span>{activeCustomer.fullName}</span>
                    <span className="text-slate-500 font-mono text-[9px]">• +91 {activeCustomer.phone}</span>
                  </p>
                  <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
                    <span>Loan ID: {selectedLoan?.accountNumber || activeCustomer.primaryLoanId}</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-1.5">
              {/* All Customer Loan IDs & Phones Directory Button */}
              <button
                onClick={() => setIsDirectoryModalOpen(true)}
                className="relative p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/30 transition-colors cursor-pointer"
                title="View All Customer Loan ID Numbers & Phone Directory"
              >
                <Phone className="w-3.5 h-3.5 text-purple-400" />
              </button>

              {/* Install / Download App Button */}
              <button
                onClick={() => setIsAppInstallModalOpen(true)}
                className="relative p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors cursor-pointer"
                title="Download / Install Mobile App to Home Screen"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              {/* Publisher Bulletins Button */}
              <button
                onClick={() => setIsPublisherBulletinsOpen(true)}
                className="relative p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-white border border-amber-500/30 transition-colors cursor-pointer"
                title="Official Publisher Bulletins & Notices"
              >
                <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                {publishedNotices && publishedNotices.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                    {publishedNotices.length}
                  </span>
                )}
              </button>

              {/* EMI Reminder Schedule Bell */}
              <button
                onClick={() => setIsReminderSheetOpen(true)}
                className="relative p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                title="Schedule EMI Push Reminders"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                {emiReminderConfig.isEnabled && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse"></span>
                )}
              </button>
              <button
                onClick={triggerMobileOtp}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="Send Mobile OTP"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                onClick={triggerAadhaarOtp}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                title="Send Aadhaar OTP"
              >
                <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => setActivePdfDoc('full-file')}
                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors"
                title="Download / Print Full PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* QUICK PROMPT SHORTCUT BAR */}
          <div className="px-4 py-2 bg-slate-900/70 border-b border-slate-900 flex items-center justify-between text-[11px] overflow-x-auto gap-2">
            <button
              onClick={() => setIsPublisherBulletinsOpen(true)}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Official Publisher Bulletins & Notices"
            >
              <Megaphone className="w-3 h-3 text-amber-400" />
              Publisher Bulletins ({publishedNotices.length})
            </button>
            <button
              onClick={() => triggerEmiReminder()}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Schedule & Trigger EMI Push Notification Reminder"
            >
              <BellRing className="w-3 h-3 text-amber-400" />
              EMI Reminder Push
            </button>
            <button
              onClick={triggerMobileOtp}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Send className="w-3 h-3" />
              Mobile OTP Send Me
            </button>
            <button
              onClick={triggerAadhaarOtp}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Fingerprint className="w-3 h-3" />
              Aadhaar OTP Send Me
            </button>
            <button
              onClick={() => setActivePdfDoc('full-file')}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer className="w-3 h-3" />
              Full File PDF
            </button>
            <button
              onClick={() => {
                if (unlockedTabs.phonepe || unlockedTabs.loans) {
                  handleRelockTab('phonepe');
                  handleRelockTab('loans');
                } else {
                  handleNavigateWithBiometric('phonepe');
                }
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Biometric Security Shield (Face ID / Fingerprint)"
            >
              <Fingerprint className="w-3 h-3 text-purple-400" />
              Biometric Shield {isBiometricEnabled ? (unlockedTabs.phonepe && unlockedTabs.loans ? 'Unlocked' : 'Active') : 'Disabled'}
            </button>
          </div>

          {/* SCROLLABLE MAIN CONTENT AREA */}
          <div className="p-4 overflow-y-auto max-h-[580px] space-y-4">
            {/* ===================== TAB 1: HOME ===================== */}
            {mobileTab === 'home' && (
              <div className="space-y-4 animate-fadeIn">
                {/* LOAN BALANCE & NEXT EMI HERO CARD */}
                <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 overflow-hidden shadow-xl">
                  {/* Subtle decorative glow */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                      Active Loan Account
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      {selectedLoan?.accountNumber || 'NS-ACC-9021'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-[11px] text-slate-400">Total Outstanding Balance</div>
                    <div className="text-3xl font-black text-white font-mono tracking-tight mt-0.5">
                      {selectedLoan ? formatCurrency(selectedLoan.remainingBalance, selectedCurrency) : '₹0'}
                    </div>
                  </div>

                  {/* Due Date & Monthly EMI Grid */}
                  <div className={`grid grid-cols-2 gap-2.5 p-3 rounded-2xl border mb-4 transition-colors ${
                    overdueInfo.isPastDueDate
                      ? 'bg-red-950/30 border-red-500/40'
                      : 'bg-slate-950/70 border-slate-800/80'
                  }`}>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <Calendar className={`w-3 h-3 ${overdueInfo.isPastDueDate ? 'text-red-400' : 'text-amber-400'}`} />
                        Next Due Date
                      </div>
                      <div className="text-xs font-bold font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className={overdueInfo.isPastDueDate ? 'text-red-400 font-black' : 'text-amber-300'}>
                          {selectedLoan?.nextDueDate || 'Nov 05, 2026'}
                        </span>
                        {overdueInfo.isPastDueDate && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black animate-pulse">
                            {overdueInfo.daysOverdue}D OVERDUE
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-emerald-400" />
                        Monthly EMI
                      </div>
                      <div className="text-xs font-black text-emerald-400 font-mono mt-0.5">
                        {selectedLoan ? formatCurrency(selectedLoan.monthlyEmi, selectedCurrency) : '₹0'}
                      </div>
                    </div>
                  </div>

                  {/* Repayment Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400">
                        Tenure Progress: {selectedLoan?.completedEmis || 0} of {selectedLoan?.totalTenureMonths || 12} EMIs
                      </span>
                      <span className="text-emerald-400 font-mono">{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* PHONEPE 1-TAP PAY & LOAN DETAILS ACTION BUTTONS */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (overdueInfo.isPastDueDate) {
                          setCustomPayAmount(overdueInfo.exactOverdueAmount);
                        }
                        handleNavigateWithBiometric('phonepe');
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer relative ${
                        overdueInfo.isPastDueDate
                          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 shadow-red-600/40 ring-1 ring-red-400/50'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                      }`}
                    >
                      {overdueInfo.isPastDueDate ? (
                        <>
                          <AlertTriangle className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
                          <span>Pay Overdue ₹{overdueInfo.exactOverdueAmount.toLocaleString('en-IN')} via PhonePe</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                          <span>Pay EMI via PhonePe ({SHOP_INFO.phonePeNumber})</span>
                        </>
                      )}
                      {isBiometricEnabled && !unlockedTabs.phonepe ? (
                        <span className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 text-[10px] flex items-center gap-1 font-bold ml-1 border border-amber-400/30">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Biometric</span>
                        </span>
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleNavigateWithBiometric('loans')}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View Full Loan Details & Ledger</span>
                      {isBiometricEnabled && !unlockedTabs.loans ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] flex items-center gap-1 border border-emerald-500/30 font-bold">
                          <Fingerprint className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* AUTOMATED EMI DUE DATE PUSH REMINDER WIDGET */}
                <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 p-3.5 shadow-lg relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                        <BellRing className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">Automated EMI Push Reminder</span>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${
                              emiReminderConfig.isEnabled
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {emiReminderConfig.isEnabled ? 'SCHEDULED' : 'MUTED'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 mt-0.5">
                          Alert timing: <strong className="text-amber-300 font-bold">{emiReminderConfig.leadDays === 0 ? 'On Due Date' : `${emiReminderConfig.leadDays} days before`}</strong> ({selectedLoan?.nextDueDate}) at {emiReminderConfig.timeOfDay}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsReminderSheetOpen(true)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 shrink-0"
                      title="Configure Schedule"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>

                  {/* Reminder Action Controls */}
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => triggerEmiReminder()}
                      className="py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BellRing className="w-3 h-3" />
                      <span>Test Push Banner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (simulateCountdown !== null) {
                          setSimulateCountdown(null);
                        } else {
                          setSimulateCountdown(5);
                        }
                      }}
                      className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        simulateCountdown !== null
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{simulateCountdown !== null ? `Push in ${simulateCountdown}s...` : 'Auto-Push in 5s'}</span>
                    </button>
                  </div>
                </div>

                {/* QUICK ACTION TILES */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <button
                    onClick={() => handleNavigateWithBiometric('phonepe')}
                    className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-colors flex flex-col items-center gap-1.5 group cursor-pointer relative"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform relative">
                      <Zap className="w-4 h-4" />
                      {isBiometricEnabled && !unlockedTabs.phonepe && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center border border-slate-950">
                          <Lock className="w-2 h-2" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">PhonePe</span>
                  </button>

                  <button
                    onClick={() => setActivePdfDoc('full-file')}
                    className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">Full PDF</span>
                  </button>

                  <button
                    onClick={() => setMobileTab('kyc')}
                    className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">Aadhaar</span>
                  </button>

                  <button
                    onClick={onOpenEmiCalculator}
                    className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">EMI Calc</span>
                  </button>
                </div>

                {/* DEVICE EMI SPECIAL NOTICE / LOAN STATUS */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">Device Protection Active</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        IMEI UNLOCKED
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Your phone financing at NS Mobile Shop has zero late fines when repaid via PhonePe (8509184717).
                    </p>
                  </div>
                </div>

                {/* RECENT REPAYMENTS HISTORY */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      Recent EMI Payments
                    </span>
                    <button
                      onClick={() => setActivePdfDoc('receipt')}
                      className="text-[10px] text-emerald-400 font-bold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                          ✓
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11px]">EMI #4 via PhonePe</div>
                          <div className="text-[9px] text-slate-500">Oct 05, 2026 • Txn #T849102</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400 text-xs">
                          {formatCurrency(selectedLoan?.monthlyEmi || 1250, selectedCurrency)}
                        </div>
                        <span className="text-[9px] text-slate-400">SUCCESS</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                          ✓
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11px]">EMI #3 via PhonePe</div>
                          <div className="text-[9px] text-slate-500">Sep 05, 2026 • Txn #T739201</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400 text-xs">
                          {formatCurrency(selectedLoan?.monthlyEmi || 1250, selectedCurrency)}
                        </div>
                        <span className="text-[9px] text-slate-400">SUCCESS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 2: LOANS / LOAN DETAILS ===================== */}
            {mobileTab === 'loans' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>Loan Accounts & Details</span>
                      {isBiometricEnabled && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
                          <Fingerprint className="w-2.5 h-2.5" />
                          UNLOCKED
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400">Ledger breakdown & payment schedule</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isBiometricEnabled && (
                      <button
                        onClick={() => handleRelockTab('loans')}
                        className="text-[10px] font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="Re-lock Loan Details with biometric authentication"
                      >
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Lock</span>
                      </button>
                    )}
                    <button
                      onClick={onOpenApply}
                      className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg hover:bg-emerald-500/20 cursor-pointer"
                    >
                      + Apply New
                    </button>
                  </div>
                </div>

                {/* Loan Selector Cards */}
                <div className="space-y-2.5">
                  {activeLoans.map((loan) => (
                    <div
                      key={loan.id}
                      onClick={() => setSelectedLoanId(loan.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedLoanId === loan.id
                          ? 'bg-slate-900 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{loan.productName}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {loan.accountNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono mt-2">
                        <div>
                          <span className="text-slate-500 block">Balance</span>
                          <span className="text-white font-bold">
                            {formatCurrency(loan.remainingBalance, selectedCurrency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Monthly EMI</span>
                          <span className="text-emerald-400 font-bold">
                            {formatCurrency(loan.monthlyEmi, selectedCurrency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Due Date</span>
                          <span className="text-amber-300 font-bold">{loan.nextDueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Loan Breakdown */}
                {selectedLoan && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Loan Breakdown</span>
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="text-[10px] text-amber-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Award className="w-3 h-3" />
                        Sanction Certificate
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500">Sanctioned Amount</span>
                        <div className="font-mono font-bold text-white mt-0.5">
                          {formatCurrency(selectedLoan.principalAmount, selectedCurrency)}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500">Interest Rate</span>
                        <div className="font-mono font-bold text-cyan-400 mt-0.5">
                          {selectedLoan.interestRate}% APR
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500">Tenure</span>
                        <div className="font-mono font-bold text-slate-200 mt-0.5">
                          {selectedLoan.totalTenureMonths} Months
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-500">Completed EMIs</span>
                        <div className="font-mono font-bold text-emerald-400 mt-0.5">
                          {selectedLoan.completedEmis} / {selectedLoan.totalTenureMonths}
                        </div>
                      </div>
                    </div>

                    {/* Download Yearly Loan Statement Button */}
                    <button
                      onClick={() => setActivePdfDoc('yearly-statement')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                      title="Download Yearly Loan Statement & Tax Certificate (FY 2025-26)"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-950 group-hover:translate-y-0.5 transition-transform" />
                      <span>Download Yearly Loan Statement</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950/20 text-slate-950 border border-slate-950/30 font-mono font-bold">
                        FY 2025-26 PDF
                      </span>
                    </button>

                    <button
                      onClick={() => setActivePdfDoc('schedule')}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      View Amortization Repayment Schedule
                    </button>

                    <button
                      onClick={() => setIsReminderSheetOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-xs font-bold text-amber-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-400" />
                      Schedule Automated EMI Due Push Reminder
                    </button>

                    {/* Auto-Pay Mandate Status in Loan Details */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            autoPayConfig.isEnabled
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                            <span>Auto-Pay e-Mandate</span>
                            <span
                              className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                autoPayConfig.isEnabled
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {autoPayConfig.isEnabled ? 'ACTIVE' : 'OFF'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {autoPayConfig.isEnabled
                              ? `Recurring EMI auto-debited on 5th from ${autoPayConfig.bankName}`
                              : 'Authorize recurring monthly EMI deductions'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsAutoPayModalOpen(true)}
                        className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {autoPayConfig.isEnabled ? 'Manage' : 'Set Up'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===================== TAB 3: PHONEPE (8509184717) ===================== */}
            {mobileTab === 'phonepe' && (
              <div className="space-y-4 animate-fadeIn">
                {/* PhonePe Header Card */}
                <div className="rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 border-2 border-purple-500/50 p-5 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white text-purple-700 font-black flex items-center justify-center text-sm shadow">
                        पे
                      </div>
                      <div>
                        <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                          <span>PhonePe Direct Pay</span>
                          {isBiometricEnabled && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
                              <Fingerprint className="w-2.5 h-2.5" />
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-purple-200">Merchant UPI Verification</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isBiometricEnabled && (
                        <button
                          onClick={() => handleRelockTab('phonepe')}
                          className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-slate-900/80 hover:bg-slate-900 text-slate-300 border border-purple-400/30 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Re-lock PhonePe with biometric authentication"
                        >
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Lock</span>
                        </button>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/30 text-purple-200 border border-purple-400/40">
                        INSTANT 0% FEE
                      </span>
                    </div>
                  </div>

                  {/* Merchant Details Box */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 mb-4">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Beneficiary / Merchant</div>
                    <div className="text-xs font-black text-white mt-0.5">
                      {SHOP_INFO.name}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">PhonePe Number</span>
                        <span className="text-amber-400 font-bold">{SHOP_INFO.phonePeNumber}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(SHOP_INFO.phonePeNumber, 'phonepe')}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedKey === 'phonepe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 block">UPI VPA</span>
                        <span className="text-purple-300 font-bold">{SHOP_INFO.upiId}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(SHOP_INFO.upiId, 'upi')}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-[10px]"
                      >
                        {copiedKey === 'upi' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Loan Account Status & Switcher */}
                  {selectedLoan && (
                    <div className={`p-3 rounded-2xl border mb-4 text-xs transition-colors ${
                      overdueInfo.isPastDueDate
                        ? 'bg-red-950/40 border-red-500/50 text-red-200 shadow-md shadow-red-950/30'
                        : 'bg-slate-950/80 border-purple-500/30 text-slate-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Target Loan Account:</span>
                          <span className="font-mono font-bold text-white">{selectedLoan.accountNumber}</span>
                        </div>
                        {overdueInfo.isPastDueDate ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-black text-[9px] border border-red-400 flex items-center gap-1 animate-pulse shadow-sm">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {overdueInfo.daysOverdue}D OVERDUE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[9px] border border-emerald-500/40">
                            ON-TIME
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-white font-semibold truncate max-w-[210px]">{selectedLoan.productName}</span>
                        <span className="font-mono text-slate-400">
                          Due: <strong className={overdueInfo.isPastDueDate ? 'text-red-400 underline font-bold' : 'text-amber-300'}>{selectedLoan.nextDueDate}</strong>
                        </span>
                      </div>

                      {/* Multi-Loan Switcher (if customer has multiple active loans) */}
                      {activeLoans.length > 1 && (
                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
                          <span className="text-[9px] text-slate-500 uppercase font-bold shrink-0">Switch Loan:</span>
                          {activeLoans.map((l) => {
                            const isOver = l.status === 'OVERDUE' || (new Date(l.nextDueDate).getTime() < new Date().getTime());
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => setSelectedLoanId(l.id)}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                                  selectedLoan.id === l.id
                                    ? isOver
                                      ? 'bg-red-600 text-white border border-red-400 shadow-xs'
                                      : 'bg-purple-600 text-white border border-purple-400'
                                    : isOver
                                    ? 'bg-red-950/60 text-red-300 hover:text-white border border-red-500/40'
                                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                              >
                                <span>{l.accountNumber}</span>
                                {isOver && <span className="text-[8px] text-amber-300 font-black">🚨</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Overdue Urgent Alert Banner & Exact Overdue Breakdown */}
                  {overdueInfo.isPastDueDate && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-red-950 via-rose-950 to-slate-950 border-2 border-red-500 text-white shadow-xl shadow-red-950/50">
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-md shadow-red-600/50 shrink-0">
                            <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-red-300 flex items-center gap-1.5">
                              <span>EMI DUE DATE EXPIRED</span>
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-red-600 text-white border border-red-400">
                                {overdueInfo.daysOverdue} DAYS OVERDUE
                              </span>
                            </div>
                            <div className="text-[10px] text-red-200">
                              Scheduled due date was <span className="font-bold underline text-white">{overdueInfo.formattedDueDate}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCustomPayAmount(overdueInfo.exactOverdueAmount)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-black text-[10px] shadow-sm cursor-pointer transition-colors shrink-0"
                          title="Auto-fill suggested overdue amount"
                        >
                          Auto-Fill
                        </button>
                      </div>

                      {/* Overdue Exact Breakdown Grid */}
                      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-red-500/40 grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px]">Unpaid EMI</span>
                          <span className="text-white font-bold">₹{overdueInfo.monthlyEmi.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">Late Fee</span>
                          <span className="text-amber-400 font-bold">+₹{overdueInfo.lateFee.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-l border-red-500/40 pl-1">
                          <span className="text-red-300 block text-[9px] font-bold">Total Overdue</span>
                          <span className="text-red-400 font-black text-xs">₹{overdueInfo.exactOverdueAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-red-200 flex items-center justify-between">
                        <span>💡 Pay exact overdue to clear penalty & prevent CIBIL downgrade.</span>
                      </div>
                    </div>
                  )}

                  {/* Amount to Repay (Highlighted in RED if Overdue) */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between">
                      <label className={`text-[10px] uppercase font-bold flex items-center gap-1 ${
                        overdueInfo.isPastDueDate ? 'text-red-300' : 'text-slate-300'
                      }`}>
                        <span>Payment Amount (INR ₹)</span>
                      </label>
                      {overdueInfo.isPastDueDate && (
                        <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono font-black text-[9px] border border-red-400 shadow-md shadow-red-600/40 flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-2.5 h-2.5" />
                          SUGGESTED OVERDUE: ₹{overdueInfo.exactOverdueAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <span className={`absolute left-3.5 top-2.5 font-bold ${
                        overdueInfo.isPastDueDate ? 'text-red-400 font-black text-base' : 'text-slate-400'
                      }`}>
                        ₹
                      </span>
                      <input
                        type="number"
                        value={customPayAmount}
                        onChange={(e) => setCustomPayAmount(Number(e.target.value))}
                        className={`w-full rounded-xl pl-8 pr-4 py-2 text-sm font-mono font-bold focus:outline-hidden transition-all ${
                          overdueInfo.isPastDueDate
                            ? 'bg-red-950/50 border-2 border-red-500 text-red-200 font-black ring-4 ring-red-500/20 focus:border-red-400 focus:ring-red-500/30 shadow-inner'
                            : 'bg-slate-950 border border-purple-500/40 text-white focus:border-purple-400'
                        }`}
                      />
                    </div>

                    {/* Red Overdue Helper Callout */}
                    {overdueInfo.isPastDueDate && (
                      <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center justify-between text-[10px] text-red-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <span>
                            Suggested exact overdue: <strong className="text-white font-black underline">₹{overdueInfo.exactOverdueAmount.toLocaleString('en-IN')}</strong> (EMI ₹{overdueInfo.monthlyEmi} + ₹{overdueInfo.lateFee} fee)
                          </span>
                        </span>
                        {customPayAmount !== overdueInfo.exactOverdueAmount && (
                          <button
                            type="button"
                            onClick={() => setCustomPayAmount(overdueInfo.exactOverdueAmount)}
                            className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[9px] font-black cursor-pointer shrink-0 transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Amount Chips (Overdue Highlighted in Red) */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                    {overdueInfo.isPastDueDate && (
                      <button
                        type="button"
                        onClick={() => setCustomPayAmount(overdueInfo.exactOverdueAmount)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md ${
                          customPayAmount === overdueInfo.exactOverdueAmount
                            ? 'bg-red-600 text-white border-2 border-red-300 ring-2 ring-red-500/50 shadow-red-600/40 animate-pulse'
                            : 'bg-red-950/80 border border-red-500 text-red-300 hover:bg-red-900/60'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3 text-red-200" />
                        <span>Exact Overdue: ₹{overdueInfo.exactOverdueAmount.toLocaleString('en-IN')}</span>
                      </button>
                    )}
                    {overdueInfo.isPastDueDate && (
                      <button
                        type="button"
                        onClick={() => setCustomPayAmount(overdueInfo.monthlyEmi)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                          customPayAmount === overdueInfo.monthlyEmi
                            ? 'bg-red-800 text-white border border-red-400'
                            : 'bg-slate-900 border border-red-900/60 text-red-300 hover:border-red-500'
                        }`}
                      >
                        EMI Only: ₹{overdueInfo.monthlyEmi.toLocaleString('en-IN')}
                      </button>
                    )}
                    {[
                      ...(overdueInfo.isPastDueDate ? [] : [selectedLoan?.monthlyEmi || 1250]),
                      2500,
                      5000,
                      selectedLoan?.remainingBalance ? Math.min(selectedLoan.remainingBalance, 10000) : 10000,
                    ].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCustomPayAmount(amt)}
                        className={`px-2.5 py-1.5 rounded-lg bg-slate-900 border text-[10px] font-mono font-bold transition-colors cursor-pointer shrink-0 ${
                          customPayAmount === amt && !overdueInfo.isPastDueDate
                            ? 'border-purple-400 bg-purple-950/60 text-purple-200'
                            : 'border-slate-700 text-slate-300 hover:text-white hover:border-purple-400'
                        }`}
                      >
                        ₹{amt.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>

                  {/* Set Up Auto-Pay Toggle Section */}
                  <div className="mb-4 p-3.5 rounded-2xl bg-slate-950/90 border border-purple-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            autoPayConfig.isEnabled
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                              : 'bg-slate-800 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          <Zap
                            className={`w-4 h-4 ${autoPayConfig.isEnabled ? 'fill-slate-950' : 'fill-purple-300'}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">Set Up Auto-Pay</span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                                autoPayConfig.isEnabled
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {autoPayConfig.isEnabled ? 'ACTIVE' : 'OFF'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-300">
                            Authorize recurring monthly EMI deductions directly from your linked bank account
                          </p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={autoPayConfig.isEnabled}
                        onClick={() => {
                          if (!autoPayConfig.isEnabled) {
                            setIsAutoPayModalOpen(true);
                          } else {
                            setAutoPayConfig((prev) => ({
                              ...prev,
                              isEnabled: false,
                              status: 'PAUSED',
                            }));
                            setMobileNotification({
                              id: `autopay_paused_${Date.now()}`,
                              title: '⏸️ Auto-Pay Paused',
                              message: `Recurring monthly EMI auto-debit of ${formatCurrency(
                                selectedLoan?.monthlyEmi || 1250,
                                selectedCurrency
                              )} paused. Toggle anytime to re-activate.`,
                              time: 'Just now',
                              type: 'system',
                            });
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          autoPayConfig.isEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            autoPayConfig.isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Mandate details when enabled */}
                    {autoPayConfig.isEnabled ? (
                      <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1.5">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400 flex items-center gap-1 font-sans">
                            <Building className="w-3 h-3 text-emerald-400" />
                            {autoPayConfig.bankName}
                          </span>
                          <span className="font-mono font-bold text-emerald-300">
                            {autoPayConfig.accountNumberMasked}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Monthly Deduction:</span>
                          <span className="font-bold text-white">
                            {formatCurrency(selectedLoan?.monthlyEmi || 1250, selectedCurrency)} on {autoPayConfig.deductionDay}th of month
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="text-slate-400">Next Scheduled Debit:</span>
                          <span className="text-amber-300 font-bold">{autoPayConfig.nextDeductionDate}</span>
                        </div>
                        <div className="pt-1 flex items-center justify-between text-[9px]">
                          <span className="text-slate-400 font-mono">UMRN: {autoPayConfig.mandateId}</span>
                          <button
                            type="button"
                            onClick={() => setIsAutoPayModalOpen(true)}
                            className="text-emerald-400 font-bold hover:underline cursor-pointer"
                          >
                            Modify Mandate →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Never miss due dates • Zero penalty guarantee</span>
                        <button
                          type="button"
                          onClick={() => setIsAutoPayModalOpen(true)}
                          className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold cursor-pointer transition-colors"
                        >
                          Configure Bank
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePhonePePay}
                    disabled={isPayingPhonePe || customPayAmount <= 0}
                    className={`w-full py-3.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                      overdueInfo.isPastDueDate
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/40 ring-2 ring-red-400/50'
                        : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white shadow-purple-600/40'
                    }`}
                  >
                    {isPayingPhonePe ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authorizing with PhonePe UPI...</span>
                      </>
                    ) : overdueInfo.isPastDueDate ? (
                      <>
                        <AlertTriangle className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
                        <span>Pay Overdue ₹{customPayAmount.toLocaleString('en-IN')} Now via PhonePe</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                        <span>Pay ₹{customPayAmount.toLocaleString('en-IN')} Now via PhonePe</span>
                      </>
                    )}
                  </button>

                  {/* Overdue Simulation / Test Toggle Helper */}
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 mt-3">
                    <span className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-500">Overdue Demo Mode:</span>
                      <strong className={overdueInfo.isPastDueDate ? 'text-red-400 font-bold' : 'text-slate-400 font-normal'}>
                        {overdueInfo.isPastDueDate ? '🚨 Past Due (Overdue Active)' : 'Standard Schedule'}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSimulatePastDueDate(!simulatePastDueDate)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                        simulatePastDueDate
                          ? 'bg-red-600 text-white border border-red-400 shadow-xs'
                          : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      {simulatePastDueDate ? '✓ Reset to Normal Date' : 'Simulate Past Due Date'}
                    </button>
                  </div>
                </div>

                {/* Instant Receipt if Paid */}
                {paymentSuccessReceipt && (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Payment Verified & Account Credited!</span>
                      </div>
                      {paymentSuccessReceipt.isOverduePayment && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                          DELINQUENCY CLEARED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono space-y-1">
                      <div>Txn ID: {paymentSuccessReceipt.txId}</div>
                      <div>UPI Ref: {paymentSuccessReceipt.upiRef}</div>
                      <div>Amount: ₹{paymentSuccessReceipt.amount.toLocaleString('en-IN')}</div>
                      <div>Time: {paymentSuccessReceipt.time}</div>
                    </div>
                    <button
                      onClick={() => setActivePdfDoc('receipt')}
                      className="mt-2 w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Download Payment Receipt PDF
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ===================== TAB 4: DIGITAL KYC ===================== */}
            {mobileTab === 'kyc' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">Digital KYC Cards</h3>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    100% VERIFIED
                  </span>
                </div>

                {/* AADHAAR CARD SIMULATION */}
                <div className="rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 border-2 border-amber-500/50 p-4 text-white shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-amber-400" />
                      <div>
                        <div className="text-xs font-black">Mera Aadhaar, Meri Pehchan</div>
                        <div className="text-[9px] text-slate-400">UIDAI Government of India</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                      e-Aadhaar
                    </span>
                  </div>

                  <div className="flex gap-3 mb-3">
                    <div className="w-14 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                      PHOTO
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-white">{activeCustomer.fullName}</div>
                      <div className="text-[10px] text-slate-400">DOB: {activeCustomer.dateOfBirth || '1992-05-14'}</div>
                      <div className="text-[10px] text-slate-400">Gender: Male</div>
                    </div>
                  </div>

                  {/* Aadhaar Number Display */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-black tracking-widest text-amber-300">
                      {showAadhaarNumber ? activeCustomer.aadharNumber : maskAadhaar(activeCustomer.aadharNumber)}
                    </span>
                    <button
                      onClick={() => setShowAadhaarNumber(!showAadhaarNumber)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      {showAadhaarNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Send Aadhaar OTP Button */}
                  <button
                    onClick={triggerAadhaarOtp}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Aadhaar OTP ("aadhar OTP send me")</span>
                  </button>
                </div>

                {/* PAN CARD SIMULATION */}
                <div className="rounded-3xl bg-gradient-to-br from-teal-950/80 via-slate-900 to-slate-950 border-2 border-teal-500/50 p-4 text-white shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-black text-teal-300">INCOME TAX DEPARTMENT</div>
                    <span className="text-[9px] font-mono bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-bold">
                      GOVT OF INDIA
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-3 text-xs">
                    <div className="font-bold text-white">{activeCustomer.fullName}</div>
                    <div className="text-[10px] text-slate-400">Permanent Account Number (PAN)</div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-teal-500/30 flex items-center justify-between">
                      <span className="font-mono text-xs font-black tracking-wider text-teal-300">
                        {showPanNumber ? activeCustomer.panNumber : maskPan(activeCustomer.panNumber)}
                      </span>
                      <button
                        onClick={() => setShowPanNumber(!showPanNumber)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        {showPanNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Send Mobile OTP Button */}
                  <button
                    onClick={triggerMobileOtp}
                    className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Send Mobile OTP ("Mobile manber OTP send me")</span>
                  </button>
                </div>

                {/* CIBIL Score Card */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">CIBIL Credit Score</span>
                    <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">765</div>
                    <span className="text-[9px] text-emerald-400 font-bold">EXCELLENT • PRIME BORROWER</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-4 border-cyan-400 border-t-emerald-400 flex items-center justify-center text-xs font-bold text-white">
                    765
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 5: PROFILE & FULL PDF ===================== */}
            {mobileTab === 'profile' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Profile Card */}
                <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 mx-auto flex items-center justify-center text-slate-950 font-black text-xl mb-3 shadow-lg shadow-emerald-500/20">
                    {activeCustomer.fullName.charAt(0)}
                  </div>
                  <h3 className="text-sm font-black text-white">{activeCustomer.fullName}</h3>
                  <p className="text-xs text-slate-400">{activeCustomer.email}</p>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">+91 {activeCustomer.phone}</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">{activeCustomer.address}</p>
                </div>

                {/* MASTER FILE DOWNLOAD & PRINT BUTTON */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-2 border-emerald-500/40 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                    <FileText className="w-4 h-4" />
                    <span>Customer Full Master File Dossier</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-snug">
                    Complete official loan file with Aadhaar verification, PAN audit, sanction order, amortization schedule, and legal declarations.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setActivePdfDoc('full-file')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => setActivePdfDoc('full-file')}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print File</span>
                    </button>
                  </div>
                </div>

                {/* Settings & Security Options */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
                  {/* Automated EMI Due Push Reminder Setting */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="font-bold text-white block">Automated EMI Push Reminders</span>
                          <span className="text-[10px] text-slate-400">
                            Notify {emiReminderConfig.leadDays === 0 ? 'on due date' : `${emiReminderConfig.leadDays} days before`} ({selectedLoan?.nextDueDate})
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emiReminderConfig.isEnabled}
                        onChange={(e) =>
                          setEmiReminderConfig({ ...emiReminderConfig, isEnabled: e.target.checked })
                        }
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsReminderSheetOpen(true)}
                        className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Sliders className="w-3 h-3 text-amber-400" />
                        <span>Configure Schedule</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerEmiReminder()}
                        className="py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-bold text-amber-300 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Bell className="w-3 h-3" />
                        <span>Test Push</span>
                      </button>
                    </div>

                    {/* Web Notification API browser push status row */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-slate-300">OS Browser Push</span>
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            browserNotificationPermission === 'granted'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {browserNotificationPermission === 'granted' ? 'ENABLED' : 'DEFAULT'}
                        </span>
                      </div>
                      {browserNotificationPermission !== 'granted' && browserNotificationPermission !== 'unsupported' ? (
                        <button
                          type="button"
                          onClick={requestBrowserNotificationPermission}
                          className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          Grant Access →
                        </button>
                      ) : (
                        <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Web API Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium text-slate-200">Biometric Face ID / Fingerprint</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isBiometricEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setIsBiometricEnabled(enabled);
                        if (!enabled) {
                          setUnlockedTabs({ phonepe: true, loans: true });
                        } else {
                          setUnlockedTabs({ phonepe: false, loans: false });
                        }
                        setMobileNotification({
                          id: `bio_toggle_${Date.now()}`,
                          title: enabled ? '🔒 Biometrics Activated' : '⚠️ Biometrics Deactivated',
                          message: enabled
                            ? 'Face ID / Fingerprint verification required before accessing PhonePe or Loan Details.'
                            : 'Biometric protection disabled. PhonePe & Loan Details tabs will open without authentication.',
                          time: 'Just now',
                          type: 'system',
                        });
                      }}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-slate-200">Support Helpline</span>
                    </div>
                    <a
                      href={`tel:${SHOP_INFO.phonePeNumber}`}
                      className="text-amber-400 font-mono font-bold hover:underline"
                    >
                      {SHOP_INFO.phonePeNumber}
                    </a>
                  </div>

                  <div className="flex items-center justify-between py-1 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span className="font-medium text-slate-200">Shop Location</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Chanchal State, Malda</span>
                  </div>
                </div>

                {/* Google Play Store Badge & Install Card in Profile */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 512 512">
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
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <span>Google Play Store</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            4.8 ★
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Download Android App & APK</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAppInstallModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] shadow-sm hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer shrink-0"
                    >
                      Install App
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===================== BOTTOM APP NAVIGATION BAR ===================== */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-900 px-3 py-2 flex items-center justify-around z-40 backdrop-blur-md">
            <button
              onClick={() => setMobileTab('home')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors cursor-pointer ${
                mobileTab === 'home' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${mobileTab === 'home' ? 'bg-emerald-500/15' : ''}`}>
                <Smartphone className="w-4 h-4" />
              </div>
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavigateWithBiometric('loans')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors cursor-pointer relative ${
                mobileTab === 'loans' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg relative ${mobileTab === 'loans' ? 'bg-emerald-500/15' : ''}`}>
                <CreditCard className="w-4 h-4" />
                {isBiometricEnabled && !unlockedTabs.loans && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950" title="Protected by Biometric" />
                )}
              </div>
              <span className="flex items-center gap-0.5">
                <span>Loans</span>
                {isBiometricEnabled && !unlockedTabs.loans && (
                  <Lock className="w-2 h-2 text-amber-400" />
                )}
              </span>
            </button>

            {/* Central PhonePe Quick Button */}
            <button
              onClick={() => handleNavigateWithBiometric('phonepe')}
              className="flex flex-col items-center -mt-4 cursor-pointer group relative"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 group-hover:scale-105 transition-transform border-2 border-slate-950 relative">
                <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                {isBiometricEnabled && !unlockedTabs.phonepe && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center border-2 border-slate-950 shadow">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>
              <span className="text-[9px] font-black text-purple-300 mt-0.5 flex items-center gap-0.5">
                <span>PhonePe</span>
                {isBiometricEnabled && !unlockedTabs.phonepe && (
                  <Lock className="w-2 h-2 text-amber-400" />
                )}
              </span>
            </button>

            <button
              onClick={() => setMobileTab('kyc')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors cursor-pointer ${
                mobileTab === 'kyc' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${mobileTab === 'kyc' ? 'bg-emerald-500/15' : ''}`}>
                <Fingerprint className="w-4 h-4" />
              </div>
              <span>KYC</span>
            </button>

            <button
              onClick={() => setMobileTab('profile')}
              className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition-colors cursor-pointer ${
                mobileTab === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${mobileTab === 'profile' ? 'bg-emerald-500/15' : ''}`}>
                <User className="w-4 h-4" />
              </div>
              <span>Profile</span>
            </button>
          </div>

          {/* ===================== SIMULATED BIOMETRIC AUTHENTICATION OVERLAY ===================== */}
          {biometricTarget && (
            <BiometricAuthOverlay
              isOpen={!!biometricTarget}
              target={biometricTarget}
              customer={activeCustomer}
              onSuccess={handleBiometricSuccess}
              onCancel={handleBiometricCancel}
            />
          )}
        </div>
      </div>

      {/* Customer Full File PDF Modal */}
      {activePdfDoc && (
        <CustomerDocPdfModal
          isOpen={!!activePdfDoc}
          onClose={() => setActivePdfDoc(null)}
          customer={activeCustomer}
          application={customerApp}
          activeLoan={selectedLoan}
          selectedCurrency={selectedCurrency}
          initialDocType={activePdfDoc}
        />
      )}

      {/* Sanction Certificate Modal */}
      {showCertificate && customerApp && (
        <SanctionCertificateModal
          application={customerApp}
          selectedCurrency={selectedCurrency}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Auto-Pay Setup / e-Mandate Modal */}
      {isAutoPayModalOpen && (
        <AutoPaySetupModal
          isOpen={isAutoPayModalOpen}
          onClose={() => setIsAutoPayModalOpen(false)}
          selectedLoan={selectedLoan}
          customer={activeCustomer}
          selectedCurrency={selectedCurrency}
          currentConfig={autoPayConfig}
          onSave={(newConfig) => {
            setAutoPayConfig(newConfig);
            setMobileNotification({
              id: `autopay_${Date.now()}`,
              title: '⚡ Auto-Pay e-Mandate Active',
              message: `Recurring EMI of ${formatCurrency(
                selectedLoan?.monthlyEmi || 1250,
                selectedCurrency
              )} authorized via ${newConfig.bankName} (${newConfig.accountNumberMasked}). Auto-debit will execute on day ${
                newConfig.deductionDay
              } of every month.`,
              time: 'Just now',
              type: 'system',
            });
          }}
        />
      )}

      {/* EMI DUE DATE REMINDER SCHEDULER MODAL / SHEET */}
      {isReminderSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-slideUp text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <BellRing className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">EMI Due Date Push Scheduler</h3>
                  <p className="text-[10px] text-slate-400">Automated mobile alerts before payment deadline</p>
                </div>
              </div>
              <button
                onClick={() => setIsReminderSheetOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Target Loan Summary Card */}
            {selectedLoan && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">{selectedLoan.productName}</span>
                  <span className="text-xs font-mono text-slate-300">{selectedLoan.accountNumber}</span>
                  <div className="text-[11px] font-bold text-amber-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due on {selectedLoan.nextDueDate}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">Monthly EMI</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {formatCurrency(selectedLoan.monthlyEmi, selectedCurrency)}
                  </span>
                </div>
              </div>
            )}

            {/* Enable/Disable Master Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-white block">Automated Push Notifications</span>
                <span className="text-[10px] text-slate-400">Receive in-app pop-up reminder before due date</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emiReminderConfig.isEnabled}
                  onChange={(e) =>
                    setEmiReminderConfig({ ...emiReminderConfig, isEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Lead Time Selection Pills */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block">
                Reminder Lead Time (When to notify):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { days: 3, label: '3 Days Before', badge: 'Recommended' },
                  { days: 1, label: '1 Day Before', badge: 'Urgent' },
                  { days: 0, label: 'On Due Date', badge: 'Due Day' },
                  { days: 5, label: '5 Days Before', badge: 'Early Bird' },
                ].map((option) => (
                  <button
                    key={option.days}
                    type="button"
                    onClick={() =>
                      setEmiReminderConfig({ ...emiReminderConfig, leadDays: option.days })
                    }
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      emiReminderConfig.leadDays === option.days
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{option.label}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                        {option.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Delivery Options */}
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300">Push Sound & Chime</span>
                </div>
                <input
                  type="checkbox"
                  checked={emiReminderConfig.soundEnabled}
                  onChange={(e) =>
                    setEmiReminderConfig({ ...emiReminderConfig, soundEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">Mirror SMS (+91 {activeCustomer.phone})</span>
                </div>
                <input
                  type="checkbox"
                  checked={emiReminderConfig.mirrorSms}
                  onChange={(e) =>
                    setEmiReminderConfig({ ...emiReminderConfig, mirrorSms: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-300">Repeat Monthly on Auto-Schedule</span>
                </div>
                <input
                  type="checkbox"
                  checked={emiReminderConfig.repeatMonthly}
                  onChange={(e) =>
                    setEmiReminderConfig({ ...emiReminderConfig, repeatMonthly: e.target.checked })
                  }
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Web Notification API: Browser System Push Notification */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">System Browser Push</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        WEB NOTIFICATION API
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      Triggers real OS desktop & device notifications in addition to in-app banners
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={emiReminderConfig.browserPushEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setEmiReminderConfig({ ...emiReminderConfig, browserPushEnabled: checked });
                    if (checked && browserNotificationPermission === 'default') {
                      requestBrowserNotificationPermission();
                    }
                  }}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Status and Action bar */}
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Browser Permission:</span>
                  <span
                    className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      browserNotificationPermission === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : browserNotificationPermission === 'denied'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : browserNotificationPermission === 'unsupported'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {browserNotificationPermission === 'granted'
                      ? '● GRANTED (ACTIVE)'
                      : browserNotificationPermission === 'denied'
                      ? '✕ BLOCKED'
                      : browserNotificationPermission === 'unsupported'
                      ? 'NOT SUPPORTED'
                      : 'PERMISSION NEEDED'}
                  </span>
                </div>

                {browserNotificationPermission !== 'granted' && browserNotificationPermission !== 'unsupported' ? (
                  <button
                    type="button"
                    onClick={requestBrowserNotificationPermission}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Grant Permission
                  </button>
                ) : browserNotificationPermission === 'granted' ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerBrowserNotification({
                        title: `🔔 Test System Browser Alert: ${formatCurrency(
                          selectedLoan?.monthlyEmi || 1250,
                          selectedCurrency
                        )}`,
                        body: `Web Notification API is verified! System push alert for ${selectedLoan?.productName || 'Loan'} is active.`,
                        amount: selectedLoan?.monthlyEmi || 1250,
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Test System Alert
                  </button>
                ) : null}
              </div>
            </div>

            {/* Test & Simulation Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerEmiReminder();
                  setIsReminderSheetOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Test Banner & System Push</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulateCountdown(5);
                  setIsReminderSheetOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate 5s Push</span>
              </button>
            </div>

            {/* Save & Confirm Button */}
            <button
              type="button"
              onClick={() => {
                setIsReminderSheetOpen(false);
                // Trigger confirmation push notification using existing banner
                setMobileNotification({
                  id: `sched_ok_${Date.now()}`,
                  title: '🔔 EMI Reminder Schedule Active',
                  message: `Automated push alert enabled: You will be notified ${
                    emiReminderConfig.leadDays === 0
                      ? 'on the due date'
                      : `${emiReminderConfig.leadDays} days before`
                  } for ${selectedLoan?.productName} (${selectedLoan?.nextDueDate}).`,
                  time: 'Just now',
                  type: 'system',
                });
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Confirm Reminder Schedule</span>
            </button>
          </div>
        </div>
      )}

      {/* Publisher Bulletins & Notices Bottom Sheet / Modal */}
      {isPublisherBulletinsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                  <Megaphone className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>Publisher Bulletins & Notices</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                      OFFICIAL
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    NS MOBILE SHOP & N.S. FINANCE • Chanchal State
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPublisherBulletinsOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Publisher Credentials Banner */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Publisher Entity</span>
                <span className="font-bold text-white">Nahid Enterprise / NS Finance</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">License ID</span>
                <span className="font-mono text-emerald-400 font-bold">PUB-NSF-WB-2026</span>
              </div>
            </div>

            {/* List of Published Notices */}
            <div className="space-y-2.5">
              {publishedNotices.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No active bulletins published at this moment.
                </div>
              ) : (
                publishedNotices.map((bulletin) => (
                  <div
                    key={bulletin.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                            bulletin.priority === 'URGENT'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : bulletin.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {bulletin.priority}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">{bulletin.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{bulletin.publishDate}</span>
                    </div>

                    <h4 className="font-bold text-white text-xs leading-snug">{bulletin.title}</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">
                      {bulletin.content || bulletin.summary}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        Target: <strong className="text-slate-200">{bulletin.targetAudience.replace('_', ' ')}</strong>
                      </span>
                      {bulletin.title.toLowerCase().includes('phonepe') || bulletin.title.toLowerCase().includes('emi') ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsPublisherBulletinsOpen(false);
                            handleNavigateWithBiometric('phonepe');
                          }}
                          className="px-2 py-1 rounded bg-purple-600/30 text-purple-300 font-bold hover:bg-purple-600/40 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>Pay via PhonePe</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Notice</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Action Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              {onOpenPublisherDesk && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPublisherBulletinsOpen(false);
                    onOpenPublisherDesk();
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Open Publisher Management Desk</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPublisherBulletinsOpen(false)}
                className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Play Store Official Listing & Install Modal */}
      <PlayStoreAppModal
        isOpen={isAppInstallModalOpen}
        onClose={() => setIsAppInstallModalOpen(false)}
        onOpenMobileApp={() => {
          setMobileTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPlayStorePublic={onOpenPlayStorePublic}
      />
    </div>
  );
};
