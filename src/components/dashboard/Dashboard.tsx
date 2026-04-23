import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { query, collection, onSnapshot, where } from "firebase/firestore";
import { BookOpen, GraduationCap, ChevronRight, Zap, Grid, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../../lib/firebase";
import { Notebook, UserSettings, UserProgress, Subject } from "../../types";
import { THEMES, SUBJECTS, t, getBranchSubjects } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface DashboardProps {
  notebooks: Notebook[];
  settings: UserSettings;
  user: User | null;
  onSelectSubject: (s: Subject) => void;
  onDeleteNotebook: (id: string) => void;
}

export const Dashboard = React.memo(({ notebooks, settings, user, onSelectSubject, onDeleteNotebook }: DashboardProps) => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const theme = THEMES[settings.themeColor];
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, `users/${userId}/progress`), where("userId", "==", userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProgress(snapshot.docs.map(d => d.data() as UserProgress));
    });
    return () => unsubscribe();
  }, [userId]);

  const totalMastery = progress.length > 0 
    ? Math.round(progress.reduce((acc, p) => acc + p.masteryLevel, 0) / progress.length)
    : 0;

  const totalSources = notebooks.reduce((acc, nb) => acc + (nb.sourcesCount || 0), 0);
  const isDataSufficient = totalSources >= 2 && progress.some(p => p.totalQuizzesTaken >= 3);
  const personalNotebooks = notebooks.filter(nb => !nb.isOfficial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 pb-20"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-serif font-bold text-zinc-900 leading-tight italic">{t('summary', settings.language)}</h2>
        <p className="text-zinc-500">
          {settings.branch ? `${settings.branch} • ` : ""}
          Suivez votre maîtrise du programme national marocain pour la filière {settings.branch}.
        </p>
      </div>

      {user?.isAnonymous && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn("p-6 rounded-[32px] border flex flex-col sm:flex-row items-center justify-between gap-6", theme.bgLight, "border-emerald-100 shadow-sm shadow-emerald-50")}
        >
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl bg-white shadow-sm", theme.text)}>
              <Zap size={24} fill="currentColor" className="animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-900">Mode Invité Activé</h4>
              <p className="text-sm text-zinc-600">Vos données sont stockées localement. Synchronisez votre compte pour ne jamais perdre votre progression.</p>
            </div>
          </div>
          <button 
            onClick={() => (window as any).upgradeAccount && (window as any).upgradeAccount()}
            className={cn("px-8 py-3 rounded-2xl text-white font-bold text-sm transition-all whitespace-nowrap", theme.primary, theme.shadow)}
          >
            Synchroniser Maintenant
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('notebooks', settings.language)}</span>
          <span className="text-4xl font-serif font-bold text-zinc-900 italic">{notebooks.length}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('mastery', settings.language)} Globale</span>
          <span className={cn("text-4xl font-serif font-bold italic", theme.text)}>
            {isDataSufficient ? `${totalMastery}%` : "---"}
          </span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col gap-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</span>
          <span className="text-xl font-bold text-zinc-900">
            {isDataSufficient ? "En préparation intensive" : t('notEnoughData', settings.language)}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            <Zap size={18} className={theme.text} /> Suggestions pour vous
          </h3>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">Basé sur votre filière</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {getBranchSubjects(settings.branch).slice(0, 4).map(sub => (
            <button 
              key={sub}
              onClick={() => onSelectSubject(sub)}
              className="p-4 bg-white border border-zinc-100 rounded-3xl hover:border-zinc-300 hover:shadow-sm transition-all text-left flex flex-col gap-2 group"
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white opacity-80 group-hover:scale-110 transition-transform", theme.primary)}>
                <BookOpen size={14} />
              </div>
              <div>
                <h5 className="font-bold text-zinc-900 text-[10px] uppercase tracking-tight">{sub}</h5>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Bac {new Date().getFullYear()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-zinc-900 flex items-center gap-2">
            <BookOpen size={18} className={theme.text} /> {t('officialCurriculum', settings.language)}
          </h3>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full">Explorez les matières</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getBranchSubjects(settings.branch).map(subject => {
             const subjectProgress = progress.find(p => p.subject === subject);
             const mastery = subjectProgress ? subjectProgress.masteryLevel : 0;
             return (
               <button 
                key={subject}
                onClick={() => onSelectSubject(subject)}
                className="group bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all text-left flex flex-col justify-between h-48 relative overflow-hidden active:scale-95"
               >
                  <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-10", theme.primary)} />
                  <div className="relative z-10">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", theme.bgLight, theme.text)}>
                      <GraduationCap size={24} />
                    </div>
                    <h4 className="text-xl font-serif font-bold italic text-zinc-900 leading-tight">{subject}</h4>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Programme Officiel</p>
                  </div>
                  
                  <div className="flex justify-between items-end gap-4">
                     <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                           <span>Maîtrise</span>
                           <span>{mastery}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                           <div className={cn("h-full", theme.primary)} style={{ width: `${mastery}%` }} />
                        </div>
                     </div>
                     <div className={cn("p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all", theme.primary)}>
                        <ChevronRight size={16} />
                     </div>
                  </div>
               </button>
             );
          })}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="font-bold text-zinc-900">{t('mastery', settings.language)} par Matière</h3>
          <Zap size={18} className={theme.text} />
        </div>
        <div className="divide-y divide-zinc-100">
          {getBranchSubjects(settings.branch).map(subject => {
            const subjectProgress = progress.find(p => p.subject === subject);
            const mastery = subjectProgress ? subjectProgress.masteryLevel : 0; 
            return (
              <div key={subject} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center opacity-80", theme.primary, "text-white")}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">{subject}</h4>
                    <span className="text-xs text-zinc-500">Baccalauréat Marocain</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-48 h-2 bg-zinc-100 rounded-full overflow-hidden hidden sm:block">
                    <motion.div 
                      key={mastery}
                      initial={{ width: 0 }}
                      animate={{ width: `${mastery}%` }}
                      transition={{ duration: 1 }}
                      className={cn("h-full rounded-full", theme.primary)}
                    />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">{mastery > 0 ? `${mastery}%` : "---"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {personalNotebooks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
               <Grid size={18} className={theme.text} /> Mes Cahiers Personnels
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalNotebooks.map(nb => {
              const date = nb.createdAt?.seconds ? new Date(nb.createdAt.seconds * 1000).toLocaleDateString() : '---';
              const isConfirming = deletingId === nb.id;

              return (
                <div 
                  key={nb.id}
                  className={cn(
                    "group bg-white p-6 rounded-[32px] border border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40 relative overflow-hidden",
                    isConfirming && "ring-2 ring-red-500 border-transparent"
                  )}
                >
                  <AnimatePresence>
                    {isConfirming && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-red-600 flex flex-col items-center justify-center p-4 text-center gap-4"
                      >
                        <p className="text-white text-xs font-black uppercase tracking-widest">Supprimer définitivement ?</p>
                        <div className="flex gap-2 w-full">
                           <button 
                            onClick={() => { onDeleteNotebook(nb.id); setDeletingId(null); }}
                            className="flex-1 py-3 bg-white text-red-600 rounded-2xl font-black text-[10px] uppercase shadow-xl active:scale-95 transition-all"
                           >
                            Oui
                           </button>
                           <button 
                            onClick={() => setDeletingId(null)}
                            className="flex-1 py-3 bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase shadow-inner active:scale-95 transition-all"
                           >
                            Non
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-start">
                      <div 
                        onClick={() => onSelectSubject(nb.subject)} 
                        className="cursor-pointer"
                      >
                        <h4 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{nb.title}</h4>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{nb.subject}</p>
                      </div>
                      <button 
                        onClick={() => setDeletingId(nb.id)}
                        className="p-2 rounded-xl bg-zinc-50 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-100 lg:opacity-40 lg:hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                      <span>{date}</span>
                      <button className={cn("p-2 rounded-lg text-white", theme.primary)} onClick={() => onSelectSubject(nb.subject)}>
                        <ChevronRight size={14} />
                      </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
});
