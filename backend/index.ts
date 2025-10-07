import express, { Request, Response } from 'express';
import crypto from 'crypto';
import fetch, { RequestInit } from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Secret for encryption
const SECRET = process.env.SECRET || 'your-secret-key-change-this-in-production';
if (!SECRET) throw new Error('SECRET environment variable is required');

const PORT = process.env.PORT || 5000;
const KEY = crypto.createHash('sha256').update(SECRET).digest();

interface Payload {
  url: string;
  exp: number;
}

// Helper function to get BASE_URL dynamically from request
function getBaseUrl(req: Request): string {
  const protocol = req.headers['x-forwarded-proto'] || 
                   (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || 
               req.headers.host || 
               `localhost:${PORT}`;
  return `${protocol}://${host}`;
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
  if (!ivBase64 || !encryptedData) throw new Error('Invalid encrypted payload format');
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

// Helper to rewrite URLs in HTML content
function rewriteUrls(html: string, originalUrl: string, proxyToken: string, baseUrl: string): string {
  try {
    const urlObj = new URL(originalUrl);
    const originBase = `${urlObj.protocol}//${urlObj.host}`;
    
    // Rewrite absolute URLs to go through our proxy
    html = html.replace(
      /(?:href|src)=["']https?:\/\/[^"']+["']/gi,
      (match) => {
        const url = match.match(/["'](https?:\/\/[^"']+)["']/)?.[1];
        if (url && url.startsWith(originBase)) {
          // Keep same domain links going through proxy
          return match;
        }
        return match;
      }
    );
    
    // Rewrite relative URLs
    html = html.replace(
      /(?:href|src)=["'](?!https?:\/\/|\/\/|data:|javascript:|#)([^"']+)["']/gi,
      (match, relativeUrl) => {
        const absoluteUrl = new URL(relativeUrl, originalUrl).href;
        return match.replace(relativeUrl, absoluteUrl);
      }
    );
    
    // Add base tag to handle relative URLs
    const baseTag = `<base href="${originalUrl}">`;
    html = html.replace(/<head[^>]*>/i, (match) => match + baseTag);
    
  } catch (err) {
    console.error('Error rewriting URLs:', err);
  }
  
  return html;
}

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  res.json({ 
    status: 'ok', 
    message: 'Universal URL proxy server is running',
    baseUrl: baseUrl,
    features: [
      'Proxy HTML pages',
      'Proxy videos and media',
      'Proxy any web content',
      'Time-limited access',
      'URL encryption'
    ],
    endpoints: {
      shorten: `${baseUrl}/api/shorten`,
      redirect: `${baseUrl}/r/:token`,
      proxy: `${baseUrl}/p/:token (internal)`
    }
  });
});

