// Backend image origin (no trailing slash)
const BACKEND_BASE = process.env.BACKEND_IMAGE_ORIGIN || 'http://srv36.mikr.us:20275';

// Minimal request/response types to avoid framework-specific deps
type ImageApiRequest = {
  query: { path?: string | string[] };
};

type ImageApiResponse = {
  status: (code: number) => ImageApiResponse;
  send: (body: string | Buffer) => void;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: ImageApiRequest, res: ImageApiResponse) {
  try {
    const pathParam = req.query.path as string[] | string | undefined;

    if (!pathParam) {
      res.status(400).send('Missing image path');
      return;
    }

    const pathParts = Array.isArray(pathParam) ? pathParam : [pathParam];

    // Build path after /images/
    const relativePath = pathParts.join('/');

    // Only allow images under /images/
    const targetUrl = `${BACKEND_BASE}/images/${relativePath}`;

    const upstream = await fetch(targetUrl);

    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream error fetching image: ${targetUrl}`);
      return;
    }

    // Copy content type and cache headers if present
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    const cacheControl = upstream.headers.get('cache-control');
    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl);
    } else {
      // Default cache policy: 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    }

    // Stream the body
    const arrayBuffer = await upstream.arrayBuffer();
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Image proxy error:', err);
    res.status(500).send('Internal image proxy error');
  }
}
