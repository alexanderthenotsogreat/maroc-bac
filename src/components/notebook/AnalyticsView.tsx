import React from "react";
import { TrendingUp, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { Subject, UserSettings } from "../../types";
import { THEMES, CURRICULUM_CHAPTERS } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface AnalyticsViewProps {
  notebookId: string;
  subject: Subject;
  settings: UserSettings;
  sourcesCount: number;
  onBrowseChapter: (chapter: string) => void;
}

export function AnalyticsView({ subject, settings, sourcesCount, onBrowseChapter }: AnalyticsViewProps) {
  const theme = THEMES[settings.themeColor];
  const chapters = CURRICULUM_CHAPTERS[subject] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white border border-zinc-200 rounded-[40px] p-10 shadow-sm relative overflow-hidden">
           <div className={cn("absolute top-0 right-0 p-12 opacity-5", theme.text)}>
              <TrendingUp size={160} />
           </div>
           <h3 className="text-2xl font-serif font-bold italic text-zinc-900 mb-2">Progression de Maîtrise</h3>
           <p className="text-zinc-500 text-sm mb-10">Analyse basée sur vos quiz et flashcards.</p>

           <div className="space-y-6 relative z-10">
              {chapters.slice(0, 4).map((c, i) => (
                <div key={c} className="space-y-2">
                   <div className="flex justify-between items-center px-1">
                      <span className="font-bold text-sm text-zinc-700">{c}</span>
                      <span className={cn("font-black text-xs uppercase italic", theme.text)}>{60 + (i * 10)}%</span>
                   </div>
                   <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", theme.primary)} style={{ width: `${60 + (i * 10)}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={24} />
                 </div>
                 <h4 className="font-bold text-zinc-900">Points Forts</h4>
              </div>
              <ul className="space-y-3">
                 <li className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Concepts Fondamentaux
                 </li>
                 <li className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Logique Déductive
                 </li>
              </ul>
           </div>

           <div className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                    <AlertCircle size={24} />
                 </div>
                 <h4 className="font-bold text-zinc-900">À Renforcer</h4>
              </div>
              <ul className="space-y-3">
                 <li className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Formulations Complexes
                 </li>
                 <li className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Cas Pratiques
                 </li>
              </ul>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className={cn("rounded-[40px] p-8 text-white shadow-xl flex flex-col items-center text-center gap-4", theme.primary)}>
           <div className="p-6 rounded-full bg-white/20 backdrop-blur-md">
              <BookOpen size={48} />
           </div>
           <div>
              <div className="text-5xl font-black italic">{sourcesCount}</div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-80 mt-2">Sources Analysées</p>
           </div>
        </div>

        <div className="bg-zinc-900 rounded-[40px] p-8 text-white">
           <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Recommandations IA
           </h4>
           <div className="space-y-4">
              {chapters.slice(4, 7).map(c => (
                <button 
                  key={c}
                  onClick={() => onBrowseChapter(c)}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all group"
                >
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 group-hover:text-emerald-400 transition-colors">Explorer</p>
                  <p className="text-sm font-bold text-zinc-200 line-clamp-1">{c}</p>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
