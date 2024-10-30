const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../var/db/chat.db');

db.serialize(() => {
    db.run("ALTER TABLE messages ADD COLUMN username TEXT", (err) => {
        if (err) {
            console.error("Error adding username column:", err.message);
        } else {
            console.log("Username column added successfully.");
        }
    });
});

db.close();
