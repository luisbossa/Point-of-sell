const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const app = express();
dotenv.config();

// Importa RedisStore y crea el cliente de Redis
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

// Crea un cliente Redis, asegúrate de que el host y el puerto sean correctos
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',  // Usa variable de entorno para el host de Redis
  port: process.env.REDIS_PORT || 6379,        // Puerto de Redis
});

// Maneja errores de conexión de Redis
client.on('error', (err) => {
  console.log('Error de conexión a Redis:', err);
});

// Configura el middleware de sesión con RedisStore
app.use(session({
  store: new RedisStore({ client }),           // Usando RedisStore para almacenar las sesiones
  secret: process.env.JWT_SECRET,              // Asegúrate de que la variable JWT_SECRET esté configurada
  resave: false,                              // No vuelve a guardar la sesión si no ha cambiado
  saveUninitialized: false,                   // No guarda sesiones que no están inicializadas
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Asegúrate de que "secure" esté en true solo en producción
    httpOnly: true,                           // Impide acceso a cookies desde JavaScript en el cliente
    maxAge: 1000 * 60 * 60 * 24 * 7,          // La sesión expirará después de 1 semana
  }
}));

// Middleware para procesar datos enviados desde formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para cookies
app.use(cookieParser());

// Ejs layout
const expressLayout = require("express-ejs-layouts");
app.use(expressLayout);

// Configura la vista de la aplicación
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Usar method-override para simular métodos HTTP como PUT
app.use(methodOverride("_method"));

// Rutas de la aplicación
app.use(require("./src/routes/router"));

// Para evitar el caché si no hay usuario autenticado
app.use(function (req, res, next) {
  if (!req.user) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }
  next();
});

// Configuración del servidor
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Servidor en ejecución en https://localhost:${port}`);
});
