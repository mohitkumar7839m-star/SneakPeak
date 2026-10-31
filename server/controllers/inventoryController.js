const Product = require("../models/Product");
const validateStockUpdate = require("../utils/inventoryValidation");

const LOW_STOCK_THRESHOLD = 5;

function isValidId(id) {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

function handleError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, message: error.message });
  }

  console.error("Inventory API error:", error);
  return res.status(500).json({ success: false, message: "Unable to complete inventory request" });
}

function inventoryView(product, sizes = product.sizes) {
  return {
    productId: product._id,
    name: product.name,
    brand: product.brand,
    sizes
  };
}

exports.getInventory = async (req, res) => {
  try {
    const products = await Product.find({ isArchived: false }).select("name brand sizes");
    const inventory = products.map(product => inventoryView(product));
    return res.json({ success: true, total: inventory.length, inventory });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getInventoryByProduct = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, isArchived: false })
      .select("name brand sizes");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, inventory: inventoryView(product) });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateInventory = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
    ? req.body
    : {};
  const updates = Array.isArray(body.sizes)
    ? body.sizes
    : body.size !== undefined && body.stock !== undefined
      ? [{ size: body.size, stock: body.stock }]
      : null;
  if (!updates || updates.length === 0) {
    return res.status(400).json({ success: false, message: "sizes must be a non-empty array" });
  }

  const seenSizes = new Set();
  for (const item of updates) {
    const stockError = item ? validateStockUpdate(item.size, item.stock) : "Invalid stock update";
    if (stockError) {
      return res.status(400).json({
        success: false,
        message: stockError
      });
    }
    if (seenSizes.has(item.size)) {
      return res.status(400).json({ success: false, message: "Each shoe size can only be updated once" });
    }
    seenSizes.add(item.size);
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, isArchived: false });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    for (const item of updates) {
      const sizeEntry = product.sizes.find(existing => existing.size === item.size);
      if (!sizeEntry) {
        return res.status(400).json({ success: false, message: `Size ${item.size} is not listed for this product` });
      }
      sizeEntry.stock = item.stock;
    }

    await product.save();
    return res.json({
      success: true,
      message: "Inventory updated successfully",
      inventory: inventoryView(product)
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateStock = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
    ? req.body
    : {};
  const { size, change, operation, quantity, stock } = body;
  const sizeError = validateStockUpdate(size, 0);
  if (sizeError) {
    return res.status(400).json({ success: false, message: sizeError });
  }

  let stockChange;
  let absoluteStock;
  if (stock !== undefined) {
    const stockError = validateStockUpdate(size, stock);
    if (stockError) return res.status(400).json({ success: false, message: stockError });
    absoluteStock = stock;
  } else if (change !== undefined) {
    if (!Number.isInteger(change) || change === 0) {
      return res.status(400).json({ success: false, message: "change must be a non-zero integer" });
    }
    stockChange = change;
  } else if (
    (operation === "increase" || operation === "decrease") &&
    Number.isInteger(quantity) &&
    quantity > 0
  ) {
    stockChange = operation === "increase" ? quantity : -quantity;
  } else {
    return res.status(400).json({
      success: false,
      message: "Provide a non-zero integer change, an increase/decrease quantity, or an absolute stock value"
    });
  }

  try {
    const filter = { _id: req.params.id, isArchived: false, "sizes.size": size };
    const update = absoluteStock !== undefined
      ? { $set: { "sizes.$.stock": absoluteStock } }
      : { $inc: { "sizes.$.stock": stockChange } };

    if (stockChange < 0) {
      filter.sizes = { $elemMatch: { size, stock: { $gte: Math.abs(stockChange) } } };
    }

    const product = await Product.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true
    });
    if (!product) {
      const existing = await Product.findOne({ _id: req.params.id, isArchived: false });
      if (!existing) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      if (!existing.sizes.some(item => item.size === size)) {
        return res.status(404).json({ success: false, message: `Size ${size} is not listed for this product` });
      }
      return res.status(409).json({ success: false, message: "Insufficient stock for this update" });
    }

    return res.json({
      success: true,
      message: "Stock updated successfully",
      inventory: inventoryView(product)
    });
  } catch (error) {
    return handleError(res, error);
  }
};

async function getStockProducts(req, res, isLowStock) {
  try {
    const stockCondition = isLowStock
      ? { $gt: 0, $lte: LOW_STOCK_THRESHOLD }
      : 0;
    const products = await Product.find({
      isArchived: false,
      sizes: { $elemMatch: { stock: stockCondition } }
    }).select("name brand sizes");

    const inventory = products.map(product => {
      const matchingSizes = product.sizes.filter(size => (
        isLowStock
          ? size.stock > 0 && size.stock <= LOW_STOCK_THRESHOLD
          : size.stock === 0
      ));
      return inventoryView(product, matchingSizes);
    });

    return res.json({ success: true, total: inventory.length, inventory });
  } catch (error) {
    return handleError(res, error);
  }
}

exports.getLowStock = (req, res) => getStockProducts(req, res, true);
exports.getOutOfStock = (req, res) => getStockProducts(req, res, false);
