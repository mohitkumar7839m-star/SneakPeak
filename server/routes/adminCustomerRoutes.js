const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getCustomers,
  getCustomerById
} = require("../controllers/adminCustomerController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", getCustomers);
router.get("/:id", getCustomerById);

module.exports = router;