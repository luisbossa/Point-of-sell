const dotenv = require("dotenv");
const Stripe = require("stripe");

dotenv.config();

const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY); // Usar clave secreta desde el archivo .env

exports.cardPayment = async (req, res) => {
  try {
    const { totalAmount } = req.body; // Recibir el total con IVA en centavos

    // Crear la sesión de pago con Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            product_data: {
              name: "Total a pagar", // Producto de ejemplo
            },
            currency: "crc", // O usa tu moneda preferida
            unit_amount: totalAmount, // Usar el total con IVA recibido
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Cambiar las URLs a la URL de producción
      success_url: `https://point-of-sell.onrender.com/?payment_status=success`, // Redirigir al inicio con parámetro success
      cancel_url: `https://point-of-sell.onrender.com/?payment_status=cancelled`, // Redirigir al inicio con parámetro cancelled
    });

    // Enviar la URL de la sesión de pago a la respuesta
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creando sesión de pago:", error);
    res.status(500).send("Error al procesar el pago");
  }
};
