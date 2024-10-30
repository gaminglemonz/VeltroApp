// Modify SQL databases here

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../var/db/veltro.db');
db.run('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id )', (err) => {
   
});
