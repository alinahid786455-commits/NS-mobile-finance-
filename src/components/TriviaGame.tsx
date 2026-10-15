import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TriviaQuestion,
  HostPersonality,
  PlayerStats,
  GameSettings,
} from '../types/trivia';
import { HostAvatar } from './HostAvatar';
import {
  playSoundCorrect,
  playSoundWrong,
  playSoundTick,
  playSoundStreak,
} from '../utils/audio';
import {
  Sparkles,
  HelpCircle,
  Scissors,
  Search,
  Mic,
  Clock,
  Zap,
  Volume2,
  CheckCircle,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';

interface TriviaGameProps {
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  host: HostPersonality;
  settings: GameSettings;
  stats: PlayerStats;
  isHostSpeaking: boolean;
  onAnswer: (isCorrect: boolean, timeSpent: number, answerIndex: number) => void;
  onNextQuestion: () => void;
  onSpeak: (text: string, style?: string) => void;
  onOpenDeepDive: () => void;
  onOpenLiveStudio: () => void;
}

export const TriviaGame: React.FC<TriviaGameProps> = ({
  questions,
  currentQuestionIndex,
  host,
  settings,
  stats,
  isHostSpeaking,
  onAnswer,
  onNextQuestion,
  onSpeak,
  onOpenDeepDive,
  onOpenLiveStudio,
}) => {
  const currentQ = questions[currentQuestionIndex];
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(settings.timePerQuestion);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [hintUsed, setHintUsed] = useState<boolean>(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState<boolean>(false);
  const [hostReactionText, setHostReactionText] = useState<string>('');

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize/reset state for each question
  useEffect(() => {
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setTimeLeft(settings.timePerQuestion);
    setEliminatedOptions([]);
    setHintUsed(false);
    setHintText(null);
    setHostReactionText('');
    startTimeRef.current = Date.now();

    // Auto read question intro with Gemini Flash TTS if autoPlay is on
    if (settings.autoPlayVoice && currentQ) {
      const speechLine = currentQ.hostIntro
        ? `${currentQ.hostIntro} ${currentQ.question}`
        : currentQ.question;
      onSpeak(speechLine, host.ttsStyle);
    }
  }, [currentQuestionIndex, currentQ, settings.autoPlayVoice, host.ttsStyle]);

  // Countdown Timer
  useEffect(() => {
    if (isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Time expired -> count as wrong answer
          handleOptionSelect(-1);
          return 0;
        }
        if (prev <= 4 && settings.soundEffects) {
          playSoundTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAnswered, currentQuestionIndex, settings.soundEffects]);

  // Lifeline: 50 / 50
  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || isAnswered || !currentQ) return;
    setFiftyFiftyUsed(true);

    const wrongIndexes = currentQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentQ.correctIndex);

    // Pick two random wrong choices to eliminate
    const shuffled = [...wrongIndexes].sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);
    setEliminatedOptions(toEliminate);

    if (settings.autoPlayVoice) {
      onSpeak("I've eliminated two tragic options for you. Now don't blow it!");
    }
  };

  // Lifeline: Ask Host for a Hint
  const handleAskHint = async () => {
    if (hintUsed || isAnswered || !currentQ) return;
    setHintUsed(true);

    const generatedHint = `Focus your thoughts: It is directly connected to "${currentQ.explanation.split('.')[0]}".`;
    setHintText(generatedHint);

    if (settings.autoPlayVoice) {
      onSpeak(`Here is a little clue from my gracious self: ${generatedHint}`);
    }
  };

  // Option Selection
  const handleOptionSelect = useCallback(
    async (index: number) => {
      if (isAnswered || !currentQ) return;
      if (timerRef.current) clearInterval(timerRef.current);

      setIsAnswered(true);
      setSelectedOptionIndex(index);

      const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const isCorrect = index === currentQ.correctIndex;

      // Play sound effects
      if (settings.soundEffects) {
        if (isCorrect) {
          if (stats.currentStreak >= 2) {
            playSoundStreak();
          } else {
            playSoundCorrect();
          }
        } else {
          playSoundWrong();
        }
      }

      // Pick Host reaction line
      let reaction = '';
      if (isCorrect) {
        const reactions = host.winReactions;
        reaction = reactions[Math.floor(Math.random() * reactions.length)];
        if (stats.currentStreak + 1 >= 3 && host.streakReactions.length > 0) {
          reaction = host.streakReactions[Math.floor(Math.random() * host.streakReactions.length)];
        }
      } else {
        const reactions = host.loseReactions;
        reaction = reactions[Math.floor(Math.random() * reactions.length)];
      }

      setHostReactionText(reaction);

      // Trigger Host TTS response
      if (settings.autoPlayVoice) {
        const fullSpokenReaction = `${reaction} The correct answer was ${currentQ.options[currentQ.correctIndex]}.`;
        onSpeak(fullSpokenReaction);
      }

      onAnswer(isCorrect, timeSpent, index);
    },
    [isAnswered, currentQ, settings.soundEffects, settings.autoPlayVoice, host, stats.currentStreak, onAnswer, onSpeak]
  );

  // Keyboard shortcut listener (1-4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          onNextQuestion();
        }
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 4) {
        const targetIndex = num - 1;
        if (!eliminatedOptions.includes(targetIndex)) {
          handleOptionSelect(targetIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, eliminatedOptions, handleOptionSelect, onNextQuestion]);

  if (!currentQ) return null;

  const timerPercentage = (timeLeft / settings.timePerQuestion) * 100;
  const timerColor =
    timeLeft <= 4 ? 'bg-rose-500' : timeLeft <= 8 ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-fadeIn">
      {/* Top Status Bar: Progress, Timer, Streak */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
            Q {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 capitalize">
            {currentQ.difficulty}
          </span>
        </div>

        {/* Streak Indicator */}
        {stats.currentStreak > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold animate-pulse">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{stats.currentStreak}x Streak</span>
          </div>
        )}

        {/* Time Left */}
        <div className="flex items-center gap-1.5 font-mono text-sm font-black text-slate-200">
          <Clock className={`w-4 h-4 ${timeLeft <= 4 ? 'text-rose-500 animate-spin' : 'text-slate-400'}`} />
          <span className={timeLeft <= 4 ? 'text-rose-400 font-bold' : ''}>{timeLeft}s</span>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-6 border border-slate-800/80">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${timerColor}`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Host Stage / Speech Balloon */}
      <div className="relative mb-6 p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <HostAvatar
          host={host}
          isSpeaking={isHostSpeaking}
          mood={
            isAnswered
              ? selectedOptionIndex === currentQ.correctIndex
                ? 'celebrating'
                : 'roasting'
              : 'neutral'
          }
          size="md"
          showBadge={false}
        />

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-wide">
                {host.name}
              </span>
              <span className="text-[10px] text-amber-400/90 font-mono">
                ({host.title})
              </span>
            </div>

            <button
              onClick={() => {
                const textToSpeak = isAnswered
                  ? `${hostReactionText} The correct answer is ${currentQ.options[currentQ.correctIndex]}.`
                  : currentQ.hostIntro || currentQ.question;
                onSpeak(textToSpeak);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Repeat Host Speech (Gemini Flash TTS)"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Host dialogue text */}
          <p className="text-xs sm:text-sm text-slate-200 font-serif italic leading-relaxed">
            "{isAnswered ? (
              <span className={selectedOptionIndex === currentQ.correctIndex ? 'text-emerald-300' : 'text-rose-300'}>
                {hostReactionText || (selectedOptionIndex === currentQ.correctIndex ? 'Splendid!' : 'Disappointing!')}
              </span>
            ) : (
              currentQ.hostIntro || host.catchphrase
            )}"
          </p>

          {/* Hint disclosure if used */}
          {hintText && (
            <div className="mt-2 text-xs font-sans text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{hintText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-6">
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/80 mb-2 font-mono">
          {currentQ.category}
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight mb-6">
          {currentQ.question}
        </h2>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((option, idx) => {
            const isEliminated = eliminatedOptions.includes(idx);
            const isSelected = selectedOptionIndex === idx;
            const isCorrect = idx === currentQ.correctIndex;

            let buttonStyle = 'bg-slate-950/70 border-slate-800 hover:border-amber-400/60 hover:bg-slate-800/60 text-slate-100';

            if (isEliminated) {
              buttonStyle = 'opacity-30 line-through bg-slate-950/30 border-slate-900 text-slate-600 cursor-not-allowed';
            } else if (isAnswered) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40';
              } else if (isSelected) {
                buttonStyle = 'bg-rose-500/20 border-rose-400 text-rose-200 ring-2 ring-rose-500/40';
              } else {
                buttonStyle = 'opacity-40 bg-slate-950/40 border-slate-800 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => !isEliminated && handleOptionSelect(idx)}
                disabled={isAnswered || isEliminated}
                className={`p-4 rounded-2xl border text-left font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-between group cursor-pointer ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400 group-hover:text-amber-300">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Explanation Box */}
        {isAnswered && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed animate-fadeIn">
            <div className="font-bold text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Explanation:
            </div>
            <p>{currentQ.explanation}</p>
            {currentQ.funFact && (
              <p className="mt-2 text-amber-300/90 italic">
                💡 Fun Fact: {currentQ.funFact}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Lifelines & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 50 / 50 Lifeline */}
          <button
            onClick={handleFiftyFifty}
            disabled={fiftyFiftyUsed || isAnswered}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            title="Eliminate two wrong answers"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            50 / 50 {fiftyFiftyUsed && '✓'}
          </button>

          {/* Ask Host For Hint */}
          <button
            onClick={handleAskHint}
            disabled={hintUsed || isAnswered}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            title="Ask Host for a Hint"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            Host Hint {hintUsed && '✓'}
          </button>

          {/* Google Search Grounded Deep Dive */}
          <button
            onClick={onOpenDeepDive}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-bold transition-colors cursor-pointer"
            title="View Google Search Grounding & citations"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            Fact Check (Search)
          </button>

          {/* Talk Live to Host button */}
          <button
            onClick={onOpenLiveStudio}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors cursor-pointer"
            title="Speak live with host via Gemini 3.8 Live API"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            Voice Interrogate
          </button>
        </div>

        {/* Next Question / Continue Button */}
        {isAnswered && (
          <button
            onClick={onNextQuestion}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer animate-bounce"
          >
            {currentQuestionIndex + 1 < questions.length ? 'Next Question' : 'View Final Verdict'}
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
};
