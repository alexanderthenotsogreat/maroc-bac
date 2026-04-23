import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInAnonymously,
  linkWithPopup,
  signOut, 
  GoogleAuthProvider,
  User 
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  serverTimestamp,
  setDoc,
  deleteDoc,
  orderBy,
  type Unsubscribe 
} from "firebase/firestore";
import { 
  Plus, 
  GraduationCap, 
  LogOut, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "./lib/firebase";
import { cn } from "./lib/utils";
import { 
  Notebook, 
  Subject, 
  UserSettings
} from "./types";

import { SUBJECTS, DEFAULT_SETTINGS, t, THEMES } from "./constants/ui";

// Components
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { SettingsView } from "./components/settings/SettingsView";
import { NotebookDetail } from "./components/notebook/NotebookDetail";
import { BacCorrector } from "./components/bac/BacCorrector";
import { ProgressBar } from "./components/ui/ProgressBar";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [view, setView] = useState<"dashboard" | "corrector" | "settings">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let unsubSettings: Unsubscribe | null = null;
    let unsubNotebooks: Unsubscribe | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const sRef = doc(db, "settings", u.uid);
        unsubSettings = onSnapshot(sRef, (snap) => {
          if (snap.exists()) setSettings(snap.data() as UserSettings);
          else setDoc(sRef, DEFAULT_SETTINGS);
        });

        const nq = query(collection(db, "notebooks"), where("userId", "==", u.uid), orderBy("updatedAt", "desc"));
        unsubNotebooks = onSnapshot(nq, (snap) => {
          setNotebooks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notebook)));
        });
      } else {
        setNotebooks([]);
        if (unsubSettings) unsubSettings();
        if (unsubNotebooks) unsubNotebooks();
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubSettings) unsubSettings();
      if (unsubNotebooks) unsubNotebooks();
    };
  }, []);

  const createNotebook = async (subject: Subject) => {
    if (!user) return;
    const title = `${subject} Notebook`;
    const nbRef = doc(collection(db, "notebooks"));
    const data: Notebook = {
      id: nbRef.id,
      userId: user.uid,
      title,
      subject,
      sourcesCount: 0,
      mastery: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(nbRef, data);
    setActiveNotebookId(nbRef.id);
    setView("dashboard");
  };

  const deleteNotebook = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notebooks", id));
      if (activeNotebookId === id) setActiveNotebookId(null);
    } catch (err) {
      console.error("Error deleting notebook:", err);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

  const login = () => signInWithPopup(auth, new GoogleAuthProvider());
  const loginAsGuest = () => signInAnonymously(auth);

  const upgradeAccount = async () => {
    if (!user || !user.isAnonymous) return;
    try {
      await linkWithPopup(user, new GoogleAuthProvider());
    } catch (err) {
      console.error("Error linking account:", err);
      alert("Une erreur est survenue lors de la synchronisation du compte.");
    }
  };

  useEffect(() => {
    (window as any).upgradeAccount = upgradeAccount;
    return () => { delete (window as any).upgradeAccount; };
  }, [user]);

  const logout = () => signOut(auth);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 gap-6">
      <ProgressBar isLoading={loading} />
      <div className="w-20 h-20 bg-zinc-900 rounded-[24px] flex items-center justify-center animate-pulse shadow-xl">
        <GraduationCap className="text-white" size={40} />
      </div>
      <div className="space-y-2 text-center">
        <p className="text-emerald-600 font-bold text-sm tracking-widest uppercase">Bac Success IA</p>
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">Initialisation des fonctionnalités...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] p-12 shadow-2xl shadow-zinc-200/50 text-center space-y-10 border border-zinc-100"
      >
        <div className="w-24 h-24 bg-zinc-900 rounded-[32px] flex items-center justify-center mx-auto rotate-12 shadow-xl">
          <GraduationCap className="text-white" size={48} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold italic text-zinc-900">BAC Success IA</h1>
          <p className="text-zinc-500 font-medium leading-relaxed">
            L'intelligence artificielle au service de votre réussite au Baccalauréat.
          </p>
        </div>
        <div className="space-y-4 pt-4">
          <button 
            onClick={login}
            className="w-full py-6 bg-zinc-900 hover:bg-zinc-800 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-4 group"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            <span>Continuer avec Google</span>
          </button>
          
          <button 
            onClick={loginAsGuest}
            className="w-full py-6 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-[24px] font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-4"
          >
            <span>Accès Invité (Mode Rapide)</span>
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest italic">
          Plateforme sécurisée & optimisée
        </p>
      </motion.div>
    </div>
  );

  const activeNotebook = notebooks.find(n => n.id === activeNotebookId);

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        notebooks={notebooks}
        activeNotebookId={activeNotebookId}
        onSelectNotebook={(id) => {
          setActiveNotebookId(id);
          setView("dashboard");
          setIsSidebarOpen(false);
        }}
        onCreateNotebook={createNotebook}
        onDeleteNotebook={deleteNotebook}
        onViewChange={(v) => {
          setView(v);
          setActiveNotebookId(null);
          setIsSidebarOpen(false);
        }}
        view={view}
        settings={settings}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          user={user} 
          onLogout={logout} 
          onUpgrade={upgradeAccount}
          onMenuToggle={() => setIsSidebarOpen(true)}
          settings={settings}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              {activeNotebook ? (
                <motion.div
                  key={activeNotebook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <NotebookDetail 
                    notebook={activeNotebook}
                    user={user}
                    settings={settings}
                    onDelete={deleteNotebook}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {view === "dashboard" && (
                    <Dashboard 
                      settings={settings} 
                      user={user} 
                      notebooks={notebooks} 
                      onSelectSubject={(s: Subject) => {
                        const existing = notebooks.find(n => n.subject === s);
                        if (existing) {
                          setActiveNotebookId(existing.id);
                        } else {
                          createNotebook(s);
                        }
                      }}
                      onDeleteNotebook={deleteNotebook}
                    />
                  )}
                  {view === "corrector" && <BacCorrector settings={settings} user={user} notebooks={notebooks} />}
                  {view === "settings" && <SettingsView settings={settings} user={user} onUpdate={(s) => setSettings(s)} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
