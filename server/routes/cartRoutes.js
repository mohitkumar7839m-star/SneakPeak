
const express = require("express");
const router = express.Router();

const { getCart, addToCart } = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

// Get the logged-in user's cart
router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);

// Temporary test route
router.get("/test", (req, res) => {
  res.json({
    message: "Cart routes are working"
  });
});

module.exports = router;
