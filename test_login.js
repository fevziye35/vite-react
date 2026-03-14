
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('server/crm.db');

async function testLogin(email, password) {
    console.log(`Testing login for: ${email}`);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
        console.log('User not found');
        return;
    }
    console.log('User found in DB');
    const match = await bcrypt.compare(password, user.password_hash);
    console.log(`Password match result: ${match}`);
    if (!match) {
        console.log(`Stored Hash: ${user.password_hash}`);
        const testHash = await bcrypt.hash(password, 10);
        console.log(`Hash of input password: ${testHash}`);
    }
}

testLogin('fevziye.mamak35@gmail.com', 'Fevziye35');
