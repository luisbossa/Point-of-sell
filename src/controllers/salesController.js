const connection = require("../../database/db");

exports.salesTransaction = async (req, res) => {
  try {
    const { transactions, employee_number, item_total, finalPrice } = req.body;

    // Verificar que los campos recibidos son correctos
    if (!transactions || !employee_number || !item_total || !finalPrice) {
      return res.status(400).json({
        error:
          "Los campos transactions, employee_number, item_total y finalPrice son obligatorios",
      });
    }

    // Usamos promesas para la conexión
    const connectionPromised = connection.promise();
    await connectionPromised.beginTransaction(); // Inicia la transacción

    // Procesar cada transacción
    let transactionProcessed = 0;

    for (const transaction of transactions) {
      const { product_id, qty_item, total_sum, singleTax } = transaction;

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

      try {
        // Ejecuta la consulta para insertar cada transacción
        const [result] = await connectionPromised.query(query, values);
        transactionProcessed++;
      } catch (err) {
        // Si hay un error, hacer rollback
        await connectionPromised.rollback();
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error al registrar la transacción" });
      }
    }

    // Si todas las transacciones fueron procesadas correctamente, hacemos commit
    await connectionPromised.commit();
    return res.status(200).json({
      success: true,
      message: "Transacciones registradas con éxito",
    });
  } catch (error) {
    // En caso de error general, rollback y respuesta de error
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
