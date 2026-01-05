import { supabase } from '../lib/supabase';
import type { Product, Customer, Offer, LogisticsOffer, LogisticsCompany } from '../types';


// --- HELPERS ---


// Data Mappers
const mapProduct = (p: any): Product => ({
    ...p,
    productName: p.product_name,
    brand: p.brand,
    grade: p.grade,
    unitType: p.unit_type,
    baseUnitPrice: p.base_unit_price,
    packagingOptions: p.packaging_options,
    hsCode: p.hs_code,
    originCountry: p.origin_country,
    minOrderQuantity: p.min_order_quantity,
    defaultContainerLoad20ft: p.default_container_load_20ft,
    defaultContainerLoad40ft: p.default_container_load_40ft
});

const mapCustomer = (c: any): Customer => ({
    ...c,
    companyName: c.company_name,
    contactPerson: c.contact_person,
    preferredIncoterm: c.preferred_incoterm,
    createdAt: c.created_at,
    updatedAt: c.updated_at
});

const mapOffer = (o: any): Offer => ({
    ...o,
    offerNumber: o.offer_number,
    customerId: o.customer_id,
    contactPerson: o.contact_person,
    validityDate: o.validity_date,
    portOfLoading: o.port_of_loading,
    portOfDischarge: o.port_of_discharge,
    paymentTerms: o.payment_terms,
    freightCost: o.freight_cost,
    insuranceCost: o.insurance_cost,
    otherCosts: o.other_costs,
    totalAmount: o.total_amount,
    expectedMargin: o.expected_margin,
    createdBy: o.created_by,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    customer: o.customers ? mapCustomer(o.customers) : undefined,
    items: o.offer_items ? o.offer_items.map(mapOfferItem) : []
});

const mapOfferItem = (i: any) => ({
    ...i,
    productId: i.product_id,
    unitPrice: i.unit_price
});

const mapLogistics = (l: any): LogisticsOffer => ({
    ...l,
    providerName: l.provider_name,
    originPort: l.origin_port,
    destinationCountry: l.destination_country,
    destinationPort: l.destination_port,
    containerType: l.container_type,
    validityDate: l.validity_date,
    contactPerson: l.contact_person,
    phone: l.phone,
    email: l.email,
    carrier: l.carrier,
    transitTime: l.transit_time,
    freeTime: l.free_time,
    customFields: l.custom_fields && typeof l.custom_fields === 'string' ? JSON.parse(l.custom_fields) : (l.custom_fields || {})
});

const mapLogisticsCompany = (l: any): LogisticsCompany => ({
    id: l.id,
    companyName: l.company_name,
    contactPerson: l.contact_person,
    phone: l.phone,
    email: l.email,
    serviceIntensity: l.service_intensity,
    ownAssets: l.own_assets,
    officeAddress: l.office_address,
    notes: l.notes,
    meetingStatus: l.meeting_status,
    customFields: l.custom_fields && typeof l.custom_fields === 'string' ? JSON.parse(l.custom_fields) : (l.custom_fields || {})
});

// --- SERVICES ---



export const productService = {
    getAll: async () => {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        return data.map(mapProduct);
    },
    create: async (product: Omit<Product, 'id'> | Product) => {
        if ('id' in product && product.id) {
            // Update
            const { data, error } = await supabase.from('products').update({
                product_name: product.productName,
                brand: product.brand,
                grade: product.grade,
                category: product.category,
                unit_type: product.unitType,
                base_unit_price: product.baseUnitPrice,
                packaging_options: product.packagingOptions,
                hs_code: product.hsCode,
                origin_country: product.originCountry,
                min_order_quantity: product.minOrderQuantity,
                default_container_load_20ft: product.defaultContainerLoad20ft,
                default_container_load_40ft: product.defaultContainerLoad40ft,
                notes: product.notes
            }).eq('id', product.id).select().single();
            if (error) throw error;
            return mapProduct(data);
        } else {
            // Insert
            const { data, error } = await supabase.from('products').insert({
                product_name: product.productName,
                brand: product.brand,
                grade: product.grade,
                category: product.category,
                unit_type: product.unitType,
                base_unit_price: product.baseUnitPrice,
                packaging_options: product.packagingOptions,
                hs_code: product.hsCode,
                origin_country: product.originCountry,
                min_order_quantity: product.minOrderQuantity,
                default_container_load_20ft: product.defaultContainerLoad20ft,
                default_container_load_40ft: product.defaultContainerLoad40ft,
                notes: product.notes
            }).select().single();
            if (error) throw error;
            return mapProduct(data);
        }
    }
};

