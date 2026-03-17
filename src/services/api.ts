import { supabase } from './supabaseClient';

export const dealService = {
    getAll: async () => {
        const { data } = await supabase.from('deals').select('*, customers(company_name)').order('created_at', { ascending: false });
        return (data || []).map(d => ({
            ...d,
            expectedRevenue: d.expected_revenue,
            expectedClosingDate: d.expected_closing_date,
            customerId: d.customer_id,
            customer: d.customers?.company_name
        }));
    },
    create: async (deal: any) => {
        const { data } = await supabase.from('deals').insert([{
            title: deal.title,
            customer_id: deal.customerId,
            expected_revenue: parseFloat(deal.expectedRevenue || deal.amount) || 0,
            stage: deal.stage || 'New',
            probability: deal.probability || 50,
            notes: deal.notes
        }]).select();
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const mapped = { ...updates };
        if (updates.expectedRevenue) mapped.expected_revenue = updates.expectedRevenue;
        if (updates.customerId) mapped.customer_id = updates.customerId;
        delete mapped.expectedRevenue;
        delete mapped.customerId;
        
        const { data } = await supabase.from('deals').update(mapped).eq('id', id).select();
        return data ? data[0] : null;
    },
    delete: async (id: string) => {
        await supabase.from('deals').delete().eq('id', id);
        return true;
    }
};

export const taskService = {
    getAll: async () => {
        const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        return data || [];
    },
    create: async (task: any) => {
        const { data } = await supabase.from('tasks').insert([{
            title: task.title,
            description: task.description,
            due_date: task.dueDate || task.due_date,
            priority: task.priority || 'medium',
            assigned_to: task.assignedTo || task.assigned_to,
            status: task.status || 'pending',
            link: task.link
        }]).select();
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const { data } = await supabase.from('tasks').update(updates).eq('id', id).select();
        return data;
    },
    delete: async (id: string) => {
        await supabase.from('tasks').delete().eq('id', id);
        return true;
    }
};

export const customerService = {
    getAll: async () => {
        const { data } = await supabase.from('customers').select('*').order('company_name', { ascending: true });
        return (data || []).map(c => ({
            ...c,
            companyName: c.company_name,
            contactPerson: c.contact_person
        }));
    },
    create: async (customer: any) => {
        const { data, error } = await supabase.from('customers').insert([{
            company_name: customer.companyName || customer.company_name,
            contact_person: customer.contactPerson || customer.contact_person,
            email: customer.email,
            phone: customer.phone,
            country: customer.country,
            city: customer.city,
            address: customer.address,
            notes: customer.notes,
            tags: customer.tags || []
        }]).select();
        if (error) throw error;
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const mapped = { ...updates };
        if (updates.companyName) mapped.company_name = updates.companyName;
        if (updates.contactPerson) mapped.contact_person = updates.contactPerson;
        delete mapped.companyName;
        delete mapped.contactPerson;

        const { data } = await supabase.from('customers').update(mapped).eq('id', id).select();
        return data;
    },
    delete: async (id: string) => {
        await supabase.from('customers').delete().eq('id', id);
        return true;
    }
};

export const productService = {
    getAll: async () => {
        const { data } = await supabase.from('products').select('*');
        return (data || []).map(p => ({
            ...p,
            productName: p.product_name,
            unitType: p.unit_type,
            baseUnitPrice: p.base_unit_price
        }));
    },
    create: async (p: any) => {
        const { data } = await supabase.from('products').insert([{
            product_name: p.productName || p.product_name,
            category: p.category,
            unit_type: p.unitType || p.unit_type,
            base_unit_price: parseFloat(p.baseUnitPrice || p.base_unit_price) || 0,
            hs_code: p.hsCode || p.hs_code,
            origin_country: p.originCountry || p.origin_country
        }]).select();
        return data ? data[0] : null;
    }
};

