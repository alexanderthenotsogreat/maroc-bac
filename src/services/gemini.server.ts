import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Source, Subject, UserSettings, UserProgress, LearningPath, TTSVoice, Language } from "../types/index.ts";

// Server-side initialization
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
    throw new Error("Service configuration incomplete. Please set GEMINI_API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

const MOROCCAN_SYSTEM_PROMPT = `You are "MorocBac AI", a premium educational AI designed for the Moroccan Baccalaureate.
User Context:
- Branch: {branch} (Critical: Science Math requires higher rigor than SVT/PC)
- Language Preference: {language}
- Learning Style: {style}

Your primary mission: Transform raw notes into ultra-effective Moroccan study materials.

Excellence Guidelines:
1. NATIONAL STANDARDS: Align strictly with the "Référentiels du Baccalauréat" (MEN). Use standard examination structures.
2. LINGUISTIC PRECISION:
   - Science Subjects: Prefer French (Biof) or English as requested.
   - Humanities/Philosophy: Prefer High-Standard Arabic.
   - Inter-language explanation: Occasionally use Darija for complex "Aha!" moments if the style is "Standard" or "Beginner".
3. TERMINOLOGY GUARD: Use official terms like "Asymptote", "Électronégativité", "Mouvement de translation", "Sira Nabawiya".
4. FORMAT CONSISTENCY: Every response must be logically structured, high-density, and exam-ready.`;

function getSystemPrompt(settings?: UserSettings) {
  if (!settings) return MOROCCAN_SYSTEM_PROMPT;
  return MOROCCAN_SYSTEM_PROMPT
    .replace("{branch}", settings.branch || "Général")
    .replace("{language}", settings.language)
    .replace("{style}", settings.learningStyle || "Standard");
}

export async function chatWithSourcesStreamServer(sources: Source[], query: string, subject: Subject, settings?: UserSettings) {
  const ai = getAI();
  const context = sources.map(s => `SOURCE [${s.title}]:\n${s.content}`).join("\n\n---\n\n");
  const langPref = settings?.language || "French";
  
  return ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `User Settings: Language ${langPref}, Style ${settings?.learningStyle || "Standard"}.
Subject: ${subject}
Branch: ${settings?.branch || "Général"}

Knowledge Base:
${context}

User Question: ${query}` }]
      }
    ],
    config: {
      systemInstruction: getSystemPrompt(settings),
      temperature: 0.7,
    }
  });
}

export async function chatWithSourcesServer(sources: Source[], query: string, subject: Subject, settings?: UserSettings) {
  const ai = getAI();
  const context = sources.map(s => `SOURCE [${s.title}]:\n${s.content}`).join("\n\n---\n\n");
  const langPref = settings?.language || "French";
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `User Settings: Language ${langPref}, Style ${settings?.learningStyle || "Standard"}.
Subject: ${subject}
Branch: ${settings?.branch || "Général"}

Knowledge Base:
${context}

User Question: ${query}` }]
      }
    ],
    config: {
      systemInstruction: getSystemPrompt(settings),
      temperature: 0.7,
    }
  });

  return response.text;
}

