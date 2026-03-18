import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { randomUUID } from 'crypto';
import { sendResetPasswordEmail } from './email.js';
import startCronJobs from './cron.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.get('/api/ping', (req, res) => res.json({ status: 'ok', time: getNow() }));
app.use(cors());
app.use(express.json());

// --- HELPERS ---
const generateId = () => randomUUID();
const getNow = () => new Date().toISOString();

// Email helper mock
const sendEmailNotification = (dealId, note) => {
    // ... logic ...
};

// --- REAL-TIME HELPERS ---
const onlineUsers = new Map(); // socketId -> userId

const broadcast = (type, payload) => {
    io.emit('data_change', { type, payload });
};

const broadcastOnlineUsers = () => {
    const uniqueUserIds = Array.from(new Set(onlineUsers.values()));
    io.emit('user_status', uniqueUserIds);
};

io.on('connection', (socket) => {
    console.log('👤 New client connected', socket.id);

    socket.on('identify', (userId) => {
        if (userId) {
            onlineUsers.set(socket.id, userId);
            console.log(`👤 User identified: ${userId}`);
            broadcastOnlineUsers();
        }
    });

    socket.on('disconnect', () => {
        console.log('👤 Client disconnected', socket.id);
        onlineUsers.delete(socket.id);
        broadcastOnlineUsers();
    });

    // --- WEBRTC SIGNALING ---
    socket.on('call-offer', (data) => {
        console.log('--- CALL OFFER RECEIVED ---');
        console.log('From socket:', socket.id);
        console.log('Caller ID:', onlineUsers.get(socket.id));
        console.log('Target ID:', data.targetUserId);
        
        const targetSocketId = [...onlineUsers.entries()].find(([k, v]) => v === data.targetUserId)?.[0];
        console.log('Found Target Socket ID:', targetSocketId);
        
        if (targetSocketId) {
            console.log('EMITTING call-offer to target socket:', targetSocketId);
            io.to(targetSocketId).emit('call-offer', {
                offer: data.offer,
                callerId: onlineUsers.get(socket.id),
                callerName: data.callerName,
                callType: data.callType
            });
        } else {
            console.log('WARNING: TARGET SOCKET NOT FOUND IN ONLINEUSERS!');
            console.log('Current online users array:', Array.from(onlineUsers.entries()));
        }
    });

    socket.on('call-answer', (data) => {
        const targetSocketId = [...onlineUsers.entries()].find(([k, v]) => v === data.targetUserId)?.[0];
        if (targetSocketId) {
            io.to(targetSocketId).emit('call-answer', {
                answer: data.answer,
                answererId: onlineUsers.get(socket.id)
            });
        }
    });

    socket.on('ice-candidate', (data) => {
        const targetSocketId = [...onlineUsers.entries()].find(([k, v]) => v === data.targetUserId)?.[0];
        if (targetSocketId) {
            io.to(targetSocketId).emit('ice-candidate', {
                candidate: data.candidate,
                senderId: onlineUsers.get(socket.id)
            });
        }
    });

    socket.on('end-call', (data) => {
        const targetSocketId = [...onlineUsers.entries()].find(([k, v]) => v === data.targetUserId)?.[0];
        if (targetSocketId) {
            io.to(targetSocketId).emit('end-call', {
                senderId: onlineUsers.get(socket.id)
            });
        }
    });

    socket.on('group-call-offer', (data) => {
        socket.broadcast.emit('group-call-offer', {
            roomId: data.roomId,
            callerId: onlineUsers.get(socket.id),
            callerName: data.callerName,
            callType: data.callType
        });
    });

    socket.on('group-call-answered', (data) => {
        socket.broadcast.emit('group-call-answered', {
            roomId: data.roomId
        });
    });
});

