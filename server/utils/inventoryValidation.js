
function validateStockUpdate(size, stock) {
  if (
    typeof size !== "number" ||
    !Number.isFinite(size) ||
    size <= 0
  ) {
    return "Enter a valid shoe size";
  }

  if (
    typeof stock !== "number" ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return "Stock must be a whole number of zero or more";
  }

  return null;
}

module.exports = validateStockUpdate;
