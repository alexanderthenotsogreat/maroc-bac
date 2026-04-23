import { chatWithSourcesStreamServer } from "../../src/services/gemini.server.ts";

export const config = {
  runtime: 'nodejs',
  maxDuration: 60, // Allow up to 60s for AI generation
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sources, query, subject, settings } = req.body;

  try {
    const stream = await chatWithSourcesStreamServer(sources, query, subject, settings);
    
    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for Vercel/Nginx
    
    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(chunk.text);
        if (typeof res.flush === 'function') res.flush();
      }
    }
    
    res.end();
  } catch (err: any) {
    console.error("[AI Chat Stream Error]", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "Internal Server Error" });
    } else {
      res.end();
    }
  }
}
