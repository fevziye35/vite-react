import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const db = new Database('crm.db');

async function addUsers() {
    const password = 'Fevziye35';
    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUsers = [
        { email: 'amamak1980@gmail.com', fullName: 'Ali Mamak' },
        { email: 'berk.camkiran@alimamak.com.tr', fullName: 'Berk Camkıran' },
        { email: 'export.sales@alimamak.com.tr', fullName: 'Export Sales' }
    ];

    for (const user of newUsers) {
        const id = crypto.randomBytes(16).toString('hex');
        const now = new Date().toISOString();

        try {
            db.prepare(`
                INSERT INTO users (id, email, password_hash, full_name, role, created_at)
                VALUES (?, ?, ?, ?, 'Admin', ?)
            `).run(id, user.email, passwordHash, user.fullName, now);
            console.log(`User ${user.email} added successfully.`);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                console.log(`User ${user.email} already exists.`);
            } else {
                console.error(`Error adding user ${user.email}:`, error);
            }
        }
    }
    db.close();
}

addUsers();
