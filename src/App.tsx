import React, { useState } from 'react';
import {
  CurrencyCode,
  CurrencyConfig,
  LoanApplication,
  ActiveLoan,
  LoanProduct,
  ApplicationStatus,
  CustomerUser,
  PublishedItem,
} from './types/loan';
import { CURRENCIES, LOAN_PRODUCTS, SHOP_INFO } from './data/loanProducts';
import { DEMO_CUSTOMERS, getCustomerLoans } from './data/customerData';
import { INITIAL_PUBLICATIONS } from './data/publisherData';
import { LoanNavbar } from './components/LoanNavbar';
import { LoanHero } from './components/LoanHero';
import { LoanApplicationForm } from './components/LoanApplicationForm';
import { EmiCalculator } from './components/EmiCalculator';
import { LoanComparisonView } from './components/LoanComparisonView';
import { LoanTracker } from './components/LoanTracker';
import { CustomerDashboard } from './components/CustomerDashboard';
import { CustomerMobileApp } from './components/CustomerMobileApp';
import { AdminDesk } from './components/AdminDesk';
import { PublisherDesk } from './components/PublisherDesk';
import { AiLoanAdvisorModal } from './components/AiLoanAdvisorModal';
import { ShopContactModal } from './components/ShopContactModal';
import { CustomerLoginModal } from './components/CustomerLoginModal';
import { PlayStorePublicPage } from './components/PlayStorePublicPage';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  HeartHandshake,
  CheckCircle2,
  FileText,
  Percent,
  Megaphone,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'apply' | 'calculator' | 'compare' | 'track' | 'my-loans' | 'admin' | 'customer-app' | 'publisher' | 'playstore'
  >(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'playstore' || tabParam === 'play-store') return 'playstore';
      if (tabParam === 'customer-app') return 'customer-app';
      if (tabParam === 'my-loans') return 'my-loans';
      if (tabParam === 'calculator') return 'calculator';
      if (tabParam === 'compare') return 'compare';
      if (tabParam === 'track') return 'track';
      if (tabParam === 'admin') return 'admin';
      if (tabParam === 'publisher') return 'publisher';
    }
    return 'apply';
  });
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(CURRENCIES.INR);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [isShopContactOpen, setIsShopContactOpen] = useState<boolean>(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(DEMO_CUSTOMERS[0]);
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState<boolean>(false);
  const [publications, setPublications] = useState<PublishedItem[]>(INITIAL_PUBLICATIONS);

  // Selected product / prefill settings for application form
  const [prefilledProduct, setPrefilledProduct] = useState<LoanProduct>(LOAN_PRODUCTS[0]);
  const [prefilledAmount, setPrefilledAmount] = useState<number>(15000);
  const [prefilledTenure, setPrefilledTenure] = useState<number>(24);
  const [trackerSearchId, setTrackerSearchId] = useState<string>('NS-LN-849201');

  // Seed sample loan applications
  const [applications, setApplications] = useState<LoanApplication[]>([
    {
      id: 'NS-LN-849201',
      fullName: 'Tariq Rahman',
      email: 'tariq.rahman@email.com',
      phone: '9332504150',
      nidOrPassport: '5849 2039 1847',
      aadharNumber: '5849 2039 1847',
      panNumber: 'ABCPR1294F',
      dateOfBirth: '1992-05-14',
      gender: 'Male',
      address: 'Chanchal State, Garage er Samne, Malda, West Bengal',
      employmentType: 'Salaried',
      monthlyIncome: 3200,
      companyName: 'Beximco Digital Solutions',
      workExperienceYears: 5,
      existingMonthlyEmi: 300,
      loanCategory: 'Personal',
      requestedAmount: 18000,
      tenureMonths: 24,
      purpose: 'Home Renovation & Modernization',
      currency: 'INR',
      interestRate: 10.5,
      monthlyEmi: 835,
      totalInterest: 2040,
      totalPayable: 20040,
      creditScore: 765,
      dtiPercentage: 27,
      status: 'APPROVED',
      appliedDate: '2026-10-08',
      remarks: 'Prime applicant with low debt-to-income ratio and consistent salary credentials.',
    },
    {
      id: 'NS-LN-502914',
      fullName: 'Fatima Zohra',
      email: 'fatima.zohra@fashioncraft.com',
      phone: '9876543210',
      nidOrPassport: '7823 9102 3845',
      aadharNumber: '7823 9102 3845',
      panNumber: 'BNMPZ8821K',
      dateOfBirth: '1989-11-20',
      gender: 'Female',
      address: 'Main Market Road, Chanchal, Malda, West Bengal',
      employmentType: 'Business Owner',
      monthlyIncome: 5500,
      companyName: 'Zohra Textiles & Boutique',
      workExperienceYears: 7,
      existingMonthlyEmi: 500,
      loanCategory: 'Business',
      requestedAmount: 45000,
      tenureMonths: 36,
      purpose: 'Purchase of automated sewing equipment and fabric inventory',
      currency: 'INR',
      interestRate: 11.5,
      monthlyEmi: 1484,
      totalInterest: 8424,
      totalPayable: 53424,
      creditScore: 780,
      dtiPercentage: 31,
      status: 'DISBURSED',
      appliedDate: '2026-10-04',
      remarks: 'Audited trade license and healthy bank statement verified. Loan disbursed.',
    },
    {
      id: 'NS-LN-319802',
      fullName: 'Kamal Hossain',
      email: 'kamal.hossain@logisticspro.com',
      phone: '9123456789',
      nidOrPassport: '4910 8274 9182',
      aadharNumber: '4910 8274 9182',
      panNumber: 'CKLPM3310Q',
      dateOfBirth: '1995-02-10',
      gender: 'Male',
      address: 'Station Road, Malda, West Bengal',
      employmentType: 'Salaried',
      monthlyIncome: 1800,
      companyName: 'Speedy Express Couriers',
      workExperienceYears: 3,
      existingMonthlyEmi: 150,
      loanCategory: 'Vehicle',
      requestedAmount: 12000,
      tenureMonths: 36,
      purpose: 'Two-wheeler commercial delivery bike purchase',
      currency: 'INR',
      interestRate: 9.2,
      monthlyEmi: 383,
      totalInterest: 1788,
      totalPayable: 13788,
      creditScore: 710,
      dtiPercentage: 33,
      status: 'VERIFYING',
      appliedDate: '2026-10-09',
      remarks: 'Applicant driving license submitted. Employer verification call scheduled.',
    },
  ]);

  // Seed sample active loans mapped to initial customer
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>(() =>
    getCustomerLoans(DEMO_CUSTOMERS[0].id)
  );

  // Handle new application submitted
  const handleApplicationSuccess = (newApp: LoanApplication) => {
    setApplications((prev) => [newApp, ...prev]);
    setTrackerSearchId(newApp.id);
  };

  // Handle application status update from Officer Desk
  const handleUpdateApplicationStatus = (
    appId: string,
    newStatus: ApplicationStatus,
    notes?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const updated = { ...app, status: newStatus };
          if (notes) updated.remarks = notes;

          // If disbursed, automatically create an active loan in customer portal
          if (newStatus === 'DISBURSED' && app.status !== 'DISBURSED') {
            const newActiveLoan: ActiveLoan = {
              id: `loan_${Date.now()}`,
              accountNumber: `NS-ACT-${Math.floor(10000 + Math.random() * 90000)}`,
              productName: `${app.loanCategory} Loan`,
              principalAmount: app.requestedAmount,
              remainingBalance: app.requestedAmount,
              monthlyEmi: app.monthlyEmi,
              interestRate: app.interestRate,
              nextDueDate: 'Nov 15, 2026',
              totalTenureMonths: app.tenureMonths,
              completedEmis: 0,
              currency: app.currency,
              status: 'ACTIVE',
            };
            setActiveLoans((loans) => [newActiveLoan, ...loans]);
          }

          return updated;
        }
        return app;
      })
    );
  };

  // Handle repayment
  const handleMakePayment = (loanId: string, amount: number) => {
    setActiveLoans((prev) =>
      prev.map((loan) => {
        if (loan.id === loanId) {
          const newBalance = Math.max(0, loan.remainingBalance - amount);
          const newCompleted = loan.completedEmis + 1;
          return {
            ...loan,
            remainingBalance: newBalance,
            completedEmis: newCompleted,
            status: newBalance <= 0 ? 'CLOSED' : 'ACTIVE',
          };
        }
        return loan;
      })
    );
  };

  const handleApplyProduct = (product: LoanProduct) => {
    setPrefilledProduct(product);
    setPrefilledAmount(product.defaultAmount);
    setPrefilledTenure(product.defaultTenureMonths);
    setActiveTab('apply');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleApplyWithValues = (amount: number, tenureMonths: number, rate: number) => {
    setPrefilledAmount(amount);
    setPrefilledTenure(tenureMonths);
    setActiveTab('apply');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleApplyProductWithValues = (product: LoanProduct, amount: number, tenureMonths: number) => {
    setPrefilledProduct(product);
    setPrefilledAmount(amount);
    setPrefilledTenure(tenureMonths);
    setActiveTab('apply');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handlePublishItem = (newItem: PublishedItem) => {
    setPublications((prev) => [newItem, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navbar */}
      <LoanNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedCurrency={selectedCurrency}
        onChangeCurrency={(code) => setSelectedCurrency(CURRENCIES[code] || CURRENCIES.INR)}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onOpenShopContact={() => setIsShopContactOpen(true)}
        currentCustomer={currentCustomer}
        onOpenCustomerLogin={() => setIsCustomerLoginOpen(true)}
      />

      {/* Main Content Render */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'apply' && (
          <>
            <LoanHero
              selectedCurrency={selectedCurrency}
              onApplyProduct={handleApplyProduct}
              onOpenCalculator={() => setActiveTab('calculator')}
              onOpenCompare={() => setActiveTab('compare')}
              onOpenPlayStore={() => setActiveTab('playstore')}
            />
            <LoanApplicationForm
              selectedCurrency={selectedCurrency}
              initialProduct={prefilledProduct}
              initialAmount={prefilledAmount}
              initialTenure={prefilledTenure}
              onSubmitSuccess={handleApplicationSuccess}
              onGoToTracker={(appId) => {
                setTrackerSearchId(appId);
                setActiveTab('track');
              }}
              currentCustomer={currentCustomer}
            />
          </>
        )}

        {activeTab === 'calculator' && (
          <div className="py-8">
            <EmiCalculator
              selectedCurrency={selectedCurrency}
              onApplyWithValues={handleApplyWithValues}
              onOpenCompare={() => setActiveTab('compare')}
            />
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="py-8">
            <LoanComparisonView
              selectedCurrency={selectedCurrency}
              onApplyProductWithValues={handleApplyProductWithValues}
            />
          </div>
        )}

        {activeTab === 'track' && (
          <div className="py-8">
            <LoanTracker
              applications={applications}
              selectedCurrency={selectedCurrency}
              defaultSearchId={trackerSearchId}
            />
          </div>
        )}

        {activeTab === 'my-loans' && (
          <div className="py-8">
            <CustomerDashboard
              activeLoans={activeLoans}
              selectedCurrency={selectedCurrency}
              onMakePayment={handleMakePayment}
              currentCustomer={currentCustomer}
              onOpenCustomerLogin={() => setIsCustomerLoginOpen(true)}
              onLogoutCustomer={() => setCurrentCustomer(null)}
              onSelectCustomer={(cust) => setCurrentCustomer(cust)}
              applications={applications}
              onOpenMobileApp={() => setActiveTab('customer-app')}
              onOpenPlayStorePublic={() => setActiveTab('playstore')}
            />
          </div>
        )}

        {activeTab === 'customer-app' && (
          <div className="py-6">
            <CustomerMobileApp
              currentCustomer={currentCustomer}
              activeLoans={activeLoans}
              applications={applications}
              selectedCurrency={selectedCurrency}
              onMakePayment={handleMakePayment}
              onOpenCustomerLogin={() => setIsCustomerLoginOpen(true)}
              onOpenApply={() => {
                setActiveTab('apply');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              onOpenEmiCalculator={() => {
                setActiveTab('calculator');
                window.scrollTo({ top: 100, behavior: 'smooth' });
              }}
              onSwitchToDesktopPortal={() => setActiveTab('my-loans')}
              onSelectCustomer={(cust) => {
                setCurrentCustomer(cust);
                setActiveLoans(getCustomerLoans(cust.id));
              }}
              publishedNotices={publications}
              onOpenPublisherDesk={() => setActiveTab('publisher')}
              onOpenPlayStorePublic={() => setActiveTab('playstore')}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="py-8">
            <AdminDesk
              applications={applications}
              selectedCurrency={selectedCurrency}
              onUpdateStatus={handleUpdateApplicationStatus}
              onOpenPublisher={() => setActiveTab('publisher')}
            />
          </div>
        )}

        {activeTab === 'publisher' && (
          <div className="py-8">
            <PublisherDesk
              applications={applications}
              selectedCurrency={selectedCurrency}
              publications={publications}
              onPublishItem={handlePublishItem}
              onOpenMobileApp={() => setActiveTab('customer-app')}
            />
          </div>
        )}

        {activeTab === 'playstore' && (
          <div className="py-6">
            <PlayStorePublicPage
              onOpenCustomerApp={() => setActiveTab('customer-app')}
              onOpenLoanApply={() => {
                setActiveTab('apply');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              onOpenCalculator={() => {
                setActiveTab('calculator');
                window.scrollTo({ top: 100, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </main>

      {/* Customer Login Modal */}
      <CustomerLoginModal
        isOpen={isCustomerLoginOpen}
        onClose={() => setIsCustomerLoginOpen(false)}
        onLoginSuccess={(customer) => {
          setCurrentCustomer(customer);
          setActiveTab('my-loans');
        }}
        currentCustomer={currentCustomer}
      />

      {/* AI Advisor Modal */}
      {isAiAdvisorOpen && (
        <AiLoanAdvisorModal onClose={() => setIsAiAdvisorOpen(false)} />
      )}

      {/* Shop Contact & PhonePe Modal */}
      {isShopContactOpen && (
        <ShopContactModal onClose={() => setIsShopContactOpen(false)} />
      )}

      {/* High-Trust Footer */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-10 px-4 sm:px-8 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
                NS
              </div>
              <span className="font-extrabold text-white text-base">
                NS <span className="text-emerald-400">MOBILE</span> & Finance
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              NS MOBILE SHOP & N.S. Finance. Smartphone sales, easy device EMI, and transparent micro loans. Instant approval and digital payments via PhonePe & Indian Bank Accounts.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setIsShopContactOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View PhonePe & Shop QR</span>
              </button>
            </div>
          </div>

          {/* Col 2: Products */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Financing Solutions
            </h4>
            <ul className="space-y-2">
              {LOAN_PRODUCTS.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => handleApplyProduct(p)}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {p.title} ({p.interestRate}%)
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Portals */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Services & Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('calculator')} className="hover:text-emerald-400 cursor-pointer">
                  EMI & Amortization Calculator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('track')} className="hover:text-emerald-400 cursor-pointer">
                  Track Loan Application Status
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('my-loans')} className="hover:text-emerald-400 cursor-pointer">
                  Borrower Repayment Desk (PhonePe)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-emerald-400 cursor-pointer">
                  Loan Officer Desk
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('publisher')} className="hover:text-amber-400 cursor-pointer flex items-center gap-1.5 text-amber-300 font-bold">
                  <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>The Publisher Hub & Circulars</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('playstore')} className="hover:text-teal-400 cursor-pointer flex items-center gap-1.5 text-teal-300 font-bold">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 512 512">
                    <path fill="#00C1A6" d="M325.3 234.3L10.7 41.6C4.4 45.4 0 52.3 0 60.8v390.4c0 8.5 4.4 15.4 10.7 19.2l314.6-192.8c4.6-2.8 7.3-7.5 7.3-12.8s-2.7-10-7.3-10.5z" />
                    <path fill="#0083D6" d="M10.7 41.6L325.3 234.3l94-57.6L67.1 7.4c-18.4-11.2-41.2-2.5-56.4 34.2z" />
                    <path fill="#FF3333" d="M10.7 470.4c15.2 36.7 38 45.4 56.4 34.2l352.2-215.7-94-57.6L10.7 470.4z" />
                    <path fill="#FFBA00" d="M504.6 245.2l-85.3-52.2-94 57.6 94 57.6 85.3-52.2c10.3-6.3 10.3-16.5 0-22.8z" />
                  </svg>
                  <span>Google Play Store (Public Page)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setIsShopContactOpen(true)} className="hover:text-emerald-400 cursor-pointer">
                  PhonePe & Bank Payment Details
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              NS MOBILE SHOP
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href={`tel:${SHOP_INFO.phone}`} className="font-bold text-white hover:text-emerald-400 font-mono">
                  {SHOP_INFO.formattedPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <a href={`mailto:${SHOP_INFO.email}`} className="text-slate-300 hover:underline font-mono">
                  {SHOP_INFO.email}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">
                  {SHOP_INFO.address}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-300">
                  {SHOP_INFO.hours}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 {SHOP_INFO.name}. All rights reserved. Accepted Payments: India Bank Account & PhonePe ({SHOP_INFO.phone}).
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-300">PhonePe / UPI Verified</span>
            <span className="hover:text-slate-300">Instant Loan Sanction</span>
            <span className="hover:text-slate-300">Chanchal State Branch</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
