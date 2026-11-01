
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  getDashboardStats
} = require("../controllers/adminDashboardController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/", getDashboardStats);

module.exports = router;
