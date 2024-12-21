require('dotenv').config();  // Cargar las variables de entorno desde el archivo .env

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,       // Usa la URL pública de la base de datos
  port: process.env.DB_PORT,       // El puerto público es 3366
  user: process.env.DB_USER,       // Tu usuario de la base de datos
  password: process.env.DB_PASSWORD,  // Tu contraseña de la base de datos
  database: process.env.DB_DATABASE  // El nombre de la base de datos
});

connection.connect((error) => {
  if (error) {
    console.log("Error de conexión a la base de datos: " + error);
    return;
  }
  console.log("Conectado a la base de datos MySQL!");
});

module.exports = connection;
