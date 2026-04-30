import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databaseDir = path.join(__dirname, '..', 'database');

if (process.env.NODE_ENV !== 'test') {
    fs.mkdirSync(databaseDir, { recursive: true });
}

const DB_PATH = process.env.NODE_ENV === 'test' 
    ? ':memory:' 
    : path.join(databaseDir, 'thoughts_app.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
