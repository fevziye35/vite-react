export const dealService = {
    // ...
    create: async (deal: any) => {
        const { data, error } = await supabase.from('deals').insert([{
            title: deal.title,
            customer_name: deal.customer || deal.customerName, // Artık bu sütun var!
            expected_revenue: deal.amount || deal.expectedRevenue, // Supabase'deki tam adı kontrol et
            currency: deal.currency || '₺',
            stage: deal.stage || 'Müşteriye Teklif Atıldı'
        }]).select();

        if (error) {
            alert("Hata: " + error.message);
            throw error;
        }
        return data[0];
    }
};