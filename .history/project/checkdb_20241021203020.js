const fs = require('fs');
const dbPath = 'var/db/todos.db';

if (!fs.existsSync(dbPath)) {
    // Create the database schema if it does not exist
} else {
    console.log('yep, it\'s just dumb');
}