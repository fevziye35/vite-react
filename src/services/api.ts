import axios from 'axios';
import type { Product, Customer, Offer, LogisticsOffer, LogisticsCompany } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with auth header
const api = axios.create({
    baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- HELPERS ---

// Data Mappers (from snake_case API to camelCase frontend)
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
    customFields: l.custom_fields || {}
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
    customFields: l.custom_fields || {}
});

// --- SERVICES ---

export const productService = {
    getAll: async () => {
        const { data } = await api.get('/api/products');
        return data.map(mapProduct);
    },
    create: async (product: Omit<Product, 'id'> | Product) => {
        if ('id' in product && product.id) {
            // Update
            const { data } = await api.put(`/api/products/${product.id}`, {
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
            });
            return mapProduct(data);
        } else {
            // Insert
            const { data } = await api.post('/api/products', {
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
            });
            return mapProduct(data);
        }
    }
};

export const customerService = {
    getAll: async () => {
        const { data } = await api.get('/api/customers');
        return data.map(mapCustomer);
    },
    create: async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
        const { data } = await api.post('/api/customers', {
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
        });
        return mapCustomer(data);
    },
    update: async (id: string, updates: any) => {
        const { data } = await api.put(`/api/customers/${id}`, {
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
        });
        return mapCustomer(data);
    },
    delete: async (id: string) => {
        await api.delete(`/api/customers/${id}`);
        return true;
    }
};

