const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { updateStock } = require("../controllers/inventoryController");

const {
  getProducts,
  getAdminProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  archiveProduct
} = require("../controllers/productController");

router.get("/search", searchProducts);
router.get("/all", getProducts);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAdminProducts
);

router.get("/:id", getProductById);

router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);
router.patch("/:id/archive", authMiddleware, adminMiddleware, archiveProduct);
router.patch("/:id/stock", authMiddleware, adminMiddleware, updateStock);

module.exports = router;