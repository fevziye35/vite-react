
import Database from 'better-sqlite3';

const db = new Database('../crm.db');

const columns = [
    { name: 'prepared_by', type: 'TEXT' },
    { name: 'related_persons', type: 'TEXT' },
    { name: 'reason', type: 'TEXT' }
];

for (const col of columns) {
    try {
        db.prepare(`ALTER TABLE tasks ADD COLUMN ${col.name} ${col.type}`).run();
        console.log(`Column ${col.name} added successfully.`);
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log(`Column ${col.name} already exists.`);
        } else {
            console.error(`Error adding column ${col.name}:`, e.message);
        }
    }
}

db.close();
