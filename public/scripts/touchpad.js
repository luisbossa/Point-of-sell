// Función para agregar un producto al carrito
function addToCart(productId, productName, price) {
  fetch(
    `/addProduct/${productId}?cart=${encodeURIComponent(
      localStorage.getItem("cart") || "[]"
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Guardar el carrito actualizado en el localStorage
        localStorage.setItem("cart", JSON.stringify(data.cart));
        updateCartTable(); // Actualizar la tabla
        updateCartSummary(); // Actualizar el resumen
      } else {
        alert("Error al agregar el producto al carrito");
      }
    })
    .catch((error) => {
      alert("Hubo un error al agregar el producto");
    });
}

// Función para actualizar la tabla del carrito
function updateCartTable() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const cartTableBody = document.getElementById("cartTableBody");
  cartTableBody.innerHTML = ""; // Limpiar la tabla

  // Iterar sobre los productos en el carrito y mostrarlos
  cart.forEach((product, index) => {
    const row = document.createElement("tr");
    row.classList.add("cart-item-row");

    const tdIndex = document.createElement("td");
    tdIndex.textContent = index + 1;
    row.appendChild(tdIndex);

    const tdName = document.createElement("td");
    tdName.textContent = product.product_name;
    row.appendChild(tdName);

    const tdQuantity = document.createElement("td");
    tdQuantity.textContent = product.quantity;
    row.appendChild(tdQuantity);

    const tdPrice = document.createElement("td");
    tdPrice.textContent = `₡ ${product.price}`;
    row.appendChild(tdPrice);

    const tdDelete = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.classList.add("delete-btn");
    deleteButton.dataset.id = product.product_id;
    tdDelete.appendChild(deleteButton);
    row.appendChild(tdDelete);

    cartTableBody.appendChild(row);
  });

  updateCartSummary(); // Actualizar el resumen después de actualizar la tabla
  addDeleteButtonEvent(); // Añadir el evento de eliminación
}

// Función para manejar el evento de eliminación de un producto
function addDeleteButtonEvent() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.currentTarget.dataset.id;
      removeFromCart(productId);
    });
  });
}

// Función para eliminar un producto del carrito
function removeFromCart(productId) {
  fetch(
    `/removeProduct/${productId}?cart=${encodeURIComponent(
      localStorage.getItem("cart") || "[]"
    )}`,
    {
      method: "DELETE",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Guardar el carrito actualizado en el localStorage
        localStorage.setItem("cart", JSON.stringify(data.cart));
        updateCartTable(); // Actualizar la tabla después de la eliminación
        updateCartSummary(); // Actualizar el resumen después de la eliminación
      } else {
        alert("Error al eliminar el producto del carrito");
      }
    })
    .catch((error) => {
      alert("Hubo un error al eliminar el producto");
      console.error(error);
    });
}

// Función para actualizar el resumen del carrito
function updateCartSummary() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // Calcular el total sin IVA
  const total = cart.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const iva = total * 0.1; // IVA al 10%
  const totalWithIVA = total + iva;

  // Calcular la cantidad total de productos
  const totalQuantity = cart.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  // Actualizar la cantidad total de productos
  document.getElementById(
    "productCount"
  ).textContent = `Cantidad de productos: ${totalQuantity}`;

  // Actualizar el resumen con IVA y el total
  document.getElementById("ivaAmount").textContent = `IVA (10%): ₡ ${iva.toFixed(
    2
  )}`;
  document.getElementById(
    "totalAmountText"
  ).textContent = `Total: ₡ ${totalWithIVA}`;
}

// Función para asignar el evento a los botones de agregar al carrito
function attachAddToCartEvent() {
  document.querySelectorAll(".btn-container").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.currentTarget.dataset.id;
      addToCart(productId);
    });
  });
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  attachAddToCartEvent(); // Asigna el evento a los botones de agregar al carrito
  updateCartTable(); // Ejecutar la función para actualizar la tabla del carrito al cargar la página
});
