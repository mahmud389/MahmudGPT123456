import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  MessageSquare, 
  PenTool, 
  Code2, 
  Search, 
  Image as ImageIcon, 
  Monitor,
  Sparkles,
  ArrowRight,
  Brain,
  Shield,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Mode } from '../types';

interface LandingPageProps {
  onStart: (mode: Mode) => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#050505] text-white scrollbar-hide">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Next-Gen Intelligence</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              THE FUTURE OF <br />
              <span className="shiny-text">CREATIVE AI</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              MAHMUDGPT+ PROMIX V5.5 is a multi-model ecosystem designed for elite creators, developers, and researchers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={() => onStart('chat')}
                className="px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-2 group shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                GET STARTED
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all">
                VIEW DOCUMENTATION
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-black tracking-tight mb-4 uppercase">One Interface. Infinite Possibilities.</h2>
            <p className="text-zinc-500">Switch between specialized canvases designed for specific workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={MessageSquare} 
              title="Neural Chat" 
              description="Advanced reasoning with GPM 5.5 Neural Thinking engine."
              color="emerald"
              onClick={() => onStart('chat')}
            />
            <FeatureCard 
              icon={PenTool} 
              title="Writing Canvas" 
              description="Professional editorial suite with real-time AI improvement."
              color="cyan"
              onClick={() => onStart('writing')}
            />
            <FeatureCard 
              icon={Code2} 
              title="IDE Canvas" 
              description="Full-featured code editor with AI debugging and refactoring."
              color="blue"
              onClick={() => onStart('ide')}
            />
            <FeatureCard 
              icon={Search} 
              title="Deep Research" 
              description="Autonomous information synthesis from global data sources."
              color="purple"
              onClick={() => onStart('research')}
            />
            <FeatureCard 
              icon={ImageIcon} 
              title="Image Forge" 
              description="Hyper-realistic image generation with GPM Vision engine."
              color="orange"
              onClick={() => onStart('image')}
            />
            <FeatureCard 
              icon={Monitor} 
              title="Live Interface" 
              description="Real-time multi-modal interaction with zero latency."
              color="red"
              onClick={() => onStart('live')}
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <Shield className="w-8 h-8 text-emerald-500" />
            <h3 className="font-bold text-xl uppercase tracking-tight">Secure by Design</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Enterprise-grade encryption and privacy-first data handling for your most sensitive projects.</p>
          </div>
          <div className="space-y-4">
            <Brain className="w-8 h-8 text-cyan-500" />
            <h3 className="font-bold text-xl uppercase tracking-tight">Neural Engine</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Powered by the GPM 5.5 architecture, featuring advanced multi-step reasoning capabilities.</p>
          </div>
          <div className="space-y-4">
            <Clock className="w-8 h-8 text-blue-500" />
            <h3 className="font-bold text-xl uppercase tracking-tight">Real-time Sync</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Seamlessly transition between devices and modes with instant cloud synchronization.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500 fill-current" />
            <span className="font-bold tracking-tight uppercase">MahmudGPT+</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">© 2026 MahmudGPT+ PROMIX V5.5</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color, onClick }: { icon: any, title: string, description: string, color: string, onClick: () => void }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] hover:bg-zinc-800 transition-all cursor-pointer group"
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", colors[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed mb-6">{description}</p>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
        Launch Mode <ArrowRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
}
