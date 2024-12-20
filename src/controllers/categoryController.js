const connection = require("../../database/db");

exports.category = async (req, res) => {
  const { category } = req.params; // Obtener el nombre de la categoría desde la URL

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    // Si la categoría es "todos", obtenemos todos los productos
    if (category === "todos") {
      // Consulta para obtener todos los productos sin filtrar por category_id
      connection.query(
        "SELECT product_id, product_name, product_image, price, category_id FROM product",
        (err, products) => {
          if (err) {
            console.error("Error al obtener productos: " + err.stack);
            return res.status(500).send("Error al obtener los productos");
          }

          res.redirect("/"); // Redirigir después de obtener los productos
        }
      );
    } else {
      // Obtener el category_id basado en el nombre de la categoría
      const categoryQuery =
        "SELECT category_id, background_color FROM categories WHERE category_name = ?";
      connection.query(categoryQuery, [category], (err, categoryResults) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }

        if (categoryResults.length === 0) {
          return res.status(404).json({ message: "Category not found" });
        }

        const categoryId = categoryResults[0].category_id;
        const backgroundColor = categoryResults[0].background_color;

        // Consulta para obtener los productos de la categoría seleccionada (1-18)
        connection.query(
          "SELECT product_id, product_name, product_image, price, category_id FROM product WHERE category_id = ? LIMIT 18",
          [categoryId],
          (err, products) => {
            if (err) {
              console.error("Error al obtener productos: " + err.stack);
              return res.status(500).send("Error al obtener los productos");
            }

            // Asignar el background color a cada producto
            products.forEach((product) => {
              product.backgroundColor = backgroundColor;
            });

            // Repetir la misma lógica para los productos 19-36
            connection.query(
              "SELECT product_id, product_name, product_image, price, category_id FROM product WHERE category_id = ? LIMIT 18, 18",
              [categoryId],
              (err, moreProducts) => {
                if (err) {
                  console.error(
                    "Error al obtener productos adicionales: " + err.stack
                  );
                  return res
                    .status(500)
                    .send("Error al obtener productos adicionales");
                }

                moreProducts.forEach((product) => {
                  product.backgroundColor = backgroundColor;
                });

                // Repetir la misma lógica para los productos 37-54
                connection.query(
                  "SELECT product_id, product_name, product_image, price, category_id FROM product WHERE category_id = ? LIMIT 36, 18",
                  [categoryId],
                  (err, extraProducts) => {
                    if (err) {
                      console.error(
                        "Error al obtener productos adicionales extra: " +
                          err.stack
                      );
                      return res
                        .status(500)
                        .send("Error al obtener productos adicionales extra");
                    }

                    extraProducts.forEach((product) => {
                      product.backgroundColor = backgroundColor;
                    });

                    // Consulta para obtener los productos 55-72
                    connection.query(
                      "SELECT product_id, product_name, product_image, price, category_id FROM product WHERE category_id = ? LIMIT 54, 18",
                      [categoryId],
                      (err, moreExtraProducts) => {
                        if (err) {
                          console.error(
                            "Error al obtener más productos: " + err.stack
                          );
                          return res
                            .status(500)
                            .send("Error al obtener más productos");
                        }

                        moreExtraProducts.forEach((product) => {
                          product.backgroundColor = backgroundColor;
                        });

                        // Determinar si hay más productos para cargar (más de 72)
                        const hasMoreProducts = moreExtraProducts.length > 0;

                        // Renderizar la vista pasando los productos limitados, los productos adicionales y los extra
                        res.render("index", {
                          user: req.user,
                          productos: products, // Productos 1-18
                          moreProductos: moreProducts, // Productos 19-36
                          extraProductos: extraProducts, // Productos 37-54
                          moreExtraProductos: moreExtraProducts, // Productos 55-72
                          hasMoreProducts: hasMoreProducts, // Variable que indica si hay más productos
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

exports.addCategoryProducts = (req, res) => {
  const { addCategory, backgroundColor } = req.body;

  // Verifica que los campos no estén vacíos
  if (!addCategory || !backgroundColor) {
    // Si los campos están vacíos, obtenemos las categorías de los productos y pasamos a la vista
    const productQuery = `
      SELECT p.product_id, p.barcode, p.product_name, p.price, c.category_name
      FROM product p
      JOIN categories c ON p.category_id = c.category_id
    `;

    connection.query(productQuery, (productError, productResults) => {
      if (productError) {
        console.error("Error al obtener los productos: ", productError);
        return res.status(500).send("Error al obtener los productos");
      }

      // Consulta para obtener todas las categorías con id y nombre
      const categoryQuery = `SELECT category_id, category_name FROM categories`;

      connection.query(categoryQuery, (categoryError, categoryResults) => {
        if (categoryError) {
          console.error("Error al obtener las categorías", categoryError);
          return res.status(500).send("Error al obtener las categorías");
        }

        // Almacenamos las categorías con id y nombre
        const pCategories = categoryResults; // Lista completa con id y nombre

        // Pasamos la vista con mensaje de error y las categorías obtenidas
        return res.render("products", {
          success: false,
          cmessage: "Este campo es requerido",
          message: "",
          addCategory,
          backgroundColor,
          categories: categoryResults.map((item) => item.category_name), // Solo nombres de categorías
          pCategories: pCategories, // Lista completa con id y nombre de las categorías
          products: productResults, // Pasamos los productos obtenidos
        });
      });
    });
    return;
  }

  // Definimos la consulta SQL para insertar la categoría
  const insertCategoryQuery =
    "INSERT INTO categories (category_name, background_color) VALUES (?, ?)";

  // Ejecutamos la consulta para insertar la categoría
  connection.query(
    insertCategoryQuery,
    [addCategory, backgroundColor],
    (err, result) => {
      if (err) {
        console.error("Error al insertar la categoría: ", err);

        // Obtener todas las categorías en caso de error
        const categoryQuery = `SELECT category_id, category_name FROM categories`;

        connection.query(categoryQuery, (categoryError, categoryResults) => {
          if (categoryError) {
            console.error("Error al obtener las categorías", categoryError);
            return res.status(500).send("Error al obtener las categorías");
          }

          const pCategories = categoryResults; // Lista completa con id y nombre

          // Pasamos la vista con mensaje de error y las categorías obtenidas
          return res.render("products", {
            success: false,
            cmessage: "Error al agregar la categoría",
            message: "",
            addCategory,
            backgroundColor,
            categories: categoryResults.map((item) => item.category_name), // Solo nombres de categorías
            pCategories: pCategories,
            products: [], // Pasar productos vacíos si ocurre un error
          });
        });

        return;
      }

      // Si la inserción es exitosa, obtenemos los productos y categorías
      const productQuery = `
        SELECT p.product_id, p.barcode, p.product_name, p.price, c.category_name
        FROM product p
        JOIN categories c ON p.category_id = c.category_id
      `;

      connection.query(productQuery, (productError, productResults) => {
        if (productError) {
          console.error("Error al obtener los productos: ", productError);
          return res.status(500).send("Error al obtener los productos");
        }

        // Obtener todas las categorías después de la inserción exitosa
        const categoryQuery = `SELECT category_id, category_name FROM categories`;

        connection.query(categoryQuery, (categoryError, categoryResults) => {
          if (categoryError) {
            console.error("Error al obtener las categorías", categoryError);
            return res.status(500).send("Error al obtener las categorías");
          }

          const pCategories = categoryResults; // Lista completa con id y nombre

          // Si todo va bien, pasamos los resultados a la vista
          res.render("products", {
            products: productResults,
            categories: categoryResults.map((item) => item.category_name), // Solo nombres de categorías
            pCategories: pCategories,
            success: true,
            cmessage: "Categoría agregada correctamente",
            message: "",
            addCategory,
            backgroundColor,
          });
        });
      });
    }
  );
};