// Notification Helper
const createNotificationsForRelatedPersons = (relatedPersonsStr, taskTitle, taskId) => {
    if (!relatedPersonsStr) return;

    const names = relatedPersonsStr.split(',').map(n => n.trim()).filter(n => n.length > 0);
    const users = db.prepare('SELECT id, full_name FROM users').all();

    for (const name of names) {
        // Simple name matching
        const user = users.find(u => u.full_name?.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(u.full_name?.toLowerCase()));
        if (user) {
            const id = generateId();
            db.prepare(`
                INSERT INTO notifications (id, user_id, type, title, message, link)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                id,
                user.id,
                'activity_assignment',
                'Yeni Etkinlik Ataması',
                `"${taskTitle}" etkinliğine ilgili kişi olarak eklendiniz.`,
                `/deals` // Or a more specific link if available
            );
            console.log(`🔔 Notification created for ${user.full_name} (ID: ${user.id}) regarding task: ${taskTitle}`);
        }
    }
};

// Cleanup helper for past reservations
const cleanupPastReservations = () => {
    try {
        const now = new Date();
        const reservations = db.prepare('SELECT * FROM reservations').all();
        
        for (const res of reservations) {
            // date_string is e.g. "2026-03-06"
            // time is e.g. "11:00"
            const resDate = new Date(`${res.date_string}T${res.time}`);
            if (resDate < now) {
                db.prepare('DELETE FROM reservations WHERE id = ?').run(res.id);
                console.log(`🗑️ Auto-deleted past reservation: ${res.id} (${res.date_string} ${res.time})`);
            }
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
};

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

// Super Admin Middleware
const requireSuperAdmin = (req, res, next) => {
    if (req.user?.email !== 'fevziye.mamak35@gmail.com') {
        return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
    }
    next();
};

// Module Permission Middleware
const checkPermission = (moduleName) => {
    return (req, res, next) => {
        // Super admin always has access
        if (req.user?.email === 'fevziye.mamak35@gmail.com') {
            return next();
        }

        // Fetch user from DB to get the latest permissions
        const user = db.prepare('SELECT permissions FROM users WHERE id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const permissions = JSON.parse(user.permissions || '{}');
        if (permissions[moduleName] === true) {
            return next();
        }

        res.status(403).json({ error: `Bu işlem için '${moduleName}' yetkiniz yok.` });
    };
};

// ==================== AUTH ROUTES ====================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        let { email, password, fullName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        email = email.trim().toLowerCase();

        // Check if user exists
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        const id = generateId();
        const now = getNow();

        const defaultPermissions = JSON.stringify({
            deals: true,
            customers: true,
            offers: true,
            messages: true
        });

        db.prepare(`
            INSERT INTO users (id, email, password_hash, full_name, role, permissions, created_at)
            VALUES (?, ?, ?, ?, 'Admin', ?, ?)
        `).run(id, email, passwordHash, fullName || email.split('@')[0], defaultPermissions, now);

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
        let { email, password } = req.body;
        console.log(`\n🔑 Login Attempt: ${email}`);

        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        email = email.trim().toLowerCase();
        password = password.trim();

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            console.log(`❌ User not found: ${email}`);
            return res.status(401).json({ error: 'Invalid login credentials' });
        }
        console.log(`✅ User found: ${user.full_name} (${user.id})`);

        console.log('Comparing passwords...');
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        console.log('✅ Password match, generating token...');
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        console.log('✅ Token generated');

        console.log('Parsing permissions...');
        const permissions = JSON.parse(user.permissions || 'null');
        console.log('✅ Permissions parsed');

        res.json({
            user: { 
                id: user.id, 
                email: user.email, 
                fullName: user.full_name, 
                role: user.role,
                permissions: permissions
            },
            token
        });
    } catch (error) {
        console.error('CRITICAL Login error:', error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});


// FORGOT PASSWORD
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        email = email.trim().toLowerCase();

        const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email);
        
        // Güvenlik için e-posta bulunmasa bile başarılı dönüyoruz (User enumeration önlemek için)
        if (!user) {
            return res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
        }

        const resetToken = randomUUID();
        const expiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
            .run(resetToken, expiry, user.id);

        const resetLink = `${req.headers.origin}/reset-password?token=${resetToken}`;
        await sendResetPasswordEmail(user.email, resetLink);

        res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'İşlem başarısız oldu' });
    }
});

// RESET PASSWORD
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

        const user = db.prepare('SELECT id, reset_token_expiry FROM users WHERE reset_token = ?').get(token);
        
        if (!user) {
            return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş bağlantı.' });
        }

        const isExpired = new Date(user.reset_token_expiry) < new Date();
        if (isExpired) {
            return res.status(400).json({ error: 'Bağlantı süresi dolmuş.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?')
            .run(passwordHash, user.id);

        res.json({ message: 'Şifreniz başarıyla güncellendi.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Şifre güncellenemedi' });
    }
});

// GET CURRENT USER
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT id, email, full_name, role, permissions, avatar_url FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
        user: { 
            id: user.id, 
            email: user.email, 
            fullName: user.full_name, 
            role: user.role,
            permissions: JSON.parse(user.permissions || 'null')
        } 
    });
});

// GET PUBLIC USER LIST
app.get('/api/users', authenticateToken, (req, res) => {
    try {
        const users = db.prepare('SELECT id, email, full_name, role FROM users').all();
        res.json(users);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Kullanıcılar listelenemedi' });
    }
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

    const newProduct = { id, ...req.body, packaging_options: packaging_options || [] };
    broadcast('products', newProduct);
    res.json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
    const { product_name, brand, grade, category, unit_type, base_unit_price, packaging_options, hs_code, origin_country, min_order_quantity, default_container_load_20ft, default_container_load_40ft, notes } = req.body;

    db.prepare(`
        UPDATE products SET product_name=?, brand=?, grade=?, category=?, unit_type=?, base_unit_price=?, packaging_options=?, hs_code=?, origin_country=?, min_order_quantity=?, default_container_load_20ft=?, default_container_load_40ft=?, notes=?
        WHERE id=?
    `).run(product_name, brand, grade, category, unit_type, base_unit_price, JSON.stringify(packaging_options || []), hs_code, origin_country, min_order_quantity, default_container_load_20ft, default_container_load_40ft, notes, req.params.id);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    updated.packaging_options = JSON.parse(updated.packaging_options || '[]');
    broadcast('products', updated);
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

    const newCustomer = { id, ...req.body, tags: tags || [], created_at: now, updated_at: now };
    broadcast('customers', newCustomer);
    res.json(newCustomer);
});

app.put('/api/customers/:id', authenticateToken, checkPermission('customers'), (req, res) => {
    const now = getNow();
    const { company_name, contact_person, email, phone, country, city, address, preferred_incoterm, notes, tags } = req.body;

    db.prepare(`
        UPDATE customers SET company_name=?, contact_person=?, email=?, phone=?, country=?, city=?, address=?, preferred_incoterm=?, notes=?, tags=?, updated_at=?
        WHERE id=?
    `).run(company_name, contact_person, email, phone, country, city, address, preferred_incoterm, notes, JSON.stringify(tags || []), now, req.params.id);

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    updated.tags = JSON.parse(updated.tags || '[]');
    broadcast('customers', updated);
    res.json(updated);
});

app.delete('/api/customers/:id', authenticateToken, checkPermission('customers'), (req, res) => {
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    broadcast('customers', { id: req.params.id, deleted: true });
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

    const newOffer = { id, offer_number: offerNumber, ...req.body, created_at: now, updated_at: now };
    broadcast('offers', newOffer);
    res.json(newOffer);
});

app.put('/api/offers/:id', (req, res) => {
    const now = getNow();
    const { status } = req.body;

    db.prepare('UPDATE offers SET status=?, updated_at=? WHERE id=?').run(status, now, req.params.id);

    const updated = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
    broadcast('offers', updated);
    res.json(updated);
});

// ==================== DEALS ====================
app.get('/api/deals', authenticateToken, checkPermission('deals'), (req, res) => {
    const deals = db.prepare('SELECT * FROM deals ORDER BY created_at DESC').all();
    deals.forEach(d => {
        d.target_products = JSON.parse(d.target_products || '[]');
        d.items = d.items ? JSON.parse(d.items) : [];
    });
    res.json(deals);
});

app.post('/api/deals', authenticateToken, checkPermission('deals'), (req, res) => {
    try {
        const id = generateId();
        const now = getNow();
        const { 
            title, customer_id, customer_name, target_products, target_volume, 
            target_country, expected_closing_date, stage, 
            probability, expected_revenue, currency, assigned_to, notes, 
            offer_id, items 
        } = req.body;

        console.log('📦 Creating deal:', { id, title, customer_name });

        db.prepare(`
            INSERT INTO deals (id, title, customer_id, customer_name, offer_id, target_products, target_volume, target_country, expected_closing_date, stage, probability, expected_revenue, currency, assigned_to, notes, items, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, title, customer_id, customer_name, offer_id, JSON.stringify(target_products || []), target_volume, target_country, expected_closing_date, stage, probability, expected_revenue, currency, assigned_to, notes, items ? JSON.stringify(items) : null, now, now);

        const newDeal = { id, ...req.body, created_at: now, updated_at: now };
        broadcast('deals', newDeal);
        res.json(newDeal);
    } catch (error) {
        console.error('❌ Error creating deal:', error);
        res.status(500).json({ error: 'Deal creation failed: ' + error.message });
    }
});

app.put('/api/deals/:id', authenticateToken, checkPermission('deals'), (req, res) => {
    try {
        const now = getNow();
        const { 
            title, customer_id, customer_name, target_products, target_volume, 
            target_country, expected_closing_date, stage, 
            probability, expected_revenue, currency, assigned_to, notes, 
            offer_id, items 
        } = req.body;

        console.log('📦 Updating deal:', req.params.id);

        db.prepare(`
            UPDATE deals SET 
                title = COALESCE(?, title),
                customer_id = COALESCE(?, customer_id),
                customer_name = COALESCE(?, customer_name),
                target_products = COALESCE(?, target_products),
                target_volume = COALESCE(?, target_volume),
                target_country = COALESCE(?, target_country),
                expected_closing_date = COALESCE(?, expected_closing_date),
                stage = COALESCE(?, stage),
                probability = COALESCE(?, probability),
                expected_revenue = COALESCE(?, expected_revenue),
                currency = COALESCE(?, currency),
                assigned_to = COALESCE(?, assigned_to),
                notes = COALESCE(?, notes),
                offer_id = COALESCE(?, offer_id),
                items = COALESCE(?, items),
                updated_at = ?
            WHERE id = ?
        `).run(
            title, customer_id, customer_name,
            target_products ? JSON.stringify(target_products) : null,
            target_volume, target_country, expected_closing_date, stage,
            probability, expected_revenue, currency,
            assigned_to, notes, offer_id, 
            items ? JSON.stringify(items) : null,
            now, req.params.id
        );

        const updated = db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id);
        if (updated) {
            updated.target_products = JSON.parse(updated.target_products || '[]');
            updated.items = updated.items ? JSON.parse(updated.items) : [];
            broadcast('deals', updated);
            res.json(updated);
        } else {
            res.status(404).json({ error: 'Deal not found' });
        }
    } catch (error) {
        console.error('❌ Error updating deal:', error);
        res.status(500).json({ error: 'Deal update failed: ' + error.message });
    }
});

