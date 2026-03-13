
import db from './server/db.js';
const users = db.prepare('SELECT id, email, full_name, role, permissions FROM users').all();
console.log(JSON.stringify(users, null, 2));
process.exit(0);
