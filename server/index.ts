import 'dotenv/config';
import path from 'path';
import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { createServer } from "http";
import { createClient } from '@supabase/supabase-js';

// Validasi environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function untuk mendapatkan user dari header
async function getUserFromAuthHeader(authHeader?: string) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.slice(7);
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

const app = express();

// Middleware dasar
app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 100) logLine = logLine.slice(0, 99) + "…";
      console.log(`[${new Date().toISOString()}] ${logLine}`);
    }
  });

  next();
});

// Auth middleware
async function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = await getUserFromAuthHeader(req.headers.authorization);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  (req as any).user = { id: user.id };
  next();
}

// Health endpoint
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Admin signup endpoint (auto-confirm email) - optional
// Requires env ALLOW_ADMIN_SIGNUP=true and uses service role to create a confirmed user
app.post('/api/auth/signup', async (req, res) => {
  if (process.env.ALLOW_ADMIN_SIGNUP !== 'true') {
    return res.status(403).json({ message: 'Signup disabled' });
  }
  const { email, password } = req.body || {};
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email & password required' });
  }
  try {
    // Supabase v2 currently does not expose direct email_confirm flag in signUp via admin.
    // Workaround: create user via admin.auth.admin.inviteUserByEmail (which sends email) then set password if needed.
    // Simpler path: use signUp then rely on email confirmation (cannot force confirm without SMTP bypass).
    // Here we attempt signUp and inform client whether confirmation needed.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    } as any);
    if (error) return res.status(400).json({ message: error.message });
    return res.status(201).json({ id: data.user?.id, email: data.user?.email });
  } catch (e: any) {
    return res.status(500).json({ message: e.message || 'Signup failed' });
  }
});

// Manual feed endpoint
app.post('/api/feed/manual', auth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const portion = Number(req.body?.portion);
    
    if (!Number.isFinite(portion) || portion < 1 || portion > 10) {
      return res.status(400).json({ message: 'Portion harus 1..10' });
    }

    const nowIso = new Date().toISOString();

    // Insert history
    const { error: historyError } = await supabaseAdmin
      .from('feeding_history')
      .insert({ user_id: userId, feeding_time: nowIso, portion, method: 'manual' });

    if (historyError) {
      console.error(historyError);
      return res.status(500).json({ message: 'Gagal mencatat history' });
    }

    // Update status
    const { error: statusError } = await supabaseAdmin
      .from('device_status')
      .upsert({ user_id: userId, device_id: `device_${userId}`, status: 'online', last_fed: nowIso }, { onConflict: 'user_id' });

    if (statusError) {
      console.error(statusError);
      return res.status(500).json({ message: 'Gagal memperbarui status' });
    }

    return res.status(200).json({ message: 'Pemberian makan berhasil' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// Schedule endpoints
app.get('/api/schedule', auth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data, error } = await supabaseAdmin
    .from('feeding_schedule')
    .select('*')
    .eq('user_id', userId)
    .order('next_feed_at', { ascending: true, nullsFirst: false });
  if (error) return res.status(500).json({ message: 'Gagal mengambil jadwal' });
  return res.json(data ?? []);
});

app.post('/api/schedule', auth, async (req, res) => {
  const userId = (req as any).user.id;
  const { portion, active, intervals, start_on_detection, initial_start_time } = req.body ?? {};
  const p = Number(portion);
  if (!Number.isFinite(p) || p < 1 || p > 10) {
    return res.status(400).json({ message: 'Portion 1..10' });
  }
  let seq: number[] = Array.isArray(intervals) ? intervals.map(Number).filter(n => Number.isFinite(n) && n > 0) : [];
  if (seq.length === 0) {
    return res.status(400).json({ message: 'Intervals required (array of positive hours)' });
  }
  if (seq.length > 24) {
    return res.status(400).json({ message: 'Too many intervals (max 24)' });
  }
  const startOnDetection = Boolean(start_on_detection);
  let nextFeedAt: string | null = null;
  let lastFeed: string | null = null;
  // If not waiting for detection and an initial_start_time provided, arm immediately
  if (!startOnDetection) {
    const base = initial_start_time ? new Date(initial_start_time) : new Date();
    if (isNaN(base.getTime())) return res.status(400).json({ message: 'Invalid initial_start_time' });
    const firstHours = seq[0];
    lastFeed = base.toISOString(); // treat base as first feed time (or detection time)
    nextFeedAt = new Date(base.getTime() + firstHours * 3600000).toISOString();
  }
  const insertObj: any = {
    user_id: userId,
    portion: p,
    active: Boolean(active),
    intervals: seq,
    start_on_detection: startOnDetection,
    sequence_index: 0,
    last_feed: lastFeed,
    next_feed_at: nextFeedAt
  };
  const { data, error } = await supabaseAdmin
    .from('feeding_schedule')
    .insert(insertObj)
    .select()
    .single();
  if (error) return res.status(500).json({ message: 'Gagal menyimpan jadwal' });
  return res.status(201).json(data);
});

app.put('/api/schedule/:id', auth, async (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const updates: any = {};
  if (req.body?.portion !== undefined) {
    const p = Number(req.body.portion);
    if (!Number.isFinite(p) || p < 1 || p > 10) return res.status(400).json({ message: 'Portion 1..10' });
    updates.portion = p;
  }
  if (req.body?.active !== undefined) updates.active = Boolean(req.body.active);
  if (req.body?.intervals !== undefined) {
    let seq: number[] = Array.isArray(req.body.intervals) ? req.body.intervals.map(Number).filter(n => Number.isFinite(n) && n > 0) : [];
    if (seq.length === 0) return res.status(400).json({ message: 'Intervals required' });
    updates.intervals = seq;
    // Reset sequence index if intervals changed length
    updates.sequence_index = 0;
  }
  if (req.body?.start_on_detection !== undefined) updates.start_on_detection = Boolean(req.body.start_on_detection);
  // Optionally allow re-arming with initial_start_time
  if (req.body?.initial_start_time !== undefined) {
    const base = new Date(req.body.initial_start_time);
    if (isNaN(base.getTime())) return res.status(400).json({ message: 'Invalid initial_start_time' });
    updates.last_feed = base.toISOString();
    // compute next feed
    const { data: current } = await supabaseAdmin.from('feeding_schedule').select('intervals').eq('id', id).eq('user_id', userId).single();
    const intervals = updates.intervals || current?.intervals || [];
    if (intervals.length) {
      updates.next_feed_at = new Date(base.getTime() + intervals[0] * 3600000).toISOString();
      updates.sequence_index = 0;
    }
  }

  const { data, error } = await supabaseAdmin
    .from('feeding_schedule')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return res.status(500).json({ message: 'Gagal memperbarui jadwal' });
  return res.json(data);
});

app.delete('/api/schedule/:id', auth, async (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { error } = await supabaseAdmin
    .from('feeding_schedule')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) return res.status(500).json({ message: 'Gagal menghapus jadwal' });
  return res.status(204).send();
});

