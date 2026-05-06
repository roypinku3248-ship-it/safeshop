const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijscuwvskpqwbygrhaqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlqc2N1d3Zza3Bxd2J5Z3JoYXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjUyODEsImV4cCI6MjA5MzE0MTI4MX0.hg_-Jfpkb-iRxspw0-zjE3OZyKW_6Fcwb_bfdHJtSJY';
const supabase = createClient(supabaseUrl, supabaseKey);

const BIKU_ID = 'SS-USR-5659';

async function resetBikuNetwork() {
    console.log(`🧹 Cleaning up network for Biku (ID: ${BIKU_ID})...`);

    // 1. Find all direct referrals
    const { data: directs, error: findError } = await supabase
        .from('users')
        .select('id, name')
        .eq('referred_by', BIKU_ID);

    if (findError) {
        console.error('❌ Error finding referrals:', findError.message);
        return;
    }

    if (!directs || directs.length === 0) {
        console.log('✅ Biku has no direct referrals to remove.');
    } else {
        console.log(`🔍 Found ${directs.length} direct referrals. Removing links...`);
        
        // 2. Remove the referred_by link for these users
        const { error: updateError } = await supabase
            .from('users')
            .update({ referred_by: null })
            .eq('referred_by', BIKU_ID);

        if (updateError) {
            console.error('❌ Update failed:', updateError.message);
        } else {
            console.log(`✨ Successfully removed all direct referrals from Biku.`);
        }
    }

    // 3. Reset Biku's total_sales too just in case
    console.log('📉 Resetting Biku\'s total_sales to 0...');
    await supabase.from('users').update({ total_sales: 0 }).eq('id', BIKU_ID);

    // 4. Remove Biku's simulated orders
    console.log('📦 Removing simulated orders for Biku...');
    await supabase.from('orders').delete().eq('user_id', BIKU_ID);

    console.log('🎉 Reset Complete! Biku account is now fresh for testing.');
}

resetBikuNetwork();
