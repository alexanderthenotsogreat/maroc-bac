import { Language, ThemeColor, StudyBranch, UserSettings, Subject } from "../types";

export const SUBJECTS: Subject[] = [
  "Mathematics", "Physics", "SVT", "Philosophy", "English", "Arabic", "History-Geography", "Economics", "Accounting", "Engineering Sciences", "Applied Arts", "Agronomy", "Islamic Sciences"
];

export const BRANCH_SUBJECTS: Record<StudyBranch, Subject[]> = {
  "Sciences Mathématiques A": ["Mathematics", "Physics", "SVT", "Philosophy", "English"],
  "Sciences Mathématiques B": ["Mathematics", "Physics", "Engineering Sciences", "Philosophy", "English"],
  "Sciences Physiques et Chimiques (PC)": ["Mathematics", "Physics", "SVT", "Philosophy", "English"],
  "Sciences de la Vie et de la Terre (SVT)": ["Mathematics", "Physics", "SVT", "Philosophy", "English"],
  "Sciences Économiques": ["Mathematics", "Economics", "Accounting", "Philosophy", "English"],
  "Gestion Comptable": ["Mathematics", "Economics", "Accounting", "Philosophy", "English"],
  "Lettres": ["Arabic", "Philosophy", "History-Geography", "English"],
  "Sciences Humaines": ["Arabic", "Philosophy", "History-Geography", "English"],
  "Sciences et Technologies Électriques (STE)": ["Mathematics", "Physics", "Engineering Sciences", "Philosophy", "English"],
  "Sciences et Technologies Mécaniques (STM)": ["Mathematics", "Physics", "Engineering Sciences", "Philosophy", "English"],
  "Sciences Agronomiques": ["Mathematics", "Physics", "SVT", "Agronomy", "Philosophy", "English"],
  "Arts Appliqués": ["Mathematics", "Physics", "Applied Arts", "Philosophy", "English"],
  "Sciences de la Charia": ["Arabic", "Islamic Sciences", "Philosophy", "History-Geography", "English"],
  "Langue Arabe": ["Arabic", "Islamic Sciences", "Philosophy", "History-Geography", "English"]
};

export const getBranchSubjects = (branch?: StudyBranch): Subject[] => {
  if (!branch) return ["Mathematics", "Physics", "SVT", "Philosophy", "English"];
  return BRANCH_SUBJECTS[branch] || ["Mathematics", "Physics", "SVT", "Philosophy", "English"];
};

