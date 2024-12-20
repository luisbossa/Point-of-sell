const mysql = require("mysql");
const dotenv = require("dotenv");

// Cargar las variables de entorno
dotenv.config();

// Configuración de la conexión con parámetros de tiempo de espera
const connection = mysql.createConnection({
  host: process.env.DB_HOST, // Usamos el valor de DB_HOST
  user: process.env.DB_USER, // Usamos el valor de DB_USER
  password: process.env.DB_PASSWORD, // Usamos el valor de DB_PASSWORD
  database: process.env.DB_DATABASE, // Usamos el valor de DB_DATABASE
  port: process.env.DB_PORT || 3306, // Usamos el puerto especificado, o 3306 por defecto
  connectTimeout: 10000, // Tiempo de espera para la conexión (10 segundos)
  timeout: 30000, // Tiempo de espera para las consultas (30 segundos)
});

// Manejador de errores
connection.on("error", (err) => {
  if (err.code === "ECONNRESET") {
    console.log("La conexión ha sido restablecida. Intentando reconectar...");
    reconnectConnection(); // Intentar reconectar automáticamente
  } else {
    console.error("Error en la conexión:", err); // Loguear otros errores
  }
});

// Función para manejar la reconexión automática
function reconnectConnection() {
  connection.end(); // Cerrar la conexión actual
  setTimeout(() => {
    console.log("Reintentando la conexión...");
    connectDatabase(); // Intentar reconectar
  }, 5000); // Espera de 5 segundos antes de intentar reconectar
}

// Función para conectar a la base de datos
function connectDatabase() {
  connection.connect((error) => {
    if (error) {
      console.log("Error de conexión:", error);
      return;
    }
    console.log("Conectado a la base de datos MySQL!");
  });
}

// Intentar conectar a la base de datos al iniciar el archivo
connectDatabase();

// Exportar la conexión para usarla en otros archivos
module.exports = connection;
