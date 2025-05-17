const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Create table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    registration_date TEXT,
    payment_status TEXT
  )`);
});

module.exports = {
  addClient: (client, callback) => {
    const stmt = db.prepare('INSERT INTO clients (name, phone, registration_date, payment_status) VALUES (?, ?, ?, ?)');
    stmt.run([client.name, client.phone, client.registration_date, client.payment_status], callback);
    stmt.finalize();
  },

  getClients: (callback) => {
    db.all('SELECT * FROM clients', [], callback);
  }
};
module.exports.updateClient = (client, cb) => {
    const sql = `UPDATE clients SET name = ?, phone = ?, registration_date = ?, payment_status = ? WHERE id = ?`;
    db.run(sql, [client.name, client.phone, client.registration_date, client.payment_status, client.id], cb);
  };
  
  module.exports.deleteClient = (id, cb) => {
    db.run(`DELETE FROM clients WHERE id = ?`, id, cb);
  };
  