// Endpoint to notify first detection event (arms schedules with start_on_detection)
app.post('/api/detection', auth, async (req, res) => {
  const userId = (req as any).user.id;
  const detectionTime = new Date();
  const detectionIso = detectionTime.toISOString();
  // For each active schedule waiting on detection and not yet armed (last_feed null)
  const { data: waiting, error } = await supabaseAdmin
    .from('feeding_schedule')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .eq('start_on_detection', true)
    .is('last_feed', null);
  if (error) return res.status(500).json({ message: 'Failed to query schedules' });
  for (const sched of waiting ?? []) {
    const firstInterval = (sched.intervals || [])[0];
    if (!firstInterval) continue;
    const nextFeedAt = new Date(detectionTime.getTime() + firstInterval * 3600000).toISOString();
    await supabaseAdmin.from('feeding_schedule').update({ last_feed: detectionIso, next_feed_at: nextFeedAt, sequence_index: 0 }).eq('id', sched.id);
  }
  return res.json({ armed: waiting?.length || 0 });
});

// History endpoint
app.get('/api/history', auth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data, error } = await supabaseAdmin
    .from('feeding_history')
    .select('*')
    .eq('user_id', userId)
    .order('feeding_time', { ascending: false });
  if (error) return res.status(500).json({ message: 'Gagal mengambil history' });
  return res.json(data ?? []);
});

// Status endpoint
app.get('/api/status', auth, async (req, res) => {
  const userId = (req as any).user.id;
  const { data, error } = await supabaseAdmin
    .from('device_status')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) return res.status(200).json({ status: 'offline', last_fed: null });
  return res.json({ status: data.status, last_fed: data.last_fed });
});

// Cron trigger endpoint
app.post('/api/cron/trigger', async (req, res) => {
  const secret = (req.headers.authorization || '').replace('Bearer ', '');
  if (!secret || secret !== process.env.CRON_SECRET) return res.status(401).json({ message: 'Unauthorized' });

  const now = new Date();
  const nowIso = now.toISOString();
  const fiveMinAgoIso = new Date(now.getTime() - 5 * 60000).toISOString();

  // Fetch schedules where next_feed_at within window
  const { data: schedules, error } = await supabaseAdmin
    .from('feeding_schedule')
    .select('*')
    .eq('active', true)
    .not('next_feed_at', 'is', null)
    .lte('next_feed_at', nowIso)
    .gte('next_feed_at', fiveMinAgoIso);

  if (error) {
    console.error(error);
    return res.status(500).json({ message: 'Cron query failed' });
  }

  for (const s of schedules ?? []) {
    // Record feed
    await supabaseAdmin.from('feeding_history').insert({
      user_id: s.user_id,
      feeding_time: nowIso,
      portion: s.portion,
      method: 'automatic'
    });
    await supabaseAdmin.from('device_status')
      .upsert({ user_id: s.user_id, device_id: `device_${s.user_id}`, status: 'online', last_fed: nowIso }, { onConflict: 'user_id' });
    // Compute next in sequence
    const intervals: number[] = s.intervals || [];
    if (intervals.length) {
      const nextIndex = (s.sequence_index + 1) % intervals.length;
      const hours = intervals[nextIndex];
      const nextFeedAt = new Date(Date.now() + hours * 3600000).toISOString();
      await supabaseAdmin.from('feeding_schedule').update({
        last_feed: nowIso,
        next_feed_at: nextFeedAt,
        sequence_index: nextIndex
      }).eq('id', s.id);
    } else {
      // No intervals -> disable next
      await supabaseAdmin.from('feeding_schedule').update({ last_feed: nowIso, next_feed_at: null }).eq('id', s.id);
    }
  }

  return res.json({ message: 'Cron job executed', processed: (schedules ?? []).length });
});

// Tambah logger sederhana (ganti penggunaan log dari vite.ts)
function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

(async () => {
  // buat HTTP server langsung dari Express app
  const server = createServer(app);

  // Development: redirect root ke Vite dev server (default 5173)
  app.get('/', (_req, res) => {
    const viteUrl = process.env.VITE_URL || 'http://localhost:5173';
    return res.redirect(307, viteUrl);
  });

  // 404 handler
  app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Error' });
  });

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "127.0.0.1";

  server.listen(port, host, () => {
    log(`Server running at http://${host}:${port}`);
  });
})();