export const proformaService = {
    getAll: async () => {
        const { data } = await supabase.from('proformas').select('*').order('created_at', { ascending: false });
        return (data || []).map(p => ({
            ...p,
            proformaNumber: p.proforma_number,
            customerId: p.customer_id,
            totalPrice: p.total_price,
            createdAt: p.created_at
        }));
    },
    create: async (proforma: any) => {
        const mapped = {
            proforma_number: proforma.proformaNumber || proforma.number,
            customer_id: proforma.customerId,
            total_price: proforma.totalPrice || proforma.amount,
            status: proforma.status || 'Draft',
            items: typeof proforma.items === 'string' ? JSON.parse(proforma.items) : proforma.items
        };
        const { data } = await supabase.from('proformas').insert([mapped]).select();
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const { data } = await supabase.from('proformas').update(updates).eq('id', id).select();
        return data ? data[0] : null;
    },
    convertFromOffer: async (offer: any) => {
        const proforma = {
            proforma_number: `PI-${offer.offerNumber || Date.now()}`,
            customer_id: offer.customerId,
            total_price: offer.totalAmount,
            status: 'Draft',
            items: offer.items,
            currency: offer.currency
        };
        const { data } = await supabase.from('proformas').insert([proforma]).select();
        return data ? data[0] : null;
    }
};

