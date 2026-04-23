import { generateTTSServer } from "../../src/services/gemini.server.ts";

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();
  const { text, voice, language } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  
  try {
    const audio = await generateTTSServer(text, voice, language);
    res.status(200).json({ data: audio });
  } catch (err: any) {
    console.error("[TTS Error]", err);
    res.status(500).json({ error: "Failed to generate audio" });
  }
}
