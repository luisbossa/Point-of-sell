// Importar correctamente 'connect-redis' y 'express-session'
const express = require('express');
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');

// Crear el cliente de Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,  // Si es necesario
  tls: {}  // Si Redis requiere conexión segura
});

// Crear la instancia de RedisStore
const RedisStore = connectRedis(session);  // Importante: connectRedis(session) no requiere paréntesis

// Configuración de Express
const app = express();

// Usar Redis para almacenar sesiones
app.use(
  session({
    store: new RedisStore({ client: redisClient }), // Usar RedisStore aquí
    secret: process.env.JWT_SECRET || "mi-secreto-super-seguro",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Solo en producción, usa cookies seguras
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
    },
  })
);

// Resto de tu configuración y rutas de Express
app.listen(process.env.PORT || 5000, () => {
  console.log('Servidor en ejecución');
});
