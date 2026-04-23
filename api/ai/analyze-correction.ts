import { analyzeCorrectionServer } from "../../src/services/gemini.server.ts";

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();
  
  // Vercel Payload limit is 4.5MB
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 4000000) { // 4MB safe limit
    return res.status(413).json({ error: "L'image est trop volumineuse (max 4Mo)" });
  }

  const { imageBuffers, subject, settings, sources, history } = req.body;
  if (!imageBuffers || !subject) return res.status(400).json({ error: "Missing required fields" });

  try {
    const data = await analyzeCorrectionServer(imageBuffers, subject, settings, sources, history);
    res.status(200).json({ text: data });
  } catch (err: any) {
    console.error("[Correction Error]", err);
    res.status(500).json({ error: "Failed to analyze correction" });
  }
}
