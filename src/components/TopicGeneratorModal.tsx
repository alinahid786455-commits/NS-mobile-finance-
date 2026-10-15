import React, { useState } from 'react';
import { HostPersonality } from '../types/trivia';
import { Search, Sparkles, Loader2, X, Compass, Globe, Zap, Film, Cpu, History } from 'lucide-react';

interface TopicGeneratorModalProps {
  host: HostPersonality;
  onGenerate: (topic: string, difficulty: 'easy' | 'medium' | 'hard', count: number) => Promise<void>;
  onClose: () => void;
  isGenerating: boolean;
}

const POPULAR_TOPICS = [
  {
    title: 'Trending 2026 Pop Culture & Hits',
    icon: Sparkles,
    badge: 'Real-Time',
    desc: 'Latest music records, viral sensations, and contemporary entertainment.',
  },
  {
    title: 'Breakthroughs in AI, Space & Tech',
    icon: Cpu,
    badge: 'Search Grounded',
    desc: 'Recent rocket launches, quantum discoveries, and artificial intelligence.',
  },
  {
    title: 'Cinema Legends & Oscar Milestones',
    icon: Film,
    badge: 'Classic & Modern',
    desc: 'Iconic movie quotes, box office records, and visionary directors.',
  },
  {
    title: 'World Curiosities & Unsolved Mysteries',
    icon: History,
    badge: 'Enigmatic',
    desc: 'Bizarre historical anomalies, cryptographic riddles, and ancient wonders.',
  },
  {
    title: 'Global Wonders & Geography Lore',
    icon: Globe,
    badge: 'Exploration',
    desc: 'Hidden geography facts, extreme earth locations, and cultural traditions.',
  },
];

export const TopicGeneratorModal: React.FC<TopicGeneratorModalProps> = ({
  host,
  onGenerate,
  onClose,
  isGenerating,
}) => {
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [count, setCount] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim() || isGenerating) return;
    onGenerate(customTopic.trim(), difficulty, count);
  };

  const handleSelectPreset = (topicTitle: string) => {
    if (isGenerating) return;
    onGenerate(topicTitle, difficulty, count);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Google Search Grounded Engine
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                gemini-3.5-flash
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white">
              Generate Custom Trivia Round
            </h3>
          </div>
        </div>

        {/* Custom Topic Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Type any custom topic or fascination:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. 1990s Anime Soundtracks, Quantum Computing, Olympic Records..."
              disabled={isGenerating}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-hidden focus:border-amber-400 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!customTopic.trim() || isGenerating}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </form>

        {/* Difficulty & Count Settings */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Difficulty
            </label>
            <div className="flex gap-1">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                    difficulty === diff
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Questions Count
            </label>
            <div className="flex gap-1">
              {[3, 5, 8].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    count === c
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c} Qs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Presets List */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Or pick a verified trending theme:
          </div>

          <div className="space-y-2">
            {POPULAR_TOPICS.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset.title)}
                  disabled={isGenerating}
                  className="w-full p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-400/40 transition-all text-left flex items-center justify-between group disabled:opacity-50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-slate-900 group-hover:bg-amber-400/10 text-amber-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        {preset.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {preset.desc}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 group-hover:text-amber-300">
                    {preset.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isGenerating && (
          <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>
              Querying Google Search grounding for verified real-world facts with {host.name}...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
