const express = require("express");
const router = express.Router();

// Controladores
const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const salesController = require("../controllers/salesController");
const salesDetailsController = require("../controllers/salesDetailsController");

// Base de datos
const connection = require("../../database/db");

// ** Rutas Públicas **
// Página de inicio
router.get("/", authController.isAuthenticated, (req, res) => {
  connection.query(
    "SELECT product_id, product_name, product_image, price, category_id FROM product LIMIT 18",
    (err, products) => {
      if (err) {
        console.error("Error al obtener productos: " + err.stack);
        return res.status(500).send("Error al obtener los productos");
      }

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

              connection.query(
                "SELECT product_id, product_name, product_image, price, category_id FROM product LIMIT 54, 18",
                (err, moreExtraProducts) => {
                  if (err) {
                    console.error(
                      "Error al obtener más productos: " + err.stack
                    );
                    return res
                      .status(500)
                      .send("Error al obtener más productos");
                  }

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

                      const getBackgroundColorByCategoryId = (categoryId) => {
                        const category = categoryColors.find(
                          (c) => c.category_id === categoryId
                        );
                        return category ? category.background_color : "#FFFFFF";
                      };

                      // Asignamos color de fondo a cada producto
                      [
                        ...products,
                        ...moreProducts,
                        ...extraProducts,
                        ...moreExtraProducts,
                      ].forEach((product) => {
                        product.backgroundColor =
                          getBackgroundColorByCategoryId(product.category_id);
                      });

                      const hasMoreProducts = moreExtraProducts.length > 0;

                      // Renderizamos la vista
                      res.render("index", {
                        user: req.user,
                        productos: products,
                        moreProductos: moreProducts,
                        extraProductos: extraProducts,
                        moreExtraProductos: moreExtraProducts,
                        hasMoreProducts,
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

// Rutas de categorías
router.get("/categories/:category", categoryController.category);

// Rutas de productos
router.get("/products", (req, res) => {
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

    const categoryQuery = "SELECT category_id, category_name FROM categories";

    connection.query(categoryQuery, (categoryError, categoryResults) => {
      if (categoryError) {
        console.error("Error al obtener las categorías", categoryError);
        return res.status(500).send("Error al obtener las categorías");
      }

      const categories = categoryResults.map((item) => item.category_name);
      const pCategories = categoryResults;

      res.render("products", {
        products: productResults,
        categories,
        pCategories,
        addCategory: "",
        message: "",
        cmessage: "",
        backgroundColor: "",
      });
    });
  });
});

// ** Rutas de Usuarios **
// Página de usuarios
router.get("/users", authController.isAuthenticated, (req, res) => {
  res.render("users", {
    user: req.user,
    otherUsers: res.locals.otherUsers || [],
    successMessage: "",
    errorMessage: "",
  });
});

// ** Rutas de Inventario **
router.get("/inventory", authController.isAuthenticated, (req, res) => {
  res.render("inventory", { user: req.user });
});

// ** Rutas de Autenticación (Login & Register) **
router.get("/login", (req, res) => res.render("login", { message: "" }));
router.get("/register", (req, res) => res.render("register", { message: "" }));

// Métodos de autenticación
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// ** Rutas de Producto **
router.get("/addProduct/:id", productController.addProduct);
router.get("/updateCart", productController.updateCart);
router.post("/checkout", productController.checkout);
router.delete("/removeProduct/:id", productController.removeProduct);

router.post(
  "/addProducts",
  productController.productUpload.single("product-img"),
  productController.addProducts
);
router.get("/editProduct/:id", productController.editProduct);
router.post("/updateProduct/:id", productController.updateProduct);
router.delete("/deleteProducts/:id", productController.deleteProducts);

// ** Rutas de Categoría **
router.post("/addCategoryProducts", categoryController.addCategoryProducts);

// ** Rutas de Ventas **
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

router.post("/salesTransaction", salesController.salesTransaction);
router.get("/get-sales-data", salesDetailsController.salesDetails);

// ** Rutas de Usuarios (Métodos) **
router.post(
  "/users",
  usersController.upload.single("image"),
  usersController.updateUser
);
router.post("/changePass", usersController.changePassword);

module.exports = router;
