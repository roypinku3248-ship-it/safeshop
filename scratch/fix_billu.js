
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ijscuwvskpqwbygrhaqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY'
);

async function findFirstOpenSlot(userId, allUsers, depth = 0) {
  if (depth >= 2) return null; // Max 3 levels deep (0, 1, 2)
  const children = allUsers.filter(u => u.referred_by === userId);
  // BFS: find first slot with < 3 children
  for (const child of children) {
    const childChildren = allUsers.filter(u => u.referred_by === child.id);
    if (childChildren.length < 3) {
      return child.id; // This child has room
    }
  }
  // Check deeper levels
  for (const child of children) {
    const slot = await findFirstOpenSlot(child.id, allUsers, depth + 1);
    if (slot) return slot;
  }
  return null;
}

async function check() {
  const { data: allUsers } = await supabase.from('users').select('id, name, email, referred_by, status');
  const biku = allUsers.find(u => u.email === 'biku@gmail.com');
  const billu = allUsers.find(u => u.email === 'billu@gmail.com');

  // Biku's direct L1 children (first 3)
  const l1 = allUsers.filter(u => u.referred_by === biku.id);
  console.log('Biku L1:', l1.map(u => `${u.name} (${u.id})`));

  // For each L1, check their children
  for (const l1member of l1.slice(0, 3)) {
    const l2 = allUsers.filter(u => u.referred_by === l1member.id);
    console.log(`  ${l1member.name}'s L2 children:`, l2.map(u => u.name));
  }

  console.log('\nBillu currently referred_by:', billu.referred_by);
  console.log('Billu should be moved to sub-slot of:', l1[0]?.name, '(', l1[0]?.id, ')');
  console.log('\nFixing Billu referred_by to:', l1[0]?.id);

  const { error } = await supabase
    .from('users')
    .update({ referred_by: l1[0]?.id }) // Place Billu under fgbfgbfgbf (first L1 slot)
    .eq('id', billu.id);
  
  if (error) console.error('Error:', error.message);
  else console.log('✅ Billu is now placed in the correct tree slot under', l1[0]?.name);
}

check();
