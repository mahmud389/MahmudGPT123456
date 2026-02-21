import React, { useState } from 'react';
import axios from 'axios';
import { generateImageWithGemini } from '../../services/geminiService';
import { motion } from 'motion/react';
import { Download, RefreshCw, Wand2, Image as ImageIcon, Layers, Maximize, Save, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';

const PRESETS = [
  { id: 'realistic', label: 'Realistic', icon: '📸' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
  { id: 'anime', label: 'Anime', icon: '🎌' },
  { id: 'illustration', label: 'Illustration', icon: '🎨' },
  { id: '3d', label: '3D Render', icon: '🧊' },
];

const RATIOS = [
  { id: '1:1', label: 'Square' },
  { id: '16:9', label: 'Landscape' },
  { id: '9:16', label: 'Portrait' },
];

export default function ImageMode({ user }: { user: User | null }) {
  const [prompt, setPrompt] = useState('');
  const [preset, setPreset] = useState('realistic');
  const [ratio, setRatio] = useState('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const fullPrompt = `${prompt}, style: ${preset}, high quality, 4k resolution`;
      const imageUrl = await generateImageWithGemini(fullPrompt, {
        aspectRatio: ratio,
        imageSize: "1K"
      });

      setGeneratedImage(imageUrl);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Controls */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0a0a0a] p-6 space-y-8 overflow-y-auto scrollbar-hide">
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city with neon lights..."
            className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
          />
          <button 
            onClick={() => setPrompt("A majestic dragon soaring over a crystal lake at sunset, cinematic lighting")}
            className="text-[10px] text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1"
          >
            <Wand2 className="w-3 h-3" />
            Surprise me
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Style Preset</label>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border",
                  preset === p.id ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800"
                )}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Aspect Ratio</label>
          <div className="flex gap-2">
            {RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRatio(r.id)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-xs transition-all border",
                  ratio === r.id ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-[#050505] p-8 flex items-center justify-center relative">
        <div className="max-w-4xl w-full aspect-square relative group">
          {generatedImage ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform">
                  <Download className="w-6 h-6" />
                </button>
                <button className="p-4 bg-white/10 text-white rounded-full hover:scale-110 transition-transform backdrop-blur-md">
                  <Maximize className="w-6 h-6" />
                </button>
                <button className="p-4 bg-white/10 text-white rounded-full hover:scale-110 transition-transform backdrop-blur-md">
                  <Save className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full h-full rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-zinc-600 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-t-2 border-emerald-500 animate-spin" />
                  <p className="text-sm font-medium animate-pulse">Painting your imagination...</p>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-16 h-16 opacity-20" />
                  <p className="text-sm">Your masterpiece will appear here</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Floating Info */}
        <div className="absolute bottom-8 right-8 flex items-center gap-4">
          <div className="px-4 py-2 bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Powered by Gemini 2.5 Flash Image
          </div>
        </div>
      </div>
    </div>
  );
}

