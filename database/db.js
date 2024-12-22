const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

connection.connect((error) => {
  if (error) {
    console.log("El error de conexión es: " + error);
    return;
  }
  console.log("Conectado a MySQL");
});

module.exports = connection;
