import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Radio, Zap, Activity, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';

export default function LiveMode({ user }: { user: User | null }) {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(0));

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setVisualizerData(prev => prev.map(() => Math.random() * 100));
      }, 100);
    } else {
      setVisualizerData(new Array(20).fill(0));
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleLive = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setTranscription(["System: Connecting to Gemini Live...", "System: Connection established.", "Gemini: Hello! I'm ready to chat. How can I help you today?"]);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 md:p-8 bg-[#050505] overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl w-full flex flex-col items-center space-y-8 md:space-y-12">
        {/* Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-48 w-full">
          {visualizerData.map((val, i) => (
            <motion.div
              key={i}
              animate={{ height: `${Math.max(10, val)}%` }}
              className={cn(
                "w-3 rounded-full transition-all duration-100",
                isActive ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-zinc-800"
              )}
            />
          ))}
        </div>

        {/* Status */}
        <div className="text-center space-y-4">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all",
            isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-white/5 border-white/10 text-zinc-500"
          )}>
            <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-700")} />
            {isActive ? "Live Session Active" : "Ready to Connect"}
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isActive ? "I'm listening..." : "Start a Live Conversation"}
          </h2>
          <p className="text-zinc-500 max-w-md mx-auto text-sm">
            Experience real-time, low-latency voice interaction with Gemini 3.1. Perfect for brainstorming, practice, or quick questions.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "p-6 rounded-full border transition-all",
              isMuted ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
            )}
          >
            {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          
          <button 
            onClick={toggleLive}
            className={cn(
              "p-10 rounded-full transition-all relative group",
              isActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-emerald-500 text-black hover:bg-emerald-400"
            )}
          >
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            {isActive ? <Zap className="w-12 h-12 fill-current" /> : <Radio className="w-12 h-12" />}
          </button>

          <button className="p-6 rounded-full border bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 transition-all">
            <Volume2 className="w-8 h-8" />
          </button>
        </div>

        {/* Transcription Preview */}
        <div className="w-full max-w-lg bg-zinc-900/30 border border-white/5 rounded-2xl p-6 h-40 overflow-y-auto space-y-3">
          {transcription.map((t, i) => (
            <motion.p 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "text-xs leading-relaxed",
                t.startsWith('System:') ? "text-zinc-600 italic" : 
                t.startsWith('Gemini:') ? "text-emerald-500 font-medium" : "text-zinc-300"
              )}
            >
              {t}
            </motion.p>
          ))}
          {!isActive && (
            <p className="text-xs text-zinc-700 italic text-center mt-8">Transcription will appear here during live session</p>
          )}
        </div>
      </div>
    </div>
  );
}
