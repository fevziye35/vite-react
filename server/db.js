import Database from 'better-sqlite3';

const db = new Database('crm.db');

// Initialize Schema
db.exec(`
    -- USERS (with authentication)
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL DEFAULT 'Viewer',
        avatar_url TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );

    -- CUSTOMERS
    CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        country TEXT,
        city TEXT,
        address TEXT,
        preferred_incoterm TEXT,
        notes TEXT,
        tags TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    -- PRODUCTS
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        product_name TEXT NOT NULL,
        brand TEXT,
        grade TEXT,
        category TEXT,
        unit_type TEXT,
        base_unit_price REAL,
        packaging_options TEXT DEFAULT '[]',
        hs_code TEXT,
        origin_country TEXT,
        min_order_quantity REAL,
        default_payment_terms TEXT,
        default_lead_time TEXT,
        notes TEXT,
        default_container_load_20ft REAL,
        default_container_load_40ft REAL
    );

    -- OFFERS
    CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        offer_number TEXT UNIQUE,
        customer_id TEXT,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        country TEXT,
        status TEXT DEFAULT 'Draft',
        validity_date TEXT,
        currency TEXT,
        incoterm TEXT,
        port_of_loading TEXT,
        port_of_discharge TEXT,
        payment_terms TEXT,
        freight_cost REAL DEFAULT 0,
        insurance_cost REAL DEFAULT 0,
        other_costs REAL DEFAULT 0,
        total_amount REAL DEFAULT 0,
        expected_margin REAL DEFAULT 0,
        created_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    -- OFFER ITEMS
    CREATE TABLE IF NOT EXISTS offer_items (
        id TEXT PRIMARY KEY,
        offer_id TEXT NOT NULL,
        product_id TEXT,
        description TEXT,
        packaging TEXT,
        quantity REAL,
        unit_price REAL,
        discount REAL,
        total REAL,
        FOREIGN KEY(offer_id) REFERENCES offers(id) ON DELETE CASCADE
    );

    -- DEALS
    CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        title TEXT,
        customer_id TEXT,
        offer_id TEXT,
        target_products TEXT DEFAULT '[]',
        target_volume TEXT,
        target_country TEXT,
        expected_closing_date TEXT,
        stage TEXT,
        probability REAL,
        expected_revenue REAL,
        assigned_to TEXT,
        notes TEXT,
        items TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    -- LOGISTICS OFFERS
    CREATE TABLE IF NOT EXISTS logistics_offers (
        id TEXT PRIMARY KEY,
        provider_name TEXT,
        origin_port TEXT,
        destination_country TEXT,
        destination_port TEXT,
        container_type TEXT,
        price REAL,
        currency TEXT,
        validity_date TEXT,
        notes TEXT,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        carrier TEXT,
        transit_time TEXT,
        free_time TEXT,
        description TEXT,
        custom_fields TEXT DEFAULT '{}'
    );

    -- LOGISTICS COMPANIES
    CREATE TABLE IF NOT EXISTS logistics_companies (
        id TEXT PRIMARY KEY,
        company_name TEXT,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        service_intensity TEXT,
        own_assets TEXT,
        office_address TEXT,
        notes TEXT,
        meeting_status TEXT,
        custom_fields TEXT DEFAULT '{}'
    );

    -- MEETINGS
    CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        title TEXT,
        customer_id TEXT,
        date TEXT,
        type TEXT,
        notes TEXT,
        outcome TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    -- TASKS
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        priority TEXT DEFAULT 'medium',
        assigned_to TEXT,
        status TEXT DEFAULT 'pending',
        link TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    );

    -- PROFORMAS
    CREATE TABLE IF NOT EXISTS proformas (
        id TEXT PRIMARY KEY,
        proforma_number TEXT UNIQUE,
        date TEXT,
        customer_id TEXT,
        offer_id TEXT,
        customer_name TEXT,
        customer_address TEXT,
        company_name TEXT,
        company_address TEXT,
        company_contact TEXT,
        items TEXT DEFAULT '[]',
        total_price REAL,
        first_payment_amount REAL,
        final_payment_amount REAL,
        currency TEXT,
        validity_days INTEGER,
        brand TEXT,
        destination TEXT,
        quantity TEXT,
        production_time TEXT,
        payment_terms TEXT,
        beneficiary_name TEXT,
        bank_name TEXT,
        bank_address TEXT,
        swift_code TEXT,
        iban TEXT,
        status TEXT DEFAULT 'Draft',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    -- SHIPMENTS
    CREATE TABLE IF NOT EXISTS shipments (
        id TEXT PRIMARY KEY,
        proforma_id TEXT,
        customer_id TEXT,
        booking_reference TEXT,
        vessel_name TEXT,
        etd TEXT,
        eta TEXT,
        container_count INTEGER,
        container_type TEXT,
        status TEXT,
        forwarder_name TEXT,
        tracking_url TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(proforma_id) REFERENCES proformas(id),
        FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    -- SUPPLIERS
    CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT,
        country TEXT,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        products TEXT DEFAULT '[]'
    );

    -- TIMELINE EVENTS
    CREATE TABLE IF NOT EXISTS timeline_events (
        id TEXT PRIMARY KEY,
        deal_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        user TEXT,
        content TEXT,
        assignee TEXT,
        due_date TEXT,
        was_sent_as_message INTEGER DEFAULT 0,
        icon TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(deal_id) REFERENCES deals(id)
    );
`);

// Seed with demo user if no users exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
    console.log('Database initialized with schema.');
}

export default db;