export const customerService = {
    getAll: async () => {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapCustomer);
    },
    create: async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
        const { data, error } = await supabase.from('customers').insert({
            company_name: customer.companyName,
            contact_person: customer.contactPerson,
            email: customer.email,
            phone: customer.phone,
            country: customer.country,
            city: customer.city,
            address: customer.address,
            preferred_incoterm: customer.preferredIncoterm,
            notes: customer.notes,
            tags: customer.tags
        }).select().single();
        if (error) throw error;
        return mapCustomer(data);
    },
    update: async (id: string, updates: any) => {
        const { data, error } = await supabase.from('customers').update({
            company_name: updates.companyName,
            contact_person: updates.contactPerson,
            email: updates.email,
            phone: updates.phone,
            country: updates.country,
            city: updates.city,
            address: updates.address,
            preferred_incoterm: updates.preferredIncoterm,
            notes: updates.notes,
            tags: updates.tags
        }).eq('id', id).select().single();
        if (error) throw error;
        return mapCustomer(data);
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};

export const offerService = {
    getAll: async () => {
        const { data, error } = await supabase.from('offers').select('*, customers(*)').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapOffer);
    },
    getById: async (id: string) => {
        const { data, error } = await supabase.from('offers').select('*, customers(*), offer_items(*)').eq('id', id).single();
        if (error) throw error;
        return mapOffer(data);
    },
    create: async (offer: any) => {
        const { data: offerData, error: offerError } = await supabase.from('offers').insert({
            offer_number: `OFF-${Date.now()}`,
            customer_id: offer.customerId,
            contact_person: offer.contactPerson,
            email: offer.email,
            phone: offer.phone,
            country: offer.country,
            status: 'Draft',
            validity_date: offer.validityDate,
            currency: offer.currency,
            incoterm: offer.incoterm,
            port_of_loading: offer.portOfLoading,
            port_of_discharge: offer.portOfDischarge,
            payment_terms: offer.paymentTerms,
            freight_cost: offer.freightCost,
            insurance_cost: offer.insuranceCost,
            other_costs: offer.otherCosts,
            total_amount: offer.totalAmount,
            expected_margin: offer.expectedMargin
        }).select().single();

        if (offerError) throw offerError;

        if (offer.items && offer.items.length > 0) {
            const itemsToInsert = offer.items.map((i: any) => ({
                offer_id: offerData.id,
                product_id: i.productId,
                description: i.description,
                packaging: i.packaging,
                quantity: i.quantity,
                unit_price: i.unitPrice,
                discount: i.discount,
                total: i.total
            }));
            const { error: itemsError } = await supabase.from('offer_items').insert(itemsToInsert);
            if (itemsError) throw itemsError;
        }
        return mapOffer(offerData);
    },
    update: async (id: string, updates: any) => {
        const { data, error } = await supabase.from('offers').update({
            status: updates.status,
            // Add other fields as needed
        }).eq('id', id).select().single();
        if (error) throw error;
        return mapOffer(data);
    }
};

export const logisticsService = {
    getAll: async () => {
        const { data, error } = await supabase.from('logistics_offers').select('*').order('id', { ascending: false });
        if (error) throw error;
        return data.map(mapLogistics);
    },
    create: async (logistics: any) => {
        // Build insert object with only defined values
        const insertData: any = {};
        if (logistics.providerName) insertData.provider_name = logistics.providerName;
        if (logistics.originPort) insertData.origin_port = logistics.originPort;
        if (logistics.destinationCountry) insertData.destination_country = logistics.destinationCountry;
        if (logistics.destinationPort) insertData.destination_port = logistics.destinationPort;
        if (logistics.containerType) insertData.container_type = logistics.containerType;
        if (logistics.price !== undefined && logistics.price !== '') insertData.price = Number(logistics.price);
        if (logistics.currency) insertData.currency = logistics.currency;
        if (logistics.validityDate) insertData.validity_date = logistics.validityDate;
        if (logistics.notes) insertData.notes = logistics.notes;
        if (logistics.contactPerson) insertData.contact_person = logistics.contactPerson;
        if (logistics.phone) insertData.phone = logistics.phone;
        if (logistics.email) insertData.email = logistics.email;
        if (logistics.carrier) insertData.carrier = logistics.carrier;
        if (logistics.transitTime) insertData.transit_time = logistics.transitTime;
        if (logistics.freeTime) insertData.free_time = logistics.freeTime;
        if (logistics.description) insertData.description = logistics.description;
        insertData.custom_fields = logistics.customFields || {};

        const { data, error } = await supabase.from('logistics_offers').insert(insertData).select().single();
        if (error) throw error;
        return mapLogistics(data);
    },
    update: async (id: string, updates: any) => {
        const { data, error } = await supabase.from('logistics_offers').update({
            provider_name: updates.providerName,
            origin_port: updates.originPort,
            destination_country: updates.destinationCountry,
            destination_port: updates.destinationPort,
            container_type: updates.containerType,
            price: updates.price,
            currency: updates.currency,
            validity_date: updates.validityDate,
            notes: updates.notes,
            contact_person: updates.contactPerson,
            phone: updates.phone,
            email: updates.email,
            carrier: updates.carrier,
            transit_time: updates.transitTime,
            free_time: updates.freeTime,
            custom_fields: updates.customFields ? JSON.stringify(updates.customFields) : undefined
        }).eq('id', id).select().single();

        if (error) throw error;
        return mapLogistics(data);
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('logistics_offers').delete().eq('id', id);
        if (error) throw error;
        return true;
    }
};

