
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ijscuwvskpqwbygrhaqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY'
);

async function check() {
  const { data: biku } = await supabase.from('users').select('id').eq('email', 'biku@gmail.com').single();
  console.log('Biku ID:', biku?.id);

  const { data: referrals } = await supabase.from('users').select('id,name,email,status,referred_by').eq('referred_by', biku?.id);
  console.log('\nBiku direct referrals:');
  referrals?.forEach(r => console.log(` - ${r.name} | status: ${r.status} | referred_by: ${r.referred_by}`));
}
check();
