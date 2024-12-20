const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const salesController = require("../controllers/salesController");
const salesDetailsController = require("../controllers/salesDetailsController");
const connection = require("../../database/db");

router.get("/categories/:category", categoryController.category);

router.get("/getSellers", (req, res) => {
  const query = "SELECT id, name FROM users";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener vendedores" });
    }
    res.json(results); // Devuelve la lista de vendedores
  });
});

router.get("/products", (req, res) => {
  // Consulta para obtener todos los productos y sus categorías (con LEFT JOIN)
  const productQuery = `
    SELECT p.product_id, p.barcode, p.product_name, p.price, c.category_name
    FROM product p
    LEFT JOIN categories c ON p.category_id = c.category_id
  `;

  connection.query(productQuery, (productError, productResults) => {
    if (productError) {
      console.error("Error al realizar la consulta de productos", productError);
      return res.status(500).send("Error en la base de datos");
    }

    // Consulta para obtener todas las categorías de la tabla categories
    const categoryQuery = `SELECT category_id, category_name FROM categories`;

    connection.query(categoryQuery, (categoryError, categoryResults) => {
      if (categoryError) {
        console.error("Error al obtener las categorías", categoryError);
        return res.status(500).send("Error al obtener las categorías");
      }

      // Extraemos todas las categorías de la tabla categories
      const categories = categoryResults.map((item) => item.category_name);
      const pCategories = categoryResults; // Lista completa con id y nombre de las categorías

      // Si la consulta es exitosa, pasamos los resultados a la vista
      res.render("products", {
        products: productResults, // Pasamos todos los productos
        categories: categories, // Pasamos solo los nombres de las categorías
        pCategories: pCategories, // Pasamos la lista completa de categorías con id y nombre
        addCategory: "",
        message: "",
        cmessage: "",
        backgroundColor: "",
      });
    });
  });
});

router.get("/", authController.isAuthenticated, (req, res) => {
  // Consulta para obtener los primeros 18 productos
  connection.query(
    "SELECT product_id, product_name, product_image, price, category_id FROM product LIMIT 18",
    (err, products) => {
      if (err) {
        console.error("Error al obtener productos: " + err.stack);
        return res.status(500).send("Error al obtener los productos");
      }

      // Consulta para obtener los productos 19-36
      connection.query(
        "SELECT product_id, product_name, product_image, price, category_id FROM product LIMIT 18, 18",
        (err, moreProducts) => {
          if (err) {
            console.error(
              "Error al obtener productos adicionales: " + err.stack
            );
            return res
              .status(500)
              .send("Error al obtener los productos adicionales");
          }

          // Consulta para obtener los productos 37-54
          connection.query(
            "SELECT product_id, product_name, product_image, price, category_id FROM product LIMIT 36, 18",
            (err, extraProducts) => {
              if (err) {
                console.error(
                  "Error al obtener productos adicionales extra: " + err.stack
                );
                return res
                  .status(500)
                  .send("Error al obtener productos adicionales extra");
              }

              // Consulta para obtener los productos 55-72 (nueva consulta)
              connection.query(
                "SELECT product_id, product_name, product_image, price, category_id FROM product LIMIT 54, 18", // Agregar más productos
                (err, moreExtraProducts) => {
                  if (err) {
                    console.error(
                      "Error al obtener más productos: " + err.stack
                    );
                    return res
                      .status(500)
                      .send("Error al obtener más productos");
                  }

                  // Obtener los colores de fondo de las categorías
                  connection.query(
                    "SELECT category_id, background_color FROM categories",
                    (err, categoryColors) => {
                      if (err) {
                        console.error(
                          "Error al obtener colores de categorías: " + err.stack
                        );
                        return res
                          .status(500)
                          .send("Error al obtener colores de categorías");
                      }

                      // Función para obtener el color de fondo de una categoría
                      const getBackgroundColorByCategoryId = (categoryId) => {
                        const category = categoryColors.find(
                          (c) => c.category_id === categoryId
                        );
                        return category ? category.background_color : "#FFFFFF"; // Fallback a blanco si no se encuentra el color
                      };

                      // Asignar el color de fondo a cada producto
                      products.forEach((product) => {
                        product.backgroundColor =
                          getBackgroundColorByCategoryId(product.category_id);
                      });
                      moreProducts.forEach((product) => {
                        product.backgroundColor =
                          getBackgroundColorByCategoryId(product.category_id);
                      });
                      extraProducts.forEach((product) => {
                        product.backgroundColor =
                          getBackgroundColorByCategoryId(product.category_id);
                      });
                      moreExtraProducts.forEach((product) => {
                        product.backgroundColor =
                          getBackgroundColorByCategoryId(product.category_id);
                      });

                      const hasMoreProducts = moreExtraProducts.length > 0;

                      // Renderizar la vista pasando todos los productos y sus colores de fondo
                      res.render("index", {
                        user: req.user,
                        productos: products,
                        moreProductos: moreProducts,
                        extraProductos: extraProducts,
                        moreExtraProductos: moreExtraProducts,
                        hasMoreProducts: hasMoreProducts, // Pasamos los productos 55-72
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// Ruta para cargar los datos del usuario
router.get("/users", authController.isAuthenticated, (req, res) => {
  res.render("users", {
    user: req.user,
    otherUsers: res.locals.otherUsers || [],
    successMessage: "",
    errorMessage: "",
  });
});

router.get("/inventory", authController.isAuthenticated, (req, res) => {
  res.render("inventory", { user: req.user });
});

//Router login and Register
router.get("/login", (req, res) => {
  res.render("login", { message: "" });
});
router.get("/register", (req, res) => {
  res.render("register", { message: "" });
});

//Router para los métodos del controller
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post(
  "/users",
  usersController.upload.single("image"),
  usersController.updateUser
);

router.post("/changePass", usersController.changePassword);

router.get("/addProduct/:id", productController.addProduct);
router.get("/updateCart", productController.updateCart);
router.post("/checkout", productController.checkout);
router.delete("/removeProduct/:id", productController.removeProduct);

router.post("/addCategoryProducts", categoryController.addCategoryProducts);

router.post(
  "/addProducts",
  productController.productUpload.single("product-img"),
  productController.addProducts
);

router.post("/salesTransaction", salesController.salesTransaction);

router.get("/editProduct/:id", productController.editProduct);
router.post("/updateProduct/:id", productController.updateProduct);
router.delete("/deleteProducts/:id", productController.deleteProducts);

router.get("/sales", authController.isAuthenticated, (req, res) => {
  res.render("sales", {
    user: req.user,
    salesData: "",
    selectedDate: "",
    totalSales: "",
    totalTax: "",
    itemTotal: "",
  });
});

router.get("/get-sales-data", salesDetailsController.salesDetails);

module.exports = router;
