/**
 * Audio processing utilities for Gemini Live API and Gemini Flash TTS.
 */

// Shared audio contexts
let liveOutputAudioCtx: AudioContext | null = null;
let liveNextStartTime = 0;
let soundFxAudioCtx: AudioContext | null = null;

export function getSoundFxContext(): AudioContext {
  if (!soundFxAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    soundFxAudioCtx = new AudioContextClass();
  }
  if (soundFxAudioCtx.state === 'suspended') {
    soundFxAudioCtx.resume().catch(() => {});
  }
  return soundFxAudioCtx;
}

export function getLiveOutputContext(): AudioContext {
  if (!liveOutputAudioCtx) {
    // Model output for gemini-3.8-live is 24kHz
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    liveOutputAudioCtx = new AudioContextClass({ sampleRate: 24000 });
  }
  if (liveOutputAudioCtx.state === 'suspended') {
    liveOutputAudioCtx.resume().catch(() => {});
  }
  return liveOutputAudioCtx;
}

export function resetLiveAudioScheduler(): void {
  if (liveOutputAudioCtx) {
    liveNextStartTime = liveOutputAudioCtx.currentTime;
  }
}

/**
 * Convert Float32Array from microphone into 16-bit PCM little-endian Base64
 * (at target sample rate 16000Hz)
 */
export function floatTo16BitPCMBase64(inputData: Float32Array): string {
  const buffer = new ArrayBuffer(inputData.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < inputData.length; i++) {
    // clamp between -1 and 1
    const s = Math.max(-1, Math.min(1, inputData[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  // Base64 encode
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Schedule a 24kHz raw PCM chunk for gapless playback via Live API
 */
export function scheduleRawPCM24kChunk(base64Data: string): void {
  try {
    const ctx = getLiveOutputContext();
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    if (liveNextStartTime < currentTime) {
      liveNextStartTime = currentTime;
    }

    source.start(liveNextStartTime);
    liveNextStartTime += audioBuffer.duration;
  } catch (err) {
    console.error('Error scheduling raw PCM chunk:', err);
  }
}

/**
 * Play a complete WAV base64 string from gemini-3.8-flash-tts
 */
export function playWavAudio(base64Audio: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch((err) => {
        console.warn('Autoplay prevented or audio error:', err);
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

// -------------------------------------------------------------------
// Synthesized Game Show Sound Effects (Zero external file dependencies)
// -------------------------------------------------------------------

export function playSoundCorrect(): void {
  try {
    const ctx = getSoundFxContext();
    const now = ctx.currentTime;

    // Major Triad Arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  } catch (e) {
    // ignore
  }
}

export function playSoundWrong(): void {
  try {
    const ctx = getSoundFxContext();
    const now = ctx.currentTime;

    // Game show buzz (dissonant low saw waves)
    [130.81, 123.47].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.48);
    });
  } catch (e) {
    // ignore
  }
}

export function playSoundTick(): void {
  try {
    const ctx = getSoundFxContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {
    // ignore
  }
}

export function playSoundStreak(): void {
  try {
    const ctx = getSoundFxContext();
    const now = ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.2, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.55);
    });
  } catch (e) {
    // ignore
  }
}
