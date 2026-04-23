import React from "react";
import { X, MessageCircle, FileText, Trash2, Printer, CheckCircle2, Lightbulb, Book } from "lucide-react";
import { StudyGuide } from "../../types";
import { cn } from "../../lib/utils";

interface StudyGuideViewProps {
  guide: StudyGuide;
  onClose: () => void;
  onAskTutor: (q: string) => void;
  onDelete: (id: string) => void;
}

export function StudyGuideView({ guide, onClose, onAskTutor, onDelete }: StudyGuideViewProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 text-left">
             <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><FileText size={20} /></div>
             <div>
                <h3 className="text-xl font-bold text-zinc-900">{guide.title}</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Guide d'Étude Personnalisé</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="p-3 text-zinc-400 hover:text-zinc-900 transition-all"><Printer size={20} /></button>
            <button onClick={() => onDelete(guide.id)} className="p-3 text-zinc-300 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-white text-left space-y-12">
          {/* Summary */}
          <section className="space-y-4">
             <h4 className="text-sm font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                <Book size={16} /> Résumé Global
             </h4>
             <p className="text-xl text-zinc-600 leading-relaxed font-medium font-serif italic">
                {guide.summary}
             </p>
          </section>

          {/* Key Points */}
          <section className="space-y-6">
             <h4 className="text-sm font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} /> Points Clés à Maîtriser
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guide.keyPoints.map((point, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 flex gap-4 items-start">
                     <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">{i + 1}</span>
                     <p className="text-zinc-800 font-medium">{point}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Exam Tips */}
          <section className="space-y-6">
             <h4 className="text-sm font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                <Lightbulb size={16} /> Astuces pour l'Examen
             </h4>
             <div className="space-y-4">
                {guide.examTips.map((tip, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-amber-50 border border-amber-100 text-amber-900 font-medium list-none">
                     ✨ {tip}
                  </div>
                ))}
             </div>
          </section>

          {/* Glossary */}
          {guide.glossary.length > 0 && (
            <section className="space-y-6">
               <h4 className="text-sm font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                  <Book size={16} /> Glossaire
               </h4>
               <div className="grid grid-cols-1 gap-4">
                  {guide.glossary.map((item, i) => (
                    <div key={i} className="flex gap-6 p-4 rounded-2xl hover:bg-zinc-50 transition-colors">
                       <span className="font-bold text-zinc-900 border-r border-zinc-100 pr-6 min-w-[120px]">{item.term}</span>
                       <span className="text-zinc-500">{item.definition}</span>
                    </div>
                  ))}
               </div>
            </section>
          )}
        </div>

        <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
           <p className="text-xs text-zinc-400 font-medium italic">Document structuré pour une révision efficace.</p>
           <button 
            onClick={() => onAskTutor(`Peux-tu m'approfondir un point spécifique de ce guide : "${guide.title}" ?`)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
           >
             <MessageCircle size={18} /> Approfondir avec l'IA
           </button>
        </div>
      </div>
    </div>
  );
}
