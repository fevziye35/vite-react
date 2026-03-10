import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// --- HELPERS ---
const generateId = () => randomUUID();
const getNow = () => new Date().toISOString();

// --- JWT MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== AUTH ROUTES ====================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        const id = generateId();
        const now = getNow();

        db.prepare(`
            INSERT INTO users (id, email, password_hash, full_name, role, created_at)
            VALUES (?, ?, ?, ?, 'Admin', ?)
        `).run(id, email, passwordHash, fullName || email.split('@')[0], now);

        // Generate token
        const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: { id, email, fullName: fullName || email.split('@')[0], role: 'Admin' },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET CURRENT USER
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT id, email, full_name, role, avatar_url FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
});

// ==================== PRODUCTS ====================
app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    products.forEach(p => p.packaging_options = JSON.parse(p.packaging_options || '[]'));
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const { product_name, brand, grade, category, unit_type, base_unit_price, packaging_options, hs_code, origin_country, min_order_quantity, default_container_load_20ft, default_container_load_40ft, notes } = req.body;
    const id = generateId();

    db.prepare(`
        INSERT INTO products (id, product_name, brand, grade, category, unit_type, base_unit_price, packaging_options, hs_code, origin_country, min_order_quantity, default_container_load_20ft, default_container_load_40ft, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, product_name, brand, grade, category, unit_type, base_unit_price, JSON.stringify(packaging_options || []), hs_code, origin_country, min_order_quantity, default_container_load_20ft, default_container_load_40ft, notes);

    res.json({ id, ...req.body, packaging_options: packaging_options || [] });
});

app.put('/api/products/:id', (req, res) => {
    const { product_name, brand, grade, category, unit_type, base_unit_price, packaging_options, hs_code, origin_country, min_order_quantity, default_container_load_20ft, default_container_load_40ft, notes } = req.body;

    db.prepare(`
        UPDATE products SET product_name=?, brand=?, grade=?, category=?, unit_type=?, base_unit_price=?, packaging_options=?, hs_code=?, origin_country=?, min_order_quantity=?, default_container_load_20ft=?, default_container_load_40ft=?, notes=?
        WHERE id=?
    `).run(product_name, brand, grade, category, unit_type, base_unit_price, JSON.stringify(packaging_options || []), hs_code, origin_country, min_order_quantity, default_container_load_20ft, default_container_load_40ft, notes, req.params.id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    updated.packaging_options = JSON.parse(updated.packaging_options || '[]');
    res.json(updated);
});

// ==================== CUSTOMERS ====================
app.get('/api/customers', (req, res) => {
    const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
    customers.forEach(c => c.tags = JSON.parse(c.tags || '[]'));
    res.json(customers);
});

app.post('/api/customers', (req, res) => {
    const id = generateId();
    const now = getNow();
    const { company_name, contact_person, email, phone, country, city, address, preferred_incoterm, notes, tags } = req.body;

    db.prepare(`
        INSERT INTO customers (id, company_name, contact_person, email, phone, country, city, address, preferred_incoterm, notes, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, company_name, contact_person, email, phone, country, city, address, preferred_incoterm, notes, JSON.stringify(tags || []), now, now);

    res.json({ id, ...req.body, tags: tags || [], created_at: now, updated_at: now });
});

app.put('/api/customers/:id', (req, res) => {
    const now = getNow();
    const { company_name, contact_person, email, phone, country, city, address, preferred_incoterm, notes, tags } = req.body;

    db.prepare(`
        UPDATE customers SET company_name=?, contact_person=?, email=?, phone=?, country=?, city=?, address=?, preferred_incoterm=?, notes=?, tags=?, updated_at=?
        WHERE id=?
    `).run(company_name, contact_person, email, phone, country, city, address, preferred_incoterm, notes, JSON.stringify(tags || []), now, req.params.id);

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    updated.tags = JSON.parse(updated.tags || '[]');
    res.json(updated);
});

