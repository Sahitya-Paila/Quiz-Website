const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // change if needed
  password: 'root',       // add your MySQL password
  database: 'quiz_app'
});

module.exports = pool;
