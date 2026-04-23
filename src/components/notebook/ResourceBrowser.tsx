import React, { useState, useEffect } from "react";
import { Globe, Zap, Loader2, Plus } from "lucide-react";
import { motion } from "motion/react";
import { UserSettings, Subject } from "../../types";
import { THEMES, CURRICULUM_CHAPTERS, t } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface ResourceBrowserProps {
  subject: Subject;
  settings: UserSettings;
  onAdd: (res: any) => void;
  initialQuery?: string;
}

export function ResourceBrowser({ subject, settings, onAdd, initialQuery }: ResourceBrowserProps) {
  const [query, setQuery] = useState(initialQuery || "");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = THEMES[settings.themeColor];

  const search = async (q?: string) => {
    const searchTerms = q || query;
    if (!searchTerms) return;
    setLoading(true);
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const endpoint = `${baseUrl}/api/browse-resources?query=${encodeURIComponent(searchTerms)}&branch=${encodeURIComponent(settings.branch || "General")}`;
      
      const resp = await fetch(endpoint);
      if (!resp.ok) throw new Error("Échec de la recherche de ressources");
      
      const data = await resp.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery);
    }
  }, [initialQuery]);

  const chapters = CURRICULUM_CHAPTERS[subject] || [];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text"
            placeholder={t('searchCourses', settings.language)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-200 transition-all font-medium text-sm"
          />
        </div>
        <button 
          onClick={() => search()}
          className={cn("px-6 rounded-2xl text-white transition-all", theme.primary)}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         {chapters.slice(0, 5).map(chapter => (
           <button 
            key={chapter}
            onClick={() => { setQuery(chapter); search(chapter); }}
            className="px-4 py-2 rounded-full border border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap hover:bg-zinc-50 transition-all"
           >
            + {chapter}
           </button>
         ))}
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {results.map((res, i) => (
          <div key={i} className="p-4 rounded-2xl border border-zinc-100 bg-white hover:border-zinc-200 transition-all group text-left">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h5 className="font-bold text-sm text-zinc-900 leading-tight group-hover:text-emerald-600 transition-colors">{res.title}</h5>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mt-1">{res.site}</span>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{res.description}</p>
              </div>
              <button 
                onClick={() => onAdd(res)}
                className={cn("p-2 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all", theme.primary)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
        {results.length === 0 && !loading && (
          <div className="py-10 text-center text-zinc-400 italic text-sm">
            Recherchez un sujet pour trouver des ressources fiables.
          </div>
        )}
      </div>
    </div>
  );
}