export const offerService = {
    getAll: async () => {
        const { data } = await api.get('/api/offers');
        return data.map(mapOffer);
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/api/offers/${id}`);
        return mapOffer(data);
    },
    create: async (offer: any) => {
        const { data } = await api.post('/api/offers', {
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
            expected_margin: offer.expectedMargin,
            items: offer.items?.map((i: any) => ({
                product_id: i.productId,
                description: i.description,
                packaging: i.packaging,
                quantity: i.quantity,
                unit_price: i.unitPrice,
                discount: i.discount,
                total: i.total
            }))
        });
        return mapOffer(data);
    },
    update: async (id: string, updates: any) => {
        const { data } = await api.put(`/api/offers/${id}`, {
            status: updates.status
        });
        return mapOffer(data);
    }
};

export const logisticsService = {
    getAll: async () => {
        const { data } = await api.get('/api/logistics_offers');
        return data.map(mapLogistics);
    },
    create: async (logistics: any) => {
        const { data } = await api.post('/api/logistics_offers', {
            provider_name: logistics.providerName,
            origin_port: logistics.originPort,
            destination_country: logistics.destinationCountry,
            destination_port: logistics.destinationPort,
            container_type: logistics.containerType,
            price: logistics.price !== undefined && logistics.price !== '' ? Number(logistics.price) : null,
            currency: logistics.currency,
            validity_date: logistics.validityDate,
            notes: logistics.notes,
            contact_person: logistics.contactPerson,
            phone: logistics.phone,
            email: logistics.email,
            carrier: logistics.carrier,
            transit_time: logistics.transitTime,
            free_time: logistics.freeTime,
            description: logistics.description,
            custom_fields: logistics.customFields || {}
        });
        return mapLogistics(data);
    },
    update: async (id: string, updates: any) => {
        const { data } = await api.put(`/api/logistics_offers/${id}`, {
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
            custom_fields: updates.customFields
        });
        return mapLogistics(data);
    },
    delete: async (id: string) => {
        await api.delete(`/api/logistics_offers/${id}`);
        return true;
    }
};

export const logisticsCompanyService = {
    getAll: async () => {
        const { data } = await api.get('/api/logistics_companies');
        return data.map(mapLogisticsCompany);
    },
    create: async (company: any) => {
        const { data } = await api.post('/api/logistics_companies', {
            company_name: company.companyName,
            contact_person: company.contactPerson,
            phone: company.phone,
            email: company.email,
            service_intensity: company.serviceIntensity,
            own_assets: company.ownAssets,
            office_address: company.officeAddress,
            notes: company.notes,
            meeting_status: company.meetingStatus,
            custom_fields: company.customFields || {}
        });
        return mapLogisticsCompany(data);
    },
    update: async (id: string, updates: any) => {
        const { data } = await api.put(`/api/logistics_companies/${id}`, {
            company_name: updates.companyName,
            contact_person: updates.contactPerson,
            phone: updates.phone,
            email: updates.email,
            service_intensity: updates.serviceIntensity,
            own_assets: updates.ownAssets,
            office_address: updates.officeAddress,
            notes: updates.notes,
            meeting_status: updates.meetingStatus,
            custom_fields: updates.customFields
        });
        return mapLogisticsCompany(data);
    },
    delete: async (id: string) => {
        await api.delete(`/api/logistics_companies/${id}`);
        return true;
    }
};

export const dealService = {
    getAll: async () => {
        const { data } = await api.get('/api/deals');
        return data.map((d: any) => ({
            ...d,
            targetProducts: d.target_products,
            items: d.items || [],
            offerId: d.offer_id
        }));
    },
    create: async (deal: any) => {
        const { data } = await api.post('/api/deals', {
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
            items: deal.items
        });
        return { ...data, items: data.items || [] };
    },
    update: async (id: string, updates: any) => {
        const { data } = await api.put(`/api/deals/${id}`, {
            stage: updates.stage,
            probability: updates.probability,
            expected_revenue: updates.expectedRevenue,
            notes: updates.notes
        });
        return data;
    }
};

export const meetingService = {
    getAll: async () => {
        const { data } = await api.get('/api/meetings');
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
        const { data } = await api.post('/api/meetings', {
            title: meeting.title,
            customer_id: meeting.customerId,
            date: meeting.date,
            type: meeting.type,
            notes: meeting.notes,
            outcome: meeting.outcome
        });
        return data;
    }
};

const mapProforma = (p: any): any => ({
    id: p.id,
    proformaNumber: p.proforma_number,
    date: p.date,
    customerId: p.customer_id,
    customerName: p.customer_name,
    customerAddress: p.customer_address,
    companyName: p.company_name,
    companyAddress: p.company_address,
    companyContact: p.company_contact,
    items: p.items || [],
    totalPrice: p.total_price,
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
    createdAt: p.created_at
});

export const proformaService = {
    getAll: async () => {
        const { data } = await api.get('/api/proformas');
        return data ? data.map(mapProforma) : [];
    },
    create: async (proforma: any) => {
        const { data } = await api.post('/api/proformas', {
            proforma_number: proforma.number,
            customer_id: proforma.customerId,
            offer_id: proforma.offerId,
            total_price: proforma.amount,
            status: proforma.status,
            date: proforma.issueDate,
            items: proforma.items
        });
        return data;
    },
    convertFromOffer: async (offer: any) => {
        const proforma = {
            number: `PI-${Date.now()}`,
            customerId: offer.customerId,
            offerId: offer.id,
            amount: offer.totalAmount,
            status: 'Draft',
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: offer.items || []
        };
        return proformaService.create(proforma);
    },
    delete: async (id: string) => {
        await api.delete(`/api/proformas/${id}`);
        return true;
    }
};

export const shipmentService = {
    getAll: async () => {
        const { data } = await api.get('/api/shipments');
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
        const { data } = await api.post('/api/shipments', {
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
        });
        return data;
    },
    update: async (id: string, shipment: any) => {
        const { data } = await api.put(`/api/shipments/${id}`, {
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
        });
        return data;
    }
};

export const supplierService = {
    getAll: async () => {
        const { data } = await api.get('/api/suppliers');
        return data.map((s: any) => ({
            ...s,
            products: s.products || []
        }));
    },
    create: async (supplier: any) => {
        const { data } = await api.post('/api/suppliers', {
            name: supplier.name,
            country: supplier.country,
            contact_person: supplier.contactPerson,
            email: supplier.email,
            phone: supplier.phone,
            products: supplier.products
        });
        return data;
    },
    update: async (id: string, updates: any) => {
        const { data } = await api.put(`/api/suppliers/${id}`, {
            name: updates.name,
            country: updates.country,
            contact_person: updates.contactPerson,
            email: updates.email,
            phone: updates.phone,
            products: updates.products
        });
        return data;
    }
};

export const taskService = {
    getAll: async () => {
        const { data } = await api.get('/api/tasks');
        return data.map((t: any) => ({
            ...t,
            dueDate: t.due_date,
            createdAt: t.created_at,
            assignedTo: t.assigned_to,
            link: t.link
        }));
    },
    create: async (task: any) => {
        const { data } = await api.post('/api/tasks', {
            title: task.title,
            description: task.description,
            due_date: task.dueDate,
            priority: task.priority,
            assigned_to: task.assignedTo,
            status: task.status || 'pending',
            link: task.link
        });
        return {
            ...data,
            dueDate: data.due_date,
            createdAt: data.created_at,
            assignedTo: data.assigned_to,
            link: data.link
        };
    },
    update: async (id: string, updates: any) => {
        const { data } = await api.put(`/api/tasks/${id}`, {
            title: updates.title,
            description: updates.description,
            due_date: updates.dueDate,
            priority: updates.priority,
            assigned_to: updates.assignedTo,
            status: updates.status,
            link: updates.link
        });
        return {
            ...data,
            dueDate: data.due_date,
            createdAt: data.created_at,
            assignedTo: data.assigned_to,
            link: data.link
        };
    },
    delete: async (id: string) => {
        await api.delete(`/api/tasks/${id}`);
        return true;
    }
};

export const timelineService = {
    getByDealId: async (dealId: string) => {
        const { data } = await api.get(`/api/timeline_events/${dealId}`);
        return data.map((e: any) => ({
            ...e,
            dealId: e.deal_id,
            wasSentAsMessage: Boolean(e.was_sent_as_message),
            dueDate: e.due_date,
            createdAt: e.created_at,
            time: e.created_at ? new Date(e.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Az önce'
        }));
    },
    create: async (event: any) => {
        const { data } = await api.post('/api/timeline_events', {
            deal_id: event.dealId,
            type: event.type,
            title: event.title,
            user: event.user,
            content: event.content,
            assignee: event.assignee,
            due_date: event.dueDate,
            was_sent_as_message: event.wasSentAsMessage,
            icon: event.icon ? 'custom' : null
        });
        return {
            ...data,
            dealId: data.deal_id,
            wasSentAsMessage: Boolean(data.was_sent_as_message),
            dueDate: data.due_date,
            createdAt: data.created_at
        };
    }
};
