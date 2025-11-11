import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const admin = createClient(url, serviceKey);

async function run() {
  try {
    // Ambil 1 user pertama untuk contoh (sesuaikan atau hardcode UUID user Anda)
    const { data: users, error: usersErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (usersErr || !users?.users?.length) {
      console.error('Tidak ada user untuk di-seed. Buat user dulu via signup.');
      return;
    }
    const user = users.users[0];
    console.log('Seeding for user:', user.id, user.email);

    const now = new Date();
    const in1Min = new Date(now.getTime() + 60_000).toISOString();
    const in3Min = new Date(now.getTime() + 180_000).toISOString();

    const schedules = [
      { user_id: user.id, time: in1Min, portion: 2, active: true },
      { user_id: user.id, time: in3Min, portion: 1, active: true }
    ];

    for (const s of schedules) {
      const { error } = await admin.from('feeding_schedule').insert(s);
      if (error) console.error('Gagal insert schedule', s, error);
      else console.log('Inserted schedule', s.time);
    }

    console.log('Seed selesai. Jalankan cron trigger setelah waktu schedule lewat.');
  } catch (e) {
    console.error(e);
  }
}

run();