export const THEMES = {
  emerald: { primary: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-600", ring: "focus:ring-emerald-500", bgLight: "bg-emerald-50", textLight: "text-emerald-700", shadow: "shadow-emerald-200" },
  blue: { primary: "bg-blue-600", text: "text-blue-600", border: "border-blue-600", ring: "focus:ring-blue-500", bgLight: "bg-blue-50", textLight: "text-blue-700", shadow: "shadow-blue-200" },
  indigo: { primary: "bg-indigo-600", text: "text-indigo-600", border: "border-indigo-600", ring: "focus:ring-indigo-500", bgLight: "bg-indigo-50", textLight: "text-indigo-700", shadow: "shadow-indigo-200" },
  rose: { primary: "bg-rose-600", text: "text-rose-600", border: "border-rose-600", ring: "focus:ring-rose-500", bgLight: "bg-rose-50", textLight: "text-rose-700", shadow: "shadow-rose-200" },
  amber: { primary: "bg-amber-600", text: "text-amber-600", border: "border-amber-600", ring: "focus:ring-amber-500", bgLight: "bg-amber-50", textLight: "text-amber-700", shadow: "shadow-amber-200" },
  violet: { primary: "bg-violet-600", text: "text-violet-600", border: "border-violet-600", ring: "focus:ring-violet-500", bgLight: "bg-violet-50", textLight: "text-violet-700", shadow: "shadow-violet-200" },
  orange: { primary: "bg-orange-600", text: "text-orange-600", border: "border-orange-600", ring: "focus:ring-orange-500", bgLight: "bg-orange-50", textLight: "text-orange-700", shadow: "shadow-orange-200" },
  slate: { primary: "bg-slate-700", text: "text-slate-700", border: "border-slate-700", ring: "focus:ring-slate-500", bgLight: "bg-slate-50", textLight: "text-slate-700", shadow: "shadow-slate-200" },
};

export const BRANCHES: StudyBranch[] = [
  "Sciences Mathématiques A",
  "Sciences Mathématiques B",
  "Sciences Physiques et Chimiques (PC)",
  "Sciences de la Vie et de la Terre (SVT)",
  "Sciences Économiques",
  "Gestion Comptable",
  "Lettres",
  "Sciences Humaines",
  "Sciences et Technologies Électriques (STE)",
  "Sciences et Technologies Mécaniques (STM)",
  "Sciences Agronomiques",
  "Arts Appliqués",
  "Sciences de la Charia",
  "Langue Arabe"
];

export const DEFAULT_SETTINGS: UserSettings = {
  language: "French",
  learningStyle: "Visual",
  learningSpeed: "Moderate",
  themeColor: "emerald",
  darkMode: false,
  branch: "Sciences Physiques et Chimiques (PC)",
  ttsEnabled: false,
  ttsVoice: 'Kore',
  ttsSpeed: 1.0,
  ttsLanguage: 'French'
};

export const TTS_VOICES: string[] = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

export const CURRICULUM_CHAPTERS: Record<string, string[]> = {
  "Mathematics": [
    "Limites et Continuité",
    "Dérivabilité et Étude de Fonctions",
    "Suites Numériques",
    "Fonctions Logarithmes",
    "Fonctions Exponentielles",
    "Nombres Complexes",
    "Calcul Intégral",
    "Équations Différentielles",
    "Probabilités"
  ],
  "Mathematics (SM)": [
    "Arithmétique dans Z",
    "Structures Algébriques",
    "Espaces Vectoriels",
    "Limites et Continuité",
    "Dérivabilité et Étude de Fonctions",
    "Suites Numériques",
    "Fonctions Logarithmes",
    "Fonctions Exponentielles",
    "Nombres Complexes",
    "Calcul Intégral",
    "Équations Différentielles",
    "Probabilités"
  ],
  "Physics": [
    "Ondes Mécaniques Progressives",
    "Ondes Lumineuses",
    "Décroissance Radioactive",
    "Noyaux, Masse et Énergie",
    "Dipôle RC",
    "Dipôle RL",
    "Circuit RLC",
    "Lois de Newton",
    "Chute Verticale",
    "Mouvements Plans",
    "Satellites et Planètes",
    "Systèmes Oscillants",
    "Atome et Mécanique de Newton"
  ],
  "Chemistry": [
    "Transformations Rapides et Lentes",
    "Suivi Temporel d'une Réaction",
    "Transformations Réversibles",
    "État d'Équilibre d'un Système",
    "Transformations liées aux Réactions Acide-Base",
    "Évolution Spontanée d'un Système Chimique",
    "Piles et Électrolyse"
  ],
  "SVT": [
    "Consommation de la Matière Organique et Flux d'Énergie",
    "Nature et Mécanisme de l'Expression de l'Information Génétique",
    "Transfert de l'Information Génétique par Reproduction Sexuée",
    "Génétique Humaine",
    "Génétique des Populations",
    "Immunologie",
    "Géologie (Chaînes de Montagnes)"
  ],
  "Philosophy": [
    "La Condition Humaine (Sujet, Autrui, Histoire)",
    "La Connaissance (Vérité, Théorie et Expérience)",
    "La Politique (État, Violence, Droit et Justice)",
    "La Morale (Devoir, Bonheur, Liberté)"
  ],
  "English": [
    "Gifts of Youth",
    "Humour",
    "Formal, Informal and Non-formal Education",
    "Sustainable Development",
    "Women and Power",
    "Cultural Values",
    "Citizenship",
    "International Organizations"
  ],
  "Arabic": [
    "إحياء النموذج",
    "سؤال الذات",
    "تكسير البنية",
    "تجديد الرؤيا",
    "الشعر الحر",
    "القصة", "المسرحية",
    "المنهج البنيوي",
    "المنهج الاجتماعي"
  ],
  "History-Geography": [
    "العالم غداة الحرب العالمية الأولى",
    "الثورة الروسية وأزمات الديمقراطيات الليبرالية",
    "الأزمة الاقتصادية الكبرى 1929",
    "المغرب تحت نظام الحماية",
    "المغرب: الاستقلال واستكمال الوحدة الترابية",
    "العولمة: المفهوم، الآليات والفاعلون",
    "المجال العالمي وتحديات الامتداد",
    "الاتحاد الأوروبي نحو اندماج شامل"
  ],
  "Economics": [
    "Le Marché",
    "Le Circuit Économique Elargi",
    "Les Agrégats de la Comptabilité Nationale",
    "Les Limites de la Comptabilité Nationale",
    "Régulation par le Marché",
    "L'Inflation",
    "Le Chômage",
    "Les Politiques Économiques"
  ],
  "Accounting": [
    "Amortissements",
    "Provisions pour Dépréciation",
    "Régularisation des Stocks",
    "Régularisation des Charges et Produits",
    "Analyse d'Exploitation",
    "Analyse de la Rentabilité"
  ],
  "Engineering Sciences": [
    "Analyse Fonctionnelle",
    "Chaîne d'Énergie (Alimenter, Distribuer, Convertir, Transmettre)",
    "Chaîne d'Information (Acquérir, Traiter, Communiquer)",
    "Automatique (Systèmes Linéaires)",
    "Logique Combinatoire et Séquentielle",
    "Microcontrôleurs",
    "Résistance des Matériaux",
    "Transmissions de Puissance"
  ],
  "Applied Arts": [
    "Culture Plastique et Visuelle",
    "Design Produits",
    "Design d'Espace",
    "Design Graphique",
    "Infographie",
    "Histoire de l'Art"
  ],
  "Agronomy": [
    "Biologie Végétale",
    "Biologie Animale",
    "Pédologie",
    "Machinisme Agricole",
    "Économie Rurale"
  ],
  "Islamic Sciences": [
    "Tafsir",
    "Hadith",
    "Fiqh",
    "Oussoul al-Fiqh",
    "Histoire de l'Islam"
  ]
};

export const getCurriculumChapters = (subject: Subject, branch?: StudyBranch): string[] => {
  if (subject === "Mathematics") {
    if (branch && branch.startsWith("Sciences Mathématiques")) {
      return CURRICULUM_CHAPTERS["Mathematics (SM)"];
    }
  }
  return CURRICULUM_CHAPTERS[subject] || [];
};

export const t = (key: string, lang: Language) => {
  const dicts: Record<Language, Record<string, string>> = {
    French: {
      dashboard: "Tableau de Bord",
      notebooks: "Vos Notebooks",
      summary: "Votre Parcours d'Excellence",
      mastery: "Maîtrise",
      newNotebook: "Nouveau Notebook",
      sources: "Sources",
      chat: "Chat",
      tools: "Outils",
      performance: "Plan d'Étude",
      analytics: "Analytiques",
      curriculum: "Programme",
      format: "Format de Sortie",
      detailedSummary: "Résumé Détaillé",
      bulletPoints: "Points Clés",
      conciseNotes: "Notes Concise",
      settings: "Paramètres",
      save: "Enregistrer",
      discard: "Abandonner",
      loading: "Chargement...",
      pointsForts: "Points Forts",
      pointsAmeliorer: "À Améliorer",
      step: "Prochaines Étapes",
      generate: "Lancer l'IA",
      branch: "Filière",
      language: "Langue",
      style: "Style d'Apprentissage",
      speed: "Vitesse",
      theme: "Thème",
      notEnoughData: "Progression Insuffisante",
      dataNeeded: "Débloquez vos statistiques exclusives",
      trackerDesc: "Atteignez les objectifs ci-dessous pour activer l'analyse prédictive IA.",
      guideTitle: "Mission : Prêt pour le Bac",
      guideQuiz: "Passez au moins 3 Quiz",
      guideSource: "Ajoutez au moins 2 Sources",
      guideTime: "Étudiez pendant 60 minutes",
      browse: "Navigateur de Ressources",
      quickAdd: "Ajout Rapide",
      searchCourses: "Rechercher des cours Bac...",
      officialCurriculum: "Matières Nationales",
      allChapters: "Tous les Chapitres",
      corrector: "Correcteur Bac",
      exams: "Examens BAC",
    },
    Arabic: {
      dashboard: "لوحة التحكم",
      notebooks: "دفاترك",
      summary: "مسارك نحو التميز",
      mastery: "الإتقان",
      newNotebook: "دفتر جديد",
      sources: "المصادر",
      chat: "دردشة",
      tools: "أدوات",
      performance: "خطة الدراسة",
      analytics: "التحليلات",
      curriculum: "المقرر",
      format: "تنسيق المخرجات",
      detailedSummary: "ملخص مفصل",
      bulletPoints: "نقاط أساسية",
      conciseNotes: "ملاحظات موجزة",
      settings: "الإعدادات",
      save: "حفظ",
      discard: "تجاهل",
      loading: "جاري التحميل...",
      pointsForts: "نقاط القوة",
      pointsAmeliorer: "نقاط للتحسين",
      step: "الخطوات القادمة",
      generate: "تشغيل الذكاء الاصطناعي",
      branch: "الشعبة",
      language: "اللغة",
      style: "نمط التعلم",
      speed: "السرعة",
      theme: "المظهر",
      notEnoughData: "تقدم غير كافٍ",
      dataNeeded: "افتح إحصائياتك الحصرية",
      trackerDesc: "حقّق الأهداف أدناه لتفعيل التحليل التنبئي للذكاء الاصطناعي.",
      guideTitle: "المهمة: الاستعداد للبكالوريا",
      guideQuiz: "اجتز 3 اختبارات على الأقل",
      guideSource: "أضف مصدرين على الأقل",
      guideTime: "ادرس لمدة 60 دقيقة",
      browse: "متصفح الموارد",
      quickAdd: "إضافة سريعة",
      searchCourses: "البحث عن دروس البكالوريا...",
      officialCurriculum: "المواد الوطنية",
      allChapters: "جميع الفصول",
      corrector: "مصحح البكالوريا",
      exams: "امتحانات البكالوريا",
    },
    English: {
      dashboard: "Dashboard",
      notebooks: "Your Notebooks",
      summary: "Your Excellence Path",
      mastery: "Mastery",
      newNotebook: "New Notebook",
      sources: "Sources",
      chat: "Chat",
      tools: "Tools",
      performance: "Study Plan",
      analytics: "Analytics",
      curriculum: "Curriculum",
      format: "Output Format",
      detailedSummary: "Detailed Summary",
      bulletPoints: "Bullet Points",
      conciseNotes: "Concise Notes",
      settings: "Settings",
      save: "Save",
      discard: "Discard",
      loading: "Loading...",
      pointsForts: "Strengths",
      pointsAmeliorer: "To Improve",
      step: "Next Steps",
      generate: "Run AI",
      branch: "Study Branch",
      language: "Language",
      style: "Learning Style",
      speed: "Speed",
      theme: "Theme",
      notEnoughData: "Not enough info",
      dataNeeded: "Data needed to unlock statistics",
      trackerDesc: "Keep adding sources and taking quizzes to see your Bac predictions.",
      guideTitle: "Mission: Ready for Bac",
      guideQuiz: "Pass at least 3 Quizzes",
      guideSource: "Add at least 2 Sources",
      guideTime: "Study for 60 minutes",
      browse: "Resource Browser",
      quickAdd: "Quick Add",
      searchCourses: "Search Bac courses...",
      officialCurriculum: "National Subjects",
      allChapters: "All Chapters",
      corrector: "Bac Corrector",
      exams: "BAC Exams",
    },
    Darija: {
      dashboard: "لوحة التحكم",
      notebooks: "الدفاتر ديالك",
      summary: "طريقك للتميز",
      mastery: "الضبط",
      newNotebook: "دفتر جديد",
      sources: "المصادر",
      chat: "دردشة",
      tools: "أدوات",
      performance: "خطة الدراسة",
      analytics: "التحليلات",
      curriculum: "المقرر",
      format: "شكل النتائج",
      detailedSummary: "ملخص مفصل",
      bulletPoints: "نقاط أساسية",
      conciseNotes: "ملاحظات قصيرة",
      settings: "الإعدادات",
      save: "حفظ",
      discard: "تراجع",
      loading: "تسنى شوية...",
      pointsForts: "نقاط القوة",
      pointsAmeliorer: "خاصهم يتحسنو",
      step: "المراحل الجاية",
      generate: "خدم الذكاء الاصطناعي",
      branch: "الشعبة",
      language: "اللغة",
      style: "طريقة التعلم",
      speed: "السرعة",
      theme: "المظهر",
      notEnoughData: "ماكافيش البيانات",
      dataNeeded: "افتح الإحصائيات ديالك",
      trackerDesc: "كمل إضافة المصادر ودوز الاختبارات باش تشوف التوقعات ديالك.",
      guideTitle: "المهمة: وجد للباك",
      guideQuiz: "دوز 3 اختبارات على الأقل",
      guideSource: "زيد 2 مصادر على الأقل",
      guideTime: "قرا لمدة 60 دقيقة",
      browse: "متصفح الموارد",
      quickAdd: "إضافة سريعة",
      searchCourses: "قلب على دروس الباك...",
      officialCurriculum: "المواد الوطنية",
      allChapters: "كاع الدروس",
      corrector: "مصحح الباك",
      exams: "امتحانات الباك",
    }
  };
  return dicts[lang][key] || key;
};
