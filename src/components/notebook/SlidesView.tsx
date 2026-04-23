import React, { useState } from "react";
import { X, MessageCircle, Presentation, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Markdown from "react-markdown";
import { SlideDeck } from "../../types";
import { cn } from "../../lib/utils";

interface SlidesViewProps {
  deck: SlideDeck;
  onClose: () => void;
  onAskTutor: (q: string) => void;
  onDelete: (id: string) => void;
}

export function SlidesView({ deck, onClose, onAskTutor, onDelete }: SlidesViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4 text-left">
             <div className="p-3 rounded-2xl bg-amber-50 text-amber-600"><Presentation size={20} /></div>
             <div>
                <h3 className="text-xl font-bold text-zinc-900">{deck.title}</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Présentation de cours (Slide {currentSlide + 1}/{deck.slides.length})</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
               <Play size={14} fill="currentColor" /> Présenter
            </button>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-8 sm:p-16 bg-zinc-900 flex items-center justify-center relative">
           <div className="w-full h-full bg-white rounded-3xl shadow-2xl p-12 sm:p-20 flex flex-col items-center justify-center text-center relative overflow-y-auto no-scrollbar">
              <div className="space-y-10 max-w-2xl">
                 <h2 className="text-4xl font-serif font-bold italic text-zinc-900 leading-tight">
                    {deck.slides[currentSlide].title}
                 </h2>
                 <ul className="space-y-4 text-left inline-block">
                    {deck.slides[currentSlide].bullets.map((bullet, idx) => (
                      <li key={idx} className="flex gap-4 text-lg text-zinc-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mt-2.5 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                 </ul>
              </div>
           </div>

           <button 
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className="absolute left-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
           >
            <ChevronLeft size={32} />
           </button>
           <button 
            onClick={() => setCurrentSlide(prev => Math.min(deck.slides.length - 1, prev + 1))}
            className="absolute right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
           >
            <ChevronRight size={32} />
           </button>
        </div>

        <div className="p-8 bg-white border-t border-zinc-100 flex justify-between items-center">
           <div className="flex gap-1.5 overflow-x-auto max-w-sm no-scrollbar px-2">
              {deck.slides.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={cn("w-3 h-3 rounded-full transition-all shrink-0", i === currentSlide ? "bg-zinc-900 scale-125" : "bg-zinc-100 hover:bg-zinc-200")} 
                />
              ))}
           </div>
           <button 
            onClick={() => onAskTutor(`Explique moi la slide n°${currentSlide + 1} de la présentation : "${deck.title}"`)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
           >
             <MessageCircle size={18} /> Approfondir la Slide
           </button>
        </div>
      </div>
    </div>
  );
}
