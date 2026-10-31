const Product = require("../models/Product");

const activeProductFilter = { isArchived: false };

function isValidId(id) {
  return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getUserId(req) {
  return req.user && (req.user.id || req.user._id || req.user.userId || req.user.sub);
}

function validateProductFields(body, creating = false) {
  const requiredTextFields = ["name", "brand", "description"];

  for (const field of requiredTextFields) {
    if (
      (creating || body[field] !== undefined) &&
      (typeof body[field] !== "string" || !body[field].trim())
    ) {
      return `${field} is required`;
    }
  }

  for (const field of ["category", "color"]) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return `${field} must be a string`;
    }
  }

  if (body.images !== undefined && (
    !Array.isArray(body.images) ||
    !body.images.every(image => typeof image === "string")
  )) {
    return "Images must be an array of strings";
  }

  if (creating && (!Array.isArray(body.sizes) || body.sizes.length === 0)) {
    return "Add at least one size with price and stock";
  }

  if (body.sizes !== undefined) {
    if (!Array.isArray(body.sizes) || body.sizes.length === 0) {
      return "Add at least one size with price and stock";
    }

    const seenSizes = new Set();
    for (const item of body.sizes) {
      if (
        !item ||
        typeof item.size !== "number" ||
        !Number.isFinite(item.size) ||
        item.size <= 0 ||
        typeof item.price !== "number" ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isInteger(item.stock) ||
        item.stock < 0
      ) {
        return "Each size needs a valid size, non-negative price and whole-number stock";
      }

      if (seenSizes.has(item.size)) {
        return "Each shoe size can only be listed once";
      }
      seenSizes.add(item.size);
    }
  }

  return null;
}

function handleError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: "A conflicting record already exists" });
  }

  console.error("Product API error:", error);
  return res.status(500).json({ success: false, message: "Unable to complete product request" });
}

exports.getProducts = async (req, res) => {
  try {
    const {
      q,
      search,
      brand,
      category,
      color,
      size,
      minPrice,
      maxPrice,
      sort = "newest",
      page = "1",
      limit = "10"
    } = req.query;

    const filter = { ...activeProductFilter };
    const query = typeof q === "string" ? q.trim() : typeof search === "string" ? search.trim() : "";

    if (query) {
      const expression = new RegExp(escapeRegex(query), "i");
      filter.$or = [
        { name: expression },
        { brand: expression },
        { category: expression }
      ];
    }

    for (const [field, value] of Object.entries({ brand, category, color })) {
      if (value !== undefined) {
        if (typeof value !== "string" || !value.trim()) {
          return res.status(400).json({ success: false, message: `Invalid ${field}` });
        }
        filter[field] = new RegExp(`^${escapeRegex(value.trim())}$`, "i");
      }
    }

    const sizeFilter = {};
    if (size !== undefined) {
      const selectedSize = Number(size);
      if (!Number.isFinite(selectedSize) || selectedSize <= 0) {
        return res.status(400).json({ success: false, message: "Invalid size" });
      }
      sizeFilter.size = selectedSize;
      sizeFilter.stock = { $gt: 0 };
    }

    const priceFilter = {};
    for (const [field, operator] of [["minPrice", "$gte"], ["maxPrice", "$lte"]]) {
      if (req.query[field] !== undefined) {
        const price = Number(req.query[field]);
        if (!Number.isFinite(price) || price < 0) {
          return res.status(400).json({ success: false, message: `Invalid ${field}` });
        }
        priceFilter[operator] = price;
      }
    }

    if (
      priceFilter.$gte !== undefined &&
      priceFilter.$lte !== undefined &&
      priceFilter.$gte > priceFilter.$lte
    ) {
      return res.status(400).json({
        success: false,
        message: "Minimum price cannot exceed maximum price"
      });
    }
    if (Object.keys(priceFilter).length) sizeFilter.price = priceFilter;
    if (size !== undefined || Object.keys(priceFilter).length) {
      filter.sizes = { $elemMatch: sizeFilter };
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      price_asc: { "sizes.price": 1 },
      price_desc: { "sizes.price": -1 },
      name_asc: { name: 1 }
    };
    if (typeof sort !== "string" || !Object.prototype.hasOwnProperty.call(sortOptions, sort)) {
      return res.status(400).json({ success: false, message: "Invalid sort option" });
    }

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ success: false, message: "Page must be a positive integer" });
    }
    if (!Number.isInteger(pageSize) || pageSize < 1) {
      return res.status(400).json({ success: false, message: "Limit must be a positive integer" });
    }
    const boundedPageSize = Math.min(50, pageSize);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions[sort])
        .skip((pageNumber - 1) * boundedPageSize)
        .limit(boundedPageSize),
      Product.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / boundedPageSize),
      products
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.searchProducts = async (req, res) => {
  if (typeof req.query.q !== "string" || !req.query.q.trim()) {
    return res.status(400).json({ success: false, message: "Search query q is required" });
  }
  return exports.getProducts(req, res);
};

exports.getProductById = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, ...activeProductFilter });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, product });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.createProduct = async (req, res) => {
  const userId = getUserId(req);
  if (!isValidId(userId)) {
    return res.status(401).json({ success: false, message: "Authenticated user ID is missing or invalid" });
  }

  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
    ? req.body
    : {};
  const validationError = validateProductFields(body, true);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const productFields = {};
    for (const field of ["name", "brand", "description", "images", "sizes", "category", "color"]) {
      if (body[field] === undefined) continue;
      productFields[field] = body[field];
      if (typeof productFields[field] === "string") productFields[field] = productFields[field].trim();
    }
    const product = await Product.create({ ...productFields, sellerId: userId });
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateProduct = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
    ? req.body
    : {};
  const allowedFields = ["name", "brand", "description", "images", "sizes", "category", "color"];
  const fields = Object.keys(body);
  if (!fields.length || fields.some(field => !allowedFields.includes(field))) {
    return res.status(400).json({ success: false, message: "No valid product fields provided" });
  }

  const validationError = validateProductFields(body);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, ...activeProductFilter });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    for (const field of fields) {
      product[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
    await product.save();
    return res.json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.deleteProduct = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, ...activeProductFilter });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    product.isArchived = true;
    await product.save();
    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return handleError(res, error);
  }
};

exports.archiveProduct = exports.deleteProduct;
