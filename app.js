const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const expressLayout = require("express-ejs-layouts");

// Inicialización express app
const app = express();

<<<<<<< HEAD
// Configuración dotenv
dotenv.config();

// Middlewares
// Middleware de sesión
app.use(
  session({
    secret: "tu-secreto-aqui",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
=======
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
>>>>>>> 0c3dea93e38f09c0ffa609d8cbb3f65785d00e37
  })
);

// Middleware para procesar datos enviados desde formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para cookies
app.use(cookieParser());

// Middleware para EJS Layouts
app.use(expressLayout);

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Middleware para manejar el _method (simulando PUT)
app.use(methodOverride("_method"));

// Rutas
app.use(require("./src/routes/router"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Borrar cache middleware
app.use(function (req, res, next) {
  if (!req.user) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }
  next();
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