export async function generateTTSServer(text: string, voice: TTSVoice = 'Kore', language: Language = 'French') {
  const ai = getAI();
  const model = "gemini-3.1-flash-tts-preview";
  
  const cleanText = text.replace(/[*_#`~>]/g, "").substring(0, 1000);
  
  const response = await ai.models.generateContent({
    model: model,
    contents: [{ parts: [{ text: cleanText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
}

function cleanJSON(text: string): string {
  if (!text) return "{}";
  let cleaned = text.replace(/```json\n?|```/g, "").trim();
  const start = Math.min(
    cleaned.indexOf("{") === -1 ? Infinity : cleaned.indexOf("{"),
    cleaned.indexOf("[") === -1 ? Infinity : cleaned.indexOf("[")
  );
  if (start !== Infinity) {
    let sub = cleaned.substring(start);
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < sub.length; i++) {
      const char = sub[i];
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
      if (braceCount === 0 && bracketCount === 0 && i > 0) return sub.substring(0, i + 1);
    }
  }
  return cleaned;
}

export async function generateFlashcardsServer(sources: Source[], subject: Subject, settings?: UserSettings, topic?: string, depth: "standard" | "deep" = "standard") {
  const ai = getAI();
  const context = sources.map(s => s.content).join("\n\n");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Generate 10 Moroccan Baccalaureate style flashcards. 
Subject: ${subject}
${topic ? `Focus Topic: ${topic}` : "Focus on high-yield exam concepts."}
Explanation Depth: ${depth === "deep" ? "Comprehensive, step-by-step breakdown with mental visualization tips." : "Concise and direct."}
Notes: ${context}` }]
      }
    ],
    config: {
      systemInstruction: getSystemPrompt(settings),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING },
            deepDive: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    }
  });

  try {
    return JSON.parse(cleanJSON(response.text || "[]"));
  } catch (e) {
    return [];
  }
}

export async function generateQuizServer(sources: Source[], subject: Subject, settings?: UserSettings, difficulty: string = "Standard", topic?: string, depth: "standard" | "deep" = "standard") {
  const ai = getAI();
  const context = sources.map(s => s.content).join("\n\n");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Generate a 5-question multiple choice quiz.
Difficulty Level: ${difficulty}
Subject: ${subject}
${topic ? `Focus Chapter/Topic: ${topic}` : ""}
Explanation Depth: ${depth === "deep" ? "Detailed explanation." : "Standard explanation."}
Notes: ${context}` }]
      }
    ],
    config: {
      systemInstruction: getSystemPrompt(settings),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            deepDive: { type: Type.STRING }
          },
          required: ["question", "options", "correctIndex", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(cleanJSON(response.text || "[]"));
  } catch (e) {
    return [];
  }
}

export async function generateLearningPathServer(
  subject: Subject, 
  progress: UserProgress, 
  settings: UserSettings, 
  sourceContext: string
): Promise<LearningPath> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Analyze progress.
Subject: ${subject}
Progress: ${JSON.stringify(progress)}
Context: ${sourceContext.substring(0, 3000)}` }]
      }
    ],
    config: {
      systemInstruction: getSystemPrompt(settings),
      responseMimeType: "application/json"
    }
  });

  try {
    return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (e) {
    return { summary: "Error", recommendedTopics: [], schedule: [], difficultyAdjustment: "Medium", personalizedTips: [] };
  }
}

export async function generateStudyGuideServer(sources: Source[], subject: Subject, settings?: UserSettings, topic?: string, format?: string) {
  const ai = getAI();
  const context = sources.map(s => s.content).join("\n\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: `Study Guide. ${topic}. ${context}` }] }],
    config: {
      systemInstruction: getSystemPrompt(settings),
      responseMimeType: "application/json"
    }
  });
  try {
    return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (e) {
    return {};
  }
}

export async function generateMindMapServer(sources: Source[], subject: Subject, settings?: UserSettings, topic?: string, format?: string) {
  const ai = getAI();
  const context = sources.map(s => s.content).join("\n\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: `Mind Map. ${topic}. ${context}` }] }],
    config: {
      systemInstruction: getSystemPrompt(settings),
      responseMimeType: "application/json"
    }
  });
  try {
    return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (e) {
    return { title: "Error", root: { id: "error", label: "Error" } };
  }
}

export async function generateSlidesServer(sources: Source[], subject: Subject, settings?: UserSettings, topic?: string, format?: string) {
  const ai = getAI();
  const context = sources.map(s => s.content).join("\n\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: `Slides. ${topic}. ${context}` }] }],
    config: {
      systemInstruction: getSystemPrompt(settings),
      responseMimeType: "application/json"
    }
  });
  try {
    return JSON.parse(cleanJSON(response.text || "{}"));
  } catch (e) {
    return {};
  }
}

export async function analyzeCorrectionServer(imageBuffers: string[], subject: Subject, settings: UserSettings, sources: Source[] = [], history: string[] = []) {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const prompt = `Corrector for: ${subject}. 
${settings.language}.
${settings.branch}.`;

  const imageParts = imageBuffers.map(data => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: data,
    },
  }));

  const response = await ai.models.generateContent({
    model: model,
    contents: [{ role: "user", parts: [...imageParts, { text: prompt }] }],
    config: {
      systemInstruction: getSystemPrompt(settings),
    }
  });

  return response.text;
}
