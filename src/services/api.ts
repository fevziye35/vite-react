import { supabase } from './supabase';

// 1. DEALS SERVICE (Asıl çalışan kısım)
export const dealService = {
    getAll: async () => {
        const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },
    create: async (deal: any) => {
        const { data, error } = await supabase.from('deals').insert([{
            title: deal.title,
            customer_name: deal.customer || deal.customerName,
            expected_revenue: deal.amount || deal.expectedRevenue,
            currency: deal.currency || '₺',
            stage: deal.stage || 'Bekliyor'
        }]).select();
        if (error) throw error;
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const { data, error } = await supabase.from('deals').update(updates).eq('id', id).select();
        if (error) throw error;
        return data;
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('deals').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};

// 2. DİĞER SERVİSLER (Hata almamak için tanımlanmış boş şablonlar)
export const productService = { getAll: async () => [] };
export const customerService = { getAll: async () => [], create: async (c: any) => c };
export const proformaService = { getAll: async () => [], create: async (p: any) => p };
export const logisticsService = { getAll: async () => [], create: async (l: any) => l, update: async (id: any, u: any) => u, delete: async (id: any) => true };
export const meetingService = { getAll: async () => [], create: async (m: any) => m };
export const taskService = { getAll: async () => [], create: async (t: any) => t, update: async (id: any, u: any) => u, delete: async (id: any) => true };
export const timelineService = { getByDealId: async (id: any) => [], create: async (t: any) => t };
export const shipmentService = { getAll: async () => [], create: async (s: any) => s, update: async (id: any, u: any) => u };
export const supplierService = { getAll: async () => [], create: async (s: any) => s, update: async (id: any, u: any) => u };
export const reservationService = { getByDealId: async (id: any) => [], create: async (r: any) => r };
export const notificationService = { getAll: async () => [], markAsRead: async (id: any) => true, delete: async (id: any) => true };