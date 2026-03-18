import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const p = { productName: 'Test Product', category: 'Oil', unitType: 'liter', baseUnitPrice: 1.10, originCountry: 'Ukraine', defaultContainerLoad20ft: 15120, defaultContainerLoad40ft: 25000 };
    const payload = {
        product_name: p.productName || p.product_name,
        brand: p.brand || null,
        category: p.category,
        unit_type: p.unitType || p.unit_type,
        base_unit_price: parseFloat(p.baseUnitPrice || p.base_unit_price) || 0,
        packaging_options: Array.isArray(p.packagingOptions || p.packaging_options) ? (p.packagingOptions || p.packaging_options) : null,
        origin_country: p.originCountry || p.origin_country || null,
        default_container_load_20ft: p.defaultContainerLoad20ft || p.default_container_load_20ft || null,
        min_order_quantity: p.minOrderQuantity || p.min_order_quantity || null,
        hs_code: p.hsCode || p.hs_code || null
    };
    console.log("Payload:", payload);
    const { data, error } = await supabase.from('products').insert([payload]).select();
    if(error) console.error("Supabase error:", error);
    else console.log("Success:", data);
}

test();
