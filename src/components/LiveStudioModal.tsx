import React, { useState, useEffect, useRef } from 'react';
import { HostPersonality, TriviaQuestion } from '../types/trivia';
import { useLiveHost } from '../hooks/useLiveHost';
import { HostAvatar } from './HostAvatar';
import {
  Mic,
  MicOff,
  Radio,
  Send,
  X,
  Sparkles,
  Volume2,
  AlertCircle,
  HelpCircle,
  Flame,
  MessageSquare,
} from 'lucide-react';

interface LiveStudioModalProps {
  host: HostPersonality;
  currentQuestion?: TriviaQuestion;
  onClose: () => void;
}

export const LiveStudioModal: React.FC<LiveStudioModalProps> = ({
  host,
  currentQuestion,
  onClose,
}) => {
  const {
    isConnected,
    isConnecting,
    isMicActive,
    isHostSpeaking,
    messages,
    error,
    startLiveSession,
    stopLiveSession,
    toggleMic,
    sendTextMessage,
  } = useLiveHost();

  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto connect when modal opens
  useEffect(() => {
    const questionContext = currentQuestion
      ? `The current trivia question is: "${currentQuestion.question}". Correct answer: "${currentQuestion.options[currentQuestion.correctIndex]}".`
      : 'No active question currently.';

    startLiveSession(host, questionContext);

    return () => {
      stopLiveSession();
    };
  }, [host, currentQuestion, startLiveSession, stopLiveSession]);

  // Auto scroll transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendTextMessage(inputText);
    setInputText('');
  };

  const handleQuickPrompt = (promptText: string) => {
    sendTextMessage(promptText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full h-[90vh] max-h-[800px] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className={`w-3 h-3 rounded-full absolute -top-0.5 -right-0.5 ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className={`w-3 h-3 rounded-full inline-block ${isConnected ? 'bg-emerald-400' : isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                  Live Voice Studio with {host.name}
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isConnected
                  ? 'Real-time two-way voice streaming active. Speak into your microphone!'
                  : isConnecting
                  ? 'Connecting to Gemini 3.8 Live API session...'
                  : 'Disconnected'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Stage: Live Avatar & Visualizer */}
        <div className="p-6 bg-gradient-to-b from-slate-950/80 to-slate-900/60 border-b border-slate-800/80 flex flex-col items-center justify-center shrink-0">
          <HostAvatar
            host={host}
            isSpeaking={isHostSpeaking}
            mood={isHostSpeaking ? 'neutral' : 'thinking'}
            size="lg"
            showBadge={true}
          />

          {/* Equalizer wave simulation */}
          <div className="mt-4 flex items-center gap-1.5 h-6">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isHostSpeaking
                    ? 'bg-gradient-to-t from-amber-500 to-pink-500'
                    : isConnected && isMicActive
                    ? 'bg-cyan-500/60'
                    : 'bg-slate-800'
                }`}
                style={{
                  height: isHostSpeaking
                    ? `${Math.max(6, Math.sin(i * 0.8 + Date.now() / 200) * 22 + 10)}px`
                    : isConnected && isMicActive
                    ? `${Math.max(4, Math.sin(i * 0.5) * 12 + 6)}px`
                    : '4px',
                }}
              />
            ))}
          </div>

          {/* Quick status pill */}
          <div className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-2">
            {isHostSpeaking ? (
              <span className="text-amber-300 font-bold flex items-center gap-1 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" /> {host.name} is speaking...
              </span>
            ) : isConnected ? (
              <span className="text-slate-400 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Listening to you...
              </span>
            ) : (
              <span>Session initializing...</span>
            )}
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Transcript Conversation Feed */}
        <div
          ref={chatScrollRef}
          className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40 text-sm"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <MessageSquare className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs">
                No voice turns recorded yet. Speak aloud or tap a quick question below!
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'host' && (
                  <span className="text-lg shrink-0 select-none">{host.avatarEmoji}</span>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-xs'
                      : msg.sender === 'host'
                      ? 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/60'
                      : 'bg-slate-900/60 text-slate-400 text-center italic w-full text-xs'
                  }`}
                >
                  {msg.sender === 'host' && (
                    <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">
                      {host.name}
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2 sm:px-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap pl-1">
            Ask Host:
          </span>
          <button
            onClick={() => handleQuickPrompt('Can you give me a cryptic hint for the current question?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-amber-400" /> Give me a hint
          </button>
          <button
            onClick={() => handleQuickPrompt('Roast my trivia gameplay so far!')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Flame className="w-3 h-3 text-rose-400" /> Roast my score
          </button>
          <button
            onClick={() => handleQuickPrompt('Tell me a mind-blowing fun fact about this topic!')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" /> Mind-blowing fact
          </button>
        </div>

        {/* Bottom Controls & Text Chat fallback */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
          {/* Mic Toggle Button */}
          <button
            onClick={toggleMic}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isMicActive
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
            title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Text Input Form */}
          <form onSubmit={handleSendText} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type anything to speak with your host..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-hidden focus:border-cyan-400 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-400 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
