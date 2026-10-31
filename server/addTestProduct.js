require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const mongoose = require("mongoose");
const Product = require("./models/Product");

async function addTestProduct() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const product = await Product.create({
      name: "SneakPeak Test Sneakers",
      description: "Temporary product for testing the Cart API",
      brand: "SneakPeak",
      price: 1999,
      image: "",
      sizes: ["UK 7", "UK 8", "UK 9"],
      stock: 10
    });

    console.log("Test product created successfully.");
    console.log("Product ID:", product._id.toString());
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

addTestProduct();
