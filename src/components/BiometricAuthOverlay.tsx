import React, { useState, useEffect, useRef } from 'react';
import {
  Fingerprint,
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Unlock,
  KeyRound,
  RefreshCw,
  Sparkles,
  Smartphone,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CustomerUser } from '../types/loan';
import { maskAadhaar, maskPan } from '../data/customerData';

export type BiometricMode = 'faceid' | 'fingerprint';
export type BiometricTarget = 'phonepe' | 'loans';

interface BiometricAuthOverlayProps {
  isOpen: boolean;
  target: BiometricTarget;
  customer: CustomerUser;
  onSuccess: (target: BiometricTarget) => void;
  onCancel: () => void;
}

// Web Audio sound synthesizer for realistic device haptics
const playDeviceChime = (type: 'scan' | 'success' | 'fail' | 'click') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'scan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(750, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      const now = ctx.currentTime;
      // High two-tone chime
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);
        gain.gain.setValueAtTime(0.08, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.22);
      });
    } else if (type === 'fail') {
      const now = ctx.currentTime;
      [220, 180].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.06, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.12);
      });
    }
  } catch {
    // Audio context may be restricted by autoplay policy
  }
};

export const BiometricAuthOverlay: React.FC<BiometricAuthOverlayProps> = ({
  isOpen,
  target,
  customer,
  onSuccess,
  onCancel,
}) => {
  const [mode, setMode] = useState<BiometricMode>('fingerprint');
  const [authState, setAuthState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [showPinFallback, setShowPinFallback] = useState<boolean>(false);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [showPinHint, setShowPinHint] = useState<boolean>(false);

  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount or close
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // When overlay opens, reset state and auto-start scan after a brief realistic pause
  useEffect(() => {
    if (isOpen) {
      setAuthState('idle');
      setErrorMessage('');
      setScanProgress(0);
      setShowPinFallback(false);
      setPinDigits([]);
      setAttemptCount(0);

      // Auto-trigger scan for instant seamless mobile feel
      const autoTimer = setTimeout(() => {
        startScanProcess(false);
      }, 350);

      return () => clearTimeout(autoTimer);
    }
  }, [isOpen, mode]);

  const startScanProcess = (forceFailure: boolean = false) => {
    if (authState === 'scanning' || authState === 'success') return;

    setAuthState('scanning');
    setErrorMessage('');
    setScanProgress(0);
    playDeviceChime('scan');

    const duration = 1200; // 1.2s scan
    const stepInterval = 40;
    const totalSteps = duration / stepInterval;
    let currentStep = 0;

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setScanProgress(progress);

      if (currentStep >= totalSteps) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        if (forceFailure) {
          setAuthState('failed');
          setErrorMessage(
            mode === 'faceid'
              ? 'Face not recognized. Keep face in frame and try again.'
              : 'Fingerprint pattern mismatch. Clean sensor and retry.'
          );
          setAttemptCount((prev) => prev + 1);
          playDeviceChime('fail');
        } else {
          setAuthState('success');
          playDeviceChime('success');

          // Gentle celebratory confetti effect
          try {
            confetti({
              particleCount: 30,
              spread: 60,
              origin: { y: 0.65 },
              colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'],
            });
          } catch {
            // confetti optional
          }

          // Automatically complete after success badge shows
          scanTimeoutRef.current = setTimeout(() => {
            onSuccess(target);
          }, 700);
        }
      }
    }, stepInterval);
  };

  // PIN keypad handling
  const handlePinInput = (digit: string) => {
    playDeviceChime('click');
    if (pinDigits.length < 4) {
      const nextDigits = [...pinDigits, digit];
      setPinDigits(nextDigits);

      if (nextDigits.length === 4) {
        // Validate PIN (Default is 1234 or any 4-digit entry in demo)
        const enteredPin = nextDigits.join('');
        if (enteredPin === '1234' || enteredPin === '8509') {
          setAuthState('success');
          playDeviceChime('success');
          setTimeout(() => {
            onSuccess(target);
          }, 600);
        } else {
          playDeviceChime('fail');
          setErrorMessage('Incorrect Security PIN. Hint: Default PIN is 1234');
          setTimeout(() => {
            setPinDigits([]);
          }, 500);
        }
      }
    }
  };

  const handlePinBackspace = () => {
    playDeviceChime('click');
    setPinDigits((prev) => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    playDeviceChime('click');
    setPinDigits([]);
    setErrorMessage('');
  };

  if (!isOpen) return null;

  const targetTitle =
    target === 'phonepe'
      ? 'PhonePe UPI Payment'
      : 'Loan Details & Ledger';

  const targetDescription =
    target === 'phonepe'
      ? 'Biometric authorization required to access PhonePe instant payments & wallet'
      : 'Biometric authorization required to view sensitive loan terms & payment schedules';

  const targetIcon =
    target === 'phonepe' ? (
      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-purple-600/30">
        पे
      </div>
    ) : (
      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs">
        <ShieldCheck className="w-4 h-4" />
      </div>
    );

  return (
    <div
      className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-5 text-white animate-fadeIn overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-title"
    >
      {/* Top Bar with Security Badge & Close */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[11px] font-black tracking-wide text-slate-200 block uppercase">
              Biometric Vault
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              FIDO2 • Level 3 Hardware Bound
            </span>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
          title="Cancel & return"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Target Resource Card */}
      <div className="my-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
        {targetIcon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 id="biometric-title" className="text-xs font-black text-white truncate">
              {targetTitle}
            </h4>
            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              LOCKED
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight truncate mt-0.5">
            {targetDescription}
          </p>
        </div>
      </div>

      {/* Main Authentication Body */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 relative">
        {/* Toggle Mode: Face ID vs Fingerprint */}
        {!showPinFallback && (
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
            <button
              onClick={() => {
                playDeviceChime('click');
                setMode('fingerprint');
                setAuthState('idle');
                setScanProgress(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'fingerprint'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Fingerprint</span>
            </button>
            <button
              onClick={() => {
                playDeviceChime('click');
                setMode('faceid');
                setAuthState('idle');
                setScanProgress(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                mode === 'faceid'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ScanFace className="w-3.5 h-3.5" />
              <span>Face ID</span>
            </button>
          </div>
        )}

        {/* ===================== VIEW 1: BIOMETRIC SCANNER ===================== */}
        {!showPinFallback ? (
          <div className="flex flex-col items-center text-center w-full max-w-[280px]">
            {/* Visual Scanner Arena */}
            <div className="relative my-3 flex items-center justify-center">
              {/* Outer pulsing glow */}
              <div
                className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${
                  authState === 'success'
                    ? 'bg-emerald-500/40'
                    : authState === 'scanning'
                    ? 'bg-cyan-500/30 animate-pulse'
                    : authState === 'failed'
                    ? 'bg-rose-500/40'
                    : 'bg-emerald-500/10'
                }`}
              ></div>

              {/* Scanner Frame / Button */}
              <button
                type="button"
                onClick={() => startScanProcess(false)}
                disabled={authState === 'scanning' || authState === 'success'}
                className={`relative w-36 h-36 rounded-3xl border-2 flex flex-col items-center justify-center p-3 transition-all cursor-pointer select-none ${
                  authState === 'success'
                    ? 'bg-emerald-950/40 border-emerald-400 shadow-xl shadow-emerald-500/30'
                    : authState === 'scanning'
                    ? 'bg-slate-900 border-cyan-400/80 shadow-xl shadow-cyan-500/20'
                    : authState === 'failed'
                    ? 'bg-rose-950/30 border-rose-500/80'
                    : 'bg-slate-900/90 border-slate-700 hover:border-emerald-500/60 active:scale-95'
                }`}
              >
                {/* Mode: Face ID Visual Wireframe */}
                {mode === 'faceid' && (
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Corner Brackets for Face ID */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-lg"></div>

                    {/* Central Face Mesh Icon */}
                    <ScanFace
                      className={`w-16 h-16 transition-colors ${
                        authState === 'success'
                          ? 'text-emerald-400'
                          : authState === 'scanning'
                          ? 'text-cyan-300'
                          : authState === 'failed'
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    />

                    {/* Laser Scan Line */}
                    {authState === 'scanning' && (
                      <div
                        className="absolute left-1 right-1 h-0.5 bg-gradient-to-r from-cyan-400 via-white to-cyan-400 shadow-[0_0_12px_#38bdf8] transition-all"
                        style={{
                          top: `${scanProgress}%`,
                        }}
                      ></div>
                    )}
                  </div>
                )}

                {/* Mode: Fingerprint Visual Sensor */}
                {mode === 'fingerprint' && (
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Concentric rings */}
                    <div
                      className={`absolute inset-0 rounded-full border border-dashed transition-all ${
                        authState === 'scanning'
                          ? 'border-cyan-400/50 animate-spin'
                          : 'border-slate-700'
                      }`}
                    ></div>

                    <Fingerprint
                      className={`w-16 h-16 transition-colors ${
                        authState === 'success'
                          ? 'text-emerald-400'
                          : authState === 'scanning'
                          ? 'text-cyan-300'
                          : authState === 'failed'
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    />

                    {/* Laser Scan Sweep */}
                    {authState === 'scanning' && (
                      <div
                        className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 shadow-[0_0_12px_#34d399] transition-all"
                        style={{
                          top: `${scanProgress}%`,
                        }}
                      ></div>
                    )}
                  </div>
                )}

                {/* Success Checkmark Stamp */}
                {authState === 'success' && (
                  <div className="absolute inset-0 rounded-3xl bg-emerald-950/80 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
                    <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce" />
                  </div>
                )}
              </button>
            </div>

            {/* Status Feedback Text */}
            <div className="min-h-[44px] flex flex-col items-center justify-center">
              {authState === 'scanning' && (
                <div className="space-y-1">
                  <div className="text-xs font-black text-cyan-300 flex items-center gap-1.5 justify-center">
                    <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                    <span>
                      {mode === 'faceid' ? 'Scanning Facial Mesh...' : 'Reading Fingerprint Ridges...'}
                    </span>
                  </div>
                  <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-75 rounded-full"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {authState === 'idle' && (
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">
                    {mode === 'faceid' ? 'Look into device camera' : 'Touch fingerprint sensor'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Tap the sensor circle to trigger verification
                  </p>
                </div>
              )}

              {authState === 'success' && (
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-emerald-400 flex items-center gap-1 justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Identity Verified: {customer.fullName}</span>
                  </p>
                  <p className="text-[10px] text-emerald-300/80 font-mono">
                    Unlocking {targetTitle}...
                  </p>
                </div>
              )}

              {authState === 'failed' && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-400 flex items-center gap-1 justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Verification Failed</span>
                  </p>
                  <p className="text-[10px] text-rose-300/80 max-w-[240px]">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Testing Controls (Scan / Fail / Fallback) */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => startScanProcess(false)}
                disabled={authState === 'scanning' || authState === 'success'}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Verify Now</span>
              </button>

              <button
                type="button"
                onClick={() => startScanProcess(true)}
                disabled={authState === 'scanning' || authState === 'success'}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Test how biometric rejection behaves"
              >
                <AlertCircle className="w-3 h-3 text-rose-400" />
                <span>Simulate Fail</span>
              </button>
            </div>
          </div>
        ) : (
          /* ===================== VIEW 2: PIN FALLBACK KEYPAD ===================== */
          <div className="w-full max-w-[260px] flex flex-col items-center animate-fadeIn">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-200">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Enter Security PIN</span>
            </div>

            {/* PIN Dots Display */}
            <div className="flex items-center gap-3 my-2">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinDigits.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      filled
                        ? 'bg-emerald-400 border-emerald-300 scale-110 shadow-sm shadow-emerald-400/50'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  ></div>
                );
              })}
            </div>

            {/* Error / Hint */}
            <div className="h-5 text-center mb-1">
              {errorMessage ? (
                <span className="text-[10px] font-bold text-rose-400">{errorMessage}</span>
              ) : (
                <span className="text-[10px] text-slate-400">
                  Default Demo PIN: <strong className="text-amber-300 font-mono">1234</strong>
                </span>
              )}
            </div>

            {/* 3x4 Number Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full mt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') handlePinClear();
                    else if (key === '⌫') handlePinBackspace();
                    else handlePinInput(key);
                  }}
                  className={`h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                    key === 'C'
                      ? 'bg-slate-900 text-rose-400 hover:bg-slate-800'
                      : key === '⌫'
                      ? 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                      : 'bg-slate-900 hover:bg-slate-800 active:scale-95 text-white border border-slate-800'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowPinFallback(false)}
              className="mt-3 text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Fingerprint className="w-3 h-3 text-emerald-400" />
              <span>Back to Biometric Scan</span>
            </button>
          </div>
        )}
      </div>

      {/* Customer Credential Binding Footer */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-[10px]">
          <div>
            <span className="text-slate-400 block font-medium">Verified Identity</span>
            <span className="text-white font-bold">{customer.fullName}</span>
            <span className="text-slate-500 font-mono ml-1.5">
              (UID: {maskAadhaar(customer.aadharNumber)})
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block font-medium">Security</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3 h-3" />
              <span>Bound to Phone</span>
            </span>
          </div>
        </div>

        {/* Fallback Option & Cancel Button */}
        <div className="flex items-center justify-between gap-2">
          {!showPinFallback ? (
            <button
              type="button"
              onClick={() => {
                setShowPinFallback(true);
                setPinDigits([]);
                setErrorMessage('');
              }}
              className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer py-1.5"
            >
              <KeyRound className="w-3 h-3" />
              <span>Forgot Biometric? Use PIN</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-800 transition-colors cursor-pointer"
          >
            Cancel & Return
          </button>
        </div>
      </div>
    </div>
  );
};
