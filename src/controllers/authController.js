const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const connection = require("../../database/db");
const { promisify } = require("util");

exports.register = async (req, res) => {
  try {
    const { name, user, pass, job_name } = req.body;

    // Validar si los campos están vacíos
    if (!name || !user || !pass || !job_name) {
      return res.render("register", {
        message: "Todos los campos son obligatorios",
        messageType: "error",
      });
    }

    // Verifica que la nueva contraseña tenga al menos 6 caracteres
    if (pass.length < 6) {
      return res.render("register", {
        message: "La contraseña debe tener 6 caracteres",
        messageType: "error",
      });
    }

    // Verificar si el nombre de usuario ya existe
    connection.query(
      "SELECT * FROM users WHERE user = ?",
      [user],
      async (error, results) => {
        if (error) {
          console.error(error);
          return res.render("register", {
            message: "Hubo un error al verificar el usuario",
            messageType: "error",
          });
        }

        if (results.length > 0) {
          return res.render("register", {
            message: "Este usuario ya está registrado",
            messageType: "error",
          });
        }

        // Hash de la contraseña
        const passHash = await bcrypt.hash(pass, 8);

        // Registrar al nuevo usuario
        connection.query(
          "INSERT INTO users SET ?",
          {
            user: user,
            name: name,
            password: passHash,
            job_title_id: job_name,
          },
          (error, results) => {
            if (error) {
              console.error(error);
              return res.render("register", {
                message: "Hubo un error al registrar el usuario",
                messageType: "error",
              });
            }

            // Después de registrar, obtener el usuario recién creado
            connection.query(
              "SELECT u.id, u.name, u.user, u.job_title_id, jt.job_name FROM users u JOIN job_titles jt ON u.job_title_id = jt.job_title_id WHERE u.user = ?",
              [user],
              (error, results) => {
                if (error || results.length === 0) {
                  console.error(error);
                  return res.render("register", {
                    message:
                      "Error al obtener los datos del usuario registrado",
                    messageType: "error",
                  });
                }

                const registeredUser = results[0];

                // Mapear el job_title_id a un rol
                let role;
                switch (registeredUser.job_title_id) {
                  case 1:
                    role = "admin";
                    break;
                  case 2:
                    role = "counter";
                    break;
                  case 3:
                    role = "employee";
                    break;
                  default:
                    role = "unknown";
                }

                // Crear token JWT con las variables de entorno
                const token = jwt.sign(
                  { id: registeredUser.id },
                  process.env.JWT_SECRET,
                  { expiresIn: process.env.JWT_TIME_EXPIRED || "7d" } // Usamos JWT_TIME_EXPIRED del .env
                );

                // Configurar el token en las cookies con la expiración adecuada
                res.cookie("jwt", token, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production", // Solo en producción se requiere HTTPS
                  maxAge:
                    (process.env.JWT_COOKIE_EXPIRES || 90) *
                    24 *
                    60 *
                    60 *
                    1000, // Usamos JWT_COOKIE_EXPIRES del .env
                });

                // Establecer usuario y rol en locals
                registeredUser.role = role;
                req.user = registeredUser;
                res.locals.user = registeredUser;

                // Redirigir a la vista index
                res.redirect("/");
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    return res.render("register", {
      message: "Hubo un error en el servidor",
      messageType: "error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, pass } = req.body;

    // Validar si el usuario o la contraseña están vacíos
    if (!user || !pass) {
      return res.render("login", {
        message: "Usuario y/o contraseña vacíos",
        messageType: "error",
      });
    }

    // Consultar si el usuario existe en la base de datos
    connection.query(
      "SELECT * FROM users WHERE user = ?",
      [user],
      async (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Hubo un error en el servidor");
        }

        // Si el usuario no existe
        if (results.length == 0) {
          return res.render("login", {
            message: "El usuario incorrecto o no existe",
            messageType: "error",
          });
        }

        // Si la contraseña no coincide
        const passwordMatch = await bcrypt.compare(pass, results[0].password);
        if (!passwordMatch) {
          return res.render("login", {
            message: "Contraseña incorrecta",
            messageType: "error",
          });
        }

        // Si todo está bien, proceder con el login
        const id = results[0].id;
        const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_TIME_EXPIRED,
        });

        const cookiesOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
        };

        res.cookie("jwt", token, cookiesOptions);
        res.redirect("/"); // Redirigir a la página principal o el dashboard
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Hubo un error en el servidor");
  }
};

exports.isAuthenticated = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoder = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const queryAuthenticatedUser = `
        SELECT users.*, job_titles.job_name, job_titles.job_title_id
        FROM users
        LEFT JOIN job_titles ON users.job_title_id = job_titles.job_title_id
        WHERE users.id = ?
      `;

      const queryOtherUsers = `
        SELECT users.name, job_titles.job_name AS role, users.job_title_id
        FROM users
        LEFT JOIN job_titles ON users.job_title_id = job_titles.job_title_id
        WHERE users.id != ?
      `;

      // Consultar el usuario autenticado
      connection.query(
        queryAuthenticatedUser,
        [decoder.id],
        (error, results) => {
          if (error || !results || results.length === 0) {
            return next();
          }

          const user = results[0];

          // Mapear job_title_id a roles para el usuario autenticado
          let role;
          switch (user.job_title_id) {
            case 1:
              role = "admin";
              break;
            case 2:
              role = "contador";
              break;
            case 3:
              role = "empleado";
              break;
            default:
              role = "ninguno";
          }

          user.role = role;
          req.user = user;
          res.locals.user = user;

          // Consultar los usuarios no autenticados
          connection.query(queryOtherUsers, [decoder.id], (err, otherUsers) => {
            if (err) {
              return next();
            }

            // Asignar el rol a cada usuario en otherUsers
            otherUsers.forEach(user => {
              switch (user.job_title_id) {
                case 1:
                  user.role = "admin";
                  break;
                case 2:
                  user.role = "contador";
                  break;
                case 3:
                  user.role = "empleado";
                  break;
                default:
                  user.role = "ninguno";
              }
            });

            // Guardar todos los usuarios en una lista
            res.locals.otherUsers = otherUsers;

            return next();
          });
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    res.redirect("/login");
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Hubo un error al cerrar sesión");
  }
};
