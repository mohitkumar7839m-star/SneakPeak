
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get logged-in user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId })
      .populate("items.product");

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: []
      });
    }

    return res.status(200).json({
      message: "Cart fetched successfully",
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message
    });
  }
};

// Add product to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size } = req.body;
    const quantity = req.body.quantity ?? 1;
    const numericSize = Number(size);

    if (
      !productId ||
      size === undefined ||
      size === null ||
      size === ""
    ) {
      return res.status(400).json({
        message: "Product ID and size are required"
      });
    }

    if (!Number.isFinite(numericSize) || numericSize <= 0) {
      return res.status(400).json({
        message: "Invalid shoe size"
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const product = await Product.findById(productId);

    if (!product || product.isArchived) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const selectedSize = product.sizes.find(
      s => s.size === numericSize
    );

    if (!selectedSize) {
      return res.status(400).json({
        message: "Selected size is not available"
      });
    }

    if (selectedSize.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    const existingItem = cart.items.find(
      item =>
        item.product.toString() === productId &&
        item.size === numericSize
    );

    if (existingItem) {
      if (existingItem.quantity + quantity > selectedSize.stock) {
        return res.status(400).json({
          message: "Requested quantity exceeds available stock"
        });
      }

      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        size: numericSize,
        quantity
      });
    }

    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json({
      message: "Product added to cart successfully",
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add product to cart",
      error: error.message
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    const product = await Product.findById(item.product);

    if (!product || product.isArchived) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const selectedSize = product.sizes.find(
      s => s.size === Number(item.size)
    );

    if (!selectedSize) {
      return res.status(400).json({
        message: "Selected size is no longer available"
      });
    }

    if (quantity > selectedSize.stock) {
      return res.status(400).json({
        message: "Insufficient stock"
      });
    }

    item.quantity = quantity;

    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json({
      message: "Cart quantity updated successfully",
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update cart item",
      error: error.message
    });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    item.deleteOne();

    await cart.save();
    await cart.populate("items.product");

    return res.status(200).json({
      message: "Item removed from cart successfully",
      cart
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove cart item",
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
};
