import React, { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { Globe, GraduationCap, Palette, Zap, Clock, Check, CheckCircle2, Loader2, BrainCircuit, Mic, FastForward } from "lucide-react";
import { motion } from "motion/react";
import { User } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { UserSettings, Language, StudyBranch, ThemeColor, LearningStyle, LearningSpeed, TTSVoice } from "../../types";
import { THEMES, BRANCHES, t, TTS_VOICES } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface SettingsViewProps {
  settings: UserSettings;
  user: User | null;
  onUpdate: (s: UserSettings) => void;
}

export function SettingsView({ settings, user, onUpdate }: SettingsViewProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const theme = THEMES[localSettings.themeColor];

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", user.uid), localSettings);
      onUpdate(localSettings);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className={cn("flex justify-between items-center p-8 rounded-[40px] border shadow-sm transition-colors", localSettings.darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
        <div className="flex flex-col gap-1">
          <h2 className={cn("text-3xl font-serif font-bold italic transition-colors", localSettings.darkMode ? "text-white" : "text-zinc-900")}>Paramètres</h2>
          <p className={cn("transition-colors", localSettings.darkMode ? "text-zinc-400" : "text-zinc-500")}>Personnalisez votre expérience MorocBac.</p>
        </div>
        <button 
          onClick={save}
          disabled={saving}
          className={cn("px-8 py-3 rounded-full text-white font-bold transition-all flex items-center gap-2", theme.primary, theme.shadow)}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : t('save', localSettings.language)}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Language */}
        <div className={cn("p-8 rounded-[40px] border shadow-sm space-y-6 transition-colors", localSettings.darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
          <div className="flex items-center gap-3">
            <Globe className={theme.text} />
            <h3 className={cn("font-bold transition-colors", localSettings.darkMode ? "text-white" : "text-zinc-900")}>{t('language', localSettings.language)}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["French", "Arabic", "English", "Darija"] as Language[]).map(l => (
              <button 
                key={l}
                onClick={() => setLocalSettings({...localSettings, language: l})}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-sm font-semibold transition-all",
                  localSettings.language === l ? `${theme.border} ${theme.text} ${theme.bgLight}` : (localSettings.darkMode ? "border-zinc-800 text-zinc-600 hover:border-zinc-700" : "border-zinc-100 text-zinc-400 hover:border-zinc-200")
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Branch */}
        <div className={cn("p-8 rounded-[40px] border shadow-sm space-y-6 md:col-span-2 transition-colors", localSettings.darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
          <div className="flex items-center gap-3">
            <GraduationCap className={theme.text} />
            <h3 className={cn("font-bold transition-colors", localSettings.darkMode ? "text-white" : "text-zinc-900")}>{t('branch', localSettings.language)}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BRANCHES.map(b => (
              <button 
                key={b}
                onClick={() => setLocalSettings({...localSettings, branch: b})}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-[10px] font-bold transition-all text-left flex items-center justify-between",
                  localSettings.branch === b ? `${theme.border} ${theme.text} ${theme.bgLight}` : (localSettings.darkMode ? "border-zinc-800 text-zinc-500 hover:border-zinc-700" : "border-zinc-100 text-zinc-500 hover:border-zinc-200")
                )}
              >
                <span className="truncate">{b}</span>
                {localSettings.branch === b && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className={cn("p-8 rounded-[40px] border shadow-sm space-y-6 transition-colors", localSettings.darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className={theme.text} />
              <h3 className={cn("font-bold transition-colors", localSettings.darkMode ? "text-white" : "text-zinc-900")}>Apparence</h3>
            </div>
            <button 
              onClick={() => setLocalSettings({...localSettings, darkMode: !localSettings.darkMode})}
              className={cn(
                "p-3 rounded-2xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest",
                localSettings.darkMode ? "bg-zinc-800 text-yellow-400" : "bg-zinc-100 text-zinc-600"
              )}
            >
              {localSettings.darkMode ? <Zap size={14} fill="currentColor" /> : <Clock size={14} />}
              {localSettings.darkMode ? "Sombre" : "Clair"}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(Object.keys(THEMES) as ThemeColor[]).map(color => (
              <button 
                key={color}
                onClick={() => setLocalSettings({...localSettings, themeColor: color})}
                className={cn(
                  "w-full aspect-square rounded-2xl border-4 transition-all",
                  THEMES[color].primary,
                  localSettings.themeColor === color ? (localSettings.darkMode ? "border-emerald-400 scale-110" : "border-zinc-900 scale-110") : "border-transparent opacity-50 hover:opacity-100"
                )}
              />
            ))}
          </div>
        </div>

        {/* Learning Style */}
        <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <BrainCircuit className={theme.text} />
            <h3 className="font-bold text-zinc-900">Style d'Apprentissage</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["Visual", "Auditory", "Read/Write", "Kinesthetic"] as LearningStyle[]).map(s => (
              <button 
                key={s}
                onClick={() => setLocalSettings({...localSettings, learningStyle: s})}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-xs font-bold transition-all",
                  localSettings.learningStyle === s ? `${theme.border} ${theme.text} bg-zinc-50` : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Clock className={theme.text} />
            <h3 className="font-bold text-zinc-900">Vitesse d'Apprentissage</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {(["Slow", "Moderate", "Fast"] as LearningSpeed[]).map(speed => (
              <button 
                key={speed}
                onClick={() => setLocalSettings({...localSettings, learningSpeed: speed})}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-sm font-bold transition-all flex justify-between items-center",
                  localSettings.learningSpeed === speed ? `${theme.border} ${theme.text} bg-zinc-50` : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                )}
              >
                {speed}
                {localSettings.learningSpeed === speed && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Configuration */}
        <div className={cn("p-8 rounded-[40px] border shadow-sm space-y-6 md:col-span-2 transition-colors", localSettings.darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
          <div className="flex items-center gap-3">
            <Mic className={theme.text} />
            <h3 className={cn("font-bold transition-colors", localSettings.darkMode ? "text-white" : "text-zinc-900")}>Configuration Audio (TTS)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Voix de l'IA (Ton)</label>
              <div className="grid grid-cols-3 gap-2">
                {(TTS_VOICES as any[]).map(v => (
                  <button 
                    key={v}
                    onClick={() => setLocalSettings({...localSettings, ttsVoice: v as TTSVoice})}
                    className={cn(
                      "px-3 py-2 rounded-xl border text-[10px] font-bold transition-all",
                      localSettings.ttsVoice === v ? `${theme.border} ${theme.text} ${theme.bgLight}` : (localSettings.darkMode ? "border-zinc-800 text-zinc-600" : "border-zinc-100 text-zinc-400")
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex justify-between">
                Vitesse de lecture <span>{localSettings.ttsSpeed || 1.0}x</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Tortue</span>
                <input 
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={localSettings.ttsSpeed || 1.0}
                  onChange={(e) => setLocalSettings({...localSettings, ttsSpeed: parseFloat(e.target.value)})}
                  className="flex-1 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Lièvre</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
