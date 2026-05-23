import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { X, AlertTriangle, Sparkles, Disc, Zap } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface ThesisModalProps {
  thesis: any | null;
  onClose: () => void;
  type: 'SUPERNOVA' | 'BLACK_HOLE' | 'HIGH_ENERGY' | 'REJECTION';
}

export function ThesisModal({ thesis, onClose, type }: ThesisModalProps) {
  if (!thesis) return null;

  const getTheme = () => {
    switch (type) {
      case 'SUPERNOVA': return { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/50', icon: Sparkles, gradient: 'from-indigo-500/20 to-transparent' };
      case 'BLACK_HOLE': return { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/50', icon: Disc, gradient: 'from-fuchsia-500/20 to-transparent' };
      case 'HIGH_ENERGY': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/50', icon: Zap, gradient: 'from-amber-500/20 to-transparent' };
      case 'REJECTION': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/50', icon: AlertTriangle, gradient: 'from-rose-500/20 to-transparent' };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Blurred backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-5xl bg-[#0a0f1c] border ${theme.border} rounded-[2rem] shadow-[0_0_100px_-20px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden`}
        >
          {/* Top glow effect */}
          <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${theme.gradient} opacity-50 pointer-events-none`} />

          <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/40 relative z-10 backdrop-blur-sm">
            <div className="flex items-center gap-5">
              <div className={`${theme.bg} ${theme.color} p-3 rounded-2xl shadow-inner border border-white/5`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-extrabold text-white font-display tracking-tight leading-none">TIC {thesis.ticId || thesis.tic_id}</h3>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                  {type === 'REJECTION' ? 'False Positive Thesis' : 'Discovery Thesis'} by {thesis.userId === 'mcp-agent' ? 'God-Tier Pipeline (MCP)' : (thesis.researcherName || 'System')}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative z-10">
            <div className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight 
              prose-h1:text-4xl prose-h1:mb-8 prose-h1:text-white 
              prose-h2:text-2xl prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-3 prose-h2:mt-10 
              prose-h3:text-xl prose-h3:text-slate-200 
              prose-p:text-slate-300 prose-p:leading-relaxed 
              prose-a:text-indigo-400 hover:prose-a:text-indigo-300 
              prose-strong:text-white prose-strong:font-bold
              prose-code:text-emerald-400 prose-code:bg-emerald-400/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
              prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
              prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
              prose-li:text-slate-300
              prose-table:border-collapse prose-table:w-full prose-td:border prose-td:border-slate-700 prose-td:p-3 prose-th:border prose-th:border-slate-700 prose-th:p-3 prose-th:bg-slate-800
              ">
              <Markdown 
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {thesis.narrative_thesis || thesis.thesis}
              </Markdown>
            </div>
          </div>

          {/* Bottom gradient fade for scroll indication */}
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0a0f1c] to-transparent pointer-events-none z-20" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
