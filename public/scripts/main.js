document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("gridContainer");
  const gridContainer2 = document.getElementById("gridContainer2");
  const gridContainer3 = document.getElementById("gridContainer3");
  const nextBtn = document.getElementById("next-btn");
  const backBtn = document.getElementById("back-btn");

  // Inicialmente, solo mostrar el primer contenedor
  gridContainer.style.display = "grid";
  gridContainer2.style.display = "none";
  gridContainer3.style.display = "none";
  gridContainer4.style.display = "none";

  nextBtn.addEventListener("click", function () {
    if (gridContainer.style.display === "grid") {
      // Ocultar gridContainer y mostrar gridContainer2 con animación
      gridContainer.classList.add("hide");
      setTimeout(() => {
        gridContainer.style.display = "none"; // Ocultar completamente
        gridContainer2.style.display = "grid"; // Mostrar gridContainer2
        gridContainer2.classList.add("show");
        gridContainer2.classList.remove("hide");
      }, 300); // Esperar a que la animación de ocultar se complete
    } else if (gridContainer2.style.display === "grid") {
      // Ocultar gridContainer2 y mostrar gridContainer3 con animación
      gridContainer2.classList.add("hide");
      setTimeout(() => {
        gridContainer2.style.display = "none";
        gridContainer3.style.display = "grid";
        gridContainer3.classList.add("show");
        gridContainer3.classList.remove("hide");
      }, 300);
    } else if (gridContainer3.style.display === "grid") {
      // Ocultar gridContainer2 y mostrar gridContainer3 con animación
      gridContainer2.classList.add("hide");
      setTimeout(() => {
        gridContainer3.style.display = "none";
        gridContainer4.style.display = "grid";
        gridContainer4.classList.add("show");
        gridContainer4.classList.remove("hide");
      }, 300);
      setTimeout(() => {
        nextBtn.style.display = "none"; // Ocultar el botón de siguiente
        backBtn.style.display = "flex"; // Mostrar el botón de atrás
        setTimeout(() => {
          backBtn.classList.remove("hide"); // Animación de desvanecimiento para el botón de atrás
        }, 300);
      }, 300); // Después de que el contenedor se haya ocultado
    }
  });

  backBtn.addEventListener("click", function () {
    if (gridContainer2.style.display === "grid") {
      // Volver a gridContainer desde gridContainer2 con animación
      gridContainer2.classList.add("hide");
      setTimeout(() => {
        gridContainer2.style.display = "none";
        gridContainer.style.display = "grid";
        gridContainer.classList.remove("hide");
        gridContainer.classList.add("show");
      }, 300);
      setTimeout(() => {
        backBtn.style.display = "none";
        nextBtn.style.display = "flex";
      }, 300);
    } else if (gridContainer3.style.display === "grid") {
      // Volver a gridContainer2 desde gridContainer3 con animación
      gridContainer3.classList.add("hide");
      setTimeout(() => {
        gridContainer3.style.display = "none";
        gridContainer2.style.display = "grid";
        gridContainer2.classList.remove("hide");
        gridContainer2.classList.add("show");
      }, 300);
    } else if (gridContainer4.style.display === "grid") {
      // Volver a gridContainer3 desde gridContainer4 con animación
      gridContainer4.classList.add("hide");
      setTimeout(() => {
        gridContainer4.style.display = "none";
        gridContainer3.style.display = "grid";
        gridContainer3.classList.remove("hide");
        gridContainer3.classList.add("show");
      }, 300);
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var button = document.getElementById("next-btn");
  var showButton = button.getAttribute("data-show") === "true";

  if (!showButton) {
    button.style.display = "none";
  }

  var usersBtnsDiv = document.getElementById("users-btns-div");
  var showDiv = usersBtnsDiv.getAttribute("data-show") === "true";

  if (showDiv) {
    usersBtnsDiv.style.display = "none";
  } else {
    usersBtnsDiv.style.display = "";
  }

  var priceElements = document.querySelectorAll(".price");

  priceElements.forEach(function (priceElement) {
    var backgroundColor = priceElement.getAttribute("data-background-color");

    if (backgroundColor) {
      priceElement.style.backgroundColor = backgroundColor;
    }
  });
});
