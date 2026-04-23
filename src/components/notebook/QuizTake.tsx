import React, { useState } from "react";
import { X, CheckCircle2, ChevronRight, Loader2, Award, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Quiz, UserSettings, Subject } from "../../types";
import { THEMES } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface QuizTakeProps {
  quiz: Quiz;
  subject: Subject;
  settings: UserSettings;
  onClose: () => void;
}

export function QuizTake({ quiz, subject, settings, onClose }: QuizTakeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const theme = THEMES[settings.themeColor];

  const handleNext = () => {
    if (selectedOption === quiz.questions[currentQuestion].correctIndex) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion + 1 < quiz.questions.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-md">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[40px] p-12 text-center space-y-8 shadow-2xl">
          <div className="text-6xl">🏆</div>
          <h3 className="text-3xl font-serif font-bold italic">Quiz Terminé !</h3>
          <div className="space-y-2">
             <p className="text-zinc-500 font-medium">Votre score pour <span className="text-zinc-900 font-bold">{subject}</span></p>
             <div className={cn("text-6xl font-black italic", theme.text)}>
              {score}/{quiz.questions.length}
             </div>
          </div>
          <button onClick={onClose} className={cn("w-full py-4 rounded-2xl text-white font-bold transition-all shadow-lg", theme.primary)}>Terminer l'évaluation</button>
        </motion.div>
      </div>
    );
  }

  const q = quiz.questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[700px]">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className={cn("p-3 rounded-2xl text-white", theme.primary)}><GraduationCap size={20} /></div>
             <div>
                <h3 className="text-xl font-bold text-zinc-900">{quiz.title}</h3>
                <p className="text-xs text-zinc-400">Question {currentQuestion + 1} of {quiz.questions.length}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all"><X size={24} /></button>
        </div>

        <div className="p-8 bg-zinc-50 flex-none">
          <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              className={cn("h-full", theme.primary)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-10">
          <div className="space-y-4 text-left">
            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest px-1">Énoncé</span>
            <h4 className="text-2xl font-serif font-bold text-zinc-900 leading-relaxed italic">{q.question}</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {q.options.map((opt, i) => (
               <button 
                key={i}
                onClick={() => setSelectedOption(i)}
                className={cn(
                  "w-full p-6 bg-white border-2 rounded-3xl text-left transition-all flex items-center justify-between group",
                  selectedOption === i ? `${theme.border} ${theme.bgLight} ${theme.text} scale-[1.02] shadow-md` : "border-zinc-100 text-zinc-600 hover:border-zinc-200"
                )}
               >
                 <span className="font-bold">{opt}</span>
                 {selectedOption === i && <CheckCircle2 size={24} />}
               </button>
             ))}
          </div>
        </div>

        <div className="p-8 bg-white border-t border-zinc-100 flex justify-end">
           <button 
            onClick={handleNext}
            disabled={selectedOption === null}
            className={cn(
              "px-10 py-4 rounded-2xl text-white font-bold transition-all shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:grayscale hover:-translate-y-1",
              theme.primary
            )}
           >
             {currentQuestion + 1 === quiz.questions.length ? "Terminer le Quiz" : "Question Suivante"} <ChevronRight size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}
