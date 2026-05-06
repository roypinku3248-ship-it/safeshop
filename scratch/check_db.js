
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijscuwvskpqwbygrhaqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('Columns in "orders" table:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('No orders found to check schema.');
  }
}

checkSchema();
