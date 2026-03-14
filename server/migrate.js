import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateTable(tableName, transform = (row) => row) {
    console.log(`Migrating ${tableName}...`);
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    
    if (rows.length === 0) {
        console.log(`  No data for ${tableName}`);
        return;
    }

    const transformedRows = rows.map(transform);

    // Chunk size for Supabase
    const chunkSize = 50;
    for (let i = 0; i < transformedRows.length; i += chunkSize) {
        const chunk = transformedRows.slice(i, i + chunkSize);
        const { error } = await supabase.from(tableName).upsert(chunk);
        if (error) {
            console.error(`  Error migrating ${tableName} (chunk ${i}):`, error);
        } else {
            console.log(`  Migrated ${chunk.length} rows to ${tableName}`);
        }
    }
}

async function startMigration() {
    try {
        console.log('🚀 Starting Data Migration to Supabase...');

        // 1. Users
        await migrateTable('users', (row) => ({
            ...row,
            permissions: row.permissions ? JSON.parse(row.permissions) : null
        }));

        // 2. Customers
        await migrateTable('customers', (row) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : []
        }));

        // 3. Products
        await migrateTable('products', (row) => ({
            ...row,
            packaging_options: row.packaging_options ? JSON.parse(row.packaging_options) : []
        }));

        // 4. Offers
        await migrateTable('offers');

        // 5. Offer Items
        await migrateTable('offer_items');

        // 6. Deals
        await migrateTable('deals', (row) => ({
            ...row,
            target_products: row.target_products ? JSON.parse(row.target_products) : [],
            items: row.items ? JSON.parse(row.items) : []
        }));

        // 7. Proformas
        await migrateTable('proformas', (row) => ({
            ...row,
            items: row.items ? JSON.parse(row.items) : []
        }));

        // 8. Tasks
        await migrateTable('tasks');

        // 9. Timeline Events
        await migrateTable('timeline_events');

        console.log('✅ Migration Finished Successfully!');
    } catch (error) {
        console.error('❌ Migration Failed:', error);
    }
}

startMigration();
