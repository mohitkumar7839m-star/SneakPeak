
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      revenueResult,
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),

      Product.countDocuments({ isArchived: { $ne: true } }),

      Order.countDocuments(),

      Order.aggregate([
        { $match: { orderStatus: "Delivered" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]),

      Order.countDocuments({
        orderStatus: {
          $in: ["Placed", "Confirmed", "Processing", "Shipped"]
        }
      }),

      Product.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $unwind: "$sizes" },
        {
          $match: {
            "sizes.stock": { $gt: 0, $lte: 5 }
          }
        },
        { $group: { _id: "$_id" } },
        { $count: "total" }
      ]),

      Product.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $unwind: "$sizes" },
        {
          $match: {
            "sizes.stock": 0
          }
        },
        { $group: { _id: "$_id" } },
        { $count: "total" }
      ]),

      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("user items totalAmount orderStatus createdAt")
        .lean()
    ]);

    const revenue = revenueResult[0]?.total || 0;

    const formattedOrders = recentOrders.map((order) => ({
      id: order._id,
      customer: order.user?.name || "Unknown Customer",
      email: order.user?.email || "",
      product: order.items?.map((item) => item.name).join(", ") || "No items",
      amount: order.totalAmount,
      status: order.orderStatus,
      createdAt: order.createdAt
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalRevenue: revenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        lowStockProducts: lowStockProducts[0]?.total || 0,
        outOfStockProducts: outOfStockProducts[0]?.total || 0
      },
      recentOrders: formattedOrders
    });
  } catch (error) {
    console.error("Admin dashboard API error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve dashboard statistics."
    });
  }
};