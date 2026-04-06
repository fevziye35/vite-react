
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jsiucudsnqluruhmcscg.supabase.co';
const supabaseKey = 'sb_publishable_KMykj7U3G9RwECONVJT0fg_jzbBN28K';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Profiles in Supabase:');
        console.table(data);
    }
}

check();
