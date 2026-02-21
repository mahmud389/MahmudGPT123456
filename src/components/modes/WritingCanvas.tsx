import React, { useState } from 'react';
import axios from 'axios';
import { chatWithGemini } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion } from 'motion/react';
import { FileText, Eye, Edit3, Download, Share2, Save, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';
import 'katex/dist/katex.min.css';

export default function WritingCanvas({ user }: { user: User | null }) {
  const [content, setContent] = useState('# New Document\n\nStart writing your masterpiece here...');
  const [view, setView] = useState<'edit' | 'preview' | 'split'>('split');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIImprove = async () => {
    setIsGenerating(true);
    try {
      const text = await chatWithGemini(`Improve this writing, fix grammar, and enhance vocabulary while keeping the same structure:\n\n${content}`, {
        model: "gpm-5.5-thinks",
        systemInstruction: "You are a professional editor. Return ONLY the improved text."
      });
      setContent(text);
    } catch (e) {
      alert("AI improvement failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 rounded-lg p-1">
            <ViewButton active={view === 'edit'} onClick={() => setView('edit')} icon={Edit3} label="Edit" />
            <ViewButton active={view === 'split'} onClick={() => setView('split')} icon={FileText} label="Split" />
            <ViewButton active={view === 'preview'} onClick={() => setView('preview')} icon={Eye} label="Preview" />
          </div>
          <div className="h-4 w-px bg-white/10" />
          <button 
            onClick={handleAIImprove}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-emerald-500 hover:bg-emerald-500/10 transition-all"
          >
            {isGenerating ? <Sparkles className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            AI Improve
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {wordCount} Words
          </div>
          <div className="h-4 w-px bg-white/10" />
          <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400">
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {(view === 'edit' || view === 'split') && (
          <div className={cn(
            "h-full bg-[#050505] p-8 overflow-y-auto",
            view === 'split' ? "w-1/2 border-r border-white/5" : "w-full max-w-4xl mx-auto"
          )}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 text-zinc-300 font-mono text-sm resize-none leading-relaxed"
              placeholder="Start writing..."
            />
          </div>
        )}
        {(view === 'preview' || view === 'split') && (
          <div className={cn(
            "h-full bg-[#050505] p-8 overflow-y-auto",
            view === 'split' ? "w-1/2" : "w-full max-w-4xl mx-auto"
          )}>
            <div className="prose prose-invert prose-emerald max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
        active ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );
}
