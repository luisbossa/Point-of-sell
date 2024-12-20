// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Obtener todos los botones de eliminación
  const deleteButtons = document.querySelectorAll(".delete-btn");

  // Agregar un listener de clic a cada botón
  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id"); // Obtener el ID del producto

      // Mostrar el popup de SweetAlert2 para confirmar la eliminación
      Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Este producto será eliminado permanentemente!",
        icon: "warning",
        iconColor: "#d33",
        showCancelButton: true,
        confirmButtonText: "ELIMINAR",
        cancelButtonText: "CANCELAR",
      }).then((result) => {
        // Si el usuario confirma la eliminación
        if (result.isConfirmed) {
          // Hacer una solicitud AJAX para eliminar el producto
          fetch("/deleteProducts/" + productId, {
            // Cambio aquí: '/deleteProducts/' en vez de '/removeProduct/'
            method: "DELETE", // Usamos el método DELETE
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json()) // Suponemos que el servidor responde con JSON
            .then((data) => {
              if (data.success) {
                // Mostrar mensaje de éxito y actualizar la página
                Swal.fire(
                  "Eliminado!",
                  "El producto ha sido eliminado.",
                  "success"
                ).then(() => {
                  // Eliminar la fila de la tabla (si es necesario)
                  const row = button.closest("tr");
                  row.remove();
                });
              } else {
                Swal.fire(
                  "Error",
                  "Hubo un problema al eliminar el producto.",
                  "error"
                );
              }
            })
            .catch((err) => {
              Swal.fire(
                "Error",
                "Hubo un problema al realizar la solicitud.",
                "error"
              );
            });
        }
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      // Captura los datos del producto desde los atributos data-*
      const productId = this.getAttribute("data-id");
      const barcode = this.getAttribute("data-barcode");
      const productName = this.getAttribute("data-product_name");
      const categoryId = this.getAttribute("data-category_id");
      const price = this.getAttribute("data-price");

      // Realiza la solicitud para obtener las categorías y el producto
      fetch(`/editProduct/${productId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success === false) {
            Swal.fire(
              "Error",
              "No se pudo cargar el producto o las categorías.",
              "error"
            );
            return;
          }

          const product = data.product;
          const categories = data.categories;

          Swal.fire({
            title: "Editar producto",
            html: `
                <form id="editForm">
                  <label for="barcode">Código de barras:</label>
                  <input type="text" id="barcode" value="${barcode}" class="swal2-input" required>
  
                  <label for="product_name">Nombre del producto:</label>
                  <input type="text" id="product_name" value="${productName}" class="swal2-input" required>
  
                  <label for="category">Categoría:</label>
                  <select id="category" class="swal2-input" required>
                    ${categories
                      .map(
                        (category) => `
                          <option value="${category.category_id}" ${
                          category.category_id == categoryId ? "selected" : ""
                        }>
                            ${category.category_name}
                          </option>
                        `
                      )
                      .join("")}
                  </select>
  
                  <label for="price">Precio:</label>
                  <input type="number" id="price" value="${price}" class="swal2-input" required>
                </form>
              `,
            showCancelButton: true,
            confirmButtonText: "EDITAR AHORA",
            cancelButtonText: "CANCELAR",
            preConfirm: () => {
              const barcode = document.getElementById("barcode").value;
              const productName = document.getElementById("product_name").value;
              const categoryId = document.getElementById("category").value;
              const price = document.getElementById("price").value;

              const updatedProduct = {
                barcode,
                product_name: productName,
                category_id: categoryId,
                price,
              };

              return fetch(`/updateProduct/${productId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProduct),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    // Buscar la fila correspondiente al producto en la tabla
                    const productRow = document.querySelector(
                      `tr[data-id="${productId}"]`
                    );

                    if (productRow) {
                      // Actualizar los valores en la fila
                      productRow.querySelector(".barcode").textContent =
                        barcode;
                      productRow.querySelector(".product_name").textContent =
                        productName;

                      // Buscar el nombre de la categoría desde el array de categorías
                      const updatedCategory = categories.find(
                        (c) => c.category_id === categoryId
                      );
                      const updatedCategoryName = updatedCategory
                        ? updatedCategory.category_name
                        : "Desconocida";
                      productRow.querySelector(".category").textContent =
                        updatedCategoryName;

                      productRow.querySelector(".price").textContent = price;
                    }
                    // Recarga la página después de actualizar
                    location.reload(); // Recarga la página
                  } else {
                    Swal.fire(
                      "Error",
                      "Hubo un problema al actualizar el producto.",
                      "error"
                    );
                  }
                })
                .catch((err) => {
                  Swal.fire(
                    "Error",
                    "Hubo un problema al realizar la solicitud.",
                    "error"
                  );
                });
            },
          });
        })
        .catch((err) => {
          Swal.fire("Error", "Hubo un problema al cargar los datos.", "error");
        });
    });
  });
});









