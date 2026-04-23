export type Subject = 
  | "Mathematics"
  | "Physics"
  | "SVT"
  | "Philosophy"
  | "English"
  | "Arabic"
  | "History-Geography"
  | "Economics"
  | "Accounting"
  | "French"
  | "Islamic Education"
  | "Engineering Sciences"
  | "Applied Arts"
  | "Agronomy"
  | "Islamic Sciences";

export interface Notebook {
  id: string;
  title: string;
  description?: string;
  userId: string;
  subject: Subject;
  mastery?: number;
  sourcesCount?: number;
  isOfficial?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Source {
  id: string;
  notebookId: string;
  userId: string;
  title: string;
  content: string;
  type: "pdf" | "text" | "link" | "image";
  createdAt: any;
}

export interface Flashcard {
  front: string;
  back: string;
  deepDive?: string;
}

export interface FlashcardSet {
  id: string;
  notebookId: string;
  userId: string;
  title: string;
  cards: Flashcard[];
  createdAt: any;
}

export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  deepDive?: string;
}

export interface Quiz {
  id: string;
  notebookId: string;
  userId: string;
  title: string;
  topic?: string;
  questions: Question[];
  createdAt: any;
}

export type LearningStyle = "Visual" | "Auditory" | "Read/Write" | "Kinesthetic";
export type LearningSpeed = "Slow" | "Moderate" | "Fast";
export type Language = "French" | "Arabic" | "English" | "Darija";
export type ThemeColor = "emerald" | "blue" | "indigo" | "rose" | "amber" | "violet" | "orange" | "slate";
export type TTSVoice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export type StudyBranch = 
  | "Sciences Mathématiques A"
  | "Sciences Mathématiques B"
  | "Sciences Physiques et Chimiques (PC)"
  | "Sciences de la Vie et de la Terre (SVT)"
  | "Sciences Économiques"
  | "Gestion Comptable"
  | "Lettres"
  | "Sciences Humaines"
  | "Sciences et Technologies Électriques (STE)"
  | "Sciences et Technologies Mécaniques (STM)"
  | "Sciences Agronomiques"
  | "Arts Appliqués"
  | "Sciences de la Charia"
  | "Langue Arabe";

export interface UserSettings {
  language: Language;
  learningStyle: LearningStyle;
  learningSpeed: LearningSpeed;
  themeColor: ThemeColor;
  darkMode: boolean;
  branch?: StudyBranch;
  ttsEnabled?: boolean;
  ttsVoice?: TTSVoice;
  ttsSpeed?: number;
  ttsLanguage?: Language;
}

export interface UserProgress {
  userId: string;
  subject: Subject;
  masteryLevel: number;
  topicMastery: Record<string, number>;
  quizScores: number[];
  studyTimeMs: number;
  lastExamSimScore?: number;
  totalQuizzesTaken: number;
  totalSourcesAdded: number;
  updatedAt: any;
}

export interface LearningPath {
  summary: string;
  recommendedTopics: string[];
  schedule: Array<{ day: string; task: string; duration: string }>;
  difficultyAdjustment: string;
  personalizedTips: string[];
}

export interface StudyGuide {
  id: string;
  notebookId: string;
  userId: string;
  title: string;
  summary: string;
  keyPoints: string[];
  examTips: string[];
  glossary: Array<{ term: string; definition: string }>;
  createdAt: any;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
}

export interface MindMap {
  id: string;
  notebookId: string;
  userId: string;
  title: string;
  root: MindMapNode;
  createdAt: any;
}

export interface Slide {
  title: string;
  bullets: string[];
}

export interface SlideDeck {
  id: string;
  notebookId: string;
  userId: string;
  title: string;
  slides: Slide[];
  createdAt: any;
}

export interface CorrectionResult {
  id: string;
  userId: string;
  subject: Subject;
  images: string[]; // array of base64
  analysis: string; // Markdown result
  score: number;
  weakPoints: string[];
  createdAt: any;
}

export interface BacExam {
  id: string;
  year: number;
  session: "Normal" | "Rattrapage";
  subject: Subject;
  branch: string;
  chapters: string[];
  pdfUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface BacRecommendation {
  exam: BacExam;
  matchedChapters: string[];
  matchCount: number;
  matchRate: number;
  isBestMatch?: boolean;
}
