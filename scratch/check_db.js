
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijscuwvskpqwbygrhaqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function searchAwaiting() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .ilike('status', '%Awaiting%');
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(`Found ${orders.length} orders with Awaiting status.`);
    orders.forEach(o => {
      console.log(`- Order: ${o.id}, UserID: ${o.user_id}, Status: ${o.status}`);
    });
  }
}

searchAwaiting();