export const logisticsCompanyService = {
    getAll: async () => {
        const { data, error } = await supabase.from('logistics_companies').select('*');
        if (error) throw error;
        return data.map(mapLogisticsCompany);
    },
    create: async (company: any) => {
        const { data, error } = await supabase.from('logistics_companies').insert({
            company_name: company.companyName,
            contact_person: company.contactPerson,
            phone: company.phone,
            email: company.email,
            service_intensity: company.serviceIntensity,
            own_assets: company.ownAssets,
            office_address: company.officeAddress,
            notes: company.notes,
            meeting_status: company.meetingStatus,
            custom_fields: JSON.stringify(company.customFields || {})
        }).select().single();
        if (error) throw error;
        return mapLogisticsCompany(data);
    },
    update: async (id: string, updates: any) => {
        const { data, error } = await supabase.from('logistics_companies').update({
            company_name: updates.companyName,
            contact_person: updates.contactPerson,
            phone: updates.phone,
            email: updates.email,
            service_intensity: updates.serviceIntensity,
            own_assets: updates.ownAssets,
            office_address: updates.officeAddress,
            notes: updates.notes,
            meeting_status: updates.meetingStatus,
            custom_fields: updates.customFields ? JSON.stringify(updates.customFields) : undefined
        }).eq('id', id).select().single();
        if (error) throw error;
        return mapLogisticsCompany(data);
    },
    delete: async (id: string) => {
        await supabase.from('logistics_companies').delete().eq('id', id);
        return true;
    }
};