// Create short URL - Works with ANY URL (HTML, video, images, etc.)
app.post('/api/shorten', (req: Request, res: Response) => {
  const { originalUrl, expirySeconds } = req.body as {
    originalUrl?: string;
    expirySeconds?: number;
  };

  if (!originalUrl || !expirySeconds) {
    return res.status(400).json({ error: 'originalUrl and expirySeconds required' });
  }

  // Validate URL format
  try {
    new URL(originalUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Validate expiry
  if (expirySeconds <= 0 || expirySeconds > 31536000) {
    return res.status(400).json({ error: 'expirySeconds must be between 1 and 31536000' });
  }

  const expiry = Math.floor(Date.now() / 1000) + expirySeconds;
  const payload: Payload = { url: originalUrl, exp: expiry };

  const encryptedPayload = encrypt(JSON.stringify(payload));
  const baseUrl = getBaseUrl(req);
  const shortUrl = `${baseUrl}/r/${encodeURIComponent(encryptedPayload)}`;

  console.log('✓ Short URL generated:', shortUrl);
  console.log('  Original URL:', originalUrl);
  console.log('  Expires in:', expirySeconds, 'seconds');

  res.json({ 
    shortUrl, 
    expiresAt: new Date(expiry * 1000),
    originalUrl: originalUrl,
    expirySeconds: expirySeconds
  });
});

/**
 * Public page route - Shows the fake URL in browser
 * Loads content via iframe from /p/:token
 */
app.get('/r/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) return res.status(400).send('Missing token');

  try {
    const decrypted = decrypt(decodeURIComponent(token));
    const payload: Payload = JSON.parse(decrypted);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      const expiredDate = new Date(payload.exp * 1000);
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Expired</title>
            <meta name="viewport" content="width=device-width,initial-scale=1"/>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .message {
                text-align: center;
                padding: 3rem;
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 400px;
              }
              h1 { color: #e74c3c; margin: 0 0 1rem 0; }
              p { color: #666; margin: 0.5rem 0; }
              .emoji { font-size: 4rem; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="message">
              <div class="emoji">⏰</div>
              <h1>Link Expired</h1>
              <p>This link expired on</p>
              <p><strong>${expiredDate.toLocaleString()}</strong></p>
              <p style="margin-top: 1rem;">Please request a new link.</p>
            </div>
          </body>
        </html>
      `);
    }

    const timeRemaining = payload.exp - now;
    const hoursRemaining = Math.floor(timeRemaining / 3600);
    const minutesRemaining = Math.floor((timeRemaining % 3600) / 60);

    // HTML shell with iframe - THIS is what user sees in address bar
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width,initial-scale=1"/>
          <title>Secure Preview</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { height: 100%; overflow: hidden; background: #000; }
            .frame { 
              width: 100vw; 
              height: 100vh; 
              border: 0; 
              display: block;
            }
            .info {
              position: fixed;
              top: 10px;
              right: 10px;
              background: rgba(0,0,0,0.8);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              font-size: 12px;
              z-index: 999999;
              backdrop-filter: blur(10px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .info:hover { background: rgba(0,0,0,0.95); }
            .lock { font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="info" title="This link will expire automatically">
            <span class="lock">🔒</span>
            Expires in: ${hoursRemaining}h ${minutesRemaining}m
          </div>
          <iframe class="frame" src="/p/${encodeURIComponent(token)}" allowfullscreen allow="autoplay; fullscreen"></iframe>
        </body>
      </html>
    `;

    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Error in /r/:token:', err);
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invalid Link</title>
          <meta name="viewport" content="width=device-width,initial-scale=1"/>
          <style>
            body { 
              font-family: Arial; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .box {
              background: white;
              padding: 3rem;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>❌ Invalid Link</h1>
            <p>This link is invalid or has been tampered with.</p>
          </div>
        </body>
      </html>
    `);
  }
});

/**
 * Internal proxy route - Actually fetches and serves the original content
 * This runs INSIDE the iframe, but address bar still shows /r/:token
 */
app.get('/p/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  if (!token) return res.status(400).send('Missing token');

  try {
    const decrypted = decrypt(decodeURIComponent(token));
    const payload: Payload = JSON.parse(decrypted);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(410).send('Link expired');
    }

    // Forward important headers
    const forwardHeaders: any = {};
    if (req.headers.range) forwardHeaders['range'] = req.headers.range;
    if (req.headers['user-agent']) forwardHeaders['user-agent'] = req.headers['user-agent'];
    if (req.headers.accept) forwardHeaders['accept'] = req.headers.accept;
    if (req.headers['accept-encoding']) forwardHeaders['accept-encoding'] = req.headers['accept-encoding'];

    const init: RequestInit = { 
      headers: forwardHeaders, 
      method: 'GET',
      redirect: 'follow'
    };

    console.log('→ Fetching from origin:', payload.url);
    const originRes = await fetch(payload.url, init);
    console.log('✓ Origin response:', originRes.status, originRes.statusText);

    if (!originRes.ok) {
      return res.status(originRes.status).send(`Error fetching content: ${originRes.statusText}`);
    }

    // Get content type to determine how to handle it
    const contentType = originRes.headers.get('content-type') || '';
    
    // Copy headers
    const contentLength = originRes.headers.get('content-length');
    const contentRange = originRes.headers.get('content-range');
    const acceptRanges = originRes.headers.get('accept-ranges');
    const cacheControl = originRes.headers.get('cache-control');

    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
    else res.setHeader('Accept-Ranges', 'bytes');
    if (cacheControl) res.setHeader('Cache-Control', cacheControl);
    else res.setHeader('Cache-Control', 'public, max-age=3600');

    // For HTML content, we can optionally rewrite URLs
    if (contentType.includes('text/html')) {
      const html = await originRes.text();
      const baseUrl = getBaseUrl(req);
      const rewrittenHtml = rewriteUrls(html, payload.url, token, baseUrl);
      res.status(originRes.status).send(rewrittenHtml);
    } else {
      // For non-HTML content (videos, images, etc.), stream directly
      if (!originRes.body) {
        return res.status(500).send('No response body from origin');
      }

      res.status(originRes.status);
      originRes.body.pipe(res);

      originRes.body.on('error', err => {
        console.error('Stream error:', err);
        if (!res.headersSent) return res.status(500).end();
        res.end();
      });
    }

    req.on('close', () => {
      console.log('✗ Client disconnected');
    });

  } catch (err) {
    console.error('Error in /p/:token:', err);
    return res.status(400).send('Invalid or tampered token');
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Universal URL Proxy Server Ready     ║
╠════════════════════════════════════════╣
║  Port: ${PORT}                           
║  Mode: Dynamic BASE_URL                ║
║  Supports: HTML, Video, Images, Docs   ║
╚════════════════════════════════════════╝
  `);
});