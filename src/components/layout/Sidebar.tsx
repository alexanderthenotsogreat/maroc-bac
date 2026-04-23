import React, { useState } from "react";
import { BookOpen, Layout, Zap, Settings, Plus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Notebook, UserSettings, Subject } from "../../types";
import { THEMES, t } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface SidebarProps {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  view: "dashboard" | "settings" | "corrector";
  onViewChange: (v: "dashboard" | "settings" | "corrector") => void;
  onSelectNotebook: (id: string) => void;
  onCreateNotebook: (subject: Subject) => void;
  onDeleteNotebook: (id: string) => void;
  settings: UserSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = React.memo(({ 
  notebooks, 
  activeNotebookId, 
  view, 
  onViewChange, 
  onSelectNotebook, 
  onCreateNotebook, 
  onDeleteNotebook, 
  settings, 
  isOpen, 
  onClose 
}: SidebarProps) => {
  const theme = THEMES[settings.themeColor];
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 border-r border-zinc-200 bg-white flex flex-col shrink-0 overflow-y-auto transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between lg:hidden mb-4">
            <h2 className="font-serif font-bold italic text-zinc-900">Menu</h2>
            <button onClick={onClose} className="p-2 text-zinc-400">
               <X size={20} />
            </button>
          </div>
          <div className="mt-2">
            <button 
              onClick={() => onViewChange("dashboard")}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 mb-2",
                view === "dashboard" && !activeNotebookId ? `${theme.primary} text-white shadow-lg` : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <Layout size={16} />
              <span className="font-semibold">{t('dashboard', settings.language)}</span>
            </button>

            <button 
              onClick={() => onViewChange("corrector")}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 mb-2",
                view === "corrector" ? `${theme.primary} text-white shadow-lg` : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <Zap size={16} />
              <span className="font-semibold">{t('corrector', settings.language)}</span>
            </button>

            <button 
              onClick={() => onViewChange("settings")}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 mb-6",
                view === "settings" ? `${theme.primary} text-white shadow-lg` : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <Settings size={16} />
              <span className="font-semibold">{t('settings', settings.language)}</span>
            </button>

            <div className="flex justify-between items-center mb-3 px-2">
              <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-bold">{t('notebooks', settings.language)}</h2>
            </div>
            <div className="flex flex-col gap-1">
              {notebooks.map((nb: Notebook) => {
                const isConfirming = deletingId === nb.id;
                return (
                  <div key={nb.id} className="group flex items-center relative gap-0.5">
                    <button 
                      onClick={() => onSelectNotebook(nb.id)}
                      className={cn(
                        "flex-1 text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3",
                        activeNotebookId === nb.id ? `${theme.bgLight} ${theme.textLight} font-semibold` : "text-zinc-600 hover:bg-zinc-100",
                        isConfirming && "bg-red-50 text-red-700"
                      )}
                    >
                      <BookOpen size={16} className={activeNotebookId === nb.id ? theme.text : "text-zinc-400"} />
                      <span className="truncate">{nb.title}</span>
                    </button>
                    {!isConfirming ? (
                      <button 
                        onClick={() => setDeletingId(nb.id)}
                        className="opacity-40 hover:opacity-100 p-2 text-zinc-400 hover:text-red-600 transition-all active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200 pr-1">
                        <button 
                          onClick={() => { onDeleteNotebook(nb.id); setDeletingId(null); }}
                          className="p-1 px-2.5 bg-red-600 text-white rounded-md text-[10px] font-black uppercase shadow-sm"
                        >
                          Oui
                        </button>
                        <button 
                          onClick={() => setDeletingId(null)}
                          className="p-1 px-2.5 bg-zinc-200 text-zinc-600 rounded-md text-[10px] font-black uppercase"
                        >
                          Non
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});
