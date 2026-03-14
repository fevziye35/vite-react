
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('server/crm.db');

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
