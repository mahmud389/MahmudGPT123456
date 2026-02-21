/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  PenTool, 
  Code2, 
  Search, 
  Image as ImageIcon, 
  Mic, 
  Zap, 
  Settings, 
  ChevronRight,
  ChevronLeft,
  Brain,
  Sparkles,
  Send,
  Plus,
  History,
  LayoutDashboard,
  Monitor,
  Trash2
} from 'lucide-react';
import { cn } from './lib/utils';
import axios from 'axios';
import { Mode, User, Message, Thread } from './types';

// Components
import ChatMode from './components/modes/ChatMode';
import WritingCanvas from './components/modes/WritingCanvas';
import IDECanvas from './components/modes/IDECanvas';
import ImageMode from './components/modes/ImageMode';
import ResearchMode from './components/modes/ResearchMode';
import LiveMode from './components/modes/LiveMode';

export default function App() {
  const [mode, setMode] = useState<Mode>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (user) {
      axios.get('/api/threads').then(res => setThreads(res.data));
    }
  }, [user, currentThreadId]);

  const handleNewThread = () => {
    setCurrentThreadId(null);
    setMode('chat');
  };

  const handleDeleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await axios.delete(`/api/threads/${id}`);
    setThreads(prev => prev.filter(t => t.id !== id));
    if (currentThreadId === id) setCurrentThreadId(null);
  };

  useEffect(() => {
    axios.get('/api/me')
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-white">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full border-t-2 border-emerald-500 animate-spin" />
          <h1 className="text-xl font-medium tracking-widest uppercase shiny-text">MahmudGPT+</h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#050505] text-zinc-100 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col relative z-50 shadow-2xl"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <Zap className="w-5 h-5 text-black fill-current" />
              </div>
              <span className="font-bold text-lg tracking-tight">MAHMUD<span className="text-emerald-500">GPT+</span></span>
            </motion.div>
          ) : (
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              <Zap className="w-5 h-5 text-black fill-current" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          <button 
            onClick={handleNewThread}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500 text-black font-bold mb-4 hover:bg-emerald-400 transition-all active:scale-95",
              !isSidebarOpen && "justify-center"
            )}
          >
            <Plus className="w-5 h-5" />
            {isSidebarOpen && <span>New Chat</span>}
          </button>

          <NavItem icon={MessageSquare} label="Chat" active={mode === 'chat'} onClick={() => setMode('chat')} isOpen={isSidebarOpen} />
          <NavItem icon={PenTool} label="Writing" active={mode === 'writing'} onClick={() => setMode('writing')} isOpen={isSidebarOpen} />
          <NavItem icon={Code2} label="IDE Canvas" active={mode === 'ide'} onClick={() => setMode('ide')} isOpen={isSidebarOpen} />
          <NavItem icon={Search} label="Research" active={mode === 'research'} onClick={() => setMode('research')} isOpen={isSidebarOpen} />
          <NavItem icon={ImageIcon} label="Image Gen" active={mode === 'image'} onClick={() => setMode('image')} isOpen={isSidebarOpen} />
          <NavItem icon={Monitor} label="Live Mode" active={mode === 'live'} onClick={() => setMode('live')} isOpen={isSidebarOpen} />
          
          {isSidebarOpen && threads.length > 0 && (
            <div className="mt-8 px-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Recent Activity</p>
              <div className="space-y-2">
                {threads.map(thread => (
                  <button 
                    key={thread.id}
                    onClick={() => {
                      setCurrentThreadId(thread.id);
                      setMode(thread.mode);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all group",
                      currentThreadId === thread.id ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    )}
                  >
                    <History className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate flex-1 text-left">{thread.title}</span>
                    <button 
                      onClick={(e) => handleDeleteThread(thread.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          {user && (
            <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/10" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full" />
              </div>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{user.plan} MEMBER</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-black shadow-lg z-50 hover:scale-110 transition-transform"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-hidden rgb-border">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100 capitalize tracking-tight">{mode}</h2>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-black">GPM 5.5 THINKS</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
              <Brain className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Neural Engine Active</span>
            </div>
            <button 
              onClick={() => alert("Settings: Neural Engine v5.5 configured. All systems nominal.")}
              className="p-2 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex">
          {/* Integrated Chat Sidebar (Always present) */}
          <div className={cn(
            "border-r border-white/5 overflow-hidden transition-all duration-300",
            mode === 'chat' ? "w-full" : "w-80 hidden xl:block"
          )}>
            <ChatMode user={user} threadId={currentThreadId} />
          </div>

          {/* Mode Canvas */}
          {mode !== 'chat' && (
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full w-full"
                >
                  {mode === 'writing' && <WritingCanvas user={user} />}
                  {mode === 'ide' && <IDECanvas user={user} />}
                  {mode === 'image' && <ImageMode user={user} />}
                  {mode === 'research' && <ResearchMode user={user} />}
                  {mode === 'live' && <LiveMode user={user} />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Branding Label */}
        <div className="absolute bottom-4 right-6 pointer-events-none z-50">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Built by Mahmud</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, isOpen }: { icon: any, label: string, active: boolean, onClick: () => void, isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
        active ? "bg-emerald-500/10 text-emerald-500" : "text-zinc-400 hover:text-white hover:bg-white/5",
        !isOpen && "justify-center"
      )}
    >
      <Icon className={cn("w-5 h-5", active && "fill-emerald-500/20")} />
      {isOpen && <span className="text-sm font-medium">{label}</span>}
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
        />
      )}
    </button>
  );
}
