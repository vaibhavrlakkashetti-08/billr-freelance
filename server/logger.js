import winston from 'winston';
import SupabaseTransport from './supabaseTransport.js';


const env = process.env.NODE_ENV || 'development';
const isDevelopment = env === 'development';

// 1. Define sensitive keys to redact from logs
const SENSITIVE_KEYS = ['password', 'token', 'apikey', 'authorization', 'secret'];

// 2. Email Masking Function
const maskEmail = (email) => {
  if (typeof email !== 'string') return email;
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  
  const [localPart, domain] = parts;
  const maskedLocal = localPart.length > 2 
    ? `${localPart.charAt(0)}***${localPart.charAt(localPart.length - 1)}`
    : '***';
    
  return `${maskedLocal}@${domain}`;
};

// 3. Custom Format to Sanitize Sensitive Data
const scrubSensitiveInfo = winston.format((info) => {
  // A recursive function to traverse nested objects and redact data limitlessly
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
    }

    let sanitized = { ...obj };
    for (const key in sanitized) {
      if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (key.toLowerCase() === 'email') {
        sanitized[key] = maskEmail(sanitized[key]);
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitize(sanitized[key]);
      }
    }
    return sanitized;
  };
  
  if (info.meta) info.meta = sanitize(info.meta);
  if (info.email) info.email = maskEmail(info.email);
  
  return info;
});

// 4. Custom Format for Stack Traces
// Hide stack traces in production as required
const handleStackTraces = winston.format((info) => {
    if (!isDevelopment && info.stack) {
        delete info.stack;
    }
    return info;
});

// 5. Create Winston Logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    scrubSensitiveInfo(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // capture errors natively
    handleStackTraces(),
    winston.format.json()
  ),
  transports: [
    // Save to files natively
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // Save to Supabase
    new SupabaseTransport({ tableName: 'logs' })
  ]
});

// 6. Console Transport for Development Only
if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple() // Making it easier to read in console
    )
  }));
}

export default logger;