app.delete('/api/deals/:id', authenticateToken, checkPermission('deals'), (req, res) => {
    try {
        db.prepare('DELETE FROM deals WHERE id = ?').run(req.params.id);
        broadcast('deals', { id: req.params.id, deleted: true });
        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/deals/:id:', error);
        res.status(500).json({ error: error.message });
    }
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

    const newOffer = { id, ...req.body };
    broadcast('logistics_offers', newOffer);
    res.json(newOffer);
});

app.put('/api/logistics_offers/:id', (req, res) => {
    const { provider_name, origin_port, destination_country, destination_port, container_type, price, currency, validity_date, notes, contact_person, phone, email, carrier, transit_time, free_time, custom_fields } = req.body;

    db.prepare(`
        UPDATE logistics_offers SET provider_name=?, origin_port=?, destination_country=?, destination_port=?, container_type=?, price=?, currency=?, validity_date=?, notes=?, contact_person=?, phone=?, email=?, carrier=?, transit_time=?, free_time=?, custom_fields=?
        WHERE id=?
    `).run(provider_name, origin_port, destination_country, destination_port, container_type, price, currency, validity_date, notes, contact_person, phone, email, carrier, transit_time, free_time, JSON.stringify(custom_fields || {}), req.params.id);

    const updated = db.prepare('SELECT * FROM logistics_offers WHERE id = ?').get(req.params.id);
    updated.custom_fields = JSON.parse(updated.custom_fields || '{}');
    broadcast('logistics_offers', updated);
    res.json(updated);
});

