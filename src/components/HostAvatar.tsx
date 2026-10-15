import React from 'react';
import { HostPersonality } from '../types/trivia';
import { Volume2, Sparkles, Flame, Mic } from 'lucide-react';

interface HostAvatarProps {
  host: HostPersonality;
  isSpeaking: boolean;
  mood?: 'neutral' | 'celebrating' | 'roasting' | 'thinking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const HostAvatar: React.FC<HostAvatarProps> = ({
  host,
  isSpeaking,
  mood = 'neutral',
  size = 'lg',
  showBadge = true,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
    xl: 'w-32 h-32 text-6xl',
  };

  const ringSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
    xl: 'p-2.5',
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Outer pulsing glow when speaking */}
      {isSpeaking && (
        <div
          className={`absolute inset-0 rounded-full blur-xl opacity-75 animate-pulse bg-gradient-to-r ${host.avatarBg}`}
        />
      )}

      {/* Main Avatar Circle */}
      <div
        className={`relative ${ringSizes[size]} rounded-full bg-gradient-to-tr ${host.avatarBg} shadow-2xl transition-transform duration-300 ${
          isSpeaking ? 'scale-105 ring-4 ring-amber-400/60 ring-offset-2 ring-offset-slate-950' : 'hover:scale-102'
        }`}
      >
        <div
          className={`${sizeClasses[size]} rounded-full bg-slate-900/90 flex items-center justify-center shadow-inner relative overflow-hidden backdrop-blur-md`}
        >
          {/* Subtle animated background grid/pulse */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          {/* Emoji Avatar */}
          <span
            className={`transition-transform duration-300 ${
              isSpeaking ? 'animate-bounce' : mood === 'roasting' ? 'rotate-6' : mood === 'celebrating' ? '-rotate-6' : ''
            }`}
          >
            {mood === 'roasting' ? '😏' : mood === 'celebrating' ? '🤩' : mood === 'thinking' ? '🤔' : host.avatarEmoji}
          </span>

          {/* Audio waveform equalizer bars inside avatar when speaking */}
          {isSpeaking && (
            <div className="absolute bottom-1 inset-x-0 flex items-end justify-center gap-0.5 h-3 px-2">
              <span className="w-1 bg-amber-400 rounded-full animate-ping h-2 opacity-80" />
              <span className="w-1 bg-pink-400 rounded-full animate-pulse h-3" />
              <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2" />
              <span className="w-1 bg-amber-300 rounded-full animate-pulse h-3.5" />
            </div>
          )}
        </div>

        {/* Live Audio indicator pill */}
        {isSpeaking && (
          <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-lg border border-amber-300 animate-bounce">
            <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        )}

        {/* High Sass flame indicator */}
        {host.sassLevel >= 7 && !isSpeaking && (
          <div className="absolute -top-1 -right-1 bg-rose-600 text-white p-1 rounded-full shadow-lg border border-rose-400" title={`Sass Level ${host.sassLevel}/10`}>
            <Flame className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Host Details */}
      {showBadge && (
        <div className="mt-2 text-center">
          <div className="font-bold text-slate-100 flex items-center justify-center gap-1.5 text-sm sm:text-base tracking-wide">
            <span>{host.name}</span>
            {isSpeaking && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                <Mic className="w-2.5 h-2.5" /> Live
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
            <span>{host.title}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400/90 font-mono text-[11px]">{host.voiceName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
