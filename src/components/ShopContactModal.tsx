import React, { useState } from 'react';
import { SHOP_INFO } from '../data/loanProducts';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Smartphone,
  Building2,
  Copy,
  Check,
  X,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface ShopContactModalProps {
  onClose: () => void;
}

export const ShopContactModal: React.FC<ShopContactModalProps> = ({ onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-purple-500/20">
            NS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 font-mono">
                Official Contact & Payments
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Open 10 AM – 10 PM
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {SHOP_INFO.name}
            </h3>
          </div>
        </div>

        {/* Quick Contact Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={`tel:${SHOP_INFO.phone}`}
            className="p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-102"
          >
            <Phone className="w-4 h-4 fill-slate-950" />
            <span>Call {SHOP_INFO.phone}</span>
          </a>

          <a
            href={`https://wa.me/91${SHOP_INFO.phone}?text=Hello%20NS%20MOBILE%20SOP,%20I%20want%20information%20about%20mobile%20and%20loan`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-102"
          >
            <Smartphone className="w-4 h-4" />
            <span>WhatsApp Chat</span>
          </a>
        </div>

        {/* Shop Location & Hours Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 mb-6 text-xs">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Shop Address</span>
              <p className="font-bold text-slate-100 text-sm">
                {SHOP_INFO.address}
              </p>
              <span className="text-emerald-400 text-[11px] font-semibold">
                (Chanchal State, Garage er samne)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Shop Timings</span>
              <span className="font-bold text-white text-xs">
                {SHOP_INFO.hours} (10.00 AM to 10.00 PM)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
            <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Email Support</span>
              <a
                href={`mailto:${SHOP_INFO.email}`}
                className="font-mono text-cyan-300 hover:underline text-xs"
              >
                {SHOP_INFO.email}
              </a>
            </div>
          </div>
        </div>

        {/* PAYMENT DETAILS (INDIA KA ACCOUNT & PHONEPE) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-950 border border-purple-500/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                पे
              </span>
              <div>
                <h4 className="font-bold text-white text-sm">
                  Payment: India Ka Account & PhonePe
                </h4>
                <span className="text-[10px] text-purple-300">
                  Instant UPI & Direct Bank Transfer Accepted
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
              Verified Merchant
            </span>
          </div>

          {/* PhonePe Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/20 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                PhonePe Number / UPI ID
              </span>
              <button
                type="button"
                onClick={() => handleCopy(SHOP_INFO.phonePeNumber, 'phonepe')}
                className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'phonepe' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'phonepe' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="font-mono font-black text-xl text-white tracking-wide">
              {SHOP_INFO.phonePeNumber}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              UPI ID: <span className="text-purple-300 font-semibold">{SHOP_INFO.upiId}</span>
            </div>
          </div>

          {/* India Bank Account Details */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                India Bank Account (NESFB / IMPS / NEFT)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(SHOP_INFO.bankDetails.accountNumber, 'bank')}
                className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'bank' ? 'Copied' : 'Copy A/C'}</span>
              </button>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Account Name:</span>
              <span className="font-bold text-white">{SHOP_INFO.bankDetails.accountName}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Account Number:</span>
              <span className="font-mono font-bold text-emerald-400">{SHOP_INFO.bankDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">IFSC Code:</span>
              <span className="font-mono font-bold text-cyan-400">{SHOP_INFO.bankDetails.ifscCode}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Bank & Branch:</span>
              <span>{SHOP_INFO.bankDetails.bankName}, {SHOP_INFO.bankDetails.branch}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          Close Information
        </button>
      </div>
    </div>
  );
};
