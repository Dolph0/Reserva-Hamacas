require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We need the service role key to insert users into auth without restrictions and bypass RLS to update roles.
// Since we don't have it in .env, wait! I only have anon key.
// But Supabase JS allows signup with anon key.
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding users...');
  
  const users = [
    { email: 'client@test.com', password: 'password123', name: 'Test Client', role: 'client' },
    { email: 'worker@test.com', password: 'password123', name: 'Test Worker', role: 'worker' },
    { email: 'admin@test.com', password: 'password123', name: 'Test Admin', role: 'admin' },
  ];

  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          name: u.name
        }
      }
    });

    if (error) {
      console.log(`Error creating ${u.email}:`, error.message);
    } else {
      console.log(`Created ${u.email} with id ${data.user?.id}`);
      
      // Since handle_new_user trigger inserts into profiles, we just need to update the role.
      // But RLS prevents updating other profiles. We can use SQL directly via MCP to update roles instead of here.
      // We will do that next.
    }
  }
}

seed().catch(console.error);
