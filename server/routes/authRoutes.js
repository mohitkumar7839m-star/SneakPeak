
const express = require("express");

const {
  registerUser,
  loginUser,
  changePassword,
  forgotPassword
} = require("../controllers/authController");

const {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.patch("/change-password", authMiddleware, changePassword);
router.patch("/forgot-password", forgotPassword);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.post("/addresses", authMiddleware, addAddress);
router.put("/addresses/:addressId", authMiddleware, updateAddress);
router.delete("/addresses/:addressId", authMiddleware, deleteAddress);
router.patch("/addresses/:addressId/default", authMiddleware, setDefaultAddress);


module.exports = router;
