// Importar los paquetes
const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const redis = require("redis");
const connectRedis = require("connect-redis");

// Cargar las variables de entorno
dotenv.config();

const app = express();

// Configuración de Redis para el almacenamiento de sesiones
const RedisStore = connectRedis(session);
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST, // Dirección del servidor Redis
  port: process.env.REDIS_PORT || 6379, // Puerto de Redis (predeterminado es 6379)
  password: process.env.REDIS_PASSWORD, // Si Redis está protegido con contraseña
});

redisClient.on("error", (err) => {
  console.error("Error de conexión con Redis: ", err);
});

// Middleware de sesión utilizando RedisStore
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET, // Usa una clave secreta segura
    resave: false, // No volver a guardar la sesión si no ha sido modificada
    saveUninitialized: false, // No crear sesión si no hay datos
    cookie: {
      secure: process.env.NODE_ENV === "production", // Usa cookies seguras en producción (HTTPS)
      httpOnly: true, // Impide que la cookie sea accesible desde JavaScript
      maxAge: 1000 * 60 * 60 * 24, // Duración de la sesión: 1 día
    },
  })
);

// Middleware para procesar datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para cookies
app.use(cookieParser());

// Configurar el motor de plantillas EJS
const expressLayout = require("express-ejs-layouts");
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Servir archivos estáticos (por ejemplo, CSS, imágenes)
app.use(express.static(path.join(__dirname, "public")));

// Usar method-override para manejar el método _method (simulando PUT y DELETE)
app.use(methodOverride("_method"));

// Rutas
app.use(require("./src/routes/router"));

// Deshabilitar caché si no hay usuario autenticado
app.use(function (req, res, next) {
  if (!req.user)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

// Configuración del servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
