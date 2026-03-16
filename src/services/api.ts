import { supabase } from './supabase';
import type { Product, Customer, Offer, LogisticsOffer, LogisticsCompany } from '../types';

// --- MAPPERS (Supabase'den gelen veriyi uygulamaya uyarlar) ---
const mapCustomer = (c: any): Customer => ({
    ...c,
    companyName: c.company_name,
    contactPerson: c.contact_person
});

// --- SERVICES (Artık Axios/Localhost yok, direkt Supabase var!) ---

export const customerService = {
    getAll: async () => {
        const { data, error } = await supabase.from('customers').select('*');
        if (error) throw error;
        return data.map(mapCustomer);
    },
    create: async (customer: any) => {
        const { data, error } = await supabase.from('customers').insert([{
            company_name: customer.companyName,
            contact_person: customer.contactPerson,
            email: customer.email,
            phone: customer.phone
        }]).select().single();
        if (error) throw error;
        return mapCustomer(data);
    }
};

export const dealService = {
    getAll: async () => {
        const { data, error } = await supabase.from('deals').select('*');
        if (error) throw error;
        return data.map((d: any) => ({
            ...d,
            customerName: d.customer_name,
            amount: d.expected_revenue,
            status: d.stage
        }));
    },
    create: async (deal: any) => {
        const { data, error } = await supabase.from('deals').insert([{
            title: deal.title,
            customer_name: deal.customer || deal.customerName,
            expected_revenue: deal.amount || deal.expectedRevenue,
            stage: deal.stage || 'Bekliyor',
            currency: deal.currency || '₺'
        }]).select().single();
        if (error) throw error;
        return data;
    }
};

export const proformaService = {
    getAll: async () => {
        const { data, error } = await supabase.from('proformas').select('*');
        if (error) throw error;
        return data;
    },
    create: async (proforma: any) => {
        const { data, error } = await supabase.from('proformas').insert([{
            proforma_number: proforma.proformaNumber,
            customer_name: proforma.customerName,
            total_price: proforma.totalPrice,
            status: proforma.status || 'Draft'
        }]).select().single();
        if (error) throw error;
        return data;
    }
};

// Diğer servisler (productService, taskService vb.) için de 
// supabase.from('tablo_adı') yapısını kullanarak ekleme yapabilirsin.