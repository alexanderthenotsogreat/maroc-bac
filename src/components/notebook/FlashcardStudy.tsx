import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, RefreshCcw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FlashcardSet, UserSettings } from "../../types";
import { THEMES } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface FlashcardStudyProps {
  set: FlashcardSet;
  settings: UserSettings;
  onClose: () => void;
}

export function FlashcardStudy({ set, settings, onClose }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = THEMES[settings.themeColor];
  const card = set.cards[currentIndex];

  const next = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % set.cards.length);
  };

  const prev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + set.cards.length) % set.cards.length);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-zinc-900">{set.title}</h3>
            <p className="text-xs text-zinc-400">Card {currentIndex + 1} of {set.cards.length}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all"><X size={24} /></button>
        </div>

        <div className="flex-1 flex items-center justify-center p-10 bg-zinc-50/50">
          <div className="w-full h-full relative perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              className="w-full h-full relative preserve-3d"
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-[32px] border-2 border-zinc-100 shadow-xl p-12 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-6">Question</span>
                 <p className="text-2xl font-serif font-bold text-zinc-900 italic leading-relaxed">{card.front}</p>
                 <div className="mt-8 text-zinc-300"><RefreshCcw size={20} /></div>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-white rounded-[32px] border-2 border-zinc-200 shadow-xl p-12 flex flex-col items-center justify-center text-center transform scale-x-[-1] rotate-y-180">
                 <div className={cn("p-4 rounded-2xl mb-6", theme.bgLight, theme.text)}>
                    <Zap size={24} />
                 </div>
                 <p className="text-xl font-medium text-zinc-800 leading-relaxed">{card.back}</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-zinc-100 flex justify-between items-center">
          <button onClick={prev} className="p-4 hover:bg-zinc-100 rounded-2xl text-zinc-400 transition-all"><ChevronLeft size={24} /></button>
          <div className="flex gap-2">
             {set.cards.map((_, i) => (
               <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i === currentIndex ? theme.primary : "bg-zinc-100")} />
             ))}
          </div>
          <button onClick={next} className="p-4 hover:bg-zinc-100 rounded-2xl text-zinc-400 transition-all"><ChevronRight size={24} /></button>
        </div>
      </div>
    </div>
  );
}
