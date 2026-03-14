import db from './db.js';
const user = db.prepare('SELECT id FROM users LIMIT 1').get();
console.log('Sample User ID:', user?.id);
const customer = db.prepare('SELECT id FROM customers LIMIT 1').get();
console.log('Sample Customer ID:', customer?.id);
