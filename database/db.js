const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST, // Utiliza la variable de entorno correcta
  user: process.env.MYSQL_USER, // Utiliza la variable de entorno correcta
  password: process.env.MYSQL_PASSWORD, // Utiliza la variable de entorno correcta
  database: process.env.MYSQL_DATABASE, // Utiliza la variable de entorno correcta
  port: process.env.MYSQL_PORT, // Asegúrate de usar el puerto correcto
});

connection.connect((error) => {
  if (error) {
    console.log("El error de conexión es: " + error);
    return;
  }
  console.log("Conectado a la base de datos MySQL!");
});

module.exports = connection;
