import React from 'react';
import { HostPersonality } from '../types/trivia';
import { HostAvatar } from './HostAvatar';
import { Radio, Mic, Search, Volume2, VolumeX, Sparkles, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentHost: HostPersonality;
  isHostSpeaking: boolean;
  onOpenHostSelector: () => void;
  onOpenLiveStudio: () => void;
  onOpenTopicGenerator: () => void;
  autoPlayVoice: boolean;
  onToggleAutoPlay: () => void;
  currentScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentHost,
  isHostSpeaking,
  onOpenHostSelector,
  onOpenLiveStudio,
  onOpenTopicGenerator,
  autoPlayVoice,
  onToggleAutoPlay,
  currentScore,
}) => {
  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-pink-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                TriviaPulse <span className="text-amber-400">AI</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Dynamic Host Game Show
            </p>
          </div>
        </div>

        {/* Center / Host Status Pill */}
        <button
          onClick={onOpenHostSelector}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-400/50 transition-all cursor-pointer group"
          title="Click to Switch AI Host"
        >
          <HostAvatar
            host={currentHost}
            isSpeaking={isHostSpeaking}
            size="sm"
            showBadge={false}
          />
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors flex items-center gap-1">
              {currentHost.name}
              <UserCheck className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              TTS: {currentHost.voiceName}
            </div>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold md:hidden">
            {currentHost.name.split(' ')[0]}
          </span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Studio Button */}
          <button
            onClick={onOpenLiveStudio}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all cursor-pointer"
            title="Open Live Voice Studio (gemini-3.8-live)"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Talk to Host</span>
            <span className="text-[9px] font-mono uppercase bg-cyan-400/20 px-1 py-0.2 rounded text-cyan-200">
              Live
            </span>
          </button>

          {/* Google Search Topic Generator */}
          <button
            onClick={onOpenTopicGenerator}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            title="Generate Grounded Topic with Google Search"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Topics</span>
          </button>

          {/* Autoplay Voice Toggle */}
          <button
            onClick={onToggleAutoPlay}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              autoPlayVoice
                ? 'bg-slate-800 border-slate-700 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={autoPlayVoice ? 'Voice TTS is ON (Click to mute)' : 'Voice TTS is OFF (Click to unmute)'}
          >
            {autoPlayVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Score Pill */}
          <div className="px-2.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black font-mono">
            {currentScore} pts
          </div>
        </div>
      </div>
    </header>
  );
};
