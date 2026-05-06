const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijscuwvskpqwbygrhaqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulatePurchase() {
    console.log('🔍 Finding user biku@gmail.com...');
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, name, total_sales')
        .eq('email', 'biku@gmail.com')
        .single();

    if (findError || !user) {
        console.error('❌ User not found:', findError?.message || 'User does not exist');
        return;
    }

    console.log(`✅ Found User: ${user.name} (ID: ${user.id})`);
    const newSales = (user.total_sales || 0) + 2000;

    console.log(`📈 Updating total_sales to: ₹${newSales}...`);
    const { error: updateError } = await supabase
        .from('users')
        .update({ total_sales: newSales })
        .eq('id', user.id);

    if (updateError) {
        console.error('❌ Update failed:', updateError.message);
    } else {
        console.log('🎉 Success! Purchase of ₹2,000 simulated for biku@gmail.com.');
    }
}

simulatePurchase();
