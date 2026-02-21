import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { chatWithGemini } from '../../services/geminiService';
import Editor from '@monaco-editor/react';
import { motion } from 'motion/react';
import { Play, Save, Download, Code2, Bug, Zap, Sparkles, FileCode, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'json', label: 'JSON' },
];

export default function IDECanvas({ user }: { user: User | null }) {
  const [code, setCode] = useState('// Write your code here...\nconsole.log("Hello PROMIX+");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post('/api/interpreter', { code, language });
      const data = response.data;
      setOutput(data.output || data.error);
    } catch (e) {
      setOutput('Error executing code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleAIAction = async (action: string) => {
    setIsAnalyzing(true);
    try {
      const prompt = `${action} the following ${language} code:\n\n${code}`;
      const text = await chatWithGemini(prompt, { model: "gpm-5.5-thinks" });
      // For simplicity, we just show the AI response in output
      setOutput(`AI ${action}:\n\n${text}`);
    } catch (e) {
      alert("AI analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="h-auto min-h-[3rem] border-b border-white/5 bg-[#0a0a0a] flex flex-wrap items-center justify-between px-4 py-2 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-500" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest focus:ring-0 text-zinc-300 cursor-pointer hover:text-white transition-colors"
            >
              {LANGUAGES.map(l => <option key={l.id} value={l.id} className="bg-[#0a0a0a]">{l.label}</option>)}
            </select>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-1 flex-wrap">
            <button 
              onClick={() => handleAIAction('Explain')}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-white/5 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              Explain
            </button>
            <button 
              onClick={() => handleAIAction('Debug')}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-white/5 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Bug className="w-3 h-3" />
              Debug
            </button>
            <button 
              onClick={() => handleAIAction('Refactor')}
              className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-white/5 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3 h-3" />
              Refactor
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            Run Code
          </button>
        </div>
      </div>

      {/* Editor & Console */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 border-r border-white/5">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 20 }
            }}
          />
        </div>
        
        <div className="w-full lg:w-96 bg-[#0a0a0a] flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Console Output</h3>
            <button onClick={() => setOutput('')} className="text-[10px] text-zinc-600 hover:text-zinc-400 uppercase font-bold">Clear</button>
          </div>
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto text-emerald-500/80 whitespace-pre-wrap">
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-zinc-500 animate-pulse">
                <Sparkles className="w-4 h-4" />
                AI is analyzing your code...
              </div>
            ) : output ? (
              output
            ) : (
              <span className="text-zinc-700 italic">No output yet. Click 'Run' to execute.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

