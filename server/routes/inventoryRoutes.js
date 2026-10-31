const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getInventory,
  getInventoryByProduct,
  updateInventory,
  updateStock,
  getLowStock,
  getOutOfStock
} = require("../controllers/inventoryController");

router.use(authMiddleware, adminMiddleware);

router.get("/", getInventory);
router.get("/low-stock", getLowStock);
router.get("/out-of-stock", getOutOfStock);
router.get("/:id", getInventoryByProduct);
router.put("/:id", updateInventory);
router.patch("/:id/stock", updateStock);

module.exports = router;
