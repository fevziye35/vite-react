
import db from './server/db.js';
const email = 'fevziye.mamak35@gmail.com';
const user = db.prepare('SELECT id, email, full_name, role FROM users WHERE email = ?').get(email);
if (user) {
    console.log('USER_FOUND:');
    console.log(JSON.stringify(user, null, 2));
} else {
    console.log('USER_NOT_FOUND');
}
process.exit(0);
