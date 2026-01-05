import Database from 'better-sqlite3';

const db = new Database('crm.db'); //, { verbose: console.log });

// Initialize Schema
const schemaSchema = `
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'Viewer',
        avatarUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        companyName TEXT NOT NULL,
        contactPerson TEXT,
        email TEXT,
        phone TEXT,
        country TEXT,
        city TEXT,
        address TEXT,
        preferredIncoterm TEXT,
        notes TEXT,
        tags TEXT, -- JSON array
        createdAt TEXT,
        updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        productName TEXT NOT NULL,
        category TEXT,
        unitType TEXT,
        baseUnitPrice REAL,
        packagingOptions TEXT, -- JSON array
        hsCode TEXT,
        originCountry TEXT,
        minOrderQuantity REAL,
        defaultPaymentTerms TEXT,
        defaultLeadTime TEXT,
        notes TEXT,
        defaultContainerLoad20ft REAL,
        defaultContainerLoad40ft REAL
    );

    CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        offerNumber TEXT UNIQUE,
        customerId TEXT,
        contactPerson TEXT,
        email TEXT,
        phone TEXT,
        country TEXT,
        status TEXT,
        validityDate TEXT,
        currency TEXT,
        incoterm TEXT,
        portOfLoading TEXT,
        portOfDischarge TEXT,
        paymentTerms TEXT,
        freightCost REAL DEFAULT 0,
        insuranceCost REAL DEFAULT 0,
        otherCosts REAL DEFAULT 0,
        totalAmount REAL DEFAULT 0,
        expectedMargin REAL DEFAULT 0,
        createdBy TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY(customerId) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS offer_items (
        id TEXT PRIMARY KEY,
        offerId TEXT NOT NULL,
        productId TEXT,
        description TEXT,
        packaging TEXT,
        quantity REAL,
        unitPrice REAL,
        discount REAL,
        total REAL,
        FOREIGN KEY(offerId) REFERENCES offers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deals (
        id TEXT PRIMARY KEY,
        title TEXT,
        customerId TEXT,
        targetProducts TEXT, -- JSON array
        targetVolume TEXT,
        targetCountry TEXT,
        expectedClosingDate TEXT,
        stage TEXT,
        probability REAL,
        expectedRevenue REAL,
        assignedTo TEXT,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        FOREIGN KEY(customerId) REFERENCES customers(id)
    );
    
    CREATE TABLE IF NOT EXISTS logistics_offers (
        id TEXT PRIMARY KEY,
        providerName TEXT,
        originPort TEXT,
        destinationCountry TEXT,
        destinationPort TEXT,
        containerType TEXT,
        price REAL,
        currency TEXT,
        validityDate TEXT,
        notes TEXT
    );

    CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        title TEXT,
        customerId TEXT,
        date TEXT,
        type TEXT, -- 'Online', 'In-Person'
        notes TEXT,
        outcome TEXT,
        createdAt TEXT
    );
`;

db.exec(schemaSchema);

// Initial Seed (if empty)
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
    console.log('Seeding database...');
    const insertUser = db.prepare('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)');
    insertUser.run('u1', 'Ali Mamak', 'ali@example.com', 'Admin');

    const insertProduct = db.prepare(`
        INSERT INTO products (id, productName, category, unitType, baseUnitPrice, packagingOptions, originCountry)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertProduct.run('p1', 'Palm Oil CP10', 'Oil', 'kg', 0.85, JSON.stringify(['Jerry Can 20L', 'Flexibag']), 'Malaysia');
    insertProduct.run('p2', 'Canned Tuna', 'Food', 'carton', 25.0, JSON.stringify(['48x170g']), 'Thailand');
}

export default db;
