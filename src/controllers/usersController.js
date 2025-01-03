const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const connection = require("../../database/db");

// Configuración de Multer para manejar las cargas de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/images/user-images")); // Guardar en 'public/images/user-images'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para evitar conflictos
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de tamaño de archivo: 5MB
  },
}); // Middleware de Multer

const getUser = (req, res) => {
  const userId = req.params.id; // Suponemos que el ID del usuario está en los parámetros de la URL

  // Consulta SQL para obtener los datos del usuario
  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error al obtener el usuario:", err);
        return res.status(500).send("Error al obtener el usuario");
      }

      // Verificar si el usuario existe
      if (results.length === 0) {
        return res.status(404).send("Usuario no encontrado");
      }

      const user = results[0];

      // Pasar el usuario a la vista usando res.locals
      res.user = user;
      res.render("users", { user: res.user });
    }
  );
};

const updateUser = (req, res) => {
  // Verifica si hay un archivo cargado (por ejemplo, si excede el tamaño permitido)
  if (req.file && req.file.size > 5 * 1024 * 1024) {
    return res
      .status(400)
      .send(
        "El archivo es demasiado grande. El tamaño máximo permitido es 5MB."
      );
  }

  // Datos enviados en el cuerpo de la solicitud (req.body)
  const {
    username,
    name,
    email,
    address,
    province,
    canton,
    district,
    job_name,
    id,
  } = req.body;

  // Verifica si se subió una imagen y genera la ruta relativa
  const imageFile = req.file
    ? "/images/user-images/" + req.file.filename
    : null;

  // Consulta para obtener el usuario autenticado con los datos de la tabla users y job_titles
  const queryAuthenticatedUser = `
    SELECT users.id, users.user, users.name, users.email, users.address, users.province, users.district, users.canton, users.image_file, users.job_title_id, job_titles.job_name, job_titles.job_title_id, users.password
    FROM users
    LEFT JOIN job_titles ON users.job_title_id = job_titles.job_title_id
    WHERE users.id = ?
  `;

  // Consulta para obtener otros usuarios
  const queryOtherUsers = `
    SELECT users.id, users.name, job_titles.job_name AS role, users.job_title_id, users.image_file
    FROM users
    LEFT JOIN job_titles ON users.job_title_id = job_titles.job_title_id
    WHERE users.id != ?
  `;

  // Aquí usamos `id` de `req.body` en lugar de `id2`, asumiendo que `id` se pasa en el cuerpo de la solicitud
  connection.query(queryAuthenticatedUser, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.render("users", {
        user: { error: "Usuario no encontrado" }, // En lugar de `null`, enviamos un objeto con error
        otherUsers: [],
        successMessage: "",
        successMessage2: "",
        passSuccessMessage: "",
        errorMessage: "Usuario no encontrado.",
        errorMessage2: "",
        passErrorMessage: "",
      });
    }

    const user = {
      id: results[0].id,
      user: results[0].user,
      name: results[0].name,
      email: results[0].email,
      address: results[0].address,
      province: results[0].province,
      district: results[0].district,
      canton: results[0].canton,
      image_file: results[0].image_file,
      job_name: results[0].job_name,
      job_title_id: results[0].job_title_id,
      password: results[0].password,
    };

    // Obtener otros usuarios
    connection.query(queryOtherUsers, [id], (err, otherUsers) => {
      if (err) {
        return res.render("users", {
          user: user,
          otherUsers: [], // Si hay un error, no pasamos otros usuarios
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage: "Error al obtener los usuarios.",
          errorMessage2: "",
          passErrorMessage: "",
        });
      }

      // Asignar rol a cada usuario
      otherUsers.forEach((otherUser) => {
        switch (otherUser.job_title_id) {
          case 1:
            otherUser.role = "admin";
            break;
          case 2:
            otherUser.role = "contador";
            break;
          case 3:
            otherUser.role = "empleado";
            break;
          default:
            otherUser.role = "ninguno";
        }
      });

      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

      // Validar formato del correo electrónico
      if (!emailRegex.test(email)) {
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage: "",
          errorMessage2: "El formato del correo electrónico no es válido.",
          passErrorMessage: "",
        });
      }

      if (email.length < 3) {
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage: "",
          errorMessage2:
            "El correo electrónico no puede tener más de 5 caracteres.",
          passErrorMessage: "",
        });
      }

      // Validar que el nombre de usuario tenga al menos 3 caracteres
      if (username.length < 3) {
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage2: "",
          errorMessage:
            "El nombre de usuario debe tener al menos 3 caracteres.",
          passErrorMessage: "",
        });
      }

      // Validar que el nombre tenga al menos 3 caracteres
      if (name.length < 3) {
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage2: "",
          errorMessage: "El nombre debe tener al menos 3 caracteres.",
          passErrorMessage: "",
        });
      }

      // Validar que la dirección tenga al menos 5 caracteres
      if (address.length < 5) {
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage: "",
          errorMessage2: "La dirección debe tener al menos 5 caracteres.",
          passErrorMessage: "",
        });
      }

      // Consulta SQL para actualizar el usuario en la base de datos
      const query = `
        UPDATE users
        SET
          user = ?, 
          name = ?, 
          email = ?, 
          address = ?, 
          province = ?, 
          canton = ?, 
          district = ?, 
          image_file = ?, 
          job_title_id = ?
        WHERE id = ?
      `;

      const values = [
        username,
        name,
        email,
        address,
        province,
        canton,
        district,
        imageFile,
        job_name,
        id,
      ];

      // Ejecutar la consulta para actualizar el usuario en la base de datos
      connection.query(query, values, (err, results) => {
        if (err) {
          console.error("Error al actualizar el usuario:", err);
          return res.status(500).send("Error al actualizar el usuario");
        }

        // Redirigir a la lista de usuarios si la actualización fue exitosa
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "Datos actualizados",
          successMessage2: "Datos actualizados",
          passSuccessMessage: "",
          errorMessage: "",
          errorMessage2: "",
          passErrorMessage: "",
        });
      });
    });
  });
};

