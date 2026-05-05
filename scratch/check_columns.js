const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ijscuwvskpqwbygrhaqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY'
);

async function checkColumns() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Error fetching data:', error.message);
      
      // If table exists but empty, we can try to fetch table definition if possible
      // or just assume it's missing if we get a "column does not exist" error
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Existing columns:', Object.keys(data[0]));
    } else {
      console.log('No data found in users table. Try fetching a specific known column to check connectivity.');
      const { data: testData, error: testError } = await supabase.from('users').select('id').limit(1);
      if (testError) console.error('Test Error:', testError.message);
      else console.log('Connectivity OK. Table is empty.');
    }
  } catch (e) {
    console.error('Unexpected Error:', e.message);
  }
}

checkColumns();
