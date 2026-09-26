document.addEventListener("DOMContentLoaded", () => {
  function togglePassword(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (!input || !button) return;

    const visible = input.type === "text";

    input.type = visible ? "password" : "text";

    button.classList.toggle("is-visible", !visible);

    button.setAttribute(
      "aria-label",
      visible ? "Mostrar contraseña" : "Ocultar contraseña",
    );

    button.setAttribute(
      "title",
      visible ? "Mostrar contraseña" : "Ocultar contraseña",
    );
  }

  const passwords = [
    ["pass", "togglePassShow"],
    ["currentPass", "toggleCurrentPassShow"],
    ["newPass", "toggleNewPassShow"],
    ["repeatPass", "toggleRepeatPassShow"],
  ];

  passwords.forEach(([inputId, buttonId]) => {
    const button = document.getElementById(buttonId);

    if (!button) return;

    button.addEventListener("click", () => {
      togglePassword(inputId, buttonId);
    });
  });
});
