const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('../var/db/chat.db');
db.run('DROP TABLE todos', (err) => {
    if (err) {console.error(err.message);}
   else {
      console.log('yep, it\'s just dumb')
   }
});
