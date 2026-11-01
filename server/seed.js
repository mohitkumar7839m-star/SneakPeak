
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");

const products = [
  {
    name: "Gel-Lyte III",
    brand: "ASICS",
    category: "Lifestyle",
    color: "White / Grey",
    description: "Retro-inspired lifestyle sneakers with a comfortable split tongue and cushioned sole.",
    images: ["https://placehold.co/600x600?text=ASICS+Gel+Lyte+III"],
    sizes: [
      { size: 7, price: 6499, stock: 8 },
      { size: 8, price: 6499, stock: 10 },
      { size: 9, price: 6499, stock: 6 },
      { size: 10, price: 6499, stock: 5 }
    ]
  },
  {
    name: "Air Jordan 1 Low",
    brand: "Nike",
    category: "Lifestyle",
    color: "Black / White",
    description: "An iconic low-top basketball-inspired sneaker for everyday streetwear.",
    images: ["https://placehold.co/600x600?text=Jordan+1+Low"],
    sizes: [
      { size: 7, price: 8999, stock: 5 },
      { size: 8, price: 8999, stock: 8 },
      { size: 9, price: 8999, stock: 7 },
      { size: 10, price: 8999, stock: 4 }
    ]
  },
  {
    name: "Pegasus 41",
    brand: "Nike",
    category: "Running",
    color: "Blue / White",
    description: "Responsive daily running shoes designed for comfortable everyday training.",
    images: ["https://placehold.co/600x600?text=Nike+Pegasus+41"],
    sizes: [
      { size: 7, price: 11995, stock: 6 },
      { size: 8, price: 11995, stock: 8 },
      { size: 9, price: 11995, stock: 5 },
      { size: 10, price: 11995, stock: 4 }
    ]
  },
  {
    name: "Adizero SL 2",
    brand: "Adidas",
    category: "Running",
    color: "White / Orange",
    description: "Lightweight performance running shoes for daily training and road running.",
    images: ["https://placehold.co/600x600?text=Adizero+SL+2"],
    sizes: [
      { size: 7, price: 10999, stock: 7 },
      { size: 8, price: 10999, stock: 6 },
      { size: 9, price: 10999, stock: 8 },
      { size: 10, price: 10999, stock: 3 }
    ]
  },
  {
    name: "Gazelle Indoor",
    brand: "Adidas",
    category: "Lifestyle",
    color: "Green / White",
    description: "A timeless terrace-style sneaker with a suede upper and classic gum sole.",
    images: ["https://placehold.co/600x600?text=Adidas+Gazelle"],
    sizes: [
      { size: 7, price: 9999, stock: 5 },
      { size: 8, price: 9999, stock: 8 },
      { size: 9, price: 9999, stock: 6 },
      { size: 10, price: 9999, stock: 4 }
    ]
  },
  {
    name: "Samba OG",
    brand: "Adidas",
    category: "Streetwear",
    color: "Black / Gum",
    description: "Classic low-profile sneakers with a leather upper and gum rubber outsole.",
    images: ["https://placehold.co/600x600?text=Adidas+Samba+OG"],
    sizes: [
      { size: 7, price: 10999, stock: 8 },
      { size: 8, price: 10999, stock: 7 },
      { size: 9, price: 10999, stock: 5 },
      { size: 10, price: 10999, stock: 4 }
    ]
  },
  {
    name: "Suede Classic",
    brand: "Puma",
    category: "Casual",
    color: "Navy / White",
    description: "Classic suede sneakers with a clean silhouette for everyday casual wear.",
    images: ["https://placehold.co/600x600?text=Puma+Suede"],
    sizes: [
      { size: 7, price: 5499, stock: 8 },
      { size: 8, price: 5499, stock: 6 },
      { size: 9, price: 5499, stock: 7 },
      { size: 10, price: 5499, stock: 4 }
    ]
  },
  {
    name: "Deviate Nitro 3",
    brand: "Puma",
    category: "Running",
    color: "Black / Lime",
    description: "Performance running shoes with responsive cushioning for energetic runs.",
    images: ["https://placehold.co/600x600?text=Puma+Deviate+Nitro"],
    sizes: [
      { size: 7, price: 13999, stock: 4 },
      { size: 8, price: 13999, stock: 7 },
      { size: 9, price: 13999, stock: 5 },
      { size: 10, price: 13999, stock: 3 }
    ]
  },
  {
    name: "1906R",
    brand: "New Balance",
    category: "Streetwear",
    color: "Silver / Black",
    description: "Retro running-inspired sneakers with a modern technical design.",
    images: ["https://placehold.co/600x600?text=NB+1906R"],
    sizes: [
      { size: 7, price: 12999, stock: 4 },
      { size: 8, price: 12999, stock: 6 },
      { size: 9, price: 12999, stock: 5 },
      { size: 10, price: 12999, stock: 3 }
    ]
  },
  {
    name: "9060",
    brand: "New Balance",
    category: "Lifestyle",
    color: "Grey / White",
    description: "Chunky lifestyle sneakers combining retro running inspiration with modern styling.",
    images: ["https://placehold.co/600x600?text=NB+9060"],
    sizes: [
      { size: 7, price: 14999, stock: 5 },
      { size: 8, price: 14999, stock: 7 },
      { size: 9, price: 14999, stock: 6 },
      { size: 10, price: 14999, stock: 3 }
    ]
  },
  {
    name: "Chuck 70 High",
    brand: "Converse",
    category: "Streetwear",
    color: "Black",
    description: "Iconic canvas high-top sneakers with a vintage-inspired finish.",
    images: ["https://placehold.co/600x600?text=Converse+Chuck+70"],
    sizes: [
      { size: 7, price: 5999, stock: 8 },
      { size: 8, price: 5999, stock: 7 },
      { size: 9, price: 5999, stock: 6 },
      { size: 10, price: 5999, stock: 4 }
    ]
  },
  {
    name: "Knu Skool",
    brand: "Vans",
    category: "Streetwear",
    color: "Black / White",
    description: "Bold skate-inspired sneakers with a padded tongue and chunky profile.",
    images: ["https://placehold.co/600x600?text=Vans+Knu+Skool"],
    sizes: [
      { size: 7, price: 6999, stock: 8 },
      { size: 8, price: 6999, stock: 7 },
      { size: 9, price: 6999, stock: 5 },
      { size: 10, price: 6999, stock: 4 }
    ]
  }
];

async function seedProducts() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the environment");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const admin = await User.findOne({ role: "admin" }).select("_id");

    if (!admin) {
      throw new Error("No admin account found. Create or verify an admin account first.");
    }

    const existingProducts = await Product.find({}, "name brand");

    const existingKeys = new Set(
      existingProducts.map(product =>
        `${product.name.trim().toLowerCase()}-${product.brand.trim().toLowerCase()}`
      )
    );

    const newProducts = products
      .filter(product =>
        !existingKeys.has(`${product.name.toLowerCase()}-${product.brand.toLowerCase()}`)
      )
      .map(product => ({
        ...product,
        sellerId: admin._id
      }));

    if (!newProducts.length) {
      console.log("All additional products already exist. Nothing was added.");
      return;
    }

    await Product.insertMany(newProducts);

    const totalProducts = await Product.countDocuments({
      isArchived: { $ne: true }
    });

    console.log(`${newProducts.length} new products added successfully.`);
    console.log(`Total active products: ${totalProducts}`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
