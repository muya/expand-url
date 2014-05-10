/**
* function to display alerts using bs-alerts :)
*/
function displayUserAlert(level, message) {
  $(document).trigger("add-alerts", [{
    'message': message,
    'priority': level
  }]);
}
