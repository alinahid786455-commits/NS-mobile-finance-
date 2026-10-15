import React, { useState } from 'react';
import {
  Search,
  Phone,
  CreditCard,
  User,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  FileSpreadsheet,
  X,
  Filter,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Smartphone,
  Calendar,
  Layers,
} from 'lucide-react';
import { CustomerUser, CurrencyConfig } from '../types/loan';
import { DEMO_CUSTOMERS, getAllCustomerDirectory, maskAadhaar, maskPan } from '../data/customerData';
import { formatCurrency } from '../utils/calculator';
import { SHOP_INFO } from '../data/loanProducts';

interface CustomerLoanDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: CurrencyConfig;
  activeCustomerId?: string;
  onSelectCustomer?: (customer: CustomerUser) => void;
}

export const CustomerLoanDirectoryModal: React.FC<CustomerLoanDirectoryModalProps> = ({
  isOpen,
  onClose,
  selectedCurrency,
  activeCustomerId,
  onSelectCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DEVICE' | 'PERSONAL' | 'BUSINESS' | 'MICRO'>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const directoryList = getAllCustomerDirectory();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredCustomers = directoryList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.fullName.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.primaryLoanId.toLowerCase().includes(q) ||
      item.allLoanIds.some((id) => id.toLowerCase().includes(q)) ||
      item.loanCategory.toLowerCase().includes(q) ||
      item.aadharNumber.replace(/\s+/g, '').includes(q);

    let matchesCategory = true;
    if (categoryFilter === 'DEVICE') {
      matchesCategory = item.loanCategory.toLowerCase().includes('device') || item.loanCategory.toLowerCase().includes('phone');
    } else if (categoryFilter === 'PERSONAL') {
      matchesCategory = item.loanCategory.toLowerCase().includes('personal') || item.loanCategory.toLowerCase().includes('vehicle');
    } else if (categoryFilter === 'BUSINESS') {
      matchesCategory = item.loanCategory.toLowerCase().includes('business');
    } else if (categoryFilter === 'MICRO') {
      matchesCategory = item.loanCategory.toLowerCase().includes('micro') || item.loanCategory.toLowerCase().includes('women');
    }

    return matchesSearch && matchesCategory;
  });

  const exportDirectoryToClipboard = () => {
    const headers = 'Customer Name,Phone Number,Loan ID Number,Category,Balance,Monthly EMI,Due Date\n';
    const rows = directoryList
      .map(
        (c) =>
          `"${c.fullName}","+91 ${c.phone}","${c.primaryLoanId}","${c.loanCategory}",${c.totalBalance},${c.totalEmi},"${c.nextDueDate}"`
      )
      .join('\n');
    navigator.clipboard.writeText(headers + rows);
    setCopiedKey('export-all');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Customer Directory & Loan ID Register
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {directoryList.length} Active Accounts
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete roster of customer names, active Loan ID numbers, and Phone contacts at {SHOP_INFO.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportDirectoryToClipboard}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Copy customer roster as CSV"
            >
              {copiedKey === 'export-all' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">CSV Copied!</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export CSV</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone (+91), or Loan ID (e.g. NS-ACT-99201)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Customers' },
              { id: 'DEVICE', label: 'Device EMI' },
              { id: 'PERSONAL', label: 'Personal & Auto' },
              { id: 'BUSINESS', label: 'Business' },
              { id: 'MICRO', label: 'Microfinance' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as typeof categoryFilter)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm">No customers matching "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                }}
                className="text-xs text-emerald-400 font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredCustomers.map((customer) => {
                const isSelected = activeCustomerId === customer.customerId;
                const matchedUser = DEMO_CUSTOMERS.find((c) => c.id === customer.customerId);

                return (
                  <div
                    key={customer.customerId}
                    className={`rounded-2xl border p-4 transition-all relative ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header Row: Customer Name & Active Tag */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          {customer.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white">
                              {customer.fullName}
                            </h3>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-slate-950">
                                Current in App
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            ID: {customer.customerId} • UID: {maskAadhaar(customer.aadharNumber)}
                          </span>
                        </div>
                      </div>

                      {/* Select / Switch Button */}
                      {onSelectCustomer && matchedUser && !isSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCustomer(matchedUser);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Select in App</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* LOAN ID NUMBER ROW (Prominently Highlighted) */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30 mb-2.5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block">
                          Customer Loan ID Number
                        </span>
                        <span className="text-xs font-black font-mono text-white tracking-wide">
                          {customer.primaryLoanId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(customer.primaryLoanId, `loan_${customer.customerId}`)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy Loan ID Number"
                        >
                          {copiedKey === `loan_${customer.customerId}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* PHONE NUMBER ROW (Direct Call, Copy, WhatsApp) */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                            Customer Phone Contact
                          </span>
                          <span className="text-xs font-black font-mono text-purple-300">
                            +91 {customer.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Copy Phone */}
                        <button
                          onClick={() => handleCopy(`+91 ${customer.phone}`, `phone_${customer.customerId}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Copy Phone Number"
                        >
                          {copiedKey === `phone_${customer.customerId}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Direct Call */}
                        <a
                          href={`tel:+91${customer.phone}`}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
                          title="Call Customer Phone"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        {/* WhatsApp Message */}
                        <a
                          href={`https://wa.me/91${customer.phone}?text=Hello%20${encodeURIComponent(
                            customer.fullName
                          )},%20this%20is%20regarding%20your%20Loan%20Account%20${customer.primaryLoanId}%20at%20NS%20Mobile%20Shop%20Finance.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition-colors cursor-pointer"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Loan Financial Metrics */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block">Category</span>
                        <span className="text-slate-200 font-bold truncate block">
                          {customer.loanCategory}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Balance</span>
                        <span className="text-white font-bold">
                          {formatCurrency(customer.totalBalance, selectedCurrency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Monthly EMI</span>
                        <span className="text-emerald-400 font-bold">
                          {formatCurrency(customer.totalEmi, selectedCurrency)}
                        </span>
                      </div>
                    </div>

                    {/* Additional Loan IDs if customer has multiple */}
                    {customer.allLoanIds.length > 1 && (
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        <span>All Active Accounts:</span>
                        <span className="font-mono text-cyan-300">
                          {customer.allLoanIds.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              All customer loan records verified by {SHOP_INFO.name} • Helpline: <strong className="text-amber-400 font-mono">{SHOP_INFO.phonePeNumber}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
