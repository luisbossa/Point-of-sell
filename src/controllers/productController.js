const path = require("path");
const multer = require("multer");
const connection = require("../../database/db");

// Configuración de Multer para productos
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/images/product-images")); // Ruta para las imágenes de productos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
  },
});

const productUpload = multer({
  storage: productStorage,
});

const addProduct = (req, res) => {
  const productId = req.params.id;

  connection.query(
    "SELECT * FROM product WHERE product_id = ?",
    [productId],
    (err, results) => {
      if (err) {
        console.error("Error al obtener el producto:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error al obtener el producto" });
      }

      if (results.length > 0) {
        const product = results[0];

        // Obtener el carrito desde el localStorage
        const cart = JSON.parse(req.query.cart || "[]");

        // Verificamos si el producto ya está en el carrito
        const existingProduct = cart.find(
          (item) => item.product_id === product.product_id
        );

        if (existingProduct) {
          existingProduct.quantity += 1; // Si el producto ya está, incrementamos la cantidad
        } else {
          // Si el producto no está en el carrito, lo agregamos con cantidad 1
          cart.push({
            product_id: product.product_id,
            product_name: product.product_name,
            price: product.price,
            quantity: 1,
          });
        }

        // Enviar el carrito actualizado al cliente
        return res.json({
          success: true,
          message: "Producto agregado al carrito",
          cart: cart,
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Producto no encontrado" });
      }
    }
  );
};

// Obtener carrito (desde el localStorage del cliente)
const updateCart = (req, res) => {
  const cart = JSON.parse(req.query.cart || "[]");
  res.json(cart);
};

// Eliminar producto del carrito
const removeProduct = (req, res) => {
  const productId = parseInt(req.params.id, 10);
  let cart = JSON.parse(req.query.cart || "[]");

  const productIndex = cart.findIndex((item) => item.product_id === productId);

  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Producto no encontrado en el carrito",
    });
  }

  cart.splice(productIndex, 1); // Eliminar producto del carrito
  return res.json({
    success: true,
    message: "Producto eliminado del carrito",
    cart,
  });
};

const editProduct = (req, res) => {
  const productId = req.params.id;

  // Aquí, deberías realizar la consulta para obtener el producto y las categorías
  const queryProduct = `SELECT * FROM product WHERE product_id = ?`;
  const queryCategories = `SELECT * FROM categories`;

  // Realiza la consulta para obtener el producto
  connection.query(queryProduct, [productId], (err, productResult) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener el producto." });
    }

    if (productResult.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Producto no encontrado." });
    }

    // Realiza la consulta para obtener las categorías
    connection.query(queryCategories, (err, categoriesResult) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al obtener las categorías.",
        });
      }

      // Enviar la respuesta con el producto y las categorías
      res.json({
        success: true,
        product: productResult[0],
        categories: categoriesResult,
      });
    });
  });
};

const updateProduct = (req, res) => {
  const productId = req.params.id;
  const { barcode, product_name, category_id, price } = req.body;

  const query = `
      UPDATE product 
      SET barcode = ?, product_name = ?, category_id = ?, price = ? 
      WHERE product_id = ?
    `;

  connection.query(
    query,
    [barcode, product_name, category_id, price, productId],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar el producto:", err);
        return res.status(500).json({
          success: false,
          message: "Error al actualizar el producto",
        });
      }

      if (result.affectedRows > 0) {
        res.json({
          success: true,
          message: "Producto actualizado exitosamente",
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Producto no encontrado" });
      }
    }
  );
};

const deleteProducts = (req, res) => {
  const productId = req.params.id; // Obtener el ID del producto desde la URL

  // Query para eliminar el producto de la base de datos
  const query = "DELETE FROM product WHERE product_id = ?";
  connection.query(query, [productId], (err, result) => {
    if (err) {
      console.error("Error al eliminar el producto:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al eliminar el producto" });
    }

    // Verificar si el producto fue eliminado
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Producto eliminado exitosamente" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Producto no encontrado" });
    }
  });
};