app.delete('/api/logistics_offers/:id', (req, res) => {
    db.prepare('DELETE FROM logistics_offers WHERE id = ?').run(req.params.id);
    broadcast('logistics_offers', { id: req.params.id, deleted: true });
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

    const newCompany = { id, ...req.body };
    broadcast('logistics_companies', newCompany);
    res.json(newCompany);
});

app.put('/api/logistics_companies/:id', (req, res) => {
    const { company_name, contact_person, phone, email, service_intensity, own_assets, office_address, notes, meeting_status, custom_fields } = req.body;

    db.prepare(`
        UPDATE logistics_companies SET company_name=?, contact_person=?, phone=?, email=?, service_intensity=?, own_assets=?, office_address=?, notes=?, meeting_status=?, custom_fields=?
        WHERE id=?
    `).run(company_name, contact_person, phone, email, service_intensity, own_assets, office_address, notes, meeting_status, JSON.stringify(custom_fields || {}), req.params.id);

    const updated = db.prepare('SELECT * FROM logistics_companies WHERE id = ?').get(req.params.id);
    updated.custom_fields = JSON.parse(updated.custom_fields || '{}');
    broadcast('logistics_companies', updated);
    res.json(updated);
});

app.delete('/api/logistics_companies/:id', (req, res) => {
    db.prepare('DELETE FROM logistics_companies WHERE id = ?').run(req.params.id);
    broadcast('logistics_companies', { id: req.params.id, deleted: true });
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

    const newMeeting = { id, ...req.body, created_at: now };
    broadcast('meetings', newMeeting);
    res.json(newMeeting);
});

