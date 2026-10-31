
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Checkout using Cash on Delivery
const checkout = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;
    let createdOrder;

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

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: userId }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty");
      }

      const orderItems = [];
      let totalAmount = 0;

      // Validate products and calculate prices
      for (const item of cart.items) {
        const product = await Product.findById(item.product).session(session);

        if (!product || product.isArchived) {
          throw new Error("A product in your cart is unavailable");
        }

        const selectedSize = product.sizes.find(
          s => s.size === Number(item.size)
        );

        if (!selectedSize) {
          throw new Error(
            `Size ${item.size} is unavailable for ${product.name}`
          );
        }

        if (
          !Number.isInteger(item.quantity) ||
          item.quantity < 1
        ) {
          throw new Error("Invalid cart quantity");
        }

        if (selectedSize.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}, size ${item.size}`
          );
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          size: selectedSize.size,
          quantity: item.quantity,
          price: selectedSize.price
        });

        totalAmount += selectedSize.price * item.quantity;
      }

      // Deduct stock from the selected size only
      for (const item of orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            sizes: {
              $elemMatch: {
                size: item.size,
                stock: { $gte: item.quantity }
              }
            }
          },
          {
            $inc: {
              "sizes.$.stock": -item.quantity
            }
          },
          {
            new: true,
            session
          }
        );

        if (!updatedProduct) {
          throw new Error(
            `Insufficient stock for ${item.name}, size ${item.size}`
          );
        }
      }

      const orders = await Order.create(
        [{
          user: userId,
          items: orderItems,
          shippingAddress,
          totalAmount,
          paymentMethod: "COD",
          paymentStatus: "Pending",
          orderStatus: "Placed"
        }],
        { session }
      );

      createdOrder = orders[0];

      // Clear cart after successful order creation
      cart.items = [];
      await cart.save({ session });
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order: createdOrder
    });

  } catch (error) {
    const isClientError =
      error.message === "Your cart is empty" ||
      error.message.startsWith("Insufficient stock") ||
      error.message.startsWith("Size ") ||
      error.message.startsWith("A product") ||
      error.message === "Invalid cart quantity";

    return res.status(isClientError ? 400 : 500).json({
      message: isClientError ? error.message : "Checkout failed",
      error: error.message
    });

  } finally {
    await session.endSession();
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


// Get a single order belonging to logged-in customer
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
  const session = await mongoose.startSession();

  try {
    if (!mongoose.isValidObjectId(req.params.orderId)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    let cancelledOrder;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: req.params.orderId,
        user: req.user.id,
        orderStatus: "Placed"
      }).session(session);

      if (!order) {
        throw new Error(
          "Order not found or can no longer be cancelled"
        );
      }

      // Restore stock to the correct shoe size
      for (const item of order.items) {
        const restored = await Product.updateOne(
          {
            _id: item.product,
            sizes: {
              $elemMatch: {
                size: item.size
              }
            }
          },
          {
            $inc: {
              "sizes.$.stock": item.quantity
            }
          },
          { session }
        );

        if (restored.matchedCount === 0) {
          throw new Error(
            `Could not restore stock for ${item.name}, size ${item.size}`
          );
        }
      }

      order.orderStatus = "Cancelled";
      await order.save({ session });

      cancelledOrder = order;
    });

    return res.status(200).json({
      message: "Order cancelled successfully",
      order: cancelledOrder
    });

  } catch (error) {
    const isClientError =
      error.message.startsWith("Order not found");

    return res.status(isClientError ? 400 : 500).json({
      message: error.message,
      error: error.message
    });

  } finally {
    await session.endSession();
  }
};


module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
  cancelOrder
};
