import { BacExam } from "../types";

export const BAC_EXAMS: BacExam[] = [
  // Mathematics
  {
    id: "math-2024-n",
    year: 2024,
    session: "Normal",
    subject: "Mathematics",
    branch: "Sciences Physiques / SVT",
    chapters: ["Nombres Complexes", "Suites Numériques", "Fonctions Numériques", "Calcul de Probabilités", "Calcul Intégral"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2024/06/Math-PC-SVT-Normal-2024.pdf",
    difficulty: "Medium"
  },
  {
    id: "math-2023-n",
    year: 2023,
    session: "Normal",
    subject: "Mathematics",
    branch: "Sciences Physiques / SVT",
    chapters: ["Nombres Complexes", "Suites Numériques", "Fonctions Numériques", "Probabilités", "Calcul Intégral"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2023/06/math-pc-svt-norm-2023.pdf",
    difficulty: "Medium"
  },
  {
    id: "math-2023-sm-n",
    year: 2023,
    session: "Normal",
    subject: "Mathematics",
    branch: "Sciences Mathématiques",
    chapters: ["Arithmétique", "Structures Algébriques", "Analyse", "Probabilités"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2023/06/Math-SM-Normal-2023.pdf",
    difficulty: "Hard"
  },
  {
    id: "math-2022-n",
    year: 2022,
    session: "Normal",
    subject: "Mathematics",
    branch: "Sciences Mathématiques",
    chapters: ["Ensembles et Applications", "Structures Algébriques", "Arithmétique", "Espaces Vectoriels", "Probabilités"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2022/06/math-sm-norm-2022.pdf",
    difficulty: "Hard"
  },
  {
    id: "math-2021-n",
    year: 2021,
    session: "Normal",
    subject: "Mathematics",
    branch: "Sciences Physiques / SVT",
    chapters: ["Nombres Complexes", "Suites Numériques", "Fonctions Numériques", "Calcul Intégral"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2021/06/math-pc-svt-norm-2021.pdf",
    difficulty: "Medium"
  },
  // Physics
  {
    id: "pc-2024-n",
    year: 2024,
    session: "Normal",
    subject: "Physics",
    branch: "Sciences Physiques",
    chapters: ["Ondes Lumineuses", "Radioactivité", "Dipôle RL", "Mécanique du point"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2024/06/pc-norm-2024.pdf",
    difficulty: "Medium"
  },
  {
    id: "pc-2023-n",
    year: 2023,
    session: "Normal",
    subject: "Physics",
    branch: "Sciences Physiques",
    chapters: ["Ondes Lumineuses", "Dipôle RC", "Systèmes Oscillants", "Lois de Newton", "Satellites et Planètes"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2023/06/PC-Normal-2023.pdf",
    difficulty: "Medium"
  },
  {
    id: "pc-2022-n",
    year: 2022,
    session: "Normal",
    subject: "Physics",
    branch: "Sciences Physiques",
    chapters: ["Ondes Mécaniques Progressives", "Décroissance Radioactive", "Dipôle RL", "Chute Verticale", "Mouvements Plans"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2022/06/pc-norm-2022.pdf",
    difficulty: "Medium"
  },
  // SVT
  {
    id: "svt-2024-n",
    year: 2024,
    session: "Normal",
    subject: "SVT",
    branch: "Sciences de la Vie et de la Terre",
    chapters: ["TP ATP", "Génétique des Populations", "Immunologie"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2024/06/svt-norm-2024.pdf",
    difficulty: "Medium"
  },
  {
    id: "svt-2023-n",
    year: 2023,
    session: "Normal",
    subject: "SVT",
    branch: "Sciences de la Vie et de la Terre",
    chapters: ["Consommation de la Matière Organique", "Rôle du Muscle Strié", "Immunologie", "Génétique Humaine"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2023/06/SVT-Normal-2023.pdf",
    difficulty: "Medium"
  },
  {
    id: "svt-2022-n",
    year: 2022,
    session: "Normal",
    subject: "SVT",
    branch: "Sciences de la Vie et de la Terre",
    chapters: ["Consommation de la Matière Organique", "Immunologie"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2022/06/svt-norm-2022.pdf",
    difficulty: "Medium"
  },
  // Philosophy
  {
    id: "philo-2023-n",
    year: 2023,
    session: "Normal",
    subject: "Philosophy",
    branch: "Toutes Branches",
    chapters: ["La Personne", "La Vérité", "L'État", "La Justice et le Droit"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2023/06/philo-norm-2023.pdf",
    difficulty: "Easy"
  },
  {
    id: "philo-2024-n",
    year: 2024,
    session: "Normal",
    subject: "Philosophy",
    branch: "Toutes Branches",
    chapters: ["Le Devoir", "La Politique", "Le Bonheur"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2024/06/philo-norm-2024.pdf",
    difficulty: "Easy"
  },
  // English
  {
    id: "eng-2023-n",
    year: 2023,
    session: "Normal",
    subject: "English",
    branch: "Toutes Branches",
    chapters: ["Gifts of Youth", "Women and Power", "The Citizenship", "Humour"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2023/06/eng-norm-2023.pdf",
    difficulty: "Easy"
  },
  {
    id: "eng-2024-n",
    year: 2024,
    session: "Normal",
    subject: "English",
    branch: "Toutes Branches",
    chapters: ["Brain Drain", "Science and Technology", "International Organizations"],
    pdfUrl: "https://www.mutamadris.ma/wp-content/uploads/2024/06/eng-norm-2024.pdf",
    difficulty: "Easy"
  },
  // specialized
  {
    id: "econ-2023-n",
    year: 2023,
    session: "Normal",
    subject: "Economics",
    branch: "Sciences Économiques",
    chapters: ["Le Marché", "Les Agrégats", "La Politique Monétaire", "La Politique Budgétaire", "Le Commerce Extérieur"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2023/06/Economic-Generale-Normal-2023.pdf",
    difficulty: "Medium"
  },
  {
    id: "account-2023-n",
    year: 2023,
    session: "Normal",
    subject: "Accounting",
    branch: "Gestion Comptable",
    chapters: ["Amortissements", "Provisions", "Régularisation des Stocks", "Analyse de Gestion"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2023/06/Comptabilite-Normal-2023.pdf",
    difficulty: "Medium"
  },
  {
    id: "si-2023-n",
    year: 2023,
    session: "Normal",
    subject: "Engineering Sciences",
    branch: "STE / STM",
    chapters: ["Analyse Fonctionnelle", "Chaîne d'énergie", "Chaîne d'information", "Automatique"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2023/06/SI-STE-Normal-2023.pdf",
    difficulty: "Hard"
  },
  {
    id: "arts-2023-n",
    year: 2023,
    session: "Normal",
    subject: "Applied Arts",
    branch: "Arts Appliqués",
    chapters: ["Culture Plastique", "Design de Produit", "Histoire de l'Art"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2023/06/Arts-Appliques-Normal-2023.pdf",
    difficulty: "Medium"
  },
  {
    id: "agri-2023-n",
    year: 2023,
    session: "Normal",
    subject: "Agronomy",
    branch: "Sciences Agronomiques",
    chapters: ["Biologie Végétale", "Sols", "Économie Rurale"],
    pdfUrl: "https://moutamadris.ma/wp-content/uploads/2023/06/Sciences-Agronomiques-Normal-2023.pdf",
    difficulty: "Medium"
  }
];
