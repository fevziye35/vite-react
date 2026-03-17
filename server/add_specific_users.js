import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('server/crm.db');

const users = [
    { email: 'mamak1980@gmail.com', fullName: 'Mamak 1980' },
    { email: 'berk.camkiran@alimamak.com.tr', fullName: 'Berk Çamkıran' },
    { email: 'export.sales@alimamak.com.tr', fullName: 'Export Sales' },
    { email: 'fevziye.mamak35@gmail.com', fullName: 'Fevziye Mamak' }
];

const password = 'Fevziyye35';

async function addUsers() {
    for (const user of users) {
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
        if (existing) {
            console.log(`User ${user.email} already exists, updating password...`);
            const hash = await bcrypt.hash(password, 10);
            db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, user.email);
        } else {
            console.log(`Adding user ${user.email}...`);
            const hash = await bcrypt.hash(password, 10);
            const id = uuidv4();
            const now = new Date().toISOString();
            const permissions = JSON.stringify({
                deals: true,
                customers: true,
                offers: true,
                messages: true
            });
            db.prepare('INSERT INTO users (id, email, password_hash, full_name, role, permissions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .run(id, user.email, hash, user.fullName, 'Admin', permissions, now);
        }
    }
    console.log('Done.');
}

addUsers().catch(console.error);
