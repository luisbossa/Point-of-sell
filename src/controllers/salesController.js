const connection = require("../../database/db");

exports.salesTransaction = async (req, res) => {
  try {
    const { transactions, employee_number, item_total, finalPrice } = req.body;

    // Validar los campos recibidos
    if (!transactions || !employee_number || !item_total || !finalPrice) {
      return res.status(400).json({
        error:
          "Los campos transactions, employee_number, item_total y finalPrice son obligatorios",
      });
    }

    // Verificar que el número de empleado exista en la base de datos
    const checkEmployeeQuery = "SELECT id FROM users WHERE id = ?";
    connection.query(checkEmployeeQuery, [employee_number], (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error al verificar el número de empleado" });
      }

      if (result.length === 0) {
        return res.status(400).json({
          error: "El número de empleado no existe en la base de datos",
        });
      }

      // Comenzar la transacción de la base de datos
      connection.beginTransaction((err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Error al iniciar la transacción" });
        }

        // Procesar cada transacción
        let transactionProcessed = 0;
        transactions.forEach((transaction) => {
          const { product_id, qty_item, total_sum, singleTax } = transaction;

          // Validar que el producto exista
          const checkProductQuery =
            "SELECT product_id FROM product WHERE product_id = ?";
          connection.query(checkProductQuery, [product_id], (err, result) => {
            if (err) {
              // Si ocurre un error, hacer rollback y enviar la respuesta de error
              return connection.rollback(() => {
                console.error(err);
                return res
                  .status(500)
                  .json({ error: "Error al verificar el producto" });
              });
            }

            if (result.length === 0) {
              // Si no se encuentra el producto, hacer rollback y enviar el error
              return connection.rollback(() => {
                return res
                  .status(400)
                  .json({ error: "El producto no existe en la base de datos" });
              });
            }

            // Insertar la transacción
            const query =
              "INSERT INTO sale_transaction (total_sum, datetime_sold, employee_number, product_id, qty_item, item_total, tax, final_price) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)";
            const values = [
              total_sum,
              employee_number,
              product_id,
              qty_item,
              item_total,
              singleTax, // El IVA individual por producto
              finalPrice,
            ];

            connection.query(query, values, (err, result) => {
              if (err) {
                return connection.rollback(() => {
                  console.error(err);
                  return res
                    .status(500)
                    .json({ error: "Error al registrar la transacción" });
                });
              }

              // Aumentamos el contador de transacciones procesadas
              transactionProcessed++;

              // Si todas las transacciones fueron procesadas, hacer commit y responder
              if (transactionProcessed === transactions.length) {
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      console.error(err);
                      return res
                        .status(500)
                        .json({ error: "Error al confirmar la transacción" });
                    });
                  }
                  return res.status(200).json({
                    success: true,
                    message: "Transacciones registradas con éxito",
                    result,
                  });
                });
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
