// Evento para el botón de compra
document.querySelector(".buy-btn").addEventListener("click", () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Si el carrito está vacío, mostrar los valores en 0, deshabilitar los botones y el input
  if (cart.length === 0) {
    Swal.fire({
      title: "Verificar pago",
      html: `                    
            <p><strong>Total a pagar:</strong> ₡ 0</p>
            <input type="text" id="payment" class="swal2-custom-input" placeholder="Ingresar monto" disabled/>
            
            <div class="swal2-price-div">
              <button class="payment-btn" data-value="5000" disabled>₡ 5000</button>
              <button class="payment-btn" data-value="10000" disabled>₡ 10000</button>
              <button class="payment-btn" data-value="15000" disabled>₡ 15000</button>
              <button class="payment-btn" data-value="20000" disabled>₡ 20000</button>
            </div>
            <p class="p-flex">
              <strong>Cambio:</strong> 
               <span class="change" id="change" ₡ >0</span> 
            </p>
          `,
      showCancelButton: true,
      cancelButtonText: "CANCELAR",
      confirmButtonText: "PAGAR AHORA",
      customClass: {
        popup: "custom-popup",
        title: "custom-title",
        input: "custom-input",
        confirmButton: "custom-confirm-btn",
        cancelButton: "custom-cancel-btn",
        validationMessage: "custom-validation-message",
      },
      preConfirm: () => {
        return false; // No se hace nada ya que no hay productos en el carrito
      },
      willClose: () => {
        document.getElementById("payment").value = "";
        document.getElementById("change").textContent = "0";
      },
    });
    return;
  }

  // Obtener el total del carrito (sin IVA)
  const totalSinIva = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Calcular el IVA (10% en Costa Rica)
  const iva = totalSinIva * 0.1;

  // Total con IVA
  const totalConIva = totalSinIva + iva;

  // Mostrar la modal de SweetAlert2 con los valores
  Swal.fire({
    title: "Verificar pago",
    html: `                    
          <p><strong>Total a pagar:</strong> ₡ ${totalConIva}</p>
          <input type="text" id="payment" class="swal2-custom-input" placeholder="Ingresar monto" oninput="updateChange(${totalConIva})" />
          
          <div class="swal2-price-div">
            <button class="payment-btn" data-value="5000">₡ 5000</button>
            <button class="payment-btn" data-value="10000">₡ 10000</button>
            <button class="payment-btn" data-value="15000">₡ 15000</button>
            <button class="payment-btn" data-value="20000">₡ 20000</button>
          </div>
          <p class="p-flex">
            <strong>Cambio:</strong> 
            <span class="change" id="change">₡ 0</span>
          </p>
        `,
    showCancelButton: true,
    cancelButtonText: "CANCELAR",
    confirmButtonText: "PAGAR AHORA",
    customClass: {
      popup: "custom-popup",
      title: "custom-title",
      input: "custom-input",
      confirmButton: "custom-confirm-btn",
      cancelButton: "custom-cancel-btn",
      validationMessage: "custom-validation-message",
    },
    didOpen: () => {
      // Agregar eventos a los botones de pago rápido
      document.querySelectorAll(".payment-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const paymentValue = button.getAttribute("data-value");
          document.getElementById("payment").value = paymentValue;
          updateChange(totalConIva);
        });
      });
    },
    preConfirm: () => {
      const payment = parseFloat(document.getElementById("payment").value);
      const change = payment - totalConIva;

      if (isNaN(payment) || payment < totalConIva) {
        Swal.showValidationMessage(
          "El monto ingresado es inválido o insuficiente"
        );
        return false;
      }

      return { payment, change };
    },
    willClose: () => {
      document.getElementById("payment").value = "";
      document.getElementById("change").textContent = "0";
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Realizar la transacción, enviar todo el carrito con cantidades
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const transactions = cart.map((item) => ({
        product_id: item.product_id,
        qty_item: item.quantity,
        singleTax: item.price * item.quantity * 0.1,
        total_sum: item.price * item.quantity, // Suma por item (precio * cantidad)
      }));

      // Calcular el total de todos los productos (total_sum global)
      const total_sum = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Calcular item_total (la suma de todas las cantidades de productos en el carrito)
      const item_total = cart.reduce((sum, item) => sum + item.quantity, 0);

      // Calcular el IVA (10%) sobre el total_sum
      const tax = total_sum * 0.1; // IVA del 10%

      // Calcular final_price: El precio total con IVA de todos los productos en el carrito
      const finalPrice = cart.reduce((sum, item) => {
        // Calculamos el total con IVA por cada ítem
        const itemTotalWithTax =
          item.price * item.quantity + item.price * item.quantity * 0.1;
        return sum + itemTotalWithTax;
      }, 0);

      // Realizar la transacción
      fetch("/salesTransaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          total_sum: parseFloat(totalConIva), // Total con IVA
          employee_number: 1, // Número de empleado
          item_total: item_total,
          finalPrice: parseFloat(finalPrice),
          transactions: transactions, // Las transacciones con productos
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          Swal.fire({
            title: "Pago realizado con éxito",
            icon: "success",
          });

          // Borrar el carrito después de un pago exitoso
          localStorage.removeItem("cart");

          // Actualizar la tabla y el resumen del carrito
          updateCartTable(); // Limpiar la tabla visualmente
          updateCartSummary(); // Actualizar el resumen visualmente
        })
        .catch((error) => {
          Swal.fire({
            title: "Hubo un error",
            text: error.message,
            icon: "error",
          });
        });
    }
  });
});

// Función para actualizar el cambio en tiempo real
function updateChange(totalConIva) {
  const payment = parseFloat(document.getElementById("payment").value);
  const changeElement = document.getElementById("change");
  if (!isNaN(payment)) {
    const change = payment - totalConIva;
    changeElement.textContent = change >= 0 ? "₡ " + change : "₡ 0";
  } else {
    changeElement.textContent = "₡ 0";
  }
}
const checkout = document.getElementById("checkout-btn");

checkout.addEventListener("click", async () => {
  // Obtener el carrito
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Verificar si el carrito está vacío
  if (cart.length === 0) {
    // Mostrar un mensaje con SweetAlert si el carrito está vacío
    Swal.fire({
      title: "No hay productos",
      icon: "warning",
      confirmButtonText: "Entendido",
      customClass: {
        popup: "custom-popup",
        title: "custom-title",
        confirmButton: "custom-confirm-btn",
        // Estilos personalizados para el ícono
        icon: "custom-icon",
      },
    });
    return; // Detener la ejecución si el carrito está vacío
  }
});
