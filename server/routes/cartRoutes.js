
const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
} = require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put("/:itemId", authMiddleware, updateCartItem);
router.delete("/:itemId", authMiddleware, removeCartItem);

router.get("/test", (req, res) => {
  res.json({ message: "Cart routes are working" });
});

module.exports = router;
