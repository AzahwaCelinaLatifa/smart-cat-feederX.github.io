import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey);

async function main() {
  try {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 50 });
    if (error) {
      console.error('List users error:', error);
      process.exit(1);
    }
    console.log(`Total users returned: ${data.users.length}`);
    for (const u of data.users) {
      console.log(`${u.id}  ${u.email}  created_at=${u.created_at}`);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
