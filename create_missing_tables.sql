-- ============================================
-- EKSİK TABLOLARI OLUŞTURMA VE DÜZELTME BİTİĞİ
-- ============================================
-- Bu SQL'i Supabase Dashboard -> SQL Editor kısmında çalıştırın.

-- 1. UUID Uzantısını Etkinleştir (Eğer etkin değilse)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFORMAS TABLOSU
CREATE TABLE IF NOT EXISTS public.proformas (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    proforma_number text UNIQUE,
    date timestamp with time zone DEFAULT timezone('utc'::text, now()),
    customer_id uuid REFERENCES public.customers(id),
    offer_id uuid REFERENCES public.offers(id),
    customer_name text,
    customer_address text,
    company_name text,
    company_address text,
    company_contact text,
    items jsonb DEFAULT '[]'::jsonb,
    total_price numeric,
    first_payment_amount numeric,
    final_payment_amount numeric,
    currency text,
    validity_days integer,
    brand text,
    destination text,
    quantity text,
    production_time text,
    payment_terms text,
    beneficiary_name text,
    bank_name text,
    bank_address text,
    swift_code text,
    iban text,
    status text DEFAULT 'Draft',
    document_type text DEFAULT 'proforma',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SHIPMENTS TABLOSU
CREATE TABLE IF NOT EXISTS public.shipments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    proforma_id uuid REFERENCES public.proformas(id),
    customer_id uuid REFERENCES public.customers(id),
    booking_reference text,
    vessel_name text,
    etd date,
    eta date,
    container_count integer,
    container_type text,
    status text,
    forwarder_name text,
    tracking_url text,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TIMELINE_EVENTS TABLOSU (Migration dosyasında geçiyor)
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text,
    "user" text,
    content text,
    assignee text,
    due_date timestamp with time zone,
    was_sent_as_message boolean DEFAULT false,
    icon text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. LOGISTICS_COMPANIES TABLOSU
CREATE TABLE IF NOT EXISTS public.logistics_companies (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name text,
    contact_person text,
    phone text,
    email text,
    service_intensity text,
    own_assets text,
    office_address text,
    notes text,
    meeting_status text,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RLS (GÜVENLİK) AYARLARI
ALTER TABLE public.proformas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_companies ENABLE ROW LEVEL SECURITY;

-- 7. POLİTİKALAR (Herkes için tam erişim - Başlangıç için)
DROP POLICY IF EXISTS "Allow all access" ON public.proformas;
CREATE POLICY "Allow all access" ON public.proformas FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access" ON public.shipments;
CREATE POLICY "Allow all access" ON public.shipments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access" ON public.timeline_events;
CREATE POLICY "Allow all access" ON public.timeline_events FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all access" ON public.logistics_companies;
CREATE POLICY "Allow all access" ON public.logistics_companies FOR ALL USING (true);

RAISE NOTICE 'Eksik tablolar başarıyla oluşturuldu/güncellendi.';
