import React, { useState } from 'react';
import axios from 'axios';
import { chatWithGemini } from '../../services/geminiService';
import { motion } from 'motion/react';
import { Search, Globe, Link as LinkIcon, FileText, ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';

export default function ResearchMode({ user }: { user: User | null }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const text = await chatWithGemini(`Research and summarize information about: ${query}. Provide key facts and sources.`, {
        model: "gpm-4.0-fast"
      });
      setSummary(text);
      // Mocking some sources for UI demo
      setResults([
        { title: "Wikipedia: " + query, url: "#", snippet: "General overview and history of " + query },
        { title: "Recent News on " + query, url: "#", snippet: "Latest developments and updates regarding " + query },
        { title: "Scientific Journal: " + query, url: "#", snippet: "In-depth analysis and research findings." }
      ]);
    } catch (e) {
      alert("Research failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto w-full px-6 py-8 overflow-hidden">
      <div className="flex flex-col items-center mb-12">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-2xl relative"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-zinc-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="What would you like to research today?"
            className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
          />
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
          >
            {isLoading ? "Searching..." : "Research"}
          </button>
        </motion.div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Summary */}
        <div className="flex-1 overflow-y-auto pr-4 space-y-6">
          {summary ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8"
            >
              <div className="flex items-center gap-2 mb-6 text-emerald-500">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-sm font-bold uppercase tracking-widest">AI Synthesis</h2>
              </div>
              <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 leading-relaxed">
                {summary}
              </div>
            </motion.div>
          ) : !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
              <Globe className="w-16 h-16 mb-4" />
              <p>Enter a topic to begin your deep research</p>
            </div>
          )}
          {isLoading && (
            <div className="space-y-4">
              <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded-lg animate-pulse" />
              <div className="h-4 w-2/3 bg-white/5 rounded-lg animate-pulse" />
            </div>
          )}
        </div>

        {/* Sources */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">Key Sources</h3>
          {results.map((res, i) => (
            <motion.a
              key={i}
              href={res.url}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                  <LinkIcon className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500" />
                </div>
                <ExternalLink className="w-3 h-3 text-zinc-600" />
              </div>
              <h4 className="text-sm font-medium text-zinc-200 mb-1 line-clamp-1">{res.title}</h4>
              <p className="text-xs text-zinc-500 line-clamp-2">{res.snippet}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}
