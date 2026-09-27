const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const expressLayout = require("express-ejs-layouts");

// Inicialización
const app = express();

// dotenv
dotenv.config();

// CONFIGURACIÓN DE EJS

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MIDDLEWARES

// Sesión
app.use(
  session({
    secret: "tu-secreto-aqui",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  }),
);

// Procesar JSON
app.use(express.json());

// Procesar formularios
app.use(express.urlencoded({ extended: true }));

// Cookies
app.use(cookieParser());

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Method Override
app.use(methodOverride("_method"));

// EJS Layouts
app.use(expressLayout);
app.set("layout", "layouts/layout");

// CACHE

app.use(function (req, res, next) {
  if (!req.user) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  next();
});

// RUTAS

app.use(require("./src/routes/router"));

// SERVIDOR

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
