import React, { useState } from 'react';
import { HostPersonality, HostVoice } from '../types/trivia';
import { PRESET_HOSTS } from '../data/hosts';
import { HostAvatar } from './HostAvatar';
import { Volume2, Sparkles, Flame, Check, Plus, Sliders, X, Radio } from 'lucide-react';

interface HostSelectorProps {
  currentHost: HostPersonality;
  onSelectHost: (host: HostPersonality) => void;
  onPreviewVoice: (host: HostPersonality, line: string) => void;
  isAudioPlaying: boolean;
}

export const HostSelector: React.FC<HostSelectorProps> = ({
  currentHost,
  onSelectHost,
  onPreviewVoice,
  isAudioPlaying,
}) => {
  const [hostsList, setHostsList] = useState<HostPersonality[]>(PRESET_HOSTS);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [previewingHostId, setPreviewingHostId] = useState<string | null>(null);

  // Custom host form state
  const [customName, setCustomName] = useState('Vesper Quinn');
  const [customTitle, setCustomTitle] = useState('The Sarcastic Oracle');
  const [customArchetype, setCustomArchetype] = useState('Cyberpunk Cynic');
  const [customEmoji, setCustomEmoji] = useState('🔮');
  const [customVoice, setCustomVoice] = useState<HostVoice>('Zephyr');
  const [customSass, setCustomSass] = useState(8);
  const [customCatchphrase, setCustomCatchphrase] = useState('I foresaw your failure in the tea leaves, darling.');
  const [customDescription, setCustomDescription] = useState('A mystic techno-oracle who delivers prophetic wisdom wrapped in razor-sharp wit.');

  const handlePreview = (host: HostPersonality) => {
    setPreviewingHostId(host.id);
    onPreviewVoice(host, host.sampleVoiceLine);
  };

  const handleSaveCustomHost = (e: React.FormEvent) => {
    e.preventDefault();
    const newHost: HostPersonality = {
      id: `custom_${Date.now()}`,
      name: customName.trim() || 'Custom Host',
      title: customTitle.trim() || 'The Rogue Host',
      archetype: customArchetype.trim() || 'Original Persona',
      avatarEmoji: customEmoji || '🎭',
      avatarBg: 'from-violet-600 to-indigo-800',
      accentColor: 'violet',
      voiceName: customVoice,
      sassLevel: customSass,
      description: customDescription.trim() || 'A uniquely calibrated host.',
      ttsStyle: `Custom host style, sass level ${customSass}/10, archetype: ${customArchetype}`,
      catchphrase: customCatchphrase.trim() || 'Let the games commence!',
      sampleVoiceLine: `Hello there! I am ${customName}. ${customCatchphrase}`,
      winReactions: ['Impressive intuition!', 'That was mathematically glorious!'],
      loseReactions: ['A tragic calculation!', 'My circuits shudder at that choice.'],
      streakReactions: ['Unstoppable cerebral momentum!'],
      isCustom: true,
    };

    setHostsList((prev) => [newHost, ...prev]);
    onSelectHost(newHost);
    setIsCustomModalOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            AI Personality Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Choose Your AI Game Show Host
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Each host features a unique voice powered by <span className="text-amber-400 font-mono">gemini-3.8-flash-tts</span>, real-time Live banter via <span className="text-cyan-400 font-mono">gemini-3.8-live</span>, and custom commentary.
          </p>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Custom Host
        </button>
      </div>

      {/* Grid of Hosts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hostsList.map((host) => {
          const isSelected = currentHost.id === host.id;
          const isCurrentlySpeaking = isAudioPlaying && previewingHostId === host.id;

          return (
            <div
              key={host.id}
              onClick={() => onSelectHost(host)}
              className={`relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/95 border-amber-400/80 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              {/* Top row: Avatar & basic metadata */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <HostAvatar
                      host={host}
                      isSpeaking={isCurrentlySpeaking}
                      size="md"
                      showBadge={false}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-100 text-lg leading-tight">
                          {host.name}
                        </h3>
                        {host.isCustom && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-amber-400 mt-0.5">
                        {host.title}
                      </p>
                      <span className="text-[11px] text-slate-400">
                        {host.archetype}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-full bg-amber-400 text-slate-950 shadow-md">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Personality bio */}
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3">
                  {host.description}
                </p>

                {/* Catchphrase quote box */}
                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 mb-4">
                  <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-1">
                    Signature Catchphrase:
                  </div>
                  <div className="text-xs italic text-amber-200/90 font-serif">
                    "{host.catchphrase}"
                  </div>
                </div>
              </div>

              {/* Bottom row: Sass meter, voice name, and preview audio button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {/* Sass flame bar */}
                <div className="flex items-center gap-1.5" title={`Roast/Sass Intensity: ${host.sassLevel}/10`}>
                  <Flame
                    className={`w-4 h-4 ${
                      host.sassLevel >= 7 ? 'text-rose-500' : host.sassLevel >= 4 ? 'text-amber-500' : 'text-blue-400'
                    }`}
                  />
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-3 rounded-xs ${
                          i < Math.round(host.sassLevel / 2)
                            ? host.sassLevel >= 7
                              ? 'bg-rose-500'
                              : 'bg-amber-400'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 ml-1">
                    {host.sassLevel}/10
                  </span>
                </div>

                {/* Voice preview trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(host);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isCurrentlySpeaking
                      ? 'bg-amber-400 text-slate-950 font-bold animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isCurrentlySpeaking ? 'Playing Voice...' : `Preview (${host.voiceName})`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Host Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCustomModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Create Custom AI Host</h3>
                <p className="text-xs text-slate-400">
                  Calibrate your own voice, sassiness, and game show style.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCustomHost} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Host Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-400"
                    placeholder="e.g. Roxanne Byte"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Emoji Avatar
                  </label>
                  <input
                    type="text"
                    value={customEmoji}
                    onChange={(e) => setCustomEmoji(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-center text-white focus:outline-hidden focus:border-amber-400"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Title / Moniker
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-400"
                    placeholder="e.g. The Silicon Siren"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Voice Actor
                  </label>
                  <select
                    value={customVoice}
                    onChange={(e) => setCustomVoice(e.target.value as HostVoice)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Kore">Kore (Glamorous / Crisp)</option>
                    <option value="Puck">Puck (Fast / Booming)</option>
                    <option value="Fenrir">Fenrir (Gritty / Deep)</option>
                    <option value="Charon">Charon (Erudite / Aristocratic)</option>
                    <option value="Zephyr">Zephyr (Chill / Cosmic)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Archetype
                </label>
                <input
                  type="text"
                  value={customArchetype}
                  onChange={(e) => setCustomArchetype(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-400"
                  placeholder="e.g. 1980s Arcade Wizard"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Sass & Roast Meter
                  </label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {customSass}/10 {customSass >= 8 ? '🔥 Scorching' : customSass >= 5 ? '⚡ Sarcastic' : '✨ Gentle'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={customSass}
                  onChange={(e) => setCustomSass(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Signature Catchphrase
                </label>
                <input
                  type="text"
                  value={customCatchphrase}
                  onChange={(e) => setCustomCatchphrase(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-400"
                  placeholder="e.g. Press start to cry, contestant!"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Host Backstory / Vibe
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
                >
                  Save & Select Host
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
