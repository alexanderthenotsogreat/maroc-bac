import React, { useState, useEffect } from "react";
import { query, collection, where, orderBy, limit, onSnapshot, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { Zap, GraduationCap, ImageIcon, Trash2, Wand2, History, Clock, TrendingUp, Plus, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { User } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { Notebook, UserSettings, Subject, Source, CorrectionResult } from "../../types";
import { THEMES, SUBJECTS, getBranchSubjects, t } from "../../constants/ui";
import { analyzeCorrection } from "../../services/aiService";
import { cn, compressImage } from "../../lib/utils";
import { ProgressBar } from "../ui/ProgressBar";

interface BacCorrectorProps {
  settings: UserSettings;
  user: User | null;
  notebooks: Notebook[];
}

export function BacCorrector({ settings, user, notebooks }: BacCorrectorProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [matiere, setMatiere] = useState<Subject>("Mathematics");
  const [history, setHistory] = useState<CorrectionResult[]>([]);
  const theme = THEMES[settings.themeColor];

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "corrections"), 
      where("userId", "==", user.uid),
      where("subject", "==", matiere),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() } as CorrectionResult)));
    });
    return () => unsubscribe();
  }, [user, matiere]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setLoading(true);

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
       const file = files[i];
       const reader = new FileReader();
       const base64 = await new Promise<string>((resolve) => {
         reader.onload = (event) => resolve(event.target?.result as string);
         reader.readAsDataURL(file);
       });
       const compressed = await compressImage(base64);
       newImages.push(compressed);
    }
    setImages(prev => [...prev, ...newImages]);
    setLoading(false);
  };

  const handleCorrect = async () => {
    if (images.length === 0 || !user) return;
    setLoading(true);
    try {
      const subjectNotebooks = notebooks.filter(nb => nb.subject === matiere);
      const allSources: Source[] = [];
      
      for (const nb of subjectNotebooks) {
        const snap = await getDocs(query(collection(db, `notebooks/${nb.id}/sources`), where("userId", "==", user.uid)));
        allSources.push(...snap.docs.map(d => ({ id: d.id, ...d.data() } as Source)));
      }

      const historySummaries = history.map(h => `- ${new Date(h.createdAt?.toDate()).toLocaleDateString()}: Core score ${h.score}/20.`);

      const base64Datas = images.map(img => img.split(",")[1]);
      const result = await analyzeCorrection(base64Datas, matiere, settings, allSources, historySummaries);
      
      setCorrection(result || "Désolé, je n'ai pas pu analyser ces images.");

      const scoreMatch = result.match(/(\d{1,2}([,.]\d{1,2})?)\/20/);
      const score = scoreMatch ? parseFloat(scoreMatch[1].replace(",", ".")) : 10;
      
      await addDoc(collection(db, "corrections"), {
        userId: user.uid,
        subject: matiere,
        images: images,
        analysis: result,
        score: score,
        weakPoints: [], 
        createdAt: serverTimestamp()
      });

    } catch (err) {
      console.error(err);
      setCorrection("Une erreur est survenue lors de l'analyse. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <ProgressBar isLoading={loading} />
      <div className="bg-white border border-zinc-200 rounded-[40px] p-6 sm:p-12 shadow-xl shadow-zinc-200/20 relative overflow-hidden">
        <div className={cn("absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 -mr-20 -mt-20 rounded-full", theme.primary)} />
        <div className={cn("absolute bottom-0 left-0 w-64 h-64 blur-[100px] opacity-10 -ml-20 -mb-20 rounded-full", theme.primary)} />
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-16 relative z-10">
          <div className="max-w-2xl">
            <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6", theme.bgLight, theme.text)}>
              <Zap size={16} fill="currentColor" />
              <span className="text-xs font-black uppercase tracking-tighter">Correcteur National IA Multipage</span>
            </div>
            <h3 className="text-4xl sm:text-5xl font-serif font-bold text-zinc-900 tracking-tight leading-none">
              Expertise <span className={cn("italic", theme.text)}>Multimodale</span>.
            </h3>
            <p className="text-zinc-500 text-lg mt-6 leading-relaxed">
              Sélectionnez <span className="text-zinc-900 font-bold">plusieurs photos</span> de votre copie ou examen blanc. L'IA analyse l'ensemble de votre production pour un diagnostic global précis.
            </p>
          </div>
          
          <div className="p-8 bg-zinc-50 rounded-[40px] border border-zinc-100 w-full lg:w-auto min-w-[320px]">
             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 block">Discipline d'Analyse</label>
             <div className="flex flex-col gap-4">
                <select 
                  value={matiere} 
                  onChange={(e) => setMatiere(e.target.value as Subject)}
                  className={cn("bg-white border-none rounded-3xl px-8 py-5 text-lg font-bold shadow-sm outline-none transition-all", theme.ring)}
                >
                  {getBranchSubjects(settings.branch).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
               <div className="flex items-center gap-3 px-2">
                 <div className="flex -space-x-3">
                   {history.slice(0, 3).map((h, i) => (
                     <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                        {Math.round(h.score)}
                     </div>
                   ))}
                 </div>
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                   {history.length > 0 ? `${history.length} diagnostics stockés` : "Aucun historique"}
                 </span>
               </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div 
              className={cn(
                "aspect-[4/3] sm:aspect-[4/5] rounded-[48px] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all overflow-hidden relative group",
                images.length > 0 ? "border-zinc-200" : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50/50"
              )}
            >
              {images.length > 0 ? (
                <div className="w-full h-full p-6 grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar">
                  {images.map((img, i) => (
                    <div key={i} className="group/item relative aspect-[3/4] bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-200">
                      <img src={img} alt={`Page ${i+1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-all">
                        <button 
                          onClick={() => removeImage(i)}
                          className="bg-white text-red-500 p-3 rounded-full hover:scale-110 transition-transform"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        P.{i+1}
                      </div>
                    </div>
                  ))}
                  <label className="aspect-[3/4] border-2 border-dashed border-zinc-300 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 cursor-pointer transition-colors group/add">
                    <div className="p-3 bg-white rounded-full shadow-lg group-hover/add:scale-110 transition-transform">
                      <Plus size={20} className={theme.text} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ajouter une page</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </label>
                </div>
              ) : (
                <>
                  <div className={cn("p-10 rounded-full bg-white shadow-2xl", theme.text)}>
                    <ImageIcon size={64} strokeWidth={1.5} />
                  </div>
                  <div className="text-center px-10">
                    <p className="text-xl font-serif font-bold text-zinc-900">Importez vos copies</p>
                    <p className="text-sm text-zinc-400 mt-2">Cliquez pour accéder à votre galerie ou caméra</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  />
                </>
              )}
              {loading && images.length === 0 && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                   <Loader2 className={cn("animate-spin", theme.text)} size={48} />
                </div>
              )}
            </div>
            
            <button 
              onClick={handleCorrect}
              disabled={images.length === 0 || loading}
              className={cn(
                "w-full py-8 rounded-[32px] text-white font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-4 group",
                theme.primary, theme.shadow, "disabled:opacity-50 disabled:grayscale hover:-translate-y-1 active:scale-[0.98]"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Compression & Analyse en cours...</span>
                </>
              ) : (
                <>
                  <div className="p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform">
                    <Wand2 size={24} />
                  </div>
                  <span>Lancer l'Expertise Global ({images.length} pages)</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col">
             <div className="flex items-center justify-between px-4 mb-8">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-3">
                   <div className={cn("w-2 h-2 rounded-full", theme.primary)} />
                   Rapport d'Expertise
                </h4>
                {correction && (
                  <button 
                    onClick={() => setStepByStepMode(!stepByStepMode)}
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all",
                      stepByStepMode ? `${theme.primary} text-white shadow-md` : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                    )}
                  >
                    {stepByStepMode ? "Mode Normal" : "Mode Pas à Pas"}
                  </button>
                )}
             </div>

             <div className={cn(
               "flex-1 min-h-[400px] sm:min-h-[600px] max-h-[800px] rounded-[48px] border-2 border-zinc-100 bg-white p-6 sm:p-10 overflow-y-auto no-scrollbar shadow-inner relative group",
               !correction && "flex flex-col items-center justify-center text-center px-8 sm:px-16 bg-zinc-50/30"
             )}>
                {correction ? (
                  <div className={cn("markdown-body prose prose-zinc prose-lg max-w-none transition-all", stepByStepMode ? "prose-h3:text-indigo-600" : "")}>
                    <Markdown>{correction}</Markdown>
                  </div>
                ) : (
                  <div className="space-y-8 max-w-sm">
                    <div className="relative">
                      <div className={cn("w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto text-zinc-200 group-hover:scale-110 transition-transform duration-500")}>
                        <History size={40} />
                      </div>
                      <div className={cn("absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-white", theme.primary)}>
                        <Clock size={16} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-serif font-bold text-zinc-900">En attente d'Analyse</p>
                      <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
                        Le système attend l'importation de votre brouillon pour lancer le moteur de correction national.
                      </p>
                    </div>
                  </div>
                )}
             </div>
             
             {correction && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-8 p-6 sm:p-10 bg-zinc-900 rounded-[48px] flex flex-col sm:flex-row items-center gap-8 text-white relative overflow-hidden group"
               >
                  <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all group-hover:scale-150", theme.primary)} />
                  <div className="p-6 bg-white/10 rounded-[32px] backdrop-blur-md shadow-2xl">
                    <TrendingUp size={32} className={theme.text} />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-2xl tracking-tight">Suggestions d'Examens</h5>
                    <p className="text-zinc-400 text-sm mt-2 leading-relaxed max-w-md">
                      L'IA a comparé votre travail aux sessions <span className="text-white font-bold">2018-2023</span>. Consultez le rapport pour voir les examens spécifiques recommandés pour combler vos lacunes.
                    </p>
                  </div>
                  <button className={cn("mt-4 sm:mt-0 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap bg-white text-zinc-900 hover:scale-105 transition-transform")}>
                    Voir sur Moutamadris
                  </button>
               </motion.div>
             )}
          </div>
        </div>
      </div>
      
      {/* Subject History */}
      {history.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-[40px] p-6 sm:p-12 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <h4 className="text-2xl font-serif font-bold italic text-zinc-900">Tableau de Bord des Évaluations</h4>
            <div className="flex gap-2">
               <div className="px-4 py-2 rounded-xl bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                 {matiere}
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((h, i) => (
              <motion.div 
                key={h.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[32px] border border-zinc-100 bg-zinc-50/50 hover:bg-white hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                onClick={() => setCorrection(h.analysis)}
              >
                <div className={cn("absolute top-0 right-0 w-2 h-full opacity-0 group-hover:opacity-100 transition-opacity", theme.primary)} />
                <div className="flex justify-between items-start mb-6">
                   <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                     {h.createdAt ? new Date(h.createdAt.toDate()).toLocaleDateString() : '---'}
                   </div>
                   <div className={cn("px-4 py-1 rounded-full text-xs font-black", h.score >= 15 ? "bg-emerald-100 text-emerald-700" : h.score >= 10 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                     {h.score}/20
                   </div>
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-zinc-200 grayscale group-hover:grayscale-0 transition-all">
                   <img src={h.images?.[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <p className="text-xs text-zinc-600 line-clamp-2 italic leading-relaxed">
                  {h.analysis.substring(0, 100)}...
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
