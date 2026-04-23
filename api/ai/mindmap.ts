import { generateMindMapServer } from "../../src/services/gemini.server.ts";

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();
  const { sources, subject, settings, topic, format } = req.body;
  if (!subject) return res.status(400).json({ error: "Subject is required" });

  try {
    const data = await generateMindMapServer(sources, subject, settings, topic, format);
    res.status(200).json(data);
  } catch (err: any) {
    console.error("[MindMap Error]", err);
    res.status(500).json({ error: "Failed to generate mind map" });
  }
}