export const dealService = {
    getAll: async () => {
        const { data, error } = await supabase.from('deals').select('*');
        if (error) throw error;
        return data.map((d: any) => ({
            ...d,
            items: d.items && typeof d.items === 'string' ? JSON.parse(d.items) : (d.items || []),
            offerId: d.offer_id
        }));
    },
    create: async (deal: any) => {
        const { data, error } = await supabase.from('deals').insert({
            title: deal.title,
            customer_id: deal.customerId,
            target_products: deal.targetProducts,
            target_volume: deal.targetVolume,
            target_country: deal.targetCountry,
            expected_closing_date: deal.expectedClosingDate,
            stage: deal.stage,
            probability: deal.probability,
            expected_revenue: deal.expectedRevenue,
            assigned_to: deal.assignedTo,
            notes: deal.notes,
            offer_id: deal.offerId,
            items: deal.items ? JSON.stringify(deal.items) : null
        }).select().single();

        if (error) throw error;
        return { ...data, items: data.items ? JSON.parse(data.items) : [] };
    },
    update: async (id: string, updates: any) => {
        const { data, error } = await supabase.from('deals').update({
            stage: updates.stage,
            probability: updates.probability,
            expected_revenue: updates.expectedRevenue,
            notes: updates.notes
        }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }
};

export const meetingService = {
    getAll: async () => {
        const { data, error } = await supabase.from('meetings').select('*, customers(company_name)').order('date', { ascending: true });
        if (error) throw error;
        return data.map((m: any) => ({
            ...m,
            customerId: m.customer_id,
            with: m.customers?.company_name || 'Unknown',
            date: m.date,
            type: m.type,
            notes: m.notes,
            outcome: m.outcome
        }));
    },
    create: async (meeting: any) => {
        const { data, error } = await supabase.from('meetings').insert({
            title: meeting.title,
            customer_id: meeting.customerId,
            date: meeting.date,
            type: meeting.type,
            notes: meeting.notes,
            outcome: meeting.outcome
        }).select().single();
        if (error) throw error;
        return data;
    }
};

const mapProforma = (p: any): any => ({
    id: p.id,
    proformaNumber: p.proforma_number || p.number,
    date: p.date || p.issueDate,
    customerId: p.customer_id || p.customerId,
    customerName: p.customer_name, // Mocks might need this if not fetching rels
    customerAddress: p.customer_address,
    companyName: p.company_name,
    companyAddress: p.company_address,
    companyContact: p.company_contact,
    items: p.items && typeof p.items === 'string' ? JSON.parse(p.items) : (p.items || []),
    totalPrice: p.total_price || p.amount,
    firstPaymentAmount: p.first_payment_amount,
    finalPaymentAmount: p.final_payment_amount,
    currency: p.currency,
    validityDays: p.validity_days,
    brand: p.brand,
    destination: p.destination,
    quantity: p.quantity,
    productionTime: p.production_time,
    paymentTerms: p.payment_terms,
    beneficiaryName: p.beneficiary_name,
    bankName: p.bank_name,
    bankAddress: p.bank_address,
    swiftCode: p.swift_code,
    iban: p.iban,
    status: p.status,
    createdAt: p.created_at || p.createdAt
});

export const proformaService = {
    getAll: async () => {
        const { data, error } = await supabase.from('proformas').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data ? data.map(mapProforma) : [];
    },
    create: async (proforma: any) => {
        const { data, error } = await supabase.from('proformas').insert({
            proforma_number: proforma.number,
            customer_id: proforma.customerId,
            offer_id: proforma.offerId,
            amount: proforma.amount,
            status: proforma.status,
            issue_date: proforma.issueDate,
            due_date: proforma.dueDate,
            items: proforma.items
        }).select().single();

        if (error) throw error;
        return data;
    },
    convertFromOffer: async (offer: any) => {
        // Create a proforma based on the offer
        const proforma = {
            number: `PI-${Date.now()}`,
            customerId: offer.customerId,
            offerId: offer.id,
            amount: offer.totalAmount,
            status: 'Draft',
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            items: JSON.stringify(offer.items || []) // Copy items!
        };
        return proformaService.create(proforma);
    }
};

export const shipmentService = {
    getAll: async () => {
        const { data, error } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map((s: any) => ({
            ...s,
            proformaId: s.proforma_id,
            customerId: s.customer_id,
            bookingReference: s.booking_reference,
            vesselName: s.vessel_name,
            containerCount: s.container_count,
            containerType: s.container_type,
            forwarderName: s.forwarder_name,
            trackingUrl: s.tracking_url
        }));
    },
    create: async (shipment: any) => {
        const { data, error } = await supabase.from('shipments').insert({
            proforma_id: shipment.proformaId,
            customer_id: shipment.customerId,
            booking_reference: shipment.bookingReference,
            vessel_name: shipment.vesselName,
            etd: shipment.etd,
            eta: shipment.eta,
            container_count: shipment.containerCount,
            container_type: shipment.containerType,
            status: shipment.status,
            forwarder_name: shipment.forwarderName,
            tracking_url: shipment.trackingUrl,
            notes: shipment.notes
        }).select().single();
        if (error) throw error;
        return data;
    },
    update: async (id: string, shipment: any) => {
        const { data, error } = await supabase.from('shipments').update({
            proforma_id: shipment.proformaId,
            customer_id: shipment.customerId,
            booking_reference: shipment.bookingReference,
            vessel_name: shipment.vesselName,
            etd: shipment.etd,
            eta: shipment.eta,
            container_count: shipment.containerCount,
            container_type: shipment.containerType,
            status: shipment.status,
            forwarder_name: shipment.forwarderName,
            tracking_url: shipment.trackingUrl,
            notes: shipment.notes
        }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }
};

export const supplierService = {
    getAll: async () => {
        const { data, error } = await supabase.from('suppliers').select('*');
        if (error) throw error;
        return data.map((s: any) => ({
            ...s,
            products: s.products || []
        }));
    },
    create: async (supplier: any) => {
        const { data, error } = await supabase.from('suppliers').insert({
            name: supplier.name,
            country: supplier.country,
            contact_person: supplier.contactPerson,
            email: supplier.email,
            phone: supplier.phone,
            products: supplier.products
        }).select().single();
        if (error) throw error;
        return data;
    },
    update: async (id: string, updates: any) => {
        const { data, error } = await supabase.from('suppliers').update({
            name: updates.name,
            country: updates.country,
            contact_person: updates.contactPerson,
            email: updates.email,
            phone: updates.phone,
            products: updates.products
        }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }
};
