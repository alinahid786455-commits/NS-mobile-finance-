import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HostPersonality, PlayerStats, TriviaQuestion } from '../types/trivia';
import { HostAvatar } from './HostAvatar';
import { Trophy, RotateCcw, Volume2, Sparkles, Award, Target, Zap, Clock } from 'lucide-react';

interface GameOverModalProps {
  stats: PlayerStats;
  totalQuestions: number;
  host: HostPersonality;
  topic: string;
  onPlayAgain: () => void;
  onChangeTopic: () => void;
  onChangeHost: () => void;
  onSpeakSummary: () => void;
  isSpeaking: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  totalQuestions,
  host,
  topic,
  onPlayAgain,
  onChangeTopic,
  onChangeHost,
  onSpeakSummary,
  isSpeaking,
}) => {
  const percentage = Math.round((stats.correctAnswers / (totalQuestions || 1)) * 100);

  // Determine Letter Grade
  let grade = 'F';
  let title = 'Complete Debacle';
  let gradeColor = 'text-rose-500 border-rose-500/40 bg-rose-500/10';

  if (percentage >= 90) {
    grade = 'S';
    title = 'Transcendent Trivia Master';
    gradeColor = 'text-amber-400 border-amber-400/40 bg-amber-400/10';
  } else if (percentage >= 80) {
    grade = 'A';
    title = 'Championship Contender';
    gradeColor = 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10';
  } else if (percentage >= 60) {
    grade = 'B';
    title = 'Respectable Performance';
    gradeColor = 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10';
  } else if (percentage >= 40) {
    grade = 'C';
    title = 'Room for Improvement';
    gradeColor = 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10';
  }

  // Trigger celebratory confetti on high scores
  useEffect(() => {
    if (percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#a855f7'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [percentage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[95vh] overflow-y-auto text-center">
        {/* Host Avatar on Podium */}
        <div className="flex justify-center mb-3">
          <HostAvatar host={host} isSpeaking={isSpeaking} size="lg" showBadge={false} />
        </div>

        {/* Title & Host Moniker */}
        <div className="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-1">
          {host.name}'s Official Verdict
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Game Over!
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          Round Category: <span className="text-slate-200 font-semibold">{topic}</span>
        </p>

        {/* Host Spoken Verdict Bubble */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 mb-6 text-left relative">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Final Commentary:
            </span>
            <button
              onClick={onSpeakSummary}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Hear Host Review"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 italic font-serif leading-relaxed">
            "{percentage >= 70
              ? host.winReactions[0] || 'Astonishing exhibition of memory!'
              : host.loseReactions[0] || 'Better luck in the next reincarnation!'} {host.catchphrase}"
          </p>
        </div>

        {/* Big Grade Badge & Score */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <div className={`p-3 rounded-2xl border ${gradeColor} flex flex-col items-center justify-center`}>
            <div className="text-3xl font-black">{grade}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5">Grade</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center">
            <div className="text-2xl font-black text-amber-400">{stats.score}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> Score
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center">
            <div className="text-2xl font-black text-emerald-400">
              {stats.correctAnswers}/{totalQuestions}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" /> Accuracy
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center">
            <div className="text-2xl font-black text-rose-400">{stats.maxStreak}x</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-rose-400" /> Max Streak
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            Play Again
          </button>
          <button
            onClick={onChangeTopic}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm transition-colors cursor-pointer"
          >
            New Search Topic
          </button>
          <button
            onClick={onChangeHost}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Change Host
          </button>
        </div>
      </div>
    </div>
  );
};