app.put('/api/meetings/:id', (req, res) => {
    const now = getNow();
    const { title, customer_id, date, type, notes, outcome } = req.body;

    db.prepare(`
        UPDATE meetings SET title=?, customer_id=?, date=?, type=?, notes=?, outcome=?
        WHERE id=?
    `).run(title, customer_id, date, type, notes, outcome, req.params.id);

    const updated = db.prepare('SELECT * FROM meetings WHERE id = ?').get(req.params.id);
    broadcast('meetings', updated);
    res.json(updated);
});

app.delete('/api/meetings/:id', (req, res) => {
    db.prepare('DELETE FROM meetings WHERE id = ?').run(req.params.id);
    broadcast('meetings', { id: req.params.id, deleted: true });
    res.json({ success: true });
});

app.delete('/api/proformas/:id', authenticateToken, checkPermission('offers'), (req, res) => {
    db.prepare('DELETE FROM proformas WHERE id = ?').run(req.params.id);
    broadcast('proformas', { id: req.params.id, deleted: true });
    res.json({ success: true });
});

// ==================== CUSTOMERS ====================
app.get('/api/customers', authenticateToken, checkPermission('customers'), (req, res) => {
    const customers = db.prepare('SELECT * FROM customers ORDER BY created_at DESC').all();
    res.json(customers);
});

