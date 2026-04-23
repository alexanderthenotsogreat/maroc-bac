import React, { useState } from "react";
import { GraduationCap, Map as MapIcon, ChevronRight, CheckCircle2, Bookmark, FileSearch, Sparkles, BrainCircuit, Rocket, Target, Wand2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Subject, UserSettings, Source, UserProgress } from "../../types";
import { THEMES } from "../../constants/ui";
import { generateLearningPath } from "../../services/aiService";
import { cn } from "../../lib/utils";

interface LearningPathViewProps {
  sources: Source[];
  subject: Subject;
  settings: UserSettings;
  userProgress?: UserProgress;
}

export function LearningPathView({ sources, subject, settings, userProgress }: LearningPathViewProps) {
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState<any>(null);
  const theme = THEMES[settings.themeColor];

  const handleGenerate = async () => {
    if (sources.length === 0) return alert("Ajoutez d'abord des sources.");
    setLoading(true);
    try {
      const sourceContext = sources.map(s => s.content).join("\n\n");
      const progress = userProgress || {
        userId: "",
        subject,
        masteryLevel: 0,
        topicMastery: {},
        quizScores: [],
        studyTimeMs: 0,
        totalQuizzesTaken: 0,
        totalSourcesAdded: 0,
        updatedAt: new Date()
      };
      
      const data = await generateLearningPath(subject, progress, settings, sourceContext);
      setPath(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 py-6">
      <div className="bg-white border-2 border-zinc-100 rounded-[40px] p-12 text-center shadow-xl shadow-zinc-100/50 relative overflow-hidden">
        <div className={cn("absolute top-0 right-0 p-20 opacity-5 -mr-10 -mt-10", theme.text)}>
          <MapIcon size={200} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
           <div className={cn("inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4", theme.bgLight, theme.text)}>
              <Rocket size={20} />
              <span className="text-sm font-black uppercase tracking-widest">Parcours d'Apprentissage IA</span>
           </div>
           <h3 className="text-4xl sm:text-5xl font-serif font-bold italic text-zinc-900 leading-tight">
              Une stratégie <span className={cn("italic", theme.text)}>sur-mesure</span> pour votre Bac.
           </h3>
           <p className="text-zinc-500 text-lg leading-relaxed">
              L'IA analyse vos forces et faiblesses actuelles pour structurer votre révision. Obtenez un plan d'action immédiat pour maîtriser <span className="text-zinc-900 font-bold">{subject}</span>.
           </p>
           {!path && (
             <button 
               onClick={handleGenerate}
               disabled={loading}
               className={cn(
                 "group relative px-12 py-6 rounded-[32px] text-white font-black uppercase tracking-[0.2em] text-sm transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto disabled:opacity-50 hover:-translate-y-1 active:scale-95",
                 theme.primary, theme.shadow
               )}
             >
               {loading ? (
                 <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   <span>Analyse de vos connaissances...</span>
                 </>
               ) : (
                 <>
                   <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                   <span>Générer ma Stratégie Bac</span>
                 </>
               )}
             </button>
           )}
        </div>
      </div>

      {path && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="lg:col-span-2 space-y-10">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] px-4">Étapes Cruciales du Parcours</h4>
            <div className="relative space-y-6">
              <div className="absolute left-8 top-12 bottom-12 w-1 bg-zinc-100 rounded-full" />
              {path.steps.map((step: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className={cn(
                    "relative pl-20 group transition-all",
                    i === 0 ? "scale-105" : "opacity-80 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white transition-all z-10",
                    i === 0 ? theme.primary : "bg-zinc-200"
                  )} />
                  <div className="bg-white border border-zinc-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all group-hover:border-zinc-200 text-left">
                    <div className="flex justify-between items-start mb-4">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg", theme.bgLight, theme.text)}>
                         Priorité {i + 1}
                      </span>
                      <ChevronRight className="text-zinc-300" size={20} />
                    </div>
                    <h5 className="text-xl font-bold text-zinc-900 mb-3">{step.title}</h5>
                    <p className="text-zinc-500 text-sm leading-relaxed">{step.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                       {step.topics?.map((t: string) => (
                         <span key={t} className="px-3 py-1 bg-zinc-50 text-[10px] font-bold text-zinc-400 rounded-lg border border-zinc-100 italic">#{t}</span>
                       ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
             <div className="bg-zinc-900 rounded-[40px] p-8 text-white relative overflow-hidden text-left">
                <div className="absolute -bottom-10 -right-10 opacity-10">
                   <Target size={160} />
                </div>
                <h4 className="text-sm font-bold flex items-center gap-2 mb-8 uppercase tracking-widest relative z-10">
                   <Target size={18} className="text-emerald-500" /> Focus Requis
                </h4>
                <div className="space-y-6 relative z-10">
                   {path.focusPoints?.map((p: string, i: number) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 shrink-0 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs">
                          {i + 1}
                        </div>
                        <p className="text-sm text-zinc-300 font-medium leading-relaxed">{p}</p>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-white border border-zinc-100 rounded-[40px] p-8 shadow-sm flex flex-col gap-6 text-left">
                <div className="flex items-center gap-4">
                   <div className={cn("p-4 rounded-2xl", theme.bgLight, theme.text)}>
                      <BrainCircuit size={24} />
                   </div>
                   <h4 className="font-bold text-zinc-900 leading-tight">Conseils de Révisions Rapides</h4>
                </div>
                <div className="space-y-4">
                   {path.quickTips?.map((tip: string, i: number) => (
                     <div key={i} className="flex gap-3 text-xs text-zinc-500 leading-relaxed font-medium p-4 bg-zinc-50/50 rounded-2xl">
                        <Zap size={14} className={cn("shrink-0", theme.text)} />
                        {tip}
                     </div>
                   ))}
                </div>
                <button 
                  onClick={handleGenerate}
                  className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-4"
                >
                  Régénérer le Parcours
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