// procesar la compra (checkout)
const checkout = (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "El carrito está vacío" });
    }

    // Vaciar el carrito después de realizar la compra
    req.session.cart = [];

    return res.json({ success: true, message: "Compra procesada con éxito" });
  } catch (error) {
    console.error("Error al procesar la compra:", error); // Imprimir error si ocurre
    return res
      .status(500)
      .json({ success: false, message: "Error al procesar la compra" });
  }
};

const addProducts = (req, res) => {
  // Verifica que el formulario esté enviando los valores correctamente
  const { productBarcode, productName, productPrice, categoryId } = req.body;

  // Define un arreglo con las rutas de las imágenes posibles
  const productImages = [
    "/images/defaultProduct.webp",
    "/images/food.webp",
    "/images/breakfast.webp",
    "/images/coffe.webp",
    "/images/juice.webp",
    "/images/sweet.webp",
    "/images/cookies.webp",
    "/images/desserts.webp",
    "/images/bakery.webp",
    "/images/appetizer.webp",
    "/images/frozen.webp",
  ];

  // Selecciona una imagen al azar del arreglo
  const randomIndex = Math.floor(Math.random() * productImages.length);
  const productImage = productImages[randomIndex]; // Esto asigna una imagen aleatoria

  // Consulta para obtener todas las categorías desde la tabla categories
  const categoryQuery = `SELECT category_id, category_name FROM categories`;

  connection.query(categoryQuery, (categoryError, categoryResults) => {
    if (categoryError) {
      console.error("Error al obtener las categorías", categoryError);
      return res.status(500).send("Error al obtener las categorías");
    }

    const categories = categoryResults.map((item) => item.category_name);
    const pCategories = categoryResults;

    const productQuery = `SELECT p.product_id, p.barcode, p.product_name, p.price, c.category_name
                          FROM product p
                          LEFT JOIN categories c ON p.category_id = c.category_id`;

    connection.query(productQuery, (productError, productResults) => {
      if (productError) {
        console.error("Error al obtener los productos:", productError);
        return res.render("products", {
          message: "Error al obtener los productos.",
          cmessage: "",
          success: false,
          categories: categories,
          pCategories: pCategories,
          addCategory: "",
          backgroundColor: "",
          products: [],
        });
      }

      if (!productBarcode || !productName || !productPrice || !categoryId) {
        return res.render("products", {
          message: "Todos los campos son obligatorios.",
          cmessage: "",
          success: false,
          categories: categories,
          pCategories: pCategories,
          addCategory: "",
          backgroundColor: "",
          products: productResults,
        });
      }

      const barcodeRegex = /^[0-9]{12,}$/;
      if (!barcodeRegex.test(productBarcode)) {
        return res.render("products", {
          message:
            "El código de barras debe contener solo números y tener al menos 12 dígitos.",
          cmessage: "",
          success: false,
          categories: categories,
          pCategories: pCategories,
          addCategory: "",
          backgroundColor: "",
          products: productResults,
        });
      }

      // Preparar la consulta para insertar el producto con la imagen seleccionada aleatoriamente
      const query = `
        INSERT INTO product (barcode, product_name, price, category_id, product_image)
        VALUES (?, ?, ?, ?, ?)
      `;

      // Ejecuta la consulta SQL para insertar el producto
      connection.query(
        query,
        [productBarcode, productName, productPrice, categoryId, productImage],
        (error, results) => {
          if (error) {
            console.error("Error al insertar producto:", error);
            return res.render("products", {
              message: "Hubo un error al insertar el producto.",
              cmessage: "",
              success: false,
              categories: categories,
              pCategories: pCategories,
              addCategory: "",
              backgroundColor: "",
              products: productResults,
            });
          }

          res.redirect("/products");
        }
      );
    });
  });
};

module.exports = {
  productUpload,
  addProducts,
  checkout,
  deleteProducts,
  updateProduct,
  editProduct,
  removeProduct,
  updateCart,
  addProduct,
};
