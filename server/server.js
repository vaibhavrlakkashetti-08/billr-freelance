import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

dotenv.config();

/* ─── Startup env validation ──────────────────────────────── */
const REQUIRED = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing  = REQUIRED.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[BILLR-SERVER] Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const app  = express();
const port = process.env.PORT || 3000;

/* ─── CORS ─────────────────────────────────────────────────── */
// Allow only the Netlify origin (set ALLOWED_ORIGINS in Render env)
// Format: comma-separated list, e.g. "https://your-app.netlify.app,https://yourdomain.com"
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { meta: { origin } });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/* ─── Middleware ────────────────────────────────────────────── */
app.use(helmet());                          // Sets 12 security-related HTTP headers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));        // Handle preflight requests
app.use(express.json({ limit: '50kb' }));  // Prevent giant request body attacks

/* ─── Rate limiting ─────────────────────────────────────────── */
// Global limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Stricter limiter for the logs endpoint
const logsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded on logs endpoint.' },
});

app.use(globalLimiter);

/* ─── Supabase clients ──────────────────────────────────────── */
// Anon client: for verifying user JWTs (auth.getUser)
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Service-role client: for privileged DB operations (reads logs table, bypasses RLS)
// NEVER expose this key to the frontend
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
);

/* ─── HTTP Request Logger ───────────────────────────────────── */
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path === '/api/logs') return; // avoid infinite feedback loop
    const responseTime = Date.now() - start;
    logger.info(`HTTP ${req.method} ${req.path}`, {
      meta: {
        method: req.method,
        url: req.path,
        status: res.statusCode,
        responseTime,
      }
    });
  });
  next();
});

/* ─── Auth middleware ───────────────────────────────────────── */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7); // Remove 'Bearer '

  // Use anon client to validate the user's JWT
  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);

  if (error || !user) {
    logger.warn('Unauthorized access attempt', {
      meta: { url: req.path, method: req.method }
    });
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }

  // Admin role check — only whitelisted emails can access logs
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

  if (adminEmails.length > 0 && !adminEmails.includes(user.email)) {
    logger.warn('Forbidden: non-admin attempted to access logs', {
      meta: { userEmail: user.email?.replace(/(.{2}).*@/, '$1***@'), url: req.path }
    });
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  req.user = user;
  next();
};

/* ─── Routes ────────────────────────────────────────────────── */

// GET /api/logs — fetches paginated logs (admin only)
app.get('/api/logs', logsLimiter, requireAuth, async (req, res) => {
  try {
    const { level, search, page = 1, limit = 50 } = req.query;
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // cap at 100
    const offset   = (pageNum - 1) * limitNum;

    // Use supabaseAdmin so we bypass the RLS "FOR SELECT USING (false)" on logs table
    let query = supabaseAdmin
      .from('logs')
      .select('id, level, message, method, url, status, response_time, created_at', { count: 'exact' });

    if (level && level !== 'all') {
      query = query.eq('level', level);
    }
    if (search) {
      query = query.or(`message.ilike.%${search}%,url.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limitNum - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    res.json({
      logs: data,
      total: count,
      page: pageNum,
      totalPages: Math.ceil((count || 0) / limitNum)
    });

  } catch (err) {
    logger.error('Failed to fetch logs', { error: err.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/health — public health-check for Render uptime monitoring
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Root
app.get('/', (_req, res) => {
  res.send(`
    <html>
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:white;margin:0;">
        <div style="text-align:center;padding:2rem;background:#1e293b;border-radius:12px;border:1px solid #334155;">
          <h1 style="color:#38bdf8;margin-top:0;">BILLR Backend API 🚀</h1>
          <p style="color:#94a3b8;margin-bottom:0;">Running securely on Render.</p>
        </div>
      </body>
    </html>
  `);
});

/* ─── 404 handler ───────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/* ─── Global error handler ──────────────────────────────────── */
app.use((err, req, res, _next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy rejected this request' });
  }
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal Server Error' });
});

/* ─── Start ─────────────────────────────────────────────────── */
app.listen(port, () => {
  console.log(`[BILLR-SERVER] Running on port ${port} | NODE_ENV=${process.env.NODE_ENV || 'development'}`);
});
