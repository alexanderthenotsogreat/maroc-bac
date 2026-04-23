import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { query, collection, onSnapshot, where } from "firebase/firestore";
import { GraduationCap, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { Notebook, UserSettings, Source } from "../../types";
import { THEMES, t } from "../../constants/ui";
import { cn } from "../../lib/utils";

// Sub-components
import { Sources } from "./Sources";
import { Chat } from "./Chat";
import { StudyTools } from "./StudyTools";
import { AnalyticsView } from "./AnalyticsView";
import { CurriculumView } from "./CurriculumView";
import { BacExamRecommender } from "../bac/BacExamRecommender";
import { LearningPathView } from "../tools/LearningPathView";

interface NotebookDetailProps {
  notebook: Notebook;
  user: User | null;
  settings: UserSettings;
  onDelete: (id: string) => void;
}

export const NotebookDetail = React.memo(({ notebook, user, settings, onDelete }: NotebookDetailProps) => {
  type Tab = "sources" | "chat" | "tools" | "performance" | "analytics" | "curriculum" | "exams";
  const [activeTab, setActiveTab] = useState<Tab>("sources");
  const [initialChatQuery, setInitialChatQuery] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const theme = THEMES[settings.themeColor];
  const [initialBrowseQuery, setInitialBrowseQuery] = useState("");

  const handleAskTutor = useCallback((query: string) => {
    setInitialChatQuery(query);
    setActiveTab("chat");
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `notebooks/${notebook.id}/sources`),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSources(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Source)));
    });
    return () => unsubscribe();
  }, [notebook.id, user]);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-20">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 text-left">
          <div className={cn("flex items-center gap-2 font-medium text-sm", theme.text)}>
            <GraduationCap size={16} /> {notebook.subject}
          </div>
          <h2 className="text-4xl font-serif font-bold text-zinc-900 leading-tight italic">{notebook.title}</h2>
        </div>
        {!notebook.isOfficial && (
          <div className="flex items-center gap-2">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 bg-red-50 p-2 rounded-2xl border border-red-100 animate-in fade-in zoom-in duration-200">
                <p className="text-[10px] font-black text-red-600 px-2">CONFIRMER ?</p>
                <button 
                  onClick={() => onDelete(notebook.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase shadow-sm hover:bg-red-600 transition-all"
                >
                  OUI
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-white text-zinc-400 border border-zinc-200 rounded-xl text-[10px] font-bold uppercase hover:bg-zinc-50 transition-all"
                >
                  NON
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-xs uppercase tracking-widest"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-200 overflow-x-auto no-scrollbar px-2 sm:px-0">
        {(["sources", "chat", "tools", "performance", "analytics", "curriculum", "exams"] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-4 text-sm font-semibold capitalize transition-all relative whitespace-nowrap",
              activeTab === tab ? theme.text : "text-zinc-400 hover:text-zinc-600"
            )}
          >
            {t(tab, settings.language)}
            {activeTab === tab && (
              <motion.div layoutId="tab" className={cn("absolute bottom-0 left-0 right-0 h-0.5", theme.primary)} />
            )}
          </button>
        ))}
      </div>

      <div className="py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "sources" && (
              <Sources 
                notebookId={notebook.id} 
                subject={notebook.subject}
                sources={sources} 
                settings={settings}
                initialBrowseQuery={initialBrowseQuery}
                onConsumedQuery={() => setInitialBrowseQuery("")}
              />
            )}

            {activeTab === "chat" && (
              <Chat 
                sources={sources} 
                subject={notebook.subject} 
                settings={settings} 
                initialQuery={initialChatQuery}
                onQueryConsumed={() => setInitialChatQuery("")}
              />
            )}
            {activeTab === "tools" && (
              <StudyTools 
                notebookId={notebook.id} 
                sources={sources} 
                subject={notebook.subject} 
                settings={settings} 
                onAskTutor={handleAskTutor}
              />
            )}
            {activeTab === "performance" && <LearningPathView sources={sources} subject={notebook.subject} settings={settings} />}
            {activeTab === "analytics" && (
              <AnalyticsView 
                notebookId={notebook.id} 
                subject={notebook.subject} 
                settings={settings} 
                sourcesCount={sources.length} 
                onBrowseChapter={(q) => {
                  setInitialBrowseQuery(q);
                  setActiveTab("sources");
                }}
              />
            )}
            {activeTab === "curriculum" && (
              <CurriculumView 
                subject={notebook.subject} 
                settings={settings} 
                onQuickAdd={(q) => {
                  setInitialBrowseQuery(q);
                  setActiveTab("sources");
                }}
                onFindExams={() => setActiveTab("exams")}
              />
            )}
            {activeTab === "exams" && (
              <BacExamRecommender 
                notebook={notebook}
                settings={settings}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
});
