import { useState, useRef, useCallback } from 'react';
import { HostPersonality } from '../types/trivia';

interface UseHostAudioReturn {
  isSpeaking: boolean;
  currentSpeechText: string;
  speak: (text: string, host: HostPersonality, styleOverride?: string) => Promise<void>;
  stop: () => void;
  audioError: string | null;
}

export function useHostAudio(): UseHostAudioReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState('');
  const [audioError, setAudioError] = useState<string | null>(null);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  const stop = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentSpeechText('');
  }, []);

  const speak = useCallback(
    async (text: string, host: HostPersonality, styleOverride?: string) => {
      if (!text || text.trim() === '') return;
      stop();

      const cacheKey = `${host.id}:${host.voiceName}:${text.trim()}`;
      setAudioError(null);
      setCurrentSpeechText(text);
      setIsSpeaking(true);

      try {
        let base64Audio = audioCacheRef.current.get(cacheKey);

        if (!base64Audio) {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              voiceName: host.voiceName,
              hostName: host.name,
              style: styleOverride || host.ttsStyle,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `TTS synthesis failed: ${response.statusText}`);
          }

          const data = await response.json();
          base64Audio = data.audioBase64;
          if (base64Audio) {
            audioCacheRef.current.set(cacheKey, base64Audio);
          }
        }

        if (base64Audio) {
          const audioUrl = `data:audio/wav;base64,${base64Audio}`;
          const audio = new Audio(audioUrl);
          activeAudioRef.current = audio;

          audio.onended = () => {
            setIsSpeaking(false);
            setCurrentSpeechText('');
            activeAudioRef.current = null;
          };

          audio.onerror = () => {
            setIsSpeaking(false);
            setAudioError('Failed to playback audio stream.');
            activeAudioRef.current = null;
          };

          await audio.play();
        } else {
          setIsSpeaking(false);
        }
      } catch (err: any) {
        console.warn('[useHostAudio] Speech generation failed:', err);
        setAudioError(err?.message || 'Could not synthesize speech');
        setIsSpeaking(false);
      }
    },
    [stop]
  );

  return {
    isSpeaking,
    currentSpeechText,
    speak,
    stop,
    audioError,
  };
}
