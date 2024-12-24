const connection = require("../../database/db");
const moment = require("moment");

exports.salesDetails = async (req, res) => {
  try {
    // Obtener la fecha seleccionada desde la query string
    const selectedDate = req.query.date;

    // Convertir la fecha seleccionada a UTC al inicio del día (00:00:00)
    const startOfDayUTC = moment.utc(selectedDate + " 00:00:00", "YYYY-MM-DD HH:mm:ss");

    // Convertir la fecha seleccionada al final del día (23:59:59) en UTC
    const endOfDayUTC = moment.utc(selectedDate + " 23:59:59", "YYYY-MM-DD HH:mm:ss");

    // Consulta SQL con fecha y hora completas
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
          sale_transaction.datetime_sold,
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

    // Ejecutar la consulta SQL pasando los valores correctos
    connection.query(query, [startOfDayUTC.format("YYYY-MM-DD HH:mm:ss"), endOfDayUTC.format("YYYY-MM-DD HH:mm:ss")], (err, results) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener los datos de las ventas" });
      }

      // Convertir las fechas de la base de datos a UTC y luego formatearlas para mostrar
      results = results.map((sale) => {
        // Convertir la fecha de la base de datos (si es necesario) a formato UTC y luego formatear
        sale.datetime_sold = moment.utc(sale.datetime_sold).format("YYYY-MM-DD HH:mm:ss");
        return sale;
      });

      // Responder con los datos de ventas en formato JSON para la solicitud AJAX
      res.json(results);
    });
  } catch (error) {
    console.error("Error en el controlador salesDetails:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};
