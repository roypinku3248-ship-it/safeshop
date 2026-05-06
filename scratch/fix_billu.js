
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijscuwvskpqwbygrhaqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBillu() {
  // 1. Link Billu to Biku
  const { error } = await supabase
    .from('users')
    .update({ referred_by: 'SS-USR-5659' }) // Biku's ID
    .eq('email', 'billu@gmail.com');
  
  if (error) {
    console.error('Error fixing Billu:', error.message);
  } else {
    console.log('✅ Successfully linked Billu to Biku.');
  }
}

fixBillu();
