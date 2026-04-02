import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import logger from './logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client for backend queries
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Custom Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Wait for the response to finish
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    
    // Do not log the /logs fetching itself to avoid infinite feedback loops of logging
    if (req.path === '/api/logs') return;

    logger.info(`HTTP ${req.method} ${req.url}`, {
      meta: {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime,
      }
    });
  });
  
  next();
});

// Middleware to protect routes via Supabase Auth
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    logger.warn('Unauthorized access attempt to logs', { 
      meta: { url: req.url, method: req.method } 
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Admin Role Check
  const adminEmailsVar = process.env.VITE_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
  const adminEmails = adminEmailsVar ? adminEmailsVar.split(',').map(e => e.trim()) : [];
  if (adminEmails.length > 0 && !adminEmails.includes(user.email)) {
    logger.warn('Forbidden access attempt to logs by non-admin', {
      meta: { email: user.email, url: req.url, method: req.method }
    });
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  req.user = user;
  next();
};

// API Endpoint to fetch logs
// GET /api/logs?level=error&search=text&page=1&limit=50
app.get('/api/logs', requireAuth, async (req, res) => {
  try {
    const { level, search, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('logs')
      .select('*', { count: 'exact' });

    if (level && level !== 'all') {
      query = query.eq('level', level);
    }
    
    if (search) {
      query = query.or(`message.ilike.%${search}%,url.ilike.%${search}%`);
    }

    // Sort by latest first
    query = query.order('created_at', { ascending: false });
    
    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      logs: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
    
  } catch (err) {
    logger.error('Failed to fetch logs', { error: err });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Basic test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend server!' });
});

// Root endpoint for browser visits and health checks
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; margin: 0;">
        <div style="text-align: center; padding: 2rem; background: #1e293b; border-radius: 12px; border: 1px solid #334155;">
          <h1 style="color: #38bdf8; margin-top: 0;">Backend Server is Running! 🚀</h1>
          <p style="color: #94a3b8; margin-bottom: 0;">The API is successfully deployed and listening securely.</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Backend Server running on port ${port}`);
});