app.delete('/api/customers/:id', (req, res) => {
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// ==================== OFFERS ====================
app.get('/api/offers', (req, res) => {
    const offers = db.prepare(`
        SELECT o.*, c.company_name as customer_company_name 
        FROM offers o 
        LEFT JOIN customers c ON o.customer_id = c.id 
        ORDER BY o.created_at DESC
    `).all();

    offers.forEach(o => {
        if (o.customer_company_name) {
            o.customers = { company_name: o.customer_company_name };
        }
    });
    res.json(offers);
});

app.get('/api/offers/:id', (req, res) => {
    const offer = db.prepare(`
        SELECT o.*, c.company_name as customer_company_name 
        FROM offers o 
        LEFT JOIN customers c ON o.customer_id = c.id 
        WHERE o.id = ?
    `).get(req.params.id);

    if (!offer) return res.status(404).json({ error: 'Not found' });

    const items = db.prepare('SELECT * FROM offer_items WHERE offer_id = ?').all(offer.id);
    offer.offer_items = items;
    if (offer.customer_company_name) {
        offer.customers = { company_name: offer.customer_company_name };
    }
    res.json(offer);
});

app.post('/api/offers', (req, res) => {
    const id = generateId();
    const now = getNow();
    const {
        customer_id, contact_person, email, phone, country,
        status, validity_date, currency, incoterm,
        port_of_loading, port_of_discharge, payment_terms,
        freight_cost, insurance_cost, other_costs, total_amount, expected_margin,
        items
    } = req.body;

    const offerNumber = `OFF-${Date.now().toString().slice(-6)}`;

    db.prepare(`
        INSERT INTO offers (id, offer_number, customer_id, contact_person, email, phone, country, status, validity_date, currency, incoterm, port_of_loading, port_of_discharge, payment_terms, freight_cost, insurance_cost, other_costs, total_amount, expected_margin, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, offerNumber, customer_id, contact_person, email, phone, country, status || 'Draft', validity_date, currency, incoterm, port_of_loading, port_of_discharge, payment_terms, freight_cost || 0, insurance_cost || 0, other_costs || 0, total_amount || 0, expected_margin || 0, now, now);

    if (items && items.length > 0) {
        const insertItem = db.prepare(`
            INSERT INTO offer_items (id, offer_id, product_id, description, packaging, quantity, unit_price, discount, total)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const item of items) {
            insertItem.run(generateId(), id, item.product_id, item.description, item.packaging, item.quantity, item.unit_price, item.discount, item.total);
        }
    }

    res.json({ id, offer_number: offerNumber, ...req.body, created_at: now, updated_at: now });
});

app.put('/api/offers/:id', (req, res) => {
    const now = getNow();
    const { status } = req.body;

    db.prepare('UPDATE offers SET status=?, updated_at=? WHERE id=?').run(status, now, req.params.id);

    const updated = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// ==================== DEALS ====================
app.get('/api/deals', (req, res) => {
    const deals = db.prepare('SELECT * FROM deals ORDER BY created_at DESC').all();
    deals.forEach(d => {
        d.target_products = JSON.parse(d.target_products || '[]');
        d.items = d.items ? JSON.parse(d.items) : [];
    });
    res.json(deals);
});

app.post('/api/deals', (req, res) => {
    const id = generateId();
    const now = getNow();
    const { title, customer_id, target_products, target_volume, target_country, expected_closing_date, stage, probability, expected_revenue, assigned_to, notes, offer_id, items } = req.body;

    db.prepare(`
        INSERT INTO deals (id, title, customer_id, offer_id, target_products, target_volume, target_country, expected_closing_date, stage, probability, expected_revenue, assigned_to, notes, items, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, customer_id, offer_id, JSON.stringify(target_products || []), target_volume, target_country, expected_closing_date, stage, probability, expected_revenue, assigned_to, notes, items ? JSON.stringify(items) : null, now, now);

    res.json({ id, ...req.body, created_at: now, updated_at: now });
});

app.put('/api/deals/:id', (req, res) => {
    const now = getNow();
    const { stage, probability, expected_revenue, notes } = req.body;

    db.prepare('UPDATE deals SET stage=?, probability=?, expected_revenue=?, notes=?, updated_at=? WHERE id=?')
        .run(stage, probability, expected_revenue, notes, now, req.params.id);

    const updated = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
    updated.target_products = JSON.parse(updated.target_products || '[]');
    updated.items = updated.items ? JSON.parse(updated.items) : [];
    res.json(updated);
});

// ==================== LOGISTICS OFFERS ====================
app.get('/api/logistics_offers', (req, res) => {
    const offers = db.prepare('SELECT * FROM logistics_offers ORDER BY id DESC').all();
    offers.forEach(l => l.custom_fields = JSON.parse(l.custom_fields || '{}'));
    res.json(offers);
});

app.post('/api/logistics_offers', (req, res) => {
    const id = generateId();
    const { provider_name, origin_port, destination_country, destination_port, container_type, price, currency, validity_date, notes, contact_person, phone, email, carrier, transit_time, free_time, description, custom_fields } = req.body;

    db.prepare(`
        INSERT INTO logistics_offers (id, provider_name, origin_port, destination_country, destination_port, container_type, price, currency, validity_date, notes, contact_person, phone, email, carrier, transit_time, free_time, description, custom_fields)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, provider_name, origin_port, destination_country, destination_port, container_type, price, currency, validity_date, notes, contact_person, phone, email, carrier, transit_time, free_time, description, JSON.stringify(custom_fields || {}));

    res.json({ id, ...req.body });
});

app.put('/api/logistics_offers/:id', (req, res) => {
    const { provider_name, origin_port, destination_country, destination_port, container_type, price, currency, validity_date, notes, contact_person, phone, email, carrier, transit_time, free_time, custom_fields } = req.body;

    db.prepare(`
        UPDATE logistics_offers SET provider_name=?, origin_port=?, destination_country=?, destination_port=?, container_type=?, price=?, currency=?, validity_date=?, notes=?, contact_person=?, phone=?, email=?, carrier=?, transit_time=?, free_time=?, custom_fields=?
        WHERE id=?
    `).run(provider_name, origin_port, destination_country, destination_port, container_type, price, currency, validity_date, notes, contact_person, phone, email, carrier, transit_time, free_time, JSON.stringify(custom_fields || {}), req.params.id);

    const updated = db.prepare('SELECT * FROM logistics_offers WHERE id = ?').get(req.params.id);
    updated.custom_fields = JSON.parse(updated.custom_fields || '{}');
    res.json(updated);
});

app.delete('/api/logistics_offers/:id', (req, res) => {
    db.prepare('DELETE FROM logistics_offers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// ==================== LOGISTICS COMPANIES ====================
app.get('/api/logistics_companies', (req, res) => {
    const companies = db.prepare('SELECT * FROM logistics_companies').all();
    companies.forEach(c => c.custom_fields = JSON.parse(c.custom_fields || '{}'));
    res.json(companies);
});

app.post('/api/logistics_companies', (req, res) => {
    const id = generateId();
    const { company_name, contact_person, phone, email, service_intensity, own_assets, office_address, notes, meeting_status, custom_fields } = req.body;

    db.prepare(`
        INSERT INTO logistics_companies (id, company_name, contact_person, phone, email, service_intensity, own_assets, office_address, notes, meeting_status, custom_fields)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, company_name, contact_person, phone, email, service_intensity, own_assets, office_address, notes, meeting_status, JSON.stringify(custom_fields || {}));

    res.json({ id, ...req.body });
});

app.put('/api/logistics_companies/:id', (req, res) => {
    const { company_name, contact_person, phone, email, service_intensity, own_assets, office_address, notes, meeting_status, custom_fields } = req.body;

    db.prepare(`
        UPDATE logistics_companies SET company_name=?, contact_person=?, phone=?, email=?, service_intensity=?, own_assets=?, office_address=?, notes=?, meeting_status=?, custom_fields=?
        WHERE id=?
    `).run(company_name, contact_person, phone, email, service_intensity, own_assets, office_address, notes, meeting_status, JSON.stringify(custom_fields || {}), req.params.id);

    const updated = db.prepare('SELECT * FROM logistics_companies WHERE id = ?').get(req.params.id);
    updated.custom_fields = JSON.parse(updated.custom_fields || '{}');
    res.json(updated);
});

app.delete('/api/logistics_companies/:id', (req, res) => {
    db.prepare('DELETE FROM logistics_companies WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// ==================== MEETINGS ====================
app.get('/api/meetings', (req, res) => {
    const meetings = db.prepare(`
        SELECT m.*, c.company_name 
        FROM meetings m 
        LEFT JOIN customers c ON m.customer_id = c.id 
        ORDER BY m.date ASC
    `).all();

    meetings.forEach(m => {
        m.customers = m.company_name ? { company_name: m.company_name } : null;
    });
    res.json(meetings);
});

app.post('/api/meetings', (req, res) => {
    const id = generateId();
    const now = getNow();
    const { title, customer_id, date, type, notes, outcome } = req.body;

    db.prepare(`
        INSERT INTO meetings (id, title, customer_id, date, type, notes, outcome, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, customer_id, date, type, notes, outcome, now);

    res.json({ id, ...req.body, created_at: now });
});

// ==================== TASKS ====================
app.get('/api/tasks', (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const id = generateId();
    const now = getNow();
    const { title, description, due_date, priority, assigned_to, status, link } = req.body;

    db.prepare(`
        INSERT INTO tasks (id, title, description, due_date, priority, assigned_to, status, link, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description, due_date, priority || 'medium', assigned_to, status || 'pending', link, now);

    res.json({ id, ...req.body, created_at: now });
});

app.put('/api/tasks/:id', (req, res) => {
    const { title, description, due_date, priority, assigned_to, status, link } = req.body;

    db.prepare(`
        UPDATE tasks SET title=?, description=?, due_date=?, priority=?, assigned_to=?, status=?, link=?
        WHERE id=?
    `).run(title, description, due_date, priority, assigned_to, status, link, req.params.id);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json(updated);
});

app.delete('/api/tasks/:id', (req, res) => {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// ==================== PROFORMAS ====================
app.get('/api/proformas', (req, res) => {
    const proformas = db.prepare('SELECT * FROM proformas ORDER BY created_at DESC').all();
    proformas.forEach(p => p.items = JSON.parse(p.items || '[]'));
    res.json(proformas);
});

app.post('/api/proformas', (req, res) => {
    const id = generateId();
    const now = getNow();
    const { proforma_number, date, customer_id, offer_id, customer_name, customer_address, company_name, company_address, company_contact, items, total_price, first_payment_amount, final_payment_amount, currency, validity_days, brand, destination, quantity, production_time, payment_terms, beneficiary_name, bank_name, bank_address, swift_code, iban, status } = req.body;

    const number = proforma_number || `PI-${Date.now()}`;

    db.prepare(`
        INSERT INTO proformas (id, proforma_number, date, customer_id, offer_id, customer_name, customer_address, company_name, company_address, company_contact, items, total_price, first_payment_amount, final_payment_amount, currency, validity_days, brand, destination, quantity, production_time, payment_terms, beneficiary_name, bank_name, bank_address, swift_code, iban, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, number, date || now, customer_id, offer_id, customer_name, customer_address, company_name, company_address, company_contact, JSON.stringify(items || []), total_price, first_payment_amount, final_payment_amount, currency, validity_days, brand, destination, quantity, production_time, payment_terms, beneficiary_name, bank_name, bank_address, swift_code, iban, status || 'Draft', now);

    res.json({ id, proforma_number: number, ...req.body, created_at: now });
});

// ==================== SHIPMENTS ====================
app.get('/api/shipments', (req, res) => {
    const shipments = db.prepare('SELECT * FROM shipments ORDER BY created_at DESC').all();
    res.json(shipments);
});

app.post('/api/shipments', (req, res) => {
    const id = generateId();
    const now = getNow();
    const { proforma_id, customer_id, booking_reference, vessel_name, etd, eta, container_count, container_type, status, forwarder_name, tracking_url, notes } = req.body;

    db.prepare(`
        INSERT INTO shipments (id, proforma_id, customer_id, booking_reference, vessel_name, etd, eta, container_count, container_type, status, forwarder_name, tracking_url, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, proforma_id, customer_id, booking_reference, vessel_name, etd, eta, container_count, container_type, status, forwarder_name, tracking_url, notes, now);

    res.json({ id, ...req.body, created_at: now });
});

app.put('/api/shipments/:id', (req, res) => {
    const { proforma_id, customer_id, booking_reference, vessel_name, etd, eta, container_count, container_type, status, forwarder_name, tracking_url, notes } = req.body;

    db.prepare(`
        UPDATE shipments SET proforma_id=?, customer_id=?, booking_reference=?, vessel_name=?, etd=?, eta=?, container_count=?, container_type=?, status=?, forwarder_name=?, tracking_url=?, notes=?
        WHERE id=?
    `).run(proforma_id, customer_id, booking_reference, vessel_name, etd, eta, container_count, container_type, status, forwarder_name, tracking_url, notes, req.params.id);

    const updated = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// ==================== SUPPLIERS ====================
app.get('/api/suppliers', (req, res) => {
    const suppliers = db.prepare('SELECT * FROM suppliers').all();
    suppliers.forEach(s => s.products = JSON.parse(s.products || '[]'));
    res.json(suppliers);
});

app.post('/api/suppliers', (req, res) => {
    const id = generateId();
    const { name, country, contact_person, email, phone, products } = req.body;

    db.prepare(`
        INSERT INTO suppliers (id, name, country, contact_person, email, phone, products)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, country, contact_person, email, phone, JSON.stringify(products || []));

    res.json({ id, ...req.body });
});

app.put('/api/suppliers/:id', (req, res) => {
    const { name, country, contact_person, email, phone, products } = req.body;

    db.prepare(`
        UPDATE suppliers SET name=?, country=?, contact_person=?, email=?, phone=?, products=?
        WHERE id=?
    `).run(name, country, contact_person, email, phone, JSON.stringify(products || []), req.params.id);

    const updated = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
    updated.products = JSON.parse(updated.products || '[]');
    res.json(updated);
});

// ==================== TIMELINE EVENTS ====================
app.get('/api/timeline_events/:deal_id', (req, res) => {
    const events = db.prepare('SELECT * FROM timeline_events WHERE deal_id = ? ORDER BY created_at DESC').all();
    res.json(events);
});

app.post('/api/timeline_events', (req, res) => {
    const id = generateId();
    const now = getNow();
    const { deal_id, type, title, user, content, assignee, due_date, was_sent_as_message, icon } = req.body;

    db.prepare(`
        INSERT INTO timeline_events (id, deal_id, type, title, user, content, assignee, due_date, was_sent_as_message, icon, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, deal_id, type, title, user, content, assignee, due_date, was_sent_as_message ? 1 : 0, icon, now);

    res.json({ id, ...req.body, created_at: now });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Database: SQLite (crm.db)`);
    console.log(`🔐 Auth: JWT-based authentication`);
});
