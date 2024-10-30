// Modify SQL databases here

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../var/db/chat.db');
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, hashed_password TEXT, salt TEXT)', (err) => {
   
