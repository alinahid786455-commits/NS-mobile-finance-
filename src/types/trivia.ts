export type HostVoice = 'Kore' | 'Puck' | 'Fenrir' | 'Charon' | 'Zephyr';

export interface HostPersonality {
  id: string;
  name: string;
  title: string;
  archetype: string;
  avatarEmoji: string;
  avatarBg: string;
  accentColor: string;
  voiceName: HostVoice;
  sassLevel: number; // 1 (supportive) to 10 (savage roaster)
  description: string;
  ttsStyle: string;
  catchphrase: string;
  sampleVoiceLine: string;
  winReactions: string[];
  loseReactions: string[];
  streakReactions: string[];
  isCustom?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  funFact?: string;
  hostIntro?: string;
  groundingSources?: GroundingSource[];
}

export interface GameSettings {
  questionCount: number;
  timePerQuestion: number; // in seconds, e.g. 20
  autoPlayVoice: boolean;
  soundEffects: boolean;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PlayerStats {
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  currentStreak: number;
  maxStreak: number;
  fastestAnswerTime: number; // in seconds
  lifelinesUsed: number;
}

export interface LiveChatMessage {
  id: string;
  sender: 'user' | 'host' | 'system';
  text: string;
  timestamp: number;
}
