const connection = require("../../database/db");
const moment = require("moment");

exports.salesDetails = async (req, res) => {
  try {
    // Obtener la fecha seleccionada desde la query string
    const selectedDate = req.query.date;

    // Agregar la hora 00:00:00 si solo se pasa la fecha
    const fullDate = selectedDate + " 00:00:00"; // Convertir la fecha a formato completo con hora

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

    // Para asegurarnos de que obtenemos todas las ventas del día completo, comparamos entre el inicio del día (00:00:00) y el siguiente día (00:00:00)
    const startOfDay = fullDate; // El inicio del día (00:00:00)
    const endOfDay = selectedDate + " 23:59:59"; // El final del día (23:59:59)

    // Ejecutar la consulta SQL pasando los valores correctos
    connection.query(query, [startOfDay, endOfDay], (err, results) => {
      if (err) {
        console.error("Error en la consulta:", err);
        return res
          .status(500)
          .json({ error: "Error al obtener los datos de las ventas" });
      }

      // Convertir las fechas a un formato legible (ejemplo: yyyy-mm-dd HH:mm:ss)
      results = results.map((sale) => {
        // Usar la fecha ya convertida en la consulta SQL, es decir, `datetime_sold_local`
        sale.datetime_sold = moment(sale.datetime_sold_local).format(
          "YYYY-MM-DD HH:mm:ss"
        );
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

