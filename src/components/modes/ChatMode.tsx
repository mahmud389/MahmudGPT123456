import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Brain, 
  Plus, 
  History, 
  ChevronDown, 
  ChevronUp, 
  User as UserIcon, 
  Zap, 
  Code2, 
  PenTool, 
  Search,
  Paperclip,
  Volume2,
  X,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import axios from 'axios';
import { chatWithGemini, generateSpeech } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import { cn } from '../../lib/utils';
import { User, Message, Thread, Attachment, MODEL_ALIASES } from '../../types';

export default function ChatMode({ user, threadId }: { user: User | null, threadId: string | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThinking, setShowThinking] = useState(true);
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODEL_ALIASES>('gpm-4.0-fast');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [autoTTS, setAutoTTS] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (threadId) {
      axios.get(`/api/threads/${threadId}/messages`).then(res => setMessages(res.data));
    } else {
      setMessages([]);
    }
  }, [threadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    const currentThreadId = threadId || `thread_${Date.now()}`;
    
    // Create thread if it doesn't exist
    if (!threadId) {
      await axios.post('/api/threads', {
        id: currentThreadId,
        title: input.slice(0, 30) || "New Chat",
        mode: 'chat'
      });
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      attachments: [...attachments],
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    // Save user message
    await axios.post('/api/messages', { ...userMsg, thread_id: currentThreadId });

    try {
      const text = await chatWithGemini(input, {
        model: selectedModel,
        thinkingLevel: showThinking ? "HIGH" : undefined,
        attachments: userMsg.attachments
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      // Save assistant message
      await axios.post('/api/messages', { ...assistantMsg, thread_id: currentThreadId });

      if (autoTTS) {
        handleTTS(text, assistantMsg.id);
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTTS = async (text: string, msgId: string) => {
    if (isSpeaking === msgId) {
      setIsSpeaking(null);
      return;
    }
    
    setIsSpeaking(msgId);
    try {
      const audioUrl = await generateSpeech(text.slice(0, 500)); // Limit for demo
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(null);
      audio.play();
    } catch (e) {
      console.error(e);
      setIsSpeaking(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
  };

  const handleSuggestionClick = (title: string) => {
    setInput(title);
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full px-4 relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-8 space-y-8 scroll-smooth scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
              <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center relative z-10">
                <Sparkles className="w-12 h-12 text-emerald-500" />
              </div>
            </motion.div>
            <div className="space-y-3">
              <h1 className="text-5xl font-black tracking-tighter shiny-text">How can I help you?</h1>
              <p className="text-zinc-500 max-w-lg mx-auto text-sm leading-relaxed">
                MAHMUDGPT+ is your ultimate AI companion. Powered by GPM 5.5, it can reason, code, and create like never before.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              <SuggestionCard title="Write a Python script" subtitle="to scrape real-time news" icon={Code2} onClick={() => handleSuggestionClick("Write a Python script to scrape real-time news")} />
              <SuggestionCard title="Explain Quantum Gravity" subtitle="in simple Bengali terms" icon={Brain} onClick={() => handleSuggestionClick("Explain Quantum Gravity in simple Bengali terms")} />
              <SuggestionCard title="Draft a Business Plan" subtitle="for a sustainable startup" icon={PenTool} onClick={() => handleSuggestionClick("Draft a Business Plan for a sustainable startup")} />
              <SuggestionCard title="Analyze Market Trends" subtitle="from a financial dataset" icon={Search} onClick={() => handleSuggestionClick("Analyze Market Trends from a financial dataset")} />
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-5 group",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
              msg.role === 'user' ? "bg-zinc-800 border border-white/5" : "bg-emerald-500 text-black shadow-emerald-500/20"
            )}>
              {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />}
            </div>
            <div className={cn(
              "max-w-[85%] space-y-3",
              msg.role === 'user' ? "text-right items-end flex flex-col" : "text-left"
            )}>
              {msg.thinking && (
                <ThinkingBlock content={msg.thinking} />
              )}
              
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] font-medium border-white/5">
                      {att.type.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-emerald-500" /> : <FileText className="w-3 h-3 text-blue-500" />}
                      <span className="max-w-[100px] truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={cn(
                "p-5 rounded-3xl text-[15px] leading-relaxed relative group/msg",
                msg.role === 'user' ? "bg-emerald-500 text-black font-semibold shadow-xl shadow-emerald-500/10" : "glass-dark border border-white/5"
              )}>
                <div className={cn(
                  "markdown-body prose prose-invert prose-sm max-w-none",
                  msg.role === 'user' && "prose-headings:text-black prose-p:text-black prose-strong:text-black prose-code:bg-black/10 prose-code:text-black"
                )}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeHighlight, rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {msg.role === 'assistant' && (
                  <div className="absolute -right-12 top-0 opacity-0 group-hover/msg:opacity-100 transition-opacity flex flex-col gap-2">
                    <button 
                      onClick={() => handleTTS(msg.content, msg.id)}
                      className={cn(
                        "p-2 rounded-lg glass hover:bg-white/10 transition-all",
                        isSpeaking === msg.id && "text-emerald-500 animate-pulse"
                      )}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleCopy(msg.content)}
                      className="p-2 rounded-lg glass hover:bg-white/10 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-black flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex gap-1.5 items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="pb-8 pt-4 sticky bottom-0 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-[2rem] blur-xl opacity-10 group-focus-within:opacity-30 transition duration-1000 animate-pulse" />
          <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-3 flex flex-col gap-3 shadow-2xl">
            
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-2">
                {attachments.map((att, i) => (
                  <div key={i} className="glass px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider border-emerald-500/30">
                    <span className="max-w-[120px] truncate">{att.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value as any)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 cursor-pointer hover:bg-white/10 transition-all pr-8"
                  >
                    <option value="gpm-5.5-thinks">GPM 5.5 THINKS</option>
                    <option value="gpm-4.0-fast">GPM 4.0 FAST</option>
                    <option value="gpm-vision">GPM VISION</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500" />
                </div>
                <div className="h-4 w-px bg-white/10" />
                <button 
                  onClick={() => setShowThinking(!showThinking)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    showThinking ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-white/5 text-zinc-500 border border-white/5"
                  )}
                >
                  <Brain className="w-3.5 h-3.5" />
                  Neural Thinking: {showThinking ? 'ON' : 'OFF'}
                </button>
                <div className="h-4 w-px bg-white/10" />
                <button 
                  onClick={() => setAutoTTS(!autoTTS)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    autoTTS ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-white/5 text-zinc-500 border border-white/5"
                  )}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Auto TTS: {autoTTS ? 'ON' : 'OFF'}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  multiple 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl glass hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-end gap-3 px-3 pb-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message MAHMUDGPT+..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] resize-none py-2 max-h-60 min-h-[48px] placeholder:text-zinc-600"
                rows={1}
              />
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="p-3.5 bg-emerald-500 text-black rounded-2xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-center text-zinc-600 mt-4 uppercase tracking-[0.3em] font-bold">
          MAHMUDGPT+ PROMIX V5.5 • SECURE NEURAL INTERFACE
        </p>
      </div>
    </div>
  );
}

function ThinkingBlock({ content }: { content: string }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="glass-dark border border-white/5 rounded-2xl overflow-hidden mb-3 w-full max-w-2xl">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Brain className="w-4 h-4 text-emerald-500" />
          Neural Thought Process
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 text-xs text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap italic opacity-60 border-t border-white/5">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuggestionCard({ title, subtitle, icon: Icon, onClick }: { title: string, subtitle: string, icon: any, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-start p-5 glass-dark border border-white/5 rounded-3xl hover:bg-white/5 hover:border-emerald-500/30 transition-all text-left group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-emerald-500" />
      </div>
      <h3 className="text-sm font-bold text-zinc-200 mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed">{subtitle}</p>
    </button>
  );
}