app.post('/api/customers', authenticateToken, checkPermission('customers'), (req, res) => {
    try {
        const { title, description, due_date, priority, assigned_to, status, link, prepared_by, related_persons, reason, deal_id, category } = req.body;
        const id = generateId();
        const now = getNow();

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        db.prepare(`
            INSERT INTO tasks (id, title, description, due_date, priority, assigned_to, status, link, prepared_by, related_persons, reason, deal_id, category, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id, 
            title, 
            description || null, 
            due_date || null, 
            priority || 'medium', 
            assigned_to || null, 
            status || 'pending', 
            link || null, 
            prepared_by || null, 
            related_persons || null, 
            reason || null, 
            deal_id || null, 
            category || 'activity',
            now
        );

        // CREATE NOTIFICATIONS
        if (related_persons) {
            createNotificationsForRelatedPersons(related_persons, title, id);
        }

        const newTask = { id, ...req.body, created_at: now };
        broadcast('tasks', newTask);
        res.json(newTask);
    } catch (error) {
        console.error('Error in POST /api/tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tasks/:id', (req, res) => {
    try {
        const { title, description, due_date, priority, assigned_to, status, link, prepared_by, related_persons, reason, deal_id, category } = req.body;

        db.prepare(`
            UPDATE tasks SET title=?, description=?, due_date=?, priority=?, assigned_to=?, status=?, link=?, prepared_by=?, related_persons=?, reason=?, deal_id=?, category=?
            WHERE id=?
        `).run(
            title, 
            description || null, 
            due_date || null, 
            priority || 'medium', 
            assigned_to || null, 
            status || 'pending', 
            link || null, 
            prepared_by || null, 
            related_persons || null, 
            reason || null, 
            deal_id || null, 
            category || 'activity',
            req.params.id
        );

        const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
        broadcast('tasks', updated);
        res.json(updated);
    } catch (error) {
        console.error('Error in PUT /api/tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tasks/:id', (req, res) => {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    broadcast('tasks', { id: req.params.id, deleted: true });
    res.json({ success: true });
});

// ==================== NOTIFICATIONS ====================
app.get('/api/notifications', authenticateToken, (req, res) => {
    try {
        const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
        res.json(notifications);
    } catch (error) {
        console.error('Error in GET /api/notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    try {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/notifications/:id/read:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/notifications/:id', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/notifications/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== PROFORMAS ====================
app.get('/api/proformas', authenticateToken, checkPermission('offers'), (req, res) => {
    const { type } = req.query;
    let query = 'SELECT * FROM proformas';
    let params = [];
    
    if (type) {
        query += ' WHERE document_type = ?';
        params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    const proformas = db.prepare(query).all(...params);
    proformas.forEach(p => p.items = JSON.parse(p.items || '[]'));
    res.json(proformas);
});

app.post('/api/proformas', authenticateToken, checkPermission('offers'), (req, res) => {
    const id = generateId();
    const now = getNow();
    const { proforma_number, date, customer_id, offer_id, customer_name, customer_address, company_name, company_address, company_contact, items, total_price, first_payment_amount, final_payment_amount, currency, validity_days, brand, destination, quantity, production_time, payment_terms, beneficiary_name, bank_name, bank_address, swift_code, iban, status, document_type } = req.body;

    const number = proforma_number || `${document_type?.toUpperCase() || 'PI'}-${Date.now()}`;

    db.prepare(`
        INSERT INTO proformas (id, proforma_number, date, customer_id, offer_id, customer_name, customer_address, company_name, company_address, company_contact, items, total_price, first_payment_amount, final_payment_amount, currency, validity_days, brand, destination, quantity, production_time, payment_terms, beneficiary_name, bank_name, bank_address, swift_code, iban, status, document_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, number, date || now, customer_id, offer_id, customer_name, customer_address, company_name, company_address, company_contact, JSON.stringify(items || []), total_price, first_payment_amount, final_payment_amount, currency, validity_days, brand, destination, quantity, production_time, payment_terms, beneficiary_name, bank_name, bank_address, swift_code, iban, status || 'Draft', document_type || 'proforma', now);

    const proforma = { id, proforma_number: number, ...req.body, created_at: now };
    broadcast('proformas', proforma);
    res.json(proforma);
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
    broadcast('shipments', updated);
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
    broadcast('suppliers', updated);
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

    const event = { id, ...req.body, created_at: now };
    broadcast('timeline_events', event);
    res.json(event);
});

// ==================== RESERVATIONS ====================
app.get('/api/reservations/:deal_id', (req, res) => {
    cleanupPastReservations();
    const reservations = db.prepare('SELECT * FROM reservations WHERE deal_id = ?').all();
    res.json(reservations);
});

app.post('/api/reservations', (req, res) => {
    const id = generateId();
    const { deal_id, date_string, time, note } = req.body;
    
    db.prepare(`
        INSERT INTO reservations (id, deal_id, date_string, time, note)
        VALUES (?, ?, ?, ?, ?)
    `).run(id, deal_id, date_string, time, note);
    
    sendEmailNotification(deal_id, note);
    
    const reservation = { id, ...req.body };
    broadcast('reservations', reservation);
    res.json(reservation);
});

// ==================== ADMIN ROUTES ====================

// LIST USERS
app.get('/api/admin/users', authenticateToken, requireSuperAdmin, (req, res) => {
    try {
        const users = db.prepare('SELECT id, email, full_name, role, permissions, created_at FROM users').all();
        users.forEach(u => u.permissions = JSON.parse(u.permissions || 'null'));
        res.json(users);
    } catch (error) {
        console.error('Admin list users error:', error);
        res.status(500).json({ error: 'Kullanıcılar listelenemedi' });
    }
});

// ADD USER
app.post('/api/admin/users', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        let { email, password, fullName, role, permissions } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'E-posta ve şifre zorunludur' });
        }
        email = email.trim().toLowerCase();

        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Bu kullanıcı zaten mevcut' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const id = generateId();
        const now = getNow();

        // Default all true if permissions not provided or empty
        const finalPermissions = permissions && Object.keys(permissions).length > 0 ? permissions : {
            deals: true,
            customers: true,
            offers: true,
            messages: true
        };

        db.prepare(`
            INSERT INTO users (id, email, password_hash, full_name, role, permissions, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, email, passwordHash, fullName, role || 'Viewer', JSON.stringify(finalPermissions), now);

        res.json({ id, email, fullName, role, permissions });
    } catch (error) {
        console.error('Admin add user error:', error);
        res.status(500).json({ error: 'Kullanıcı eklenemedi' });
    }
});

// UPDATE USER
app.put('/api/admin/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { fullName, role, permissions, password } = req.body;
        
        let updateQuery = 'UPDATE users SET full_name = ?, role = ?, permissions = ?';
        let params = [fullName, role, JSON.stringify(permissions || null)];

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            updateQuery += ', password_hash = ?';
            params.push(passwordHash);
        }

        updateQuery += ' WHERE id = ?';
        params.push(req.params.id);

        db.prepare(updateQuery).run(...params);

        res.json({ success: true });
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ error: 'Kullanıcı güncellenemedi' });
    }
});

// DELETE USER
app.delete('/api/admin/users/:id', authenticateToken, requireSuperAdmin, (req, res) => {
    try {
        // Super admin kendini silemez
        const targetUser = db.prepare('SELECT email FROM users WHERE id = ?').get(req.params.id);
        if (targetUser?.email === 'fevziye.mamak35@gmail.com') {
            return res.status(403).json({ error: 'Süper admin silinemez.' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: 'Kullanıcı silinemedi' });
    }
});

// ==================== START SERVER ====================
startCronJobs();
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Real-time: Socket.io enabled`);
    console.log(`📦 Database: SQLite (crm.db)`);
    console.log(`🔐 Auth: JWT-based authentication`);

    // Tünel başlatma (iç içe çökmeleri engellemek için ES methoduyla)
    const startTunnel = async () => {
        try {
            const localtunnel = (await import('localtunnel')).default;
            const tunnel = await localtunnel({ port: PORT, subdomain: 'makfacrm' });
            
            console.log(`\n================================`);
            console.log(`🚀 MAKFA CRM GLOBALLY ACCESSIBLE AT:`);
            console.log(`🌍 ${tunnel.url}`);
            console.log(`=================================\n`);
            
            tunnel.on('close', () => {
                console.log('\n⚠️ Tunnel closed! Restarting in 5s...');
                setTimeout(startTunnel, 5000);
            });
            
            tunnel.on('error', (err) => {
                console.log('\n❌ Tunnel Error:', err.message);
                tunnel.close();
            });
        } catch (err) {
            console.log('\n❌ Tunnel failed to connect:', err.message);
            setTimeout(startTunnel, 5000);
        }
    };
    
    startTunnel();
});
