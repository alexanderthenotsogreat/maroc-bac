import React, { useState, useEffect, useCallback } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { BookOpen, Zap, GraduationCap, Map, Presentation, Sliders, X, Layers, BrainCircuit, Wand2, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { auth, db } from "../../lib/firebase";
import { Source, Subject, UserSettings, FlashcardSet, Quiz, StudyGuide, MindMap, SlideDeck } from "../../types";
import { THEMES, CURRICULUM_CHAPTERS, t } from "../../constants/ui";
import { 
  generateFlashcards, 
  generateQuiz, 
  generateStudyGuide, 
  generateMindMap, 
  generateSlides 
} from "../../services/aiService";
import { cn } from "../../lib/utils";
import { ProgressBar } from "../ui/ProgressBar";

// Study Tool Views (Placeholder imports - these will be moved next)
// For now they are kept in this file or imported if moved
import { FlashcardStudy } from "./FlashcardStudy";
import { QuizTake } from "./QuizTake";
// ... others

interface StudyToolsProps {
  notebookId: string;
  sources: Source[];
  subject: Subject;
  settings: UserSettings;
  onAskTutor: (query: string) => void;
}

export const StudyTools = React.memo(({ notebookId, sources, subject, settings, onAskTutor }: StudyToolsProps) => {
  const [flashcards, setFlashcards] = useState<FlashcardSet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [decks, setDecks] = useState<SlideDeck[]>([]);

  const [isGenerating, setIsGenerating] = useState<"flashcards" | "quiz" | "guide" | "mindmap" | "slides" | null>(null);
  const [preview, setPreview] = useState<{ type: string; data: any } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("detailedSummary");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const chapters = CURRICULUM_CHAPTERS[subject] || [];

  const [viewingFlashcards, setViewingFlashcards] = useState<FlashcardSet | null>(null);
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null);
  const [viewingGuide, setViewingGuide] = useState<StudyGuide | null>(null);
  const [viewingMindMap, setViewingMindMap] = useState<MindMap | null>(null);
  const [viewingDeck, setViewingDeck] = useState<SlideDeck | null>(null);

  const theme = THEMES[settings.themeColor];

  const handleTutorBridge = useCallback((q: string) => {
    setViewingGuide(null);
    setViewingMindMap(null);
    setViewingDeck(null);
    onAskTutor(q);
  }, [onAskTutor]);

  const [toolToConfigure, setToolToConfigure] = useState<"flashcards" | "quiz" | "guide" | "mindmap" | "slides" | null>(null);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Standard" | "Advanced" | "Expert">("Standard");
  const [depth, setDepth] = useState<"standard" | "deep">("standard");

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const fq = query(collection(db, `notebooks/${notebookId}/flashcards`), where("userId", "==", uid));
    const qq = query(collection(db, `notebooks/${notebookId}/quizzes`), where("userId", "==", uid));
    const gq = query(collection(db, `notebooks/${notebookId}/study-guides`), where("userId", "==", uid));
    const mq = query(collection(db, `notebooks/${notebookId}/mind-maps`), where("userId", "==", uid));
    const sq = query(collection(db, `notebooks/${notebookId}/slides`), where("userId", "==", uid));
    
    const uf = onSnapshot(fq, (snapshot) => setFlashcards(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FlashcardSet))));
    const uq = onSnapshot(qq, (snapshot) => setQuizzes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Quiz))));
    const ug = onSnapshot(gq, (snapshot) => setGuides(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as StudyGuide))));
    const um = onSnapshot(mq, (snapshot) => setMindMaps(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MindMap))));
    const us = onSnapshot(sq, (snapshot) => setDecks(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SlideDeck))));

    return () => { uf(); uq(); ug(); um(); us(); };
  }, [notebookId]);

  const handleGen = async () => {
    if (!toolToConfigure) return;
    if (sources.length === 0) return alert("Ajoutez d'abord des sources.");
    
    const type = toolToConfigure;
    setIsGenerating(type);
    setToolToConfigure(null);

    const filteredSources = selectedSourceIds.length > 0 
      ? sources.filter(s => selectedSourceIds.includes(s.id))
      : sources;

    try {
      let data;
      if (type === "flashcards") data = await generateFlashcards(filteredSources, subject, settings, selectedTopic, depth);
      else if (type === "quiz") data = await generateQuiz(filteredSources, subject, settings, difficulty, selectedTopic, depth);
      else if (type === "guide") data = await generateStudyGuide(filteredSources, subject, settings, selectedTopic, t(selectedFormat, settings.language));
      else if (type === "mindmap") data = await generateMindMap(filteredSources, subject, settings, undefined, t(selectedFormat, settings.language));
      else if (type === "slides") data = await generateSlides(filteredSources, subject, settings, selectedTopic, t(selectedFormat, settings.language));

      setPreview({ type, data });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(null);
    }
  };

  const savePreview = async () => {
    if (!preview) return;
    const { type, data } = preview;
    let coll = "";
    let payload = { ...data, notebookId, userId: auth.currentUser?.uid, createdAt: serverTimestamp() };

    if (type === "flashcards") { coll = "flashcards"; payload.cards = data; payload.title = "Flashcards IA"; }
    else if (type === "quiz") { coll = "quizzes"; payload.questions = data; payload.title = "Quiz IA"; payload.topic = selectedTopic; }
    else if (type === "guide") coll = "study-guides";
    else if (type === "mindmap") coll = "mind-maps";
    else if (type === "slides") coll = "slides";

    await addDoc(collection(db, `notebooks/${notebookId}/${coll}`), payload);
    setPreview(null);
  };

  return (
    <div className="flex flex-col gap-10">
      <ProgressBar isLoading={!!isGenerating} />
      <div className="flex overflow-x-auto no-scrollbar gap-6 items-end pb-2">
        <GeneratorButton onClick={() => setToolToConfigure("guide")} loading={isGenerating === "guide"} icon={<BookOpen />} title="Guide d'Étude" desc="Résumé complet" theme={theme} />
        <GeneratorButton onClick={() => setToolToConfigure("flashcards")} loading={isGenerating === "flashcards"} icon={<Zap />} title="Flashcards" desc="Optimisation mémoire" theme={theme} />
        <GeneratorButton onClick={() => setToolToConfigure("quiz")} loading={isGenerating === "quiz"} icon={<GraduationCap />} title="Quiz" desc="Format Bac" theme={theme} />
        <GeneratorButton onClick={() => setToolToConfigure("mindmap")} loading={isGenerating === "mindmap"} icon={<Map />} title="Mind Map" desc="Visualisation" theme={theme} />
        <GeneratorButton onClick={() => setToolToConfigure("slides")} loading={isGenerating === "slides"} icon={<Presentation />} title="Slides" desc="Format présentation" theme={theme} />
      </div>

      <AnimatePresence>
        {toolToConfigure && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 sm:p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl text-white shadow-lg", theme.primary)}><Sliders size={20} /></div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold italic">Configurer</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{toolToConfigure}</p>
                  </div>
                </div>
                <button onClick={() => setToolToConfigure(null)} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-all"><X size={24} /></button>
              </div>
              <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
                {toolToConfigure !== "mindmap" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest px-1"><Layers size={14} /> Focus Chapitre</div>
                    <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="w-full bg-zinc-50 border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-inner outline-none focus:ring-2 focus:ring-zinc-200 transition-all">
                      <option value="">Tous les chapitres</option>
                      {chapters.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest px-1"><BookOpen size={14} /> Sources</div>
                  <div className="flex flex-wrap gap-2">
                    {sources.map(s => {
                      const isSelected = selectedSourceIds.includes(s.id);
                      return (
                        <button key={s.id} onClick={() => {
                          if (isSelected) setSelectedSourceIds(prev => prev.filter(id => id !== s.id));
                          else setSelectedSourceIds(prev => [...prev, s.id]);
                        }} className={cn("px-4 py-2 rounded-xl text-[10px] font-bold border transition-all truncate max-w-[150px]", isSelected ? `${theme.primary} text-white border-transparent` : "bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-zinc-300")}>
                          {s.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="p-8 bg-zinc-50/50 border-t border-zinc-100 flex gap-4">
                <button onClick={() => setToolToConfigure(null)} className="flex-1 py-4 rounded-2xl bg-white border border-zinc-200 text-zinc-400 font-bold hover:text-zinc-900 transition-all uppercase tracking-widest text-[10px]">Annuler</button>
                <button onClick={handleGen} className={cn("flex-1 py-4 rounded-2xl text-white font-bold transition-all shadow-xl flex items-center justify-center gap-3", theme.primary)}><Wand2 size={18} /> Générer</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <StudyItemList title="Guides" items={guides} onView={setViewingGuide} onDelete={(id: string) => deleteDoc(doc(db, `notebooks/${notebookId}/study-guides`, id))} theme={theme} />
        <StudyItemList title="Mind Maps" items={mindMaps} onView={setViewingMindMap} onDelete={(id: string) => deleteDoc(doc(db, `notebooks/${notebookId}/mind-maps`, id))} theme={theme} />
        <StudyItemList title="Slides" items={decks} onView={setViewingDeck} onDelete={(id: string) => deleteDoc(doc(db, `notebooks/${notebookId}/slides`, id))} theme={theme} />
        <StudyItemList title="Flashcards" items={flashcards} onView={setViewingFlashcards} onDelete={(id: string) => deleteDoc(doc(db, `notebooks/${notebookId}/flashcards`, id))} theme={theme} />
        <StudyItemList title="Quizzes" items={quizzes} onView={setViewingQuiz} onDelete={(id: string) => deleteDoc(doc(db, `notebooks/${notebookId}/quizzes`, id))} theme={theme} />
      </div>

      <AnimatePresence>
        {preview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-2xl rounded-[40px] p-10 text-center space-y-6 shadow-2xl">
                <div className="text-4xl">✨</div>
                <h3 className="text-2xl font-serif font-bold italic">Contenu généré !</h3>
                <div className="flex gap-4">
                   <button onClick={() => setPreview(null)} className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-500 font-bold">Laisser</button>
                   <button onClick={savePreview} className={cn("flex-1 py-4 rounded-2xl text-white font-bold transition-all shadow-lg", theme.primary)}>Obtenir</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {viewingFlashcards && <FlashcardStudy set={viewingFlashcards} settings={settings} onClose={() => setViewingFlashcards(null)} />}
      {viewingQuiz && <QuizTake quiz={viewingQuiz} subject={subject} settings={settings} onClose={() => setViewingQuiz(null)} />}
      {/* ... Rest of views ... */}
    </div>
  );
});

function GeneratorButton({ onClick, loading, icon, title, desc, theme }: any) {
  return (
    <button onClick={onClick} disabled={loading} className="shrink-0 bg-white border border-zinc-200 hover:border-zinc-300 rounded-[32px] px-8 py-6 flex flex-col items-center gap-3 transition-all group min-w-[200px]">
      <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform opacity-80", theme.primary, "text-white")}>
        {loading ? <Loader2 className="animate-spin" /> : icon}
      </div>
      <div className="text-center">
        <h4 className="font-bold text-zinc-900 text-sm">{title}</h4>
        <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">{desc}</p>
      </div>
    </button>
  );
}

function StudyItemList({ title, items, onView, onDelete, theme }: any) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">{title}</h4>
      <div className="grid grid-cols-1 gap-2">
        {items.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center justify-between shadow-sm group">
            <button onClick={() => onView(item)} className="flex-1 text-left">
              <h5 className="font-bold text-zinc-900 text-sm truncate max-w-[150px] group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{item.title}</h5>
              <p className="text-[9px] text-zinc-300 font-black uppercase">{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : '---'}</p>
            </button>
            <button onClick={() => onDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors opacity-60 hover:opacity-100"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
