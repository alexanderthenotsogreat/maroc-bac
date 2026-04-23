import { 
  chatWithSourcesStreamServer, 
  generateFlashcardsServer, 
  generateQuizServer, 
  generateLearningPathServer, 
  generateStudyGuideServer, 
  generateMindMapServer, 
  generateSlidesServer, 
  generateTTSServer, 
  analyzeCorrectionServer 
} from "./gemini.server";

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

async function parseJsonBody(req: any) {
  if (req.body && Object.keys(req.body).length > 0) {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk: Buffer | string) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body: any;
  try {
    body = await parseJsonBody(req);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { action, ...payload } = body || {};
  if (!action || typeof action !== "string") {
    return res.status(400).json({ error: "Missing or invalid action parameter" });
  }

  try {
    switch (action) {
      case "chat": {
        const { sources, query, subject, settings } = payload;
        const stream = await chatWithSourcesStreamServer(sources, query, subject, settings);
        
        // Unified SSE Pattern for streaming
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        for await (const chunk of stream) {
          if (chunk.text) {
            res.write(chunk.text);
            if (typeof res.flush === 'function') res.flush();
          }
        }
        res.end();
        break;
      }

      case "quiz": {
        const { sources, subject, settings, difficulty, topic, depth } = payload;
        if (!subject) return res.status(400).json({ error: "Subject is required" });
        const data = await generateQuizServer(sources, subject, settings, difficulty, topic, depth);
        res.status(200).json(data);
        break;
      }

      case "flashcards": {
        const { sources, subject, settings, topic, depth } = payload;
        if (!subject) return res.status(400).json({ error: "Subject is required" });
        const data = await generateFlashcardsServer(sources, subject, settings, topic, depth);
        res.status(200).json(data);
        break;
      }

      case "slides": {
        const { sources, subject, settings, topic, format } = payload;
        if (!subject) return res.status(400).json({ error: "Subject is required" });
        const data = await generateSlidesServer(sources, subject, settings, topic, format);
        res.status(200).json(data);
        break;
      }

      case "mindmap": {
        const { sources, subject, settings, topic, format } = payload;
        if (!subject) return res.status(400).json({ error: "Subject is required" });
        const data = await generateMindMapServer(sources, subject, settings, topic, format);
        res.status(200).json(data);
        break;
      }

      case "learning-path": {
        const { subject, progress, settings, sourceContext } = payload;
        if (!subject) return res.status(400).json({ error: "Subject is required" });
        const data = await generateLearningPathServer(subject, progress, settings, sourceContext);
        res.status(200).json(data);
        break;
      }

      case "study-guide": {
        const { sources, subject, settings, topic, format } = payload;
        if (!subject) return res.status(400).json({ error: "Subject is required" });
        const data = await generateStudyGuideServer(sources, subject, settings, topic, format);
        res.status(200).json(data);
        break;
      }

      case "tts": {
        const { text, voice, language } = payload;
        if (!text) return res.status(400).json({ error: "Text is required" });
        const audio = await generateTTSServer(text, voice, language);
        res.status(200).json({ data: audio });
        break;
      }

      case "correction": {
        // Vercel Payload Limit (4.5MB) protection
        const contentLength = parseInt(req.headers['content-length'] || '0');
        if (contentLength > 4000000) {
          return res.status(413).json({ error: "L'image est trop volumineuse (max 4Mo)" });
        }
        const { imageBuffers, subject, settings, sources, history } = payload;
        if (!imageBuffers || !subject) return res.status(400).json({ error: "Missing required fields" });
        const data = await analyzeCorrectionServer(imageBuffers, subject, settings, sources, history);
        res.status(200).json({ text: data });
        break;
      }

      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    console.error(`[AI API Error] Action: ${action}`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal AI processing failed" });
    } else {
      res.end();
    }
  }
}