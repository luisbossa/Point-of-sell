const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");

const app = express();
dotenv.config();

const expressLayout = require("express-ejs-layouts");

// Middlewares

// Middleware de sesión
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true, // Asegúrate de que la cookie sea segura en producción
    httpOnly: true, // Asegura que solo el servidor pueda acceder a la cookie
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 semana
  }
}));

// Para procesar datos enviados desde forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For cookies
app.use(cookieParser());

// Ejs layout
app.use(expressLayout);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// Usa method-override para manejar el _method (simulando PUT)
app.use(methodOverride("_method"));

// Rutas
app.use(require("./src/routes/router"));

// Clear cache
app.use(function (req, res, next) {
  if (!req.user)
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  next();
});

// Server setup
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Servidor en ejecución en https://localhost:${port}`);
});
