import Transport from 'winston-transport';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found in env. Supabase Transport will fail to initialize.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default class SupabaseTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.tableName = opts.tableName || 'logs';
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, meta, error, ...rest } = info;
    
    // Attempt to map HTTP request info
    const method = rest.method || meta?.method || null;
    const url = rest.url || meta?.url || null;
    const status = rest.status || meta?.status || null;
    const response_time = rest.responseTime || meta?.responseTime || null;
    const user_id = rest.user_id || meta?.user_id || null;
    
    try {
      const payload = {
        level,
        message,
        method,
        url,
        status: status ? parseInt(status) : null,
        response_time: response_time ? parseInt(response_time) : null,
        user_id,
        meta: meta || rest
      };

      // Background insert to prevent blocking the request cycle
      supabase.from(this.tableName).insert([payload]).then(({ error }) => {
          if (error) console.error("Error inserting log to Supabase:", error);
      });
    } catch (err) {
      console.error("Failed to parse log for Supabase transport:", err);
    }

    if (callback) {
      callback();
    }
  }
}
