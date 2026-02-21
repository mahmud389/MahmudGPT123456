export type Mode = 'chat' | 'writing' | 'ide' | 'research' | 'image' | 'live' | 'voice';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  plan: 'free' | 'pro' | 'ultra';
}

export interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  attachments?: Attachment[];
  timestamp: number;
}

export interface Thread {
  id: string;
  title: string;
  mode: Mode;
  created_at: string;
}

export const MODEL_ALIASES = {
  'gpm-5.5-thinks': 'gemini-3.1-pro-preview',
  'gpm-4.0-fast': 'gemini-3-flash-preview',
  'gpm-vision': 'gemini-2.5-flash-image',
  'gpm-audio': 'gemini-2.5-flash-native-audio-preview-09-2025',
  'gpm-tts': 'gemini-2.5-flash-preview-tts'
};
