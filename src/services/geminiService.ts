import { GoogleGenAI, Modality } from "@google/genai";
import axios from "axios";
import { Attachment, MODEL_ALIASES } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const chatWithGemini = async (
  message: string, 
  options: { 
    model?: keyof typeof MODEL_ALIASES, 
    systemInstruction?: string, 
    thinkingLevel?: string,
    attachments?: Attachment[]
  } = {}
) => {
  // 1. Check usage
  const limitCheck = await axios.get('/api/usage/check?type=message');
  if (!limitCheck.data.allowed) {
    throw new Error("Daily limit reached. Upgrade to PRO!");
  }

  // 2. Call Gemini
  const ai = getAI();
  const modelName = MODEL_ALIASES[options.model || 'gpm-4.0-fast'];
  
  const parts: any[] = [{ text: message }];
  
  if (options.attachments && options.attachments.length > 0) {
    options.attachments.forEach(att => {
      parts.push({
        inlineData: {
          data: att.data.split(',')[1] || att.data,
          mimeType: att.type
        }
      });
    });
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts },
    config: {
      systemInstruction: options.systemInstruction,
      thinkingConfig: options.thinkingLevel ? { thinkingLevel: options.thinkingLevel as any } : undefined
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  // 3. Increment usage
  await axios.post('/api/usage/increment', { type: 'message' });

  return text;
};

export const generateSpeech = async (text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Zephyr') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_ALIASES['gpm-tts'],
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Failed to generate speech");
  
  return `data:audio/wav;base64,${base64Audio}`;
};

export const generateImageWithGemini = async (prompt: string, options: { aspectRatio?: string, imageSize?: string } = {}) => {
  // 1. Check usage
  const limitCheck = await axios.get('/api/usage/check?type=image');
  if (!limitCheck.data.allowed) {
    throw new Error("Daily image limit reached.");
  }

  // 2. Call Gemini
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { 
        aspectRatio: (options.aspectRatio || "1:1") as any, 
        imageSize: (options.imageSize || "1K") as any 
      }
    }
  });

  let imageUrl = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  if (!imageUrl) throw new Error("Failed to generate image");

  // 3. Increment usage
  await axios.post('/api/usage/increment', { type: 'image' });

  return imageUrl;
};
