const mysql = require("mysql");

const isProduction = process.env.NODE_ENV === "production"; // Detectar si es producción

const connection = mysql.createConnection({
  host: isProduction ? process.env.MYSQL_HOST : "autorack.proxy.rlwy.net", // Usar la URL interna o pública
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: isProduction ? process.env.MYSQL_PORT : 51107, // Usar el puerto correcto según el entorno
});

connection.connect((error) => {
  if (error) {
    console.log("El error de conexión es: " + error);
    return;
  }
  console.log("Conectado a la base de datos MySQL!");
});

module.exports = connection;
