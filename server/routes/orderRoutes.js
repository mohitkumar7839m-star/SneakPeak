
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder
} = require("../controllers/orderController");

router.post("/checkout", authMiddleware, checkout);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:orderId", authMiddleware, getOrderById);
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);

module.exports = router;
