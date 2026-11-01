
const User = require("../models/User");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.getCustomers = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const filter = { role: "customer" };

    if (search) {
      const safeSearch = escapeRegex(search);

      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } }
      ];
    }

    const total = await User.countDocuments(filter);

    const customers = await User.find(filter)
      .select("name email phone role createdAt addresses")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const customerList = customers.map((customer) => ({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      role: customer.role,
      createdAt: customer.createdAt,
      addressCount: customer.addresses?.length || 0
    }));

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      customers: customerList
    });
  } catch (error) {
    console.error("Admin customer API error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customers."
    });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID."
      });
    }

    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer"
    })
      .select("name email phone role createdAt addresses")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    return res.status(200).json({
      success: true,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        role: customer.role,
        createdAt: customer.createdAt,
        addresses: (customer.addresses || []).map((address) => ({
          _id: address._id,
          label: address.label,
          fullName: address.fullName,
          phone: address.phone,
          addressLine: address.addressLine,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: address.isDefault
        }))
      }
    });
  } catch (error) {
    console.error("Admin customer detail API error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customer details."
    });
  }
};
