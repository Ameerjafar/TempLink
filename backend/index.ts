import express, { Request, Response } from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';
import cors from 'cors';
const app = express();
app.use(cors())
app.use(express.json());
// Secret for encryption
const SECRET = process.env.SECRET!;
if (!SECRET) throw new Error("SECRET environment variable is required");

const BASE_URL = 'http://localhost:5000';
const KEY = crypto.createHash('sha256').update(SECRET).digest();

interface Payload {
  url: string;
  exp: number;
}

// AES encryption
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  let encrypted = cipher.update(text, 'utf-8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

// AES decryption
function decrypt(enc: string): string {
  const [ivBase64, encryptedData] = enc.split(':');
  const iv = Buffer.from(ivBase64!, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  let decrypted = decipher.update(encryptedData!, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

// Create short URL - NO VALIDATION
app.post('/api/shorten', (req: Request, res: Response) => {
  const { originalUrl, expirySeconds } = req.body as { 
    originalUrl?: string; 
    expirySeconds?: number;
  };
  
  if (!originalUrl || !expirySeconds) {
    return res.status(400).json({ error: 'originalUrl and expirySeconds required' });
  }

  const expiry = Math.floor(Date.now() / 1000) + expirySeconds;
  const payload: Payload = { url: originalUrl, exp: expiry };

  const encryptedPayload = encrypt(JSON.stringify(payload));
  const shortUrl = `${BASE_URL}/r/${encodeURIComponent(encryptedPayload)}`;

  console.log('Short URL generated:', shortUrl);

  res.json({ shortUrl, expiresAt: new Date(expiry * 1000) });
});

// Serve video content with streaming and Range support
app.get('/r/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) return res.status(400).send('Missing token');

  try {
    const decrypted = decrypt(decodeURIComponent(token));
    const payload: Payload = JSON.parse(decrypted);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(410).send('Link expired');
    }

    // Forward Range headers if present
    const headers: any = {};
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
      console.log('Range requested:', req.headers.range);
    }

    const response = await fetch(payload.url, { headers });
    
    console.log('Origin response status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Accept-Ranges:', response.headers.get('accept-ranges'));

    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      return res.status(response.status).send('Error fetching original content');
    }

    if (!response.body) {
      return res.status(500).send('No response body');
    }

    // Set the correct status code (206 for partial content, 200 for full)
    res.status(response.status);

    // Copy all relevant headers
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
    else res.setHeader('Accept-Ranges', 'bytes'); // Add default for video streaming

    // Additional headers for better streaming
    res.setHeader('Cache-Control', 'no-cache');

    // Pipe the stream properly
    response.body.pipe(res);

    response.body.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    });

    // Handle client disconnect
    req.on('close', () => {
      console.log('Client disconnected, destroying stream');
      response.body?.destroy();
    });

  } catch (err) {
    console.error('Error in /r/:token:', err);
    if (!res.headersSent) {
      return res.status(400).send('Invalid or tampered token');
    }
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on ${5000}`));