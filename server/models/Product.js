
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"]
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true
    },

    category: {
      type: String,
      trim: true
    },

    color: {
      type: String,
      trim: true
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },

    images: {
      type: [String],
      default: []
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Seller ID is required"],
      ref: "User"
    },

    sizes: {
      type: [
        {
          size: {
            type: Number,
            required: true,
            min: [1, "Size must be greater than zero"]
          },

          price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"]
          },

          stock: {
            type: Number,
            required: true,
            min: [0, "Stock cannot be negative"],
            validate: {
              validator: Number.isInteger,
              message: "Stock must be a whole number"
            },
            default: 0
          }
        }
      ],

      validate: {
        validator: sizes => Array.isArray(sizes) && sizes.length > 0,
        message: "At least one shoe size is required"
      }
    },

    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
