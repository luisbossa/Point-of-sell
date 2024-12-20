$(document).ready(function () {
  // Inicializar el datepicker de jQuery UI en el div
  $("#datepicker").datepicker({
    onSelect: function (dateText, inst) {
      // Convertir la fecha seleccionada (dateText) a un objeto Date
      var selectedDate = new Date(dateText);

      // Obtener el año, mes y día de la fecha seleccionada
      var year = selectedDate.getFullYear();
      var month = selectedDate.toLocaleString("default", { month: "long" }); // Mes en formato largo
      var day = selectedDate.getDate();

      // Actualizar el contenido del título dinámicamente
      $(".sales-info-heading").html(
        "Del periodo " + year + ", " + month + ", " + day + "&nbsp;"
      );
    },
  });
});
