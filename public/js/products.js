document.addEventListener("DOMContentLoaded", function () {
  const deleteButtons = document.querySelectorAll(".pdelete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");

      Swal.fire({
        title: "¿Eliminar producto?",
        text: "Esta acción eliminará el producto permanentemente.",
        icon: "warning",
        iconColor: "#ef5350",
        showCancelButton: true,
        confirmButtonText: "ELIMINAR",
        cancelButtonText: "CANCELAR",
        reverseButtons: true,
      }).then((result) => {
        if (!result.isConfirmed) {
          return;
        }

        fetch("/deleteProducts/" + productId, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              Swal.fire({
                title: "Producto eliminado",
                text: "El producto ha sido eliminado correctamente.",
                icon: "success",
                confirmButtonText: "ACEPTAR",
                confirmButtonColor: "#4f8cff",
              }).then(() => {
                const row = button.closest("tr");

                if (row) {
                  row.remove();
                } else {
                  location.reload();
                }
              });
            } else {
              Swal.fire({
                title: "Error",
                text: "Hubo un problema al eliminar el producto.",
                icon: "error",
                confirmButtonText: "ACEPTAR",
                confirmButtonColor: "#4f8cff",
              });
            }
          })
          .catch(() => {
            Swal.fire({
              title: "Error",
              text: "Hubo un problema al realizar la solicitud.",
              icon: "error",
              confirmButtonText: "ACEPTAR",
              confirmButtonColor: "#4f8cff",
            });
          });
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      const productId = this.getAttribute("data-id");
      const barcode = this.getAttribute("data-barcode");
      const productName = this.getAttribute("data-product_name");
      const categoryId = this.getAttribute("data-category_id");
      const price = this.getAttribute("data-price");

      fetch(`/editProduct/${productId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success === false) {
            Swal.fire({
              title: "Error",
              text: "No se pudo cargar el producto o las categorías.",
              icon: "error",
              confirmButtonText: "ACEPTAR",
              confirmButtonColor: "#4f8cff",
            });
            return;
          }

          const categories = data.categories;

          Swal.fire({
            title: "Editar producto",
            html: `
                            <form id="editForm">
                                <label for="barcode">Código de barras</label>
                                <input
                                    type="text"
                                    id="barcode"
                                    value="${barcode}"
                                    required
                                >

                                <label for="product_name">Nombre del producto</label>
                                <input
                                    type="text"
                                    id="product_name"
                                    value="${productName}"
                                    required
                                >

                                <label for="category">Categoría</label>
                                <select id="category" required>
                                    ${categories
                                      .map(
                                        (category) => `
                                                <option
                                                    value="${category.category_id}"
                                                    ${
                                                      category.category_id ==
                                                      categoryId
                                                        ? "selected"
                                                        : ""
                                                    }
                                                >
                                                    ${category.category_name}
                                                </option>
                                            `,
                                      )
                                      .join("")}
                                </select>

                                <label for="price">Precio</label>
                                <input
                                    type="number"
                                    id="price"
                                    value="${price}"
                                    required
                                >
                            </form>
                        `,
            showCancelButton: true,
            confirmButtonText: "EDITAR AHORA",
            cancelButtonText: "CANCELAR",
            reverseButtons: true,
            preConfirm: () => {
              const updatedProduct = {
                barcode: document.getElementById("barcode").value,
                product_name: document.getElementById("product_name").value,
                category_id: document.getElementById("category").value,
                price: document.getElementById("price").value,
              };

              if (
                !updatedProduct.barcode ||
                !updatedProduct.product_name ||
                !updatedProduct.category_id ||
                !updatedProduct.price
              ) {
                Swal.showValidationMessage(
                  "Todos los campos son obligatorios.",
                );
                return false;
              }

              return fetch(`/updateProduct/${productId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedProduct),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (!data.success) {
                    throw new Error("No se pudo actualizar el producto.");
                  }

                  return data;
                })
                .catch((error) => {
                  Swal.showValidationMessage(error.message);
                });
            },
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "Producto actualizado",
                text: "Los cambios se guardaron correctamente.",
                icon: "success",
                confirmButtonText: "ACEPTAR",
                confirmButtonColor: "#4f8cff",
              }).then(() => {
                location.reload();
              });
            }
          });
        })
        .catch(() => {
          Swal.fire({
            title: "Error",
            text: "Hubo un problema al cargar los datos.",
            icon: "error",
            confirmButtonText: "ACEPTAR",
            confirmButtonColor: "#4f8cff",
          });
        });
    });
  });
});
