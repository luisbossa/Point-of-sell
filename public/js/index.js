document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("gridContainer");
  const gridContainer2 = document.getElementById("gridContainer2");
  const gridContainer3 = document.getElementById("gridContainer3");
  const gridContainer4 = document.getElementById("gridContainer4");

  const nextBtn = document.getElementById("next-btn");
  const backBtn = document.getElementById("back-btn");
  const usersBtnsDiv = document.getElementById("users-btns-div");

  const grids = [
    gridContainer,
    gridContainer2,
    gridContainer3,
    gridContainer4,
  ].filter(Boolean);

  let currentPage = 0;
  let isChangingPage = false;

  function showGrid(index, direction = "next") {
    if (!grids[index] || isChangingPage || index === currentPage) {
      return;
    }

    isChangingPage = true;

    const currentGrid = grids[currentPage];
    const nextGrid = grids[index];

    if (currentGrid) {
      currentGrid.classList.remove("show");
      currentGrid.classList.add("hide");

      setTimeout(() => {
        currentGrid.style.display = "none";
      }, 250);
    }

    setTimeout(() => {
      nextGrid.style.display = "grid";
      nextGrid.classList.remove("hide");

      if (direction === "next") {
        nextGrid.classList.add("show");
      } else {
        nextGrid.classList.add("show");
      }

      currentPage = index;
      updatePaginationButtons();

      setTimeout(() => {
        isChangingPage = false;
      }, 300);
    }, 250);
  }

  function updatePaginationButtons() {
    if (!nextBtn || !backBtn) {
      return;
    }

    const lastPage = grids.length - 1;

    if (currentPage === 0) {
      backBtn.style.display = "none";

      const hasNextPage = grids.length > 1 && nextBtn.dataset.show === "true";

      nextBtn.style.display = hasNextPage ? "inline-flex" : "none";
    } else if (currentPage >= lastPage) {
      nextBtn.style.display = "none";
      backBtn.style.display = "inline-flex";
    } else {
      nextBtn.style.display = "inline-flex";
      backBtn.style.display = "inline-flex";
    }

    if (usersBtnsDiv) {
      const hasMoreProducts = nextBtn.dataset.show === "true";

      if (hasMoreProducts) {
        usersBtnsDiv.style.display = "none";
      } else {
        usersBtnsDiv.style.display = "flex";
      }
    }
  }

  grids.forEach((grid, index) => {
    grid.style.display = index === 0 ? "grid" : "none";
    grid.classList.remove("hide");
    grid.classList.toggle("show", index === 0);
  });

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < grids.length - 1) {
        showGrid(currentPage + 1, "next");
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (currentPage > 0) {
        showGrid(currentPage - 1, "back");
      }
    });
  }

  const priceElements = document.querySelectorAll(".price");

  priceElements.forEach((priceElement) => {
    const backgroundColor = priceElement.dataset.backgroundColor;

    if (backgroundColor) {
      priceElement.style.backgroundColor = backgroundColor;
    }
  });

  updatePaginationButtons();
});
