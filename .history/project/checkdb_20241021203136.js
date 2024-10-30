const fs = require('fs');
const dbPath = '../var/db/todos.db';

if (fs.existsSync(dbPath)) {
   console.log('yep, it\'s just dumb');
} else {
    
}