const changePassword = (req, res) => {
  const { currentPass, newPass, repeatPass, id2 } = req.body;

  // Consulta para obtener el usuario autenticado con los datos de la tabla users y job_titles
  const queryAuthenticatedUser = `
    SELECT users.id, users.user, users.name, users.email, users.address, users.province, users.district, users.canton, users.image_file, users.job_title_id, job_titles.job_name, job_titles.job_title_id, users.password
    FROM users
    LEFT JOIN job_titles ON users.job_title_id = job_titles.job_title_id
    WHERE users.id = ?
  `;

  // Consulta para obtener otros usuarios
  const queryOtherUsers = `
    SELECT users.id, users.name, job_titles.job_name AS role, users.job_title_id, users.image_file
    FROM users
    LEFT JOIN job_titles ON users.job_title_id = job_titles.job_title_id
    WHERE users.id != ?
  `;

  connection.query(queryAuthenticatedUser, [id2], (err, results) => {
    if (err || results.length === 0) {
      return res.render("users", {
        user: req.user, // Pasa el usuario desde req.user si no se encuentra el usuario
        otherUsers: [], // No se pasan otros usuarios en caso de error
        successMessage: "",
        successMessage2: "",
        passSuccessMessage: "",
        errorMessage: "",
        errorMessage2: "",
        passErrorMessage: "Usuario no encontrado.",
      });
    }

    const user = {
      id: results[0].id,
      user: results[0].user,
      name: results[0].name,
      email: results[0].email,
      address: results[0].address,
      province: results[0].province,
      district: results[0].district,
      canton: results[0].canton,
      image_file: results[0].image_file,
      job_name: results[0].job_name,
      job_title_id: results[0].job_title_id,
      password: results[0].password,
    };

    // Obtener otros usuarios
    connection.query(queryOtherUsers, [id2], (err, otherUsers) => {
      if (err) {
        return res.render("users", {
          user: user,
          otherUsers: [], // Si hay un error, no pasamos otros usuarios
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage: "",
          passErrorMessage: "Error al obtener los usuarios.",
        });
      }

      // Asignar rol a cada usuario
      otherUsers.forEach((user) => {
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

      // Verificar que todos los campos de la contraseña estén presentes
      if (!currentPass || !newPass || !repeatPass) {
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage: "",
          errorMessage2: "",
          passErrorMessage: "Todos los campos de contraseña son obligatorios.",
        });
      }

      // Verificar que las nuevas contraseñas coincidan
      if (newPass !== repeatPass) {
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage: "",
          errorMessage2: "",
          passErrorMessage: "Las contraseñas nuevas no coinciden.",
        });
      }

      // Verificar que la nueva contraseña tenga al menos 6 caracteres
      if (newPass.length < 6) {
        return res.render("users", {
          user: user,
          otherUsers: otherUsers,
          successMessage: "",
          successMessage2: "",
          passSuccessMessage: "",
          errorMessage: "",
          errorMessage2: "",
          passErrorMessage:
            "La nueva contraseña debe tener al menos 6 caracteres.",
        });
      }

      // Comparar la contraseña actual con la almacenada en la base de datos
      bcrypt.compare(currentPass, user.password, async (err, isMatch) => {
        if (err) {
          return res.render("users", {
            user: user,
            otherUsers: otherUsers,
            successMessage: "",
            successMessage2: "",
            passSuccessMessage: "",
            errorMessage: "",
            errorMessage2: "",
            passErrorMessage:
              "Hubo un error al verificar la contraseña actual.",
          });
        }

        if (!isMatch) {
          return res.render("users", {
            user: user,
            otherUsers: otherUsers,
            successMessage: "",
            successMessage2: "",
            passSuccessMessage: "",
            errorMessage: "",
            errorMessage2: "",
            passErrorMessage: "La contraseña actual es incorrecta.",
          });
        }

        // Hashea la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPass, 8);

        // Actualizar la contraseña en la base de datos
        const queryUpdatePassword = `
          UPDATE users
          SET password = ?
          WHERE id = ?
        `;
        connection.query(
          queryUpdatePassword,
          [hashedPassword, id2],
          (err, results) => {
            if (err) {
              return res.render("users", {
                user: user,
                otherUsers: otherUsers,
                successMessage: "",
                successMessage2: "",
                passSuccessMessage: "",
                errorMessage: "",
                errorMessage2: "",
                passErrorMessage: "Error al actualizar la contraseña.",
              });
            }

            // Si la actualización fue exitosa, mostramos el mensaje de éxito
            res.render("users", {
              user: user,
              otherUsers: otherUsers,
              successMessage: "",
              successMessage2: "",
              passSuccessMessage: "Contraseña actualizada correctamente.",
              errorMessage: "",
              errorMessage2: "",
              passErrorMessage: "",
            });
          }
        );
      });
    });
  });
};

module.exports = { upload, updateUser, getUser, changePassword };
