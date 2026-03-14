-- PROFORMAS TABLOSU DÜZELTMESİ (SUPABASE/POSTGRESQL)
-- Bu SQL'i Supabase Dashboard -> SQL Editor kısmında çalıştırın.

-- 1. Eğer tablo varsa ve sütun tipleri yanlışsa, verileri koruyarak düzeltmeye çalışalım.
-- Not: Eğer tablo henüz yoksa veya içindeki veriler önemli değilse direkt DROP-CREATE yapabilirsiniz.

DO $$ 
BEGIN
    -- Önce kısıtlamayı kaldır (eğer varsa)
    ALTER TABLE IF EXISTS public.proformas DROP CONSTRAINT IF EXISTS proformas_customer_id_fkey;
    
    -- customer_id sütununu uuid tipine çevir
    -- (Eğer içinde uuid olmayan metinler varsa bu işlem hata verebilir, 
    -- bu durumda verileri temizlemek gerekebilir)
    ALTER TABLE IF EXISTS public.proformas 
    ALTER COLUMN customer_id TYPE uuid USING (customer_id::uuid);

    -- Kısıtlamayı (Foreign Key) tekrar ekle
    ALTER TABLE IF EXISTS public.proformas
    ADD CONSTRAINT proformas_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES public.customers(id);

    RAISE NOTICE 'Proformas tablosu başarıyla güncellendi.';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Otomatik güncelleme başarısız oldu, tabloyu yeniden oluşturuyorum...';
    
    -- Eğer yukarıdaki işlem hata verirse (veri tipi uyumsuzluğu vs.), 
    -- tabloyu silip en baştan doğru tiplerle oluşturuyoruz.
    DROP TABLE IF EXISTS public.shipments; -- Önce referans veren tabloyu silelim
    DROP TABLE IF EXISTS public.proformas;

    CREATE TABLE public.proformas (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        proforma_number text UNIQUE,
        date timestamp with time zone DEFAULT timezone('utc'::text, now()),
        customer_id uuid REFERENCES public.customers(id),
        offer_id uuid, -- İsterseniz bunu da references public.offers(id) yapabilirsiniz
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

    -- Shipments tablosunu da doğru tiplerle ekleyelim
    CREATE TABLE public.shipments (
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

    -- RLS Ayarları
    ALTER TABLE public.proformas ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow all access for authenticated users" ON public.proformas FOR ALL USING (true);
    CREATE POLICY "Allow all access for authenticated users" ON public.shipments FOR ALL USING (true);
END $$;
