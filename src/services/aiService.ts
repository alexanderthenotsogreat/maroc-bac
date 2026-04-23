import { Source, Subject, UserSettings, UserProgress, LearningPath, StudyGuide, MindMap, SlideDeck, TTSVoice, Language } from "../types/index.ts";
import { t } from "../constants/ui";

/**
 * Helper to ensure we use absolute URLs when needed, or relative paths that are consistent.
 * On mobile/remote devices, using relatives is usually fine if on the same origin, 
 * but constructing them explicitly prevents protocol/base matching errors.
 */
function getApiUrl(path: string): string {
  // If we have a specific base URL defined, use it.
  // Otherwise, use window.location.origin to ensure absolute path from root.
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}${path}`;
}

/**
 * Robust fetch wrapper with timeout and better error reporting.
 */
async function secureFetch(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for AI

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Erreur de communication avec le serveur";
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error("La requête a expiré. Le serveur est peut-être surchargé.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function chatWithSourcesStream(sources: Source[], query: string, subject: Subject, settings?: UserSettings) {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "chat", sources, query, subject, settings })
  });
  
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No reader available");

  const decoder = new TextDecoder();
  return {
    [Symbol.asyncIterator]: async function* () {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield { text: decoder.decode(value, { stream: true }) };
      }
    }
  };
}

export async function chatWithSources(sources: Source[], query: string, subject: Subject, settings?: UserSettings) {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "chat", sources, query, subject, settings })
  });
  
  return response.text();
}

export async function generateTTS(text: string, voice: TTSVoice = 'Kore', language: Language = 'French') {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "tts", text, voice, language })
  });
  const { data } = await response.json();
  return data;
}

export async function generateFlashcards(sources: Source[], subject: Subject, settings?: UserSettings, topic?: string, depth: "standard" | "deep" = "standard") {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "flashcards", sources, subject, settings, topic, depth })
  });
  return response.json();
}

export async function generateQuiz(sources: Source[], subject: Subject, settings?: UserSettings, difficulty: string = "Standard", topic?: string, depth: "standard" | "deep" = "standard") {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "quiz", sources, subject, settings, difficulty, topic, depth })
  });
  return response.json();
}

export async function generateLearningPath(
  subject: Subject, 
  progress: UserProgress, 
  settings: UserSettings, 
  sourceContext: string
): Promise<LearningPath> {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "learning-path", subject, progress, settings, sourceContext })
  });
  return response.json();
}

export async function generateStudyGuide(sources: Source[], subject: Subject, settings?: UserSettings, topic?: string, format?: string): Promise<Partial<StudyGuide>> {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "study-guide", sources, subject, settings, topic, format })
  });
  return response.json();
}

export async function generateMindMap(sources: Source[], subject: Subject, settings?: UserSettings, topic?: string, format?: string): Promise<Partial<MindMap>> {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "mindmap", sources, subject, settings, topic, format })
  });
  return response.json();
}

export async function generateSlides(sources: Source[], subject: Subject, settings?: UserSettings, topic?: string, format?: string): Promise<Partial<SlideDeck>> {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "slides", sources, subject, settings, topic, format })
  });
  return response.json();
}

export async function analyzeCorrection(imageBuffers: string[], subject: Subject, settings: UserSettings, sources: Source[] = [], history: string[] = []) {
  const url = getApiUrl("/api/ai");
  const response = await secureFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "correction", imageBuffers, subject, settings, sources, history })
  });
  const { text } = await response.json();
  return text;
}
