import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function testDeleteCustomer(id) {
    try {
        console.log(`Testing delete for customer: ${id}`);
        const { data, error } = await supabase.from('customers').delete().eq('id', id);
        if (error) {
            console.error('Direct delete error:', error);
            console.log('Trying manual cascade from script...');
        } else {
            console.log('Direct delete successful (unexpected if constraints exist)');
            return;
        }

        // Try to find what blocks it
        const tables = ['deals', 'offers', 'proformas', 'shipments', 'meetings', 'tasks'];
        for (const table of tables) {
            const { count, error: countErr } = await supabase.from(table).select('*', { count: 'exact', head: true }).eq('customer_id', id);
            if (!countErr) {
                console.log(`${table}: Found ${count} associated records`);
            } else {
                console.log(`${table}: Error or column missing: ${countErr.message}`);
                // Try deal_id if it's a tasks/shipments etc table
                if (table === 'tasks') {
                    // tasks might be linked to deal_id, not customer_id directly
                }
            }
        }
    } catch (e) {
        console.error('Fatal error in script:', e);
    }
}

// Need a customer ID to test. I'll fetch one.
async function run() {
    const { data: customers } = await supabase.from('customers').select('id, company_name').limit(1);
    if (customers && customers.length > 0) {
        // I won't actually delete unless I have a test customer.
        console.log('Customer to test delete:', customers[0]);
    } else {
        console.log('No customers found to test.');
    }
}

run();
