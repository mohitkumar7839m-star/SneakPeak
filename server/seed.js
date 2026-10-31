
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");

const sellerId = new mongoose.Types.ObjectId();

const products = [
  {
    name: "Air Max 90",
    brand: "Nike",
    description: "Classic everyday sneakers",
    images: ["https://placehold.co/400x300?text=Nike+Air+Max"],
    sellerId,
    sizes: [
      { size: 8, price: 7999, stock: 10 },
      { size: 9, price: 7999, stock: 8 },
      { size: 10, price: 7999, stock: 5 }
    ]
  },
  {
    name: "Air Force 1",
    brand: "Nike",
    description: "White casual sneakers",
    images: ["https://placehold.co/400x300?text=Air+Force+1"],
    sellerId,
    sizes: [
      { size: 8, price: 7499, stock: 6 },
      { size: 9, price: 7499, stock: 7 }
    ]
  },
  {
    name: "Dunk Low",
    brand: "Nike",
    description: "Low-top lifestyle sneakers",
    images: ["https://placehold.co/400x300?text=Dunk+Low"],
    sellerId,
    sizes: [{ size: 9, price: 8299, stock: 4 }]
  },
  {
    name: "Ultraboost",
    brand: "Adidas",
    description: "Comfortable running shoes",
    images: ["https://placehold.co/400x300?text=Ultraboost"],
    sellerId,
    sizes: [
      { size: 8, price: 9999, stock: 5 },
      { size: 9, price: 9999, stock: 3 }
    ]
  },
  {
    name: "Superstar",
    brand: "Adidas",
    description: "Classic shell-toe sneakers",
    images: ["https://placehold.co/400x300?text=Superstar"],
    sellerId,
    sizes: [{ size: 8, price: 5999, stock: 8 }]
  },
  {
    name: "Forum Low",
    brand: "Adidas",
    description: "Retro basketball-inspired sneakers",
    images: ["https://placehold.co/400x300?text=Forum+Low"],
    sellerId,
    sizes: [{ size: 9, price: 6999, stock: 5 }]
  },
  {
    name: "Air 200",
    brand: "Puma",
    description: "Lightweight daily sneakers",
    images: ["https://placehold.co/400x300?text=Puma+Air"],
    sellerId,
    sizes: [{ size: 8, price: 4499, stock: 7 }]
  },
  {
    name: "RS-X",
    brand: "Puma",
    description: "Chunky retro sneakers",
    images: ["https://placehold.co/400x300?text=Puma+RSX"],
    sellerId,
    sizes: [{ size: 9, price: 6999, stock: 4 }]
  },
  {
    name: "574 Core",
    brand: "New Balance",
    description: "Everyday lifestyle sneakers",
    images: ["https://placehold.co/400x300?text=NB+574"],
    sellerId,
    sizes: [{ size: 8, price: 6499, stock: 6 }]
  },
  {
    name: "2002R",
    brand: "New Balance",
    description: "Retro running-inspired sneakers",
    images: ["https://placehold.co/400x300?text=NB+2002R"],
    sellerId,
    sizes: [{ size: 9, price: 10999, stock: 3 }]
  },
  {
    name: "Chuck Taylor",
    brand: "Converse",
    description: "Classic canvas high-tops",
    images: ["https://placehold.co/400x300?text=Converse"],
    sellerId,
    sizes: [{ size: 8, price: 3999, stock: 9 }]
  },
  {
    name: "Old Skool",
    brand: "Vans",
    description: "Skate-inspired casual sneakers",
    images: ["https://placehold.co/400x300?text=Vans+Old+Skool"],
    sellerId,
    sizes: [{ size: 9, price: 4999, stock: 5 }]
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log("12 sample products added successfully!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
