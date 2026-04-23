import React from "react";
import { BookOpen, FileSearch, Plus } from "lucide-react";
import { motion } from "motion/react";
import { UserSettings, Subject } from "../../types";
import { THEMES, CURRICULUM_CHAPTERS, t, getCurriculumChapters } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface CurriculumViewProps {
  subject: Subject;
  settings: UserSettings;
  onQuickAdd: (q: string) => void;
  onFindExams: () => void;
}

export function CurriculumView({ subject, settings, onQuickAdd, onFindExams }: CurriculumViewProps) {
  const chapters = getCurriculumChapters(subject, settings.branch);
  const theme = THEMES[settings.themeColor];

  return (
    <div className="space-y-8">
      <div className="bg-white border border-zinc-200 rounded-[40px] p-10 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
           <div>
              <h3 className="text-2xl font-serif font-bold italic text-zinc-900">{t('officialCurriculum', settings.language)}</h3>
              <p className="text-zinc-500 text-sm mt-1">{subject} • Baccalauréat National</p>
           </div>
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <button 
                onClick={onFindExams}
                className={cn("flex-1 sm:flex-none px-6 py-3 rounded-2xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest", theme.primary)}
             >
                <FileSearch size={16} /> Find BAC Exams
             </button>
             <div className={cn("p-4 rounded-3xl hidden sm:block", theme.bgLight, theme.text)}>
                <BookOpen size={32} />
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((chapter, i) => (
            <motion.div 
              key={chapter}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-6 rounded-3xl border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400">
                    {i + 1}
                 </div>
                 <span className="font-bold text-zinc-900 text-sm">{chapter}</span>
              </div>
              <button 
                onClick={() => onQuickAdd(chapter)}
                className={cn("p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest", theme.text, "hover:bg-zinc-100")}
              >
                <Plus size={14} /> {t('quickAdd', settings.language)}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
