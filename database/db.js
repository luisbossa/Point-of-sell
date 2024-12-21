const mysql = require("mysql2/promise");

async function connectToDatabase() {
  try {
    // Establece la conexión a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT || 3306, // Asegúrate de que el puerto esté configurado correctamente
    });

    console.log("Conectado a la base de datos MySQL!");
    return connection; // Devuelve la conexión para usarla en otras partes del código
  } catch (error) {
    console.error("El error de conexión es:", error.message);
    // Puedes agregar un mecanismo de reintentos o enviar alertas de error
    process.exit(1); // Termina el proceso si la conexión falla
  }
}

module.exports = connectToDatabase;
