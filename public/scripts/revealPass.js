document.addEventListener("DOMContentLoaded", function () {
  function togglePasswordVisibility(inputId, showIconId, hideIconId) {
    const passwordField = document.getElementById(inputId);
    const showIcon = document.getElementById(showIconId);
    const hideIcon = document.getElementById(hideIconId);

    const currentType = passwordField.type;
    passwordField.type = currentType === "password" ? "text" : "password";

    if (passwordField.type === "password") {
      showIcon.style.display = "block";
      hideIcon.style.display = "none";
    } else {
      showIcon.style.display = "none";
      hideIcon.style.display = "block";
    }
  }

  const toggleCurrentPassShow = document.getElementById(
    "toggleCurrentPassShow"
  );
  const toggleCurrentPassHide = document.getElementById(
    "toggleCurrentPassHide"
  );
  if (toggleCurrentPassShow && toggleCurrentPassHide) {
    toggleCurrentPassShow.addEventListener("click", function () {
      togglePasswordVisibility(
        "currentPass",
        "toggleCurrentPassShow",
        "toggleCurrentPassHide"
      );
    });
    toggleCurrentPassHide.addEventListener("click", function () {
      togglePasswordVisibility(
        "currentPass",
        "toggleCurrentPassShow",
        "toggleCurrentPassHide"
      );
    });
  }

  const toggleNewPassShow = document.getElementById("toggleNewPassShow");
  const toggleNewPassHide = document.getElementById("toggleNewPassHide");
  if (toggleNewPassShow && toggleNewPassHide) {
    toggleNewPassShow.addEventListener("click", function () {
      togglePasswordVisibility(
        "newPass",
        "toggleNewPassShow",
        "toggleNewPassHide"
      );
    });
    toggleNewPassHide.addEventListener("click", function () {
      togglePasswordVisibility(
        "newPass",
        "toggleNewPassShow",
        "toggleNewPassHide"
      );
    });
  }

  const toggleRepeatPassShow = document.getElementById("toggleRepeatPassShow");
  const toggleRepeatPassHide = document.getElementById("toggleRepeatPassHide");
  if (toggleRepeatPassShow && toggleRepeatPassHide) {
    toggleRepeatPassShow.addEventListener("click", function () {
      togglePasswordVisibility(
        "repeatPass",
        "toggleRepeatPassShow",
        "toggleRepeatPassHide"
      );
    });
    toggleRepeatPassHide.addEventListener("click", function () {
      togglePasswordVisibility(
        "repeatPass",
        "toggleRepeatPassShow",
        "toggleRepeatPassHide"
      );
    });
  }
});
