
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus
} = require("../controllers/orderController");

router.post("/checkout", authMiddleware, checkout);
router.get("/my-orders", authMiddleware, getMyOrders);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  getAllOrders
);

router.get(
  "/admin/:orderId",
  authMiddleware,
  adminMiddleware,
  getAdminOrderById
);

router.patch(
  "/admin/:orderId/status",
  authMiddleware,
  adminMiddleware,
  updateOrderStatus
);

router.get("/:orderId", authMiddleware, getOrderById);
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);

module.exports = router;
