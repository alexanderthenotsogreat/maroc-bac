export const config = {
  runtime: 'nodejs',
};

export default function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).end();
  const { query, branch } = req.query;
  
  const branchName = branch as string;
  if (!branchName) return res.status(400).send("Branch is required");

  const isTech = branchName.includes("Technologies") || branchName.includes("Mathématiques B");
  const isLit = branchName.includes("Lettres") || branchName.includes("Humaines") || branchName.includes("Arabe");
  const isEcon = branchName.includes("Économiques") || branchName.includes("Comptable");
  const isAgri = branchName.includes("Agronomiques");

  const results = [
    {
      title: `${query} - Cours & Exercices`,
      site: "AlloSchool.com",
      url: `https://www.alloschool.com/section/${encodeURIComponent(branchName)}`,
      description: `Ressources pédagogiques officielles pour la fillière ${branchName}. Contenu conforme au programme du Ministère de l'Éducation Nationale.`
    },
    {
      title: `Résumé complet : ${query}`,
      site: "Moutamadris.ma",
      url: "https://moutamadris.ma/",
      description: `Fiches de révision optimisées pour les élèves de ${branchName}.`
    }
  ];

  if (isTech) {
    results.push({
      title: `Schémas & Travaux Pratiques: ${query}`,
      site: "BacTechno.ma",
      url: "https://bactechno.ma/",
      description: "Focus sur les Sciences de l'Ingénieur et la conception technique."
    });
  } else if (isLit) {
    results.push({
      title: `Analyses Littéraires & Textes: ${query}`,
      site: "Adab.ma",
      url: "https://adab.ma/",
      description: "Approfondissement des textes littéraires et des courants philosophiques."
    });
  } else if (isEcon) {
    results.push({
      title: `Études de Cas & Comptabilité: ${query}`,
      site: "EcoMaroc.ma",
      url: "https://ecomaroc.ma/",
      description: "Analyses économiques et exercices de comptabilité analytique."
    });
  } else if (isAgri) {
    results.push({
      title: `Fiches Techniques Agronomie: ${query}`,
      site: "AgriOrientation.ma",
      url: "https://agriorientation.ma/",
      description: "Sciences du sol, biologie végétale et élevage."
    });
  } else {
    results.push({
      title: `Vidéos de vulgarisation: ${query}`,
      site: "Kezako.com",
      url: "https://kezako.com/",
      description: "Concepts scientifiques expliqués visuellement en Darija et Français."
    });
  }

  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
  res.status(200).json(results);
}
