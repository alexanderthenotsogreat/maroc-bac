import React, { useState, useCallback, useMemo } from "react";
import { Search, Filter, BookOpen, GraduationCap, ChevronRight, FileSearch, Trash2, Zap, Bookmark, FileDown, Award, RefreshCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Notebook, UserSettings, BacExam, BacRecommendation } from "../../types";
import { THEMES, t, BRANCHES } from "../../constants/ui";
import { BAC_EXAMS } from "../../constants/bacExams";
import { cn } from "../../lib/utils";
import { ProgressBar } from "../ui/ProgressBar";

interface BacExamRecommenderProps {
  notebook: Notebook;
  settings: UserSettings;
}

export function BacExamRecommender({ notebook, settings }: BacExamRecommenderProps) {
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<BacRecommendation[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [sessionFilter, setSessionFilter] = useState<string>("All");
  const [isDownloading, setIsDownloading] = useState(false);
  const theme = THEMES[settings.themeColor];

  const chapters = useMemo(() => {
    const allExams = BAC_EXAMS.filter(e => e.subject === notebook.subject);
    const uniqueChapters = new Set<string>();
    allExams.forEach(e => e.chapters.forEach(c => uniqueChapters.add(c)));
    return Array.from(uniqueChapters).sort();
  }, [notebook.subject]);

  const toggleChapter = (chapter: string) => {
    setSelectedChapters(prev => 
      prev.includes(chapter) 
        ? prev.filter(c => c !== chapter)
        : [...prev, chapter]
    );
  };

  const findExams = useCallback(() => {
    const eligibleExams = BAC_EXAMS.filter(exam => {
      if (exam.subject !== notebook.subject) return false;
      
      if (branchFilter !== "All") {
        const examBranch = exam.branch;
        // Handle flexible matching (e.g. "Toutes Branches" matches everything)
        if (examBranch === "Toutes Branches") return true;
        
        // Check if the selected filter is contained within the exam branch tag (e.g. "Lettres" vs "Lettres / Sciences Humaines")
        // or vice-versa to handle combined labels in the mock data
        const isMatch = examBranch.includes(branchFilter) || 
                        branchFilter.includes(examBranch) ||
                        (branchFilter.includes("Mathématiques") && examBranch.includes("Mathématics")) || // Handle mixed lang
                        (branchFilter === "Sciences Physiques et Chimiques (PC)" && examBranch.includes("Physiques")) ||
                        (branchFilter === "Sciences de la Vie et de la Terre (SVT)" && examBranch.includes("SVT"));
        
        if (!isMatch) return false;
      }
      
      if (yearFilter !== "All" && exam.year.toString() !== yearFilter) return false;
      if (sessionFilter !== "All" && exam.session !== sessionFilter) return false;
      return true;
    });

    const results: BacRecommendation[] = eligibleExams.map(exam => {
      const matched = exam.chapters.filter(c => selectedChapters.includes(c));
      const matchRate = selectedChapters.length > 0 ? matched.length / selectedChapters.length : 0;
      return { exam, matchedChapters: matched, matchRate, matchCount: matched.length };
    });

    const sortedResults = results
      .filter(r => r.matchedChapters.length > 0 || selectedChapters.length === 0)
      .sort((a, b) => b.matchRate - a.matchRate);

    setRecommendations(sortedResults);
  }, [notebook.subject, selectedChapters, branchFilter, yearFilter, sessionFilter]);

  const branches = useMemo(() => ["All", ...BRANCHES], []);
  const years = useMemo(() => ["All", ...new Set(BAC_EXAMS.filter(e => e.subject === notebook.subject).map(e => e.year.toString()))].sort((a, b) => b.localeCompare(a)), [notebook.subject]);
  const sessions = ["All", "Normal", "Rattrapage"];

  const handleDownload = async (url: string, filename: string) => {
    setIsDownloading(true);
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const endpoint = `${baseUrl}/api/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Download failed");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || "Erreur lors du téléchargement.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-10">
      <ProgressBar isLoading={isDownloading} />
      <div className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm">
        <h3 className="text-2xl font-serif font-bold italic text-zinc-900 mb-6">Filtre d'Analyse BAC</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Sujet</label>
            <div className={cn("px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 font-bold text-xs", theme.text)}>
              {notebook.subject}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Filière</label>
            <select 
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 font-bold text-xs focus:ring-2 focus:ring-zinc-200 outline-none"
            >
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Année</label>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 font-bold text-xs focus:ring-2 focus:ring-zinc-200 outline-none"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Session</label>
            <select 
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 font-bold text-xs focus:ring-2 focus:ring-zinc-200 outline-none"
            >
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={findExams}
              className={cn("w-full py-3 rounded-2xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest", theme.primary)}
            >
              <Search size={16} /> Analyser
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Chapitres visés (Optionnel)</label>
          <div className="flex flex-wrap gap-2">
            {chapters.map(chapter => (
              <button 
                key={chapter}
                onClick={() => toggleChapter(chapter)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border",
                  selectedChapters.includes(chapter) 
                    ? `${theme.primary} text-white border-transparent shadow-md` 
                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                )}
              >
                {chapter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.length > 0 ? (
          recommendations.map((rec, i) => (
            <motion.div 
              key={rec.exam.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-zinc-200 rounded-[40px] p-8 shadow-sm flex flex-col gap-6 relative group hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              {rec.matchRate === 1 && selectedChapters.length > 0 && (
                <div className="absolute -top-3 -right-3 bg-amber-400 text-white p-2 rounded-full shadow-lg z-10 animate-bounce">
                  <Award size={14} /> Best Match
                </div>
              )}
              
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white", theme.primary)}>
                      {rec.exam.session === "Normal" ? "Session Normale" : "Rattrapage"}
                    </span>
                    <span className="text-zinc-300 text-[9px]">•</span>
                    <span className="text-zinc-500 text-[10px] font-bold">{rec.exam.year}</span>
                  </div>
                  <h4 className="text-2xl font-serif font-bold text-zinc-900 group-hover:italic transition-all leading-tight">Bac National {rec.exam.year}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={cn("px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-600 border border-zinc-200")}>
                      {rec.exam.branch}
                    </div>
                  </div>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase shrink-0", 
                  rec.exam.difficulty === 'Easy' ? "bg-emerald-50 text-emerald-600" :
                  rec.exam.difficulty === 'Medium' ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                )}>
                  {rec.exam.difficulty}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Chapitres Correspondants</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.matchedChapters.map(c => (
                      <span key={c} className={cn("px-3 py-1 rounded-lg text-[10px] font-bold border", theme.bgLight, theme.text, theme.border)}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3 border-t border-zinc-50 mt-auto">
                <button 
                  onClick={() => handleDownload(rec.exam.pdfUrl, `Bac-${rec.exam.subject}-${rec.exam.year}-${rec.exam.session}.pdf`)}
                  disabled={isDownloading}
                  className={cn("flex-1 py-3 my-1 rounded-2xl text-white text-xs font-bold text-center transition-all shadow-lg flex items-center justify-center gap-2", theme.primary, isDownloading && "opacity-50")}
                >
                  {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
                  {isDownloading ? "Traitement..." : "Télécharger l'Examen"}
                </button>
                <button className="p-3 my-1 rounded-2xl bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all border border-zinc-100">
                  <Bookmark size={16} />
                </button>
              </div>
            </motion.div>
          ))
        ) : selectedChapters.length > 0 && recommendations.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="text-6xl grayscale opacity-20">🔍</div>
             <p className="text-zinc-400 font-medium">Aucun examen ne correspond exactly à cette filière, année ou session.</p>
             <button onClick={() => { setSelectedChapters([]); setRecommendations([]); setBranchFilter('All'); setYearFilter('All'); setSessionFilter('All'); }} className="text-sm font-bold text-zinc-900 underline underline-offset-4">Réinitialiser tous les filtres</button>
          </div>
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px]">
            <p className="text-zinc-300 font-serif italic text-lg">Choisissez des chapitres pour voir les examens disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
