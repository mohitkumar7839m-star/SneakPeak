
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { updateStock } = require("../controllers/inventoryController");

const {
  getProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  archiveProduct
} = require("../controllers/productController");

// Public routes
router.get("/search", searchProducts);
router.get("/all", getProducts);
router.get("/:id", getProductById);

// Product mutations require an administrator.
router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.patch("/:id/archive", authMiddleware, adminMiddleware, archiveProduct);
router.patch("/:id/stock", authMiddleware, adminMiddleware, updateStock);

module.exports = router;
