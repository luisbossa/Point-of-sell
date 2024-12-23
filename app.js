const express = require("express");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const dotenv = require("dotenv");
dotenv.config();
const app = express();

app.use(
  session({
    secret: process.env.JWT_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true, 
      maxAge: 1000 * 60 * 60 * 24 * 7, 
    },
  })
);

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
