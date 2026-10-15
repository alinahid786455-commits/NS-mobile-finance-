import { useState, useRef, useCallback, useEffect } from 'react';
import { HostPersonality, LiveChatMessage } from '../types/trivia';
import {
  floatTo16BitPCMBase64,
  scheduleRawPCM24kChunk,
  resetLiveAudioScheduler,
} from '../utils/audio';

interface UseLiveHostReturn {
  isConnected: boolean;
  isConnecting: boolean;
  isMicActive: boolean;
  isHostSpeaking: boolean;
  messages: LiveChatMessage[];
  error: string | null;
  startLiveSession: (host: HostPersonality, currentQuestionContext?: string) => Promise<void>;
  stopLiveSession: () => void;
  toggleMic: () => void;
  sendTextMessage: (text: string) => void;
}

export function useLiveHost(): UseLiveHostReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicActive, setIsMicActive] = useState(true);
  const [isHostSpeaking, setIsHostSpeaking] = useState(false);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isMicMutedRef = useRef(false);

  // Stop everything
  const stopLiveSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsHostSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveSession();
    };
  }, [stopLiveSession]);

  const toggleMic = useCallback(() => {
    const nextState = !isMicActive;
    setIsMicActive(nextState);
    isMicMutedRef.current = !nextState;

    if (micStreamRef.current) {
      micStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  }, [isMicActive]);

  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ type: 'text', text: text.trim() }));
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_u_${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const startLiveSession = useCallback(
    async (host: HostPersonality, currentQuestionContext = '') => {
      stopLiveSession();
      setError(null);
      setIsConnecting(true);
      resetLiveAudioScheduler();

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = async () => {
          setIsConnecting(false);
          setIsConnected(true);

          // Send init handshake
          ws.send(
            JSON.stringify({
              type: 'init',
              hostName: host.name,
              personality: `${host.description} Style: ${host.ttsStyle}. Catchphrase: "${host.catchphrase}"`,
              voiceName: host.voiceName,
              currentQuestion: currentQuestionContext,
            })
          );

          // Start microphone audio capture (16kHz for Live API input)
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            });
            micStreamRef.current = stream;

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const inputCtx = new AudioContextClass({ sampleRate: 16000 });
            inputAudioCtxRef.current = inputCtx;

            const source = inputCtx.createMediaStreamSource(stream);
            // 4096 frames buffer at 16kHz is ~256ms per slice
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            source.connect(processor);
            processor.connect(inputCtx.destination);

            processor.onaudioprocess = (e) => {
              if (isMicMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBase64 = floatTo16BitPCMBase64(inputData);
              ws.send(JSON.stringify({ type: 'audio', audio: pcmBase64 }));
            };
          } catch (micErr: any) {
            console.warn('[Live API] Microphone access denied or unavailable:', micErr);
            setError('Microphone access blocked. You can still type in the Live Chat to talk with the host!');
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'ready') {
              setMessages((prev) => [
                ...prev,
                {
                  id: `msg_sys_${Date.now()}`,
                  sender: 'system',
                  text: data.message || `Connected to ${host.name} Live!`,
                  timestamp: Date.now(),
                },
              ]);
            }

            if (data.type === 'audio' && data.audio) {
              setIsHostSpeaking(true);
              scheduleRawPCM24kChunk(data.audio);
            }

            if (data.type === 'turn_complete') {
              setTimeout(() => setIsHostSpeaking(false), 500);
            }

            if (data.type === 'interrupted') {
              resetLiveAudioScheduler();
              setIsHostSpeaking(false);
            }

            if (data.type === 'host_transcript' && data.text) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.sender === 'host' && Date.now() - last.timestamp < 3000) {
                  return [...prev.slice(0, -1), { ...last, text: `${last.text} ${data.text}` }];
                }
                return [
                  ...prev,
                  {
                    id: `msg_h_${Date.now()}`,
                    sender: 'host',
                    text: data.text,
                    timestamp: Date.now(),
                  },
                ];
              });
            }

            if (data.type === 'user_transcript' && data.text) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.sender === 'user' && Date.now() - last.timestamp < 3000) {
                  return [...prev.slice(0, -1), { ...last, text: `${last.text} ${data.text}` }];
                }
                return [
                  ...prev,
                  {
                    id: `msg_u_${Date.now()}`,
                    sender: 'user',
                    text: data.text,
                    timestamp: Date.now(),
                  },
                ];
              });
            }

            if (data.type === 'error') {
              setError(data.error);
            }
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };

        ws.onerror = (e) => {
          console.error('[WebSocket Error]:', e);
          setError('Live connection error.');
          setIsConnecting(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          setIsConnecting(false);
          setIsHostSpeaking(false);
        };
      } catch (err: any) {
        console.error('Failed to connect to Live API WebSocket:', err);
        setError(err?.message || 'Could not connect to Live Host');
        setIsConnecting(false);
      }
    },
    [stopLiveSession]
  );

  return {
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
  };
}
