const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const salesController = require("../controllers/salesController");
const salesDetailsController = require("../controllers/salesDetailsController");
const cardPaymentController = require("../controllers/cardPaymentController");
const connection = require("../../database/db");
const moment = require("moment");

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
                        return category ? category.background_color : "#FFFFFF"; // Fallback a blanco si no se encuentra el color
                      };

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

                      res.render("index", {
                        user: req.user,
                        productos: products,
                        moreProductos: moreProducts,
                        extraProductos: extraProducts,
                        moreExtraProductos: moreExtraProducts,
                        hasMoreProducts: hasMoreProducts,
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
    successMessage: "",
    successMessage2: "",
    passSuccessMessage: "",
    errorMessage: "",
    errorMessage2: "",
    passErrorMessage: "",
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
  // Obtener la fecha seleccionada desde la query string
  const selectedDate = req.query.date;

  // Agregar la hora 00:00:00 si solo se pasa la fecha
  const fullDate = selectedDate + " 00:00:00"; // Convertir la fecha a formato completo con hora

  // Asegurarse de que el formato de las fechas sea correcto
  const startOfDay = moment(selectedDate)
    .startOf("day")
    .format("YYYY-MM-DD HH:mm:ss"); // Inicio del día a las 00:00:00
  const endOfDay = moment(selectedDate)
    .endOf("day")
    .format("YYYY-MM-DD HH:mm:ss"); // Fin del día a las 23:59:59

  // Consulta SQL con fecha y hora completas y conversión de zona horaria
  const query = `
      SELECT 
          sale_transaction.sale_transaction_id,
          sale_transaction.product_id,
          sale_transaction.employee_number,
          sale_transaction.qty_item,
          sale_transaction.item_total,
          sale_transaction.total_sum,
          sale_transaction.tax,
          sale_transaction.final_price,
          CONVERT_TZ(sale_transaction.datetime_sold, '+00:00', '-06:00') AS datetime_sold_local, -- Convertir UTC a UTC-6
          product.product_name,
          product.price,
          product.product_image,
          users.user,
          users.name,
          users.email
      FROM 
          sale_transaction
      JOIN 
          product ON sale_transaction.product_id = product.product_id
      JOIN 
          users ON sale_transaction.employee_number = users.id
      WHERE 
          sale_transaction.datetime_sold >= ? AND sale_transaction.datetime_sold < ? 
  `;

  // Ejecutar la consulta SQL con los parámetros de fecha
  connection.query(query, [startOfDay, endOfDay], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener los datos de las ventas" });
    }

    // Verificar y formatear las fechas para que sean más legibles
    results = results.map((sale) => {
      // Convertir la fecha a la zona horaria deseada en el servidor antes de devolverla al cliente
      sale.datetime_sold = moment(sale.datetime_sold_local).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      // Si la fecha sigue mal, agrega un ajuste de día (por ejemplo, sumar 1 día).
      // sale.datetime_sold = moment(sale.datetime_sold).add(1, 'days').format("YYYY-MM-DD HH:mm:ss");

      return sale;
    });

    // Calcular los totales
    // Total de ventas: Sumar el total de cada transacción
    const totalSales = results.reduce(
      (acc, sale) => acc + parseFloat(sale.total_sum),
      0
    );

    // Total de impuestos: Sumar el impuesto de cada transacción
    const totalTax = results.reduce(
      (acc, sale) => acc + parseFloat(sale.tax),
      0
    );

    // Total de productos: Sumar la cantidad de productos vendidos
    const itemTotal = results.reduce(
      (acc, sale) => acc + parseInt(sale.qty_item, 10),
      0
    );

    // Renderizar la vista con los datos y los totales
    res.render("sales", {
      user: req.user,
      salesData: results,
      selectedDate: selectedDate,
      totalSales: totalSales,
      totalTax: totalTax,
      itemTotal: itemTotal,
    });
  });
});

router.get("/get-sales-data", salesDetailsController.salesDetails);

router.post("/cardPayment", cardPaymentController.cardPayment);

module.exports = router;
