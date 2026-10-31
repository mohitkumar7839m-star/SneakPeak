require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const mongoose = require("mongoose");
const Product = require("./models/Product");

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const products = await Product.find({}, "name stock sizes price");

    console.log("Products and current stock:");
    console.log(JSON.stringify(products, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkProducts();
