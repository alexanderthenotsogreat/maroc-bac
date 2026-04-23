import React, { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Plus, Link as LinkIcon, FileDown, ImageIcon, FileText, ExternalLink, Globe, Loader2, X, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import * as pdfjs from "pdfjs-dist";
import { auth, db } from "../../lib/firebase";
import { UserSettings, Source, Subject } from "../../types";
import { THEMES, CURRICULUM_CHAPTERS, t } from "../../constants/ui";
import { cn, compressImage } from "../../lib/utils";
import { ResourceBrowser } from "./ResourceBrowser";
import { ProgressBar } from "../ui/ProgressBar";

// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface SourcesProps {
  notebookId: string;
  subject: Subject;
  sources: Source[];
  settings: UserSettings;
  initialBrowseQuery?: string;
  onConsumedQuery?: () => void;
}

export function Sources({ notebookId, subject, sources, settings, initialBrowseQuery, onConsumedQuery }: SourcesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [mode, setMode] = useState<"text" | "link" | "pdf" | "image" | "browse">("text");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (initialBrowseQuery) {
      setIsAdding(true);
      setMode("browse");
      if (onConsumedQuery) onConsumedQuery();
    }
  }, [initialBrowseQuery]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = THEMES[settings.themeColor];

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setTitle(file.name.replace(".pdf", ""));
    
    try {
      if (file.type.startsWith("image/")) {
        setMode("image");
        const reader = new FileReader();
        reader.onload = async (event) => {
           const base64 = event.target?.result as string;
           const compressed = await compressImage(base64);
           setContent(compressed);
           setLoading(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await pdfjs.getDocument(typedArray).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }
        setContent(fullText);
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      setLoading(false);
    }
  };

  const add = async () => {
    if (!title || (!content && mode !== "pdf")) return;
    setLoading(true);
    try {
      await addDoc(collection(db, `notebooks/${notebookId}/sources`), {
        notebookId,
        userId: auth.currentUser?.uid,
        title,
        content: mode === "link" ? `Content from link: ${content}` : content,
        type: mode,
        createdAt: serverTimestamp()
      });

      const nbRef = doc(db, "notebooks", notebookId);
      await setDoc(nbRef, { sourcesCount: (sources.length + 1), updatedAt: serverTimestamp() }, { merge: true });

      setTitle("");
      setContent("");
      setIsAdding(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await deleteDoc(doc(db, `notebooks/${notebookId}/sources`, sourceId));
      const nbRef = doc(db, "notebooks", notebookId);
      await setDoc(nbRef, { sourcesCount: Math.max(0, sources.length - 1), updatedAt: serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar isLoading={loading} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button 
          onClick={() => setIsAdding(true)}
          className="h-48 border-2 border-dashed border-zinc-200 rounded-[32px] flex flex-col items-center justify-center gap-4 text-zinc-400 hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
        >
          <div className={cn("p-4 rounded-2xl bg-zinc-50 group-hover:scale-110 transition-transform", theme.text)}>
            <Plus size={24} />
          </div>
          <span className="font-bold text-sm tracking-wide">Ajouter une Source</span>
        </button>
        {sources.map(s => (
          <div key={s.id} className="h-48 bg-white border border-zinc-200 rounded-[32px] p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden text-left">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg bg-zinc-50", theme.text)}>
                  {s.type === "link" ? <LinkIcon size={18} /> : s.type === "pdf" ? <FileDown size={18} /> : s.type === "image" ? <ImageIcon size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex items-center gap-1">
                  {confirmDeleteId === s.id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl">
                      <button 
                        onClick={() => { handleDeleteSource(s.id); setConfirmDeleteId(null); }}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        OUI
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 bg-zinc-100 text-zinc-400 rounded-lg text-[10px] font-bold uppercase transition-all"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(s.id)}
                      className="opacity-40 hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-zinc-900 line-clamp-1">{s.title}</h3>
              {s.type === "image" ? (
                <div className="h-20 w-full rounded-xl overflow-hidden mt-1 grayscale group-hover:grayscale-0 transition-all">
                  <img src={s.content} alt={s.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{s.content}</p>
              )}
            </div>
            {s.type === "link" && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                <ExternalLink size={10} /> Source Externe
              </div>
            )}
          </div>
        ))}
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-8 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 italic">Nouvelle Source</h3>
              <div className="flex gap-1 bg-zinc-100 p-1 rounded-2xl overflow-x-auto no-scrollbar w-full sm:w-auto">
                {(["text", "link", "pdf", "image", "browse"] as const).map(m => (
                  <button 
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap", mode === m ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600")}
                  >
                    {m === "browse" ? t('browse', settings.language) : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 sm:p-8 space-y-6 overflow-y-auto">
              {mode !== "browse" && (
                <input 
                  type="text" 
                  placeholder="Titre de la source..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-200 transition-all font-medium text-sm"
                />
              )}
              
              {mode === "text" ? (
                <textarea 
                  placeholder="Collez vos notes ici..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-200 transition-all font-medium resize-none text-sm leading-relaxed"
                />
              ) : mode === "link" ? (
                <div className="space-y-4">
                   <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-600 rounded-2xl text-xs font-medium text-left">
                    <Globe size={18} /> L'IA analysera le contenu du lien de manière sécurisée.
                   </div>
                   <input 
                    type="url" 
                    placeholder="https://..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-200 transition-all font-medium text-sm"
                  />
                </div>
              ) : mode === "pdf" ? (
                <label className="h-40 border-2 border-dashed border-zinc-100 rounded-[32px] flex flex-col items-center justify-center gap-3 text-zinc-400 group cursor-pointer hover:bg-zinc-50 transition-all w-full">
                  {loading && mode === "pdf" ? (
                    <Loader2 className="animate-spin" size={32} />
                  ) : (
                    <FileDown size={32} className="group-hover:scale-110 transition-transform" />
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest px-8 text-center">
                    {content ? `Prêt : ${title}` : "Cliquez pour téléverser votre PDF"}
                  </p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                  />
                </label>
              ) : mode === "image" ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group hover:bg-zinc-100/50 transition-colors cursor-pointer">
                    {content ? (
                      <img src={content} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="text-center p-6">
                        {loading ? <Loader2 size={32} className="mx-auto animate-spin text-zinc-300 mb-2" /> : <ImageIcon size={32} className="mx-auto text-zinc-300 mb-2 group-hover:scale-110 transition-transform" />}
                        <p className="text-sm font-bold text-zinc-400">Cliquez pour choisir une image</p>
                        <p className="text-[10px] text-zinc-300 uppercase tracking-widest mt-1">L'IA compressera automatiquement les gros fichiers</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              ) : (
                <ResourceBrowser 
                  subject={subject} 
                  settings={settings} 
                  initialQuery={initialBrowseQuery}
                  onAdd={(res) => {
                    setTitle(res.title);
                    setContent(res.url);
                    setMode("link");
                  }} 
                />
              )}
              <div className="flex gap-3 justify-end pt-4">
                <button onClick={() => setIsAdding(false)} className="px-8 py-3 rounded-2xl font-bold text-zinc-400 hover:text-zinc-900 transition-all uppercase tracking-widest text-[10px]">Annuler</button>
                <button 
                  onClick={add}
                  disabled={loading}
                  className={cn("px-10 py-3 rounded-2xl text-white font-bold transition-all flex items-center gap-2", theme.primary, theme.shadow)}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
