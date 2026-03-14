
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The crm.db is in the same directory as db.js (server/)
const db = new Database(path.join(__dirname, 'crm.db'));

async function resetPassword(email, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, email);
    if (result.changes > 0) {
        console.log(`Password for ${email} has been reset to: ${newPassword}`);
    } else {
        console.log(`User ${email} not found.`);
    }
}

resetPassword('fevziye.mamak35@gmail.com', 'Fevziye35');
