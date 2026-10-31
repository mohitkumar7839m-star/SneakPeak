
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Checkout using Cash on Delivery
const checkout = async (req, res) => {
  const deductedStock = [];

  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    const requiredFields = [
      "fullName",
      "phone",
      "address",
      "city",
      "state",
      "pincode"
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        field =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        message: "Complete shipping address is required"
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty"
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Validate products and calculate prices from the database.
    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          message: "A product in your cart no longer exists"
        });
      }

      if (!product.sizes.includes(item.size)) {
        return res.status(400).json({
          message: `Size ${item.size} is unavailable for ${product.name}`
        });
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid cart quantity"
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image || "",
        size: item.size,
        quantity: item.quantity,
        price: product.price
      });

      totalAmount += product.price * item.quantity;
    }

    // Atomically reserve stock so concurrent checkouts
    // cannot deduct more than the available quantity.
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
          sizes: item.size
        },
        {
          $inc: { stock: -item.quantity }
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error(
          `Insufficient stock for ${item.name}, size ${item.size}`
        );
      }

      deductedStock.push({
        productId: item.product,
        quantity: item.quantity
      });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Placed"
    });

    // Clear the cart only after the order is saved.
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    // Compensate for stock deductions if checkout fails.
    for (const item of deductedStock.reverse()) {
      try {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } }
        );
      } catch (rollbackError) {
        console.error("Stock rollback failed:", rollbackError.message);
      }
    }

    const stockError = error.message.startsWith("Insufficient stock");

    return res.status(stockError ? 409 : 500).json({
      message: stockError
        ? error.message
        : "Checkout failed",
      error: error.message
    });
  }
};

// Get logged-in customer's order history
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

// Get a single order belonging to the logged-in customer
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch order",
      error: error.message
    });
  }
};

// Cancel an order that has not progressed beyond Placed
const cancelOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        user: req.user.id,
        orderStatus: "Placed"
      },
      {
        $set: { orderStatus: "Cancelled" }
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        message: "Order not found or can no longer be cancelled"
      });
    }

    // Restore stock for a successfully cancelled order.
    for (const item of order.items) {
      const restored = await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } }
      );

      if (restored.matchedCount === 0) {
        console.error("Could not restore stock for:", item.product);
      }
    }

    return res.status(200).json({
      message: "Order cancelled successfully",
      order
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel order",
      error: error.message
    });
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder
};