export const logisticsService = {
    getAll: async () => {
        const { data } = await supabase.from('logistics_offers').select('*').order('created_at', { ascending: false });
        return (data || []).map(o => ({
            ...o,
            providerName: o.provider_name,
            originPort: o.origin_port,
            destinationPort: o.destination_port,
            containerType: o.container_type,
            validityDate: o.validity_date,
            description: o.notes,
            contactPerson: o.contact_person
        }));
    },
    create: async (offer: any) => {
        const mapped = {
            provider_name: offer.providerName,
            origin_port: offer.originPort,
            destination_port: offer.destinationPort,
            container_type: offer.containerType,
            price: parseFloat(offer.price) || 0,
            currency: offer.currency || 'USD',
            validity_date: offer.validityDate,
            notes: offer.description,
            contact_person: offer.contactPerson,
            carrier: offer.carrier
        };
        const { data, error } = await supabase.from('logistics_offers').insert([mapped]).select();
        if (error) {
            console.error("Logistics Create Error:", error);
            throw error;
        }
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const mapped: any = { ...updates };
        if (updates.providerName) mapped.provider_name = updates.providerName;
        if (updates.originPort) mapped.origin_port = updates.originPort;
        if (updates.destinationPort) mapped.destination_port = updates.destinationPort;
        if (updates.containerType) mapped.container_type = updates.containerType;
        if (updates.validityDate) mapped.validity_date = updates.validityDate;
        if (updates.description) mapped.notes = updates.description;
        if (updates.contactPerson) mapped.contact_person = updates.contactPerson;
        
        delete mapped.providerName;
        delete mapped.originPort;
        delete mapped.destinationPort;
        delete mapped.containerType;
        delete mapped.validityDate;
        delete mapped.description;
        delete mapped.contactPerson;

        const { data, error } = await supabase.from('logistics_offers').update(mapped).eq('id', id).select();
        if (error) {
            console.error("Logistics Update Error:", error);
            throw error;
        }
        return data ? data[0] : null;
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('logistics_offers').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};

export const logisticsCompanyService = {
    getAll: async () => {
        const { data } = await supabase.from('logistics_companies').select('*').order('company_name', { ascending: true });
        return (data || []).map(c => ({
            ...c,
            companyName: c.company_name,
            contactPerson: c.contact_person
        }));
    },
    create: async (company: any) => {
        const { data } = await supabase.from('logistics_companies').insert([{
            company_name: company.companyName || company.company_name,
            contact_person: company.contactPerson || company.contact_person,
            phone: company.phone,
            email: company.email,
            service_intensity: company.service_intensity,
            own_assets: company.own_assets,
            office_address: company.office_address,
            notes: company.notes,
            meeting_status: company.meeting_status,
            custom_fields: company.custom_fields || {}
        }]).select();
        return data ? data[0] : null;
    }
};

export const meetingService = {
    getAll: async () => {
        const { data } = await supabase.from('meetings').select('*').order('date', { ascending: false });
        return data || [];
    },
    create: async (meeting: any) => {
        const { data } = await supabase.from('meetings').insert([meeting]).select();
        return data ? data[0] : null;
    }
};

export const timelineService = {
    getByDealId: async (dealId: string) => {
        const { data } = await supabase.from('timeline_events').select('*').eq('deal_id', dealId).order('created_at', { ascending: false });
        return data || [];
    },
    create: async (event: any) => {
        const { data } = await supabase.from('timeline_events').insert([event]).select();
        return data ? data[0] : null;
    }
};

export const shipmentService = {
    getAll: async () => {
        const { data } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
        return data || [];
    },
    create: async (shipment: any) => {
        const { data } = await supabase.from('shipments').insert([shipment]).select();
        return data ? data[0] : null;
    }
};

export const supplierService = {
    getAll: async () => {
        try {
            const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
            if (error) {
                console.error("Supabase Suppliers Error:", error.message);
                return [];
            }
            return (data || []).map(s => ({
                ...s,
                contactPerson: s.contact_person
            }));
        } catch (e) {
            console.error("SupplierService error:", e);
            return [];
        }
    },
    create: async (supplier: any) => {
        const { data, error } = await supabase.from('suppliers').insert([{
            name: supplier.name,
            country: supplier.country,
            contact_person: supplier.contactPerson || supplier.contact_person,
            phone: supplier.phone,
            products: supplier.products || []
        }]).select();
        
        if (error) {
            console.error("Detailed Add Supplier Error:", error);
            throw new Error(`Tedarikçi eklenemedi: ${error.message}`);
        }
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const mapped = { ...updates };
        if (updates.contactPerson) mapped.contact_person = updates.contactPerson;
        delete mapped.contactPerson;
        
        const { data, error } = await supabase.from('suppliers').update(mapped).eq('id', id).select();
        if (error) {
            console.error("Detailed Update Supplier Error:", error);
            throw error;
        }
        return data ? data[0] : null;
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('suppliers').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};

export const offerService = {
    getAll: async () => {
        const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
        return (data || []).map(o => ({
            ...o,
            offerNumber: o.offer_number || 'N/A',
            contactPerson: o.contact_person || 'N/A',
            customerId: o.customer_id,
            totalAmount: o.total_amount || 0,
            freightCost: o.freight_cost || 0,
            insuranceCost: o.insurance_cost || 0,
            validityDate: o.validity_date,
            createdAt: o.created_at,
            country: o.country || 'N/A',
            portOfLoading: o.port_of_loading,
            portOfDischarge: o.port_of_discharge,
            paymentTerms: o.payment_terms,
            items: Array.isArray(o.items) ? o.items : []
        }));
    },
    getById: async (id: string) => {
        const { data } = await supabase.from('offers').select('*').eq('id', id).single();
        if (!data) return null;
        return {
            ...data,
            offerNumber: data.offer_number,
            contactPerson: data.contact_person,
            totalAmount: data.total_amount,
            validityDate: data.validity_date,
            customerId: data.customer_id,
            portOfLoading: data.port_of_loading,
            portOfDischarge: data.port_of_discharge,
            paymentTerms: data.payment_terms,
            freightCost: data.freight_cost,
            insuranceCost: data.insurance_cost
        };
    },
    create: async (offer: any) => {
        const mapped = {
            offer_number: offer.offerNumber || `OFF-${Date.now()}`,
            customer_id: offer.customerId,
            contact_person: offer.contactPerson,
            email: offer.email,
            phone: offer.phone,
            country: offer.country,
            validity_date: offer.validityDate,
            currency: offer.currency,
            incoterm: offer.incoterm,
            port_of_loading: offer.portOfLoading,
            port_of_discharge: offer.portOfDischarge,
            payment_terms: offer.paymentTerms,
            freight_cost: offer.freightCost,
            insurance_cost: offer.insuranceCost,
            total_amount: offer.totalAmount,
            items: offer.items
        };
        const { data } = await supabase.from('offers').insert([mapped]).select();
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const mapped: any = { ...updates };
        if (updates.offerNumber) mapped.offer_number = updates.offerNumber;
        if (updates.contactPerson) mapped.contact_person = updates.contactPerson;
        if (updates.totalAmount) mapped.total_amount = updates.totalAmount;
        if (updates.validityDate) mapped.validity_date = updates.validityDate;
        if (updates.customerId) mapped.customer_id = updates.customerId;
        
        const { data } = await supabase.from('offers').update(mapped).eq('id', id).select();
        return data ? data[0] : null;
    }
};

export const userService = {
    getAll: async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
            if (error) throw error;
            
            return (data || []).map(u => ({
                id: u.id,
                email: (u.email || '').toLowerCase().trim(),
                fullName: u.full_name,
                role: u.role,
                permissions: u.permissions || { deals: true, customers: true, offers: true, messages: true }
            }));
        } catch (e) {
            console.error("UserService error:", e);
            return [];
        }
    },
    create: async (userData: any) => {
        const email = userData.email?.toLowerCase().trim();
        const { data, error } = await supabase.from('profiles').upsert([{
            full_name: userData.fullName,
            email: email,
            role: userData.role || 'Admin',
            permissions: userData.permissions || { deals: true, customers: true, offers: true, messages: true }
        }], { onConflict: 'email' }).select();
        
        if (error) {
            console.error("User Create/Upsert Error:", error);
            throw error;
        }
        return data ? data[0] : null;
    },
    update: async (id: string, updates: any) => {
        const mapped: any = {
            full_name: updates.fullName,
            role: updates.role,
            permissions: updates.permissions,
            email: updates.email?.toLowerCase().trim()
        };

        const { data, error } = await supabase.from('profiles').upsert([{ 
            id: id,
            ...mapped
        }]).select();
        
        if (error) {
            console.error("User Update Error:", error);
            throw error;
        }
        return data ? data[0] : null;
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};

export const getStats = async () => {
    try {
        const [deals, offers, proformas, shipments, customers] = await Promise.all([
            supabase.from('deals').select('*, customers(company_name)'),
            supabase.from('offers').select('*, customers(company_name)').order('created_at', { ascending: false }),
            supabase.from('proformas').select('*'),
            supabase.from('shipments').select('*'),
            supabase.from('customers').select('*')
        ]);

        const allDeals = deals.data || [];
        const allOffers = offers.data || [];
        const allProformas = proformas.data || [];
        const allShipments = shipments.data || [];
        const allCustomers = customers.data || [];

        const activeDeals = allDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
        const totalPipeline = activeDeals.reduce((sum, d) => sum + (Number(d.expected_revenue) || 0), 0);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const offersThisMonth = allOffers.filter(o => {
            const date = new Date(o.created_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;

        const plannedContainers = allShipments.reduce((sum, s) => sum + (Number(s.container_count) || 0), 0);

        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return {
                month: d.toLocaleString('tr', { month: 'short' }),
                monthIndex: d.getMonth(),
                year: d.getFullYear(),
                value: 0
            };
        });

        allProformas.forEach(p => {
            const date = new Date(p.created_at);
            const m = date.getMonth();
            const y = date.getFullYear();
            const bucket = last6Months.find(b => b.monthIndex === m && b.year === y);
            if (bucket) {
                bucket.value += (Number(p.total_price) || 0);
            }
        });

        const categoryMap: Record<string, number> = {};
        allDeals.forEach(d => {
            const cat = d.stage || 'Yeni';
            categoryMap[cat] = (categoryMap[cat] || 0) + (Number(d.expected_revenue) || 0);
        });
        const categoryData = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const countryMap: Record<string, number> = {};
        allCustomers.forEach(c => {
            const country = c.country || 'Diğer';
            countryMap[country] = (countryMap[country] || 0) + 1;
        });
        const countryData = Object.entries(countryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        return {
            activeDealsCount: activeDeals.length,
            offersSentMonth: offersThisMonth,
            totalPipeline,
            plannedContainers,
            revenueTrend: last6Months.map(({ month, value }) => ({ month, value })),
            categoryData,
            countryData,
            recentOffers: allOffers.slice(0, 5).map(o => ({
                id: o.id,
                offerNumber: o.offer_number || 'OFF-' + o.id.substring(0, 8),
                contactPerson: (o as any).customers?.company_name || o.contact_person || 'Bilinmiyor',
                totalAmount: o.total_amount || 0,
                status: o.status,
                createdAt: o.created_at
            }))
        };
    } catch (e) {
        console.error("Stats fetch error:", e);
        return null;
    }
};

export const updateSettings = async (s: any) => s;

export const notificationService = {
    getAll: async () => {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        return (data || []).map(n => ({
            ...n,
            isRead: n.is_read,
            createdAt: n.created_at
        }));
    },
    markAsRead: async (id: string) => {
        const { data } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select();
        return data;
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};