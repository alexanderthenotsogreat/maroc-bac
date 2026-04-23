import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, BrainCircuit, Volume2, VolumeX, Square } from "lucide-react";
import { UserSettings, Subject, Source } from "../../types";
import { THEMES } from "../../constants/ui";
import { chatWithSourcesStream, generateTTS } from "../../services/aiService";
import { cn, pcmToWav } from "../../lib/utils";

interface ChatProps {
  sources: Source[];
  subject: Subject;
  settings: UserSettings;
  initialQuery?: string;
  onQueryConsumed?: () => void;
}

export function Chat({ sources, subject, settings, initialQuery, onQueryConsumed }: ChatProps) {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(settings.ttsEnabled || false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const theme = THEMES[settings.themeColor];
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioQueue = useRef<string[]>([]);
  const isPlaying = useRef(false);
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const processQueue = async () => {
    if (isPlaying.current || audioQueue.current.length === 0) {
      if (audioQueue.current.length === 0) setIsSpeaking(false);
      return;
    }
    isPlaying.current = true;
    setIsSpeaking(true);
    const text = audioQueue.current.shift()!;
    
    try {
      const base64 = await generateTTS(text, settings.ttsVoice, settings.language);
      if (base64) {
        const audioUrl = pcmToWav(base64);
        const audio = new Audio(audioUrl);
        currentAudio.current = audio;
        audio.playbackRate = settings.ttsSpeed || 1.0;
        audio.onended = () => {
          isPlaying.current = false;
          currentAudio.current = null;
          URL.revokeObjectURL(audioUrl);
          processQueue();
        };
        audio.play();
      } else {
        isPlaying.current = false;
        processQueue();
      }
    } catch (e) {
      console.error(e);
      isPlaying.current = false;
      processQueue();
    }
  };

  const queueSpeech = (text: string) => {
    if (!ttsEnabled) return;
    const clean = text.trim();
    if (clean.length < 2) return;
    audioQueue.current.push(clean);
    processQueue();
  };

  const stopSpeech = () => {
    audioQueue.current = [];
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }
    isPlaying.current = false;
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim() !== "") {
      const triggerQuery = async () => {
        const userMsg = initialQuery;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);
        if (onQueryConsumed) onQueryConsumed();
        
        setMessages(prev => [...prev, { role: "ai", content: "" }]);

        try {
          const stream = await chatWithSourcesStream(sources, userMsg, subject, settings);
          let fullText = "";
          let currentSentence = "";
          
          for await (const chunk of stream) {
            const text = chunk.text;
            fullText += text;
            currentSentence += text;

            if (/[.!?\n]/.test(text)) {
              queueSpeech(currentSentence);
              currentSentence = "";
            }

            setMessages(prev => {
              const next = [...prev];
              next[next.length - 1] = { role: "ai", content: fullText };
              return next;
            });
          }
          if (currentSentence.trim()) queueSpeech(currentSentence);
        } catch (err) {
          console.error(err);
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = { role: "ai", content: "Une erreur est survenue." };
            return next;
          });
        } finally {
          setLoading(false);
        }
      };
      triggerQuery();
    }
  }, [initialQuery]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input || loading) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    setMessages(prev => [...prev, { role: "ai", content: "" }]);

    try {
      const stream = await chatWithSourcesStream(sources, userMsg, subject, settings);
      let fullText = "";
      let currentSentence = "";

      for await (const chunk of stream) {
        const text = chunk.text;
        fullText += text;
        currentSentence += text;

        if (/[.!?\n]/.test(text)) {
          queueSpeech(currentSentence);
          currentSentence = "";
        }

        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: "ai", content: fullText };
          return next;
        });
      }
      if (currentSentence.trim()) queueSpeech(currentSentence);
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "ai", content: "Une erreur est survenue." };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] max-h-[80vh] sm:max-h-none bg-white border border-zinc-200 rounded-[40px] overflow-hidden shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 gap-4 opacity-50">
            <div className={cn("p-6 rounded-full bg-zinc-50", theme.text)}>
              <BrainCircuit size={48} />
            </div>
            <p className="max-w-xs text-sm font-medium">Posez des questions sur vos sources. Je vous répondrai selon les standards marocains.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] rounded-3xl px-6 py-4 !leading-relaxed whitespace-pre-wrap text-sm text-left",
              m.role === "user" ? `${theme.primary} text-white shadow-lg` : "bg-zinc-100 text-zinc-800"
            )}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-3xl px-6 py-4 flex items-center gap-2 text-sm italic">
              <Loader2 className="animate-spin" size={16} /> MorocBac AI réfléchit...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      <div className="p-6 border-t border-zinc-100 bg-white">
        <div className="relative flex items-center gap-2">
          {isSpeaking ? (
            <button 
              onClick={stopSpeech}
              className="p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 transition-all hover:bg-rose-100 shadow-sm"
              title="Arrêter l'audio"
            >
              <Square size={20} fill="currentColor" />
            </button>
          ) : (
            <button 
              onClick={() => {
                const newState = !ttsEnabled;
                setTtsEnabled(newState);
                if (!newState) stopSpeech();
              }}
              className={cn(
                "p-4 rounded-2xl transition-all border",
                ttsEnabled ? `${theme.text} ${theme.bgLight} border-emerald-100` : "text-zinc-400 bg-zinc-50 border-zinc-100"
              )}
              title={ttsEnabled ? "Désactiver l'audio" : "Activer l'audio"}
            >
              {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          )}
          <input 
            type="text"
            placeholder="Écrivez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-6 py-4 rounded-3xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-200 transition-all font-medium text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className={cn("p-4 rounded-2xl text-white transition-all", theme.primary, theme.shadow)}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
