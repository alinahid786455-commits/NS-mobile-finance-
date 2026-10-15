import React, { useEffect, useState } from 'react';
import { TriviaQuestion, HostPersonality } from '../types/trivia';
import { Search, ExternalLink, Sparkles, CheckCircle2, ShieldCheck, X, Loader2 } from 'lucide-react';

interface DeepDiveModalProps {
  question: TriviaQuestion;
  userAnswer?: string;
  host: HostPersonality;
  onClose: () => void;
}

export const DeepDiveModal: React.FC<DeepDiveModalProps> = ({
  question,
  userAnswer,
  host,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState<{
    content: string;
    sources: Array<{ title: string; uri: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const correctAnswerText = question.options[question.correctIndex];

  useEffect(() => {
    let isMounted = true;

    async function fetchDeepDive() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/fact-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question.question,
            correctAnswer: correctAnswerText,
            selectedAnswer: userAnswer || 'None yet',
            explanation: question.explanation,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to retrieve search grounded fact check.');
        }

        const data = await res.json();
        if (isMounted) {
          setDeepDiveData({
            content: data.content,
            sources: data.sources || question.groundingSources || [],
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Error running Google Search fact check');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDeepDive();

    return () => {
      isMounted = false;
    };
  }, [question, correctAnswerText, userAnswer]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Google Search Grounding
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                gemini-3.5-flash
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Verified Fact-Check & Deep Dive
            </h3>
          </div>
        </div>

        {/* Question Recap Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-slate-200 mb-2">
            "{question.question}"
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Verified Correct Answer: <strong>{correctAnswerText}</strong></span>
          </div>
          {userAnswer && (
            <div className="text-xs text-slate-400 mt-1 pl-6">
              Your guess was: <span className="text-slate-200 font-medium">{userAnswer}</span>
            </div>
          )}
        </div>

        {/* Content State */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-300">
              Searching Google for verified citations and trivia lore...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Grounded in current real-world web data
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        ) : deepDiveData ? (
          <div className="space-y-5">
            {/* Host commentary bubble */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <span className="text-2xl">{host.avatarEmoji}</span>
              <div>
                <div className="text-xs font-bold text-amber-300">
                  {host.name}'s Commentary:
                </div>
                <p className="text-xs text-slate-300 italic mt-0.5">
                  "{question.funFact || 'The universe is filled with marvelous eccentricities if you bother to seek them!'}"
                </p>
              </div>
            </div>

            {/* AI Synthesized Facts */}
            <div className="bg-slate-950/40 rounded-2xl p-4 border border-slate-800/60">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Historical Context & Deep Dive
              </h4>
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {deepDiveData.content}
              </div>
            </div>

            {/* Google Search Grounding Sources */}
            {deepDiveData.sources.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Web Sources (Google Search Grounding)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {deepDiveData.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-xs group"
                    >
                      <span className="text-slate-300 font-medium truncate group-hover:text-cyan-300">
                        {source.title || 'Web Reference'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            Back to Game Show
          </button>
        </div>
      </div>
    </div>
  );
};
