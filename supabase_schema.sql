-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (Managed by Supabase Auth, but we can have a profile table if needed, 
-- though for now we can just rely on the auth.users or create a public profile table)
-- For simplicity in this app's logic, let's create a profiles table that links to auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text default 'Viewer',
  avatar_url text
);

-- CUSTOMERS
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  contact_person text,
  email text,
  phone text,
  country text,
  city text,
  address text,
  preferred_incoterm text,
  notes text,
  tags jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  product_name text not null,
  category text,
  unit_type text,
  base_unit_price numeric,
  packaging_options jsonb default '[]'::jsonb,
  hs_code text,
  origin_country text,
  min_order_quantity numeric,
  default_payment_terms text,
  default_lead_time text,
  notes text,
  default_container_load_20ft numeric,
  default_container_load_40ft numeric
);

-- OFFERS
create table public.offers (
  id uuid default uuid_generate_v4() primary key,
  offer_number text unique,
  customer_id uuid references public.customers(id),
  contact_person text,
  email text,
  phone text,
  country text,
  status text check (status in ('Draft', 'Sent', 'Negotiation', 'Accepted', 'Lost')),
  validity_date date,
  currency text check (currency in ('USD', 'EUR')),
  incoterm text,
  port_of_loading text,
  port_of_discharge text,
  payment_terms text,
  freight_cost numeric default 0,
  insurance_cost numeric default 0,
  other_costs numeric default 0,
  total_amount numeric default 0,
  expected_margin numeric default 0,
  created_by uuid references auth.users,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- OFFER ITEMS
create table public.offer_items (
  id uuid default uuid_generate_v4() primary key,
  offer_id uuid references public.offers(id) on delete cascade not null,
  product_id uuid references public.products(id),
  description text,
  packaging text,
  quantity numeric,
  unit_price numeric,
  discount numeric,
  total numeric
);

-- DEALS
create table public.deals (
  id uuid default uuid_generate_v4() primary key,
  title text,
  customer_id uuid references public.customers(id),
  target_products jsonb default '[]'::jsonb,
  target_volume text,
  target_country text,
  expected_closing_date date,
  stage text,
  probability numeric,
  expected_revenue numeric,
  assigned_to uuid references auth.users,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LOGISTICS OFFERS
create table public.logistics_offers (
  id uuid default uuid_generate_v4() primary key,
  provider_name text,
  origin_port text,
  destination_country text,
  destination_port text,
  container_type text,
  price numeric,
  currency text,
  validity_date date,
  notes text
);

-- MEETINGS
create table public.meetings (
  id uuid default uuid_generate_v4() primary key,
  title text,
  customer_id uuid references public.customers(id),
  date timestamp with time zone,
  type text,
  notes text,
  outcome text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TASKS
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  priority text check (priority in ('urgent', 'medium', 'low')) default 'medium',
  assigned_to text,
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  link text
);

-- LOGISTICS COMPANIES
create table public.logistics_companies (
  id uuid default uuid_generate_v4() primary key,
  company_name text,
  contact_person text,
  phone text,
  email text,
  service_intensity text,
  own_assets text,
  office_address text,
  notes text,
  meeting_status text,
  custom_fields jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TIMELINE EVENTS
create table public.timeline_events (
  id uuid default uuid_generate_v4() primary key,
  deal_id uuid references public.deals(id) on delete cascade,
  type text not null,
  title text,
  "user" text,
  content text,
  assignee text,
  due_date timestamp with time zone,
  was_sent_as_message boolean default false,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROFORMAS
create table public.proformas (
  id uuid default uuid_generate_v4() primary key,
  proforma_number text unique,
  date timestamp with time zone default timezone('utc'::text, now()),
  customer_id uuid references public.customers(id),
  offer_id uuid references public.offers(id),
  customer_name text,
  customer_address text,
  company_name text,
  company_address text,
  company_contact text,
  items jsonb default '[]'::jsonb,
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
  status text default 'Draft',
  document_type text default 'proforma',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SHIPMENTS
create table public.shipments (
  id uuid default uuid_generate_v4() primary key,
  proforma_id uuid references public.proformas(id),
  customer_id uuid references public.customers(id),
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE ROW LEVEL SECURITY (RLS)
-- For simplicity, we will enable public read/write access for now, 
-- BUT for a real team app you should restrict this.
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.offers enable row level security;
alter table public.offer_items enable row level security;
alter table public.deals enable row level security;
alter table public.proformas enable row level security;
alter table public.shipments enable row level security;
alter table public.timeline_events enable row level security;
alter table public.logistics_companies enable row level security;
alter table public.logistics_offers enable row level security;
alter table public.meetings enable row level security;
alter table public.tasks enable row level security;

-- CREATE POLICIES (Allow everything for authenticated users for now)
create policy "Allow all access for authenticated users" on public.customers for all using (true);
create policy "Allow all access for authenticated users" on public.products for all using (true);
create policy "Allow all access for authenticated users" on public.offers for all using (true);
create policy "Allow all access for authenticated users" on public.offer_items for all using (true);
create policy "Allow all access for authenticated users" on public.deals for all using (true);
create policy "Allow all access for authenticated users" on public.proformas for all using (true);
create policy "Allow all access for authenticated users" on public.shipments for all using (true);
create policy "Allow all access for authenticated users" on public.timeline_events for all using (true);
create policy "Allow all access for authenticated users" on public.logistics_companies for all using (true);
create policy "Allow all access for authenticated users" on public.logistics_offers for all using (true);
create policy "Allow all access for authenticated users" on public.meetings for all using (true);
create policy "Allow all access for authenticated users" on public.tasks for all using (true);

-- SEED DATA
insert into public.products (product_name, category, unit_type, base_unit_price, packaging_options, origin_country)
values 
('Palm Oil CP10', 'Oil', 'kg', 0.85, '["Jerry Can 20L", "Flexibag"]', 'Malaysia'),
('Canned Tuna', 'Food', 'carton', 25.0, '["48x170g"]', 'Thailand');

