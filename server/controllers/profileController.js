const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile"
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 60
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 60 characters"
        });
      }
    }

    if (phone !== undefined) {
      if (
        typeof phone !== "string" ||
        (phone.trim() && !/^\+?[\d\s-]{10,15}$/.test(phone.trim()))
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid phone number"
        });
      }
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: await User.findById(user._id).select("-password")
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile"
    });
  }
};

const validateAddress = (address) => {
  const requiredFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "pincode"
  ];

  for (const field of requiredFields) {
    if (
      typeof address[field] !== "string" ||
      !address[field].trim()
    ) {
      return `${field} is required`;
    }
  }

  if (!/^\+?[\d\s-]{10,15}$/.test(address.phone.trim())) {
    return "Please enter a valid phone number";
  }

  if (!/^\d{6}$/.test(address.pincode.trim())) {
    return "Please enter a valid 6-digit pincode";
  }

  if (
    address.label !== undefined &&
    !["Home", "Work", "Other"].includes(address.label)
  ) {
    return "Address label must be Home, Work or Other";
  }

  return null;
};

const addAddress = async (req, res) => {
  try {
    const errorMessage = validateAddress(req.body);

    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const shouldBeDefault =
      user.addresses.length === 0 || req.body.isDefault === true;

    if (shouldBeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      label: req.body.label || "Home",
      fullName: req.body.fullName.trim(),
      phone: req.body.phone.trim(),
      addressLine: req.body.addressLine.trim(),
      city: req.body.city.trim(),
      state: req.body.state.trim(),
      pincode: req.body.pincode.trim(),
      isDefault: shouldBeDefault
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("Add address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to add address"
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const errorMessage = validateAddress(req.body);

    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    const fields = [
      "label",
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        address[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    if (req.body.isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = item._id.equals(address._id);
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("Update address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update address"
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    const wasDefault = address.isDefault;

    address.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("Delete address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete address"
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    user.addresses.forEach((item) => {
      item.isDefault = item._id.equals(address._id);
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("Set default address error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update default address"
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};