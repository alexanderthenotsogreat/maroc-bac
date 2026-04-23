export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).end();
  const { url, filename } = req.query;
  if (!url) return res.status(400).send("URL is required");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(url as string, {
      signal: controller.signal as any,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,application/octet-stream,*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.google.com/'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).send(`The source website is currently unavailable.`);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      return res.status(403).send("Could not access the PDF directly due to source website protection.");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'examen-bac.pdf'}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    return res.status(200).send(buffer);
  } catch (err: any) {
    if (err.name === 'AbortError') return res.status(504).send("Request timed out.");
    return res.status(500).send("Communication error with the source website.");
  }
}
