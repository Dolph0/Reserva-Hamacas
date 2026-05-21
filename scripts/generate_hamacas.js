require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// We need the service role key to bypass RLS for inserts if RLS is on.
// Wait, we can just use the anon key if RLS allows inserts, or we can use the service role key.
// Let's check if we have a service role key in .env.local. If not, we'll try with anon key.
// Since this is a test environment, RLS might be disabled or allows anon to insert for now.

async function generate() {
  console.log('Authenticating as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@test.com',
    password: 'password123'
  });
  
  if (authError) {
    console.error('Auth error:', authError);
    return;
  }
  
  console.log('Generating hamacas for Sector Azul...');
  
  // Clear existing blue hamacas
  const { error: delError } = await supabase
    .from('hamacas')
    .delete()
    .eq('sector', 'azul');
    
  if (delError) {
    console.error('Error deleting existing hamacas:', delError);
    return;
  }

  const hamacasToInsert = [];
  let number = 1;

  // We have roughly 5 rows
  // Y coordinates for each row
  const rowsY = [17, 26, 36, 46, 56];
  
  // Each row has about 9-10 pairs of loungers.
  // The layout curves slightly, so we adjust the starting X for each row.
  const startingX = [8, 6, 4, 3, 2];

  for (let r = 0; r < rowsY.length; r++) {
    const y = rowsY[r];
    let currentX = startingX[r];
    
    // We'll create 9 pairs for row 0 and 1, 10 pairs for row 2,3,4.
    // Let's just create 9 pairs for all rows to be safe and keep it aligned, 
    // or just interpolate until we hit x > 95.
    
    while (currentX < 95) {
      // Lounger A (left of the pair)
      hamacasToInsert.push({
        sector: 'azul',
        number: number++,
        x_relative: currentX,
        y_relative: y,
        price_base: 20,
        status: 'available'
      });
      
      currentX += 4; // Distance between A and B in a pair
      
      // Lounger B (right of the pair)
      hamacasToInsert.push({
        sector: 'azul',
        number: number++,
        x_relative: currentX,
        y_relative: y,
        price_base: 20,
        status: 'available'
      });
      
      currentX += 6; // Distance between pairs (the umbrella space)
    }
  }

  console.log(`Generated ${hamacasToInsert.length} hamacas. Inserting...`);
  
  const { error: insError } = await supabase
    .from('hamacas')
    .insert(hamacasToInsert);

  if (insError) {
    console.error('Error inserting hamacas:', insError);
  } else {
    console.log('Successfully inserted all hamacas!');
  }
}

generate().catch(console.error);
