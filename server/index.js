import express from 'express';
import cors from 'cors';
import db from './db.js';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- HELPERS ---
const generateId = () => randomUUID();
const getNow = () => new Date().toISOString();

// --- ROUTES ---

// PRODUCTS
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    products.forEach(p => p.packagingOptions = JSON.parse(p.packagingOptions || '[]'));
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const { productName, category, unitType, baseUnitPrice, packagingOptions, hsCode, originCountry, minOrderQuantity, defaultContainerLoad20ft, defaultContainerLoad40ft } = req.body;
    const stmt = db.prepare(`
        INSERT INTO products (id, productName, category, unitType, baseUnitPrice, packagingOptions, hsCode, originCountry, minOrderQuantity, defaultContainerLoad20ft, defaultContainerLoad40ft)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const id = generateId();
    stmt.run(id, productName, category, unitType, baseUnitPrice, JSON.stringify(packagingOptions), hsCode, originCountry, minOrderQuantity, defaultContainerLoad20ft, defaultContainerLoad40ft);
    res.json({ id, ...req.body });
});

// CUSTOMERS
app.get('/api/customers', (req, res) => {
    const customers = db.prepare('SELECT * FROM customers').all();
    customers.forEach(c => c.tags = JSON.parse(c.tags || '[]'));
    res.json(customers);
});

app.post('/api/customers', (req, res) => {
    const id = generateId();
    const now = getNow();
    const { companyName, contactPerson, email, phone, country, city, address, preferredIncoterm, notes, tags } = req.body;

    const stmt = db.prepare(`
        INSERT INTO customers (id, companyName, contactPerson, email, phone, country, city, address, preferredIncoterm, notes, tags, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, companyName, contactPerson, email, phone, country, city, address, preferredIncoterm, notes, JSON.stringify(tags || []), now, now);
    res.json({ id, ...req.body, createdAt: now, updatedAt: now });
});

// OFFERS
app.get('/api/offers', (req, res) => {
    const offers = db.prepare('SELECT * FROM offers ORDER BY createdAt DESC').all();
    res.json(offers);
});

app.get('/api/offers/:id', (req, res) => {
    const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Not found' });

    const items = db.prepare('SELECT * FROM offer_items WHERE offerId = ?').all(offer.id);
    res.json({ ...offer, items });
});

app.post('/api/offers', (req, res) => {
    const id = generateId();
    const now = getNow();
    const {
        customerId, contactPerson, email, phone, country,
        status, validityDate, currency, incoterm,
        portOfLoading, portOfDischarge, paymentTerms,
        freightCost, insuranceCost, otherCosts, totalAmount, expectedMargin,
        items
    } = req.body;

    const offerNumber = `OFF-${Date.now().toString().slice(-6)}`; // Simple offer number gen

    const insertOffer = db.prepare(`
        INSERT INTO offers (id, offerNumber, customerId, contactPerson, email, phone, country, status, validityDate, currency, incoterm, portOfLoading, portOfDischarge, paymentTerms, freightCost, insuranceCost, otherCosts, totalAmount, expectedMargin, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
        INSERT INTO offer_items (id, offerId, productId, description, packaging, quantity, unitPrice, discount, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
        insertOffer.run(
            id, offerNumber, customerId, contactPerson, email, phone, country,
            status || 'Draft', validityDate, currency, incoterm,
            portOfLoading, portOfDischarge, paymentTerms,
            freightCost, insuranceCost, otherCosts, totalAmount, expectedMargin,
            now, now
        );

        for (const item of items) {
            insertItem.run(generateId(), id, item.productId, item.description, item.packaging, item.quantity, item.unitPrice, item.discount, item.total);
        }
    });

    transaction();
    res.json({ id, offerNumber, ...req.body });
});

// LOGISTICS
app.get('/api/logistics', (req, res) => {
    const offers = db.prepare('SELECT * FROM logistics_offers').all();
    res.json(offers);
});

app.post('/api/logistics', (req, res) => {
    const id = generateId();
    const { providerName, originPort, destinationCountry, destinationPort, containerType, price, currency, validityDate, notes } = req.body;
    const stmt = db.prepare(`
        INSERT INTO logistics_offers (id, providerName, originPort, destinationCountry, destinationPort, containerType, price, currency, validityDate, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, providerName, originPort, destinationCountry, destinationPort, containerType, price, currency, validityDate, notes);
    res.json({ id, ...req.body });
});

// START
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
