-- ============================================
-- LOGISTICS_COMPANIES TABLOSU İÇİN SUPABASE DÜZELTMESİ
-- ============================================
-- 
-- Bu SQL'i Supabase Dashboard'da çalıştırın:
-- 1. https://app.supabase.com adresine gidin
-- 2. Projenizi seçin
-- 3. Sol menüden "SQL Editor" tıklayın
-- 4. "New Query" tuşuna basın
-- 5. Aşağıdaki SQL'i yapıştırın ve "Run" tuşuna basın
--
-- ============================================

-- Önce mevcut politikaları temizle (hata verirse sorun değil)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON logistics_companies;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON logistics_companies;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON logistics_companies;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON logistics_companies;
DROP POLICY IF EXISTS "Allow all inserts" ON logistics_companies;
DROP POLICY IF EXISTS "Allow all selects" ON logistics_companies;
DROP POLICY IF EXISTS "Allow all updates" ON logistics_companies;
DROP POLICY IF EXISTS "Allow all deletes" ON logistics_companies;

-- RLS'yi devre dışı bırak (EN KOLAY ÇÖZÜM)
ALTER TABLE logistics_companies DISABLE ROW LEVEL SECURITY;

-- VEYA alternatif olarak RLS'yi etkinleştirip politika ekle:
-- ALTER TABLE logistics_companies ENABLE ROW LEVEL SECURITY;

-- Tüm işlemler için izin ver
-- CREATE POLICY "public_access" ON logistics_companies FOR ALL USING (true) WITH CHECK (true);
