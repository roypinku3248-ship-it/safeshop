
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ijscuwvskpqwbygrhaqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY'
);

async function check() {
  console.log('=== ALL ORDERS ===');
  const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10);
  orders.forEach(o => console.log(`  ID: ${o.id}, user_id: ${o.user_id}, status: ${o.status}, amount: ${o.total_amount}`));

  console.log('\n=== BILLU ===');
  const { data: billu } = await supabase.from('users').select('*').eq('email', 'billu@gmail.com').single();
  if (billu) console.log(`  ID: ${billu.id}, referred_by: ${billu.referred_by}, status: ${billu.status}`);

  console.log('\n=== BIKU ===');
  const { data: biku } = await supabase.from('users').select('*').eq('email', 'biku@gmail.com').single();
  if (biku) console.log(`  ID: ${biku.id}, status: ${biku.status}`);

  console.log('\n=== BIKU REFERRED USERS ===');
  if (biku) {
    const { data: referrals } = await supabase.from('users').select('*').eq('referred_by', biku.id);
    referrals.forEach(r => console.log(`  ${r.name} (${r.email}) - status: ${r.status}`));
    
    console.log('\n=== ORDERS FOR BIKU REFERRALS ===');
    for (const ref of referrals) {
      const { data: refOrders } = await supabase.from('orders').select('*').eq('user_id', ref.id);
      refOrders.forEach(o => console.log(`  ${ref.name}'s order - status: ${o.status}, amount: ${o.total_amount}`));
    }
  }
}

check();
