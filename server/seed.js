
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

if (!process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
}

const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");

const products = [
  {
    name: "Air Max 270",
    brand: "Nike",
    category: "Lifestyle",
    color: "White Black",
    description: "The Nike Air Max 270 features a breathable mesh upper, a large visible Air unit and a lightweight design for everyday comfort.",
    price: 11999,
    image: "https://www.nike.sa/dw/image/v2/BDVB_PRD/on/demandware.static/-/Sites-akeneo-master-catalog/default/dw2c6247b5/nk/cb1/c/e/4/9/e/cb1ce49e_6014_46e8_b23e_527fd5985283.jpg?q=100&sh=700&sm=fit&strip=false&sw=700"
  },
  {
    name: "Air Max 97",
    brand: "Nike",
    category: "Lifestyle",
    color: "Black White",
    description: "The Nike Air Max 97 combines its signature flowing upper design with full-length Air cushioning and a durable rubber outsole.",
    price: 14999,
    image: "https://www.nike.com.kw/dw/image/v2/BDVB_PRD/on/demandware.static/-/Sites-akeneo-master-catalog/default/dwcb16f9bc/nk/b79/b/b/e/5/5/b79bbe55_f9e1_43f1_89fe_45e19c8bb685.jpg"
  },
  {
    name: "Air Max 1",
    brand: "Nike",
    category: "Lifestyle",
    color: "White Black",
    description: "The Nike Air Max 1 features its classic wavy mudguard, layered upper materials and visible Air cushioning.",
    price: 12999,
    image: "https://www.nike.sa/dw/image/v2/BDVB_PRD/on/demandware.static/-/Sites-akeneo-master-catalog/default/dw4be300fb/nk/492/7/f/3/e/2/4927f3e2_b271_4255_844b_772b66ba9f66.png"
  },
  {
    name: "Blazer Mid 77",
    brand: "Nike",
    category: "Streetwear",
    color: "White Green",
    description: "The Nike Blazer Mid 77 brings vintage basketball styling with a leather upper, high-top profile and classic rubber sole.",
    price: 8999,
    image: "https://www.nike.sa/dw/image/v2/BDVB_PRD/on/demandware.static/-/Sites-akeneo-master-catalog/default/dw7c55783a/nk/7f1/3/a/7/5/e/7f13a75e_7227_4859_a6a8_adf116f5af2b.jpg?sh=2000&sm=fit&sw=2000"
  },
  {
    name: "Cortez",
    brand: "Nike",
    category: "Casual",
    color: "White Red",
    description: "The Nike Cortez is a heritage running-inspired sneaker with a leather upper, classic Swoosh and lightweight foam midsole.",
    price: 7999,
    image: "https://www.nike.ae/dw/image/v2/BDVB_PRD/on/demandware.static/-/Sites-akeneo-master-catalog/default/dw1fc6f9b3/nk/acc/d/6/e/6/d/accd6e6d_04e2_4df6_b2b8_798d63cd3a9c.jpg?sh=2000&sm=fit&sw=2000"
  },
  {
    name: "Air Jordan 4 Retro",
    brand: "Jordan",
    category: "Streetwear",
    color: "White Blue",
    description: "The Air Jordan 4 Retro features a premium leather upper, signature mesh panels, visible Air cushioning and classic basketball styling.",
    price: 18999,
    image: "https://images-beta.laced.com/products/9c7e4cab-846b-4862-8d15-e6dd511370e9.jpg?width=2048"
  },
  {
    name: "Campus 00s",
    brand: "Adidas",
    category: "Streetwear",
    color: "Black Pink",
    description: "The adidas Campus 00s combines a retro skate-inspired silhouette with a suede upper, textile lining and rubber outsole.",
    price: 8999,
    image: "https://assets.adidas.com/images/w_500%2Cf_auto%2Cq_auto/c2f4c9206b1949efb10ed3da3a5cbb36_9366/Campus_00s_Shoes_Black_JH7272_01_00_standard.jpg"
  },
  {
    name: "Stan Smith",
    brand: "Adidas",
    category: "Casual",
    color: "White Green",
    description: "The adidas Stan Smith is a timeless tennis-inspired sneaker with a clean leather upper, perforated three stripes and classic heel tab.",
    price: 7999,
    image: "https://assets.adidas.com/images/w_600%2Cf_auto%2Cq_auto/db0ea48a69aa469c9024dc4e6a622b1a_faec/Stan_Smith_Shoes_White_ID0268_db04_standard.jpg"
  },
  {
    name: "NMD R1",
    brand: "Adidas",
    category: "Lifestyle",
    color: "Black",
    description: "The adidas NMD R1 features a lightweight knit-inspired upper, Boost cushioning and signature midsole plugs.",
    price: 11999,
    image: "https://assetmanagerpim-res.cloudinary.com/images/w_1560/q_100/62d96641e799450fbbdfad0800cb06ed_9366/GZ9256_01_standard.WebP"
  },
  {
    name: "Ozweego",
    brand: "Adidas",
    category: "Lifestyle",
    color: "Beige",
    description: "The adidas Ozweego blends a retro running silhouette with layered materials, a sculpted midsole and comfortable cushioning.",
    price: 10999,
    image: "https://assets.adidas.com/images/h_2000%2Cf_auto%2Cq_auto%2Cfl_lossy%2Cc_fill%2Cg_auto/8207547598544e829803adf000ba9f14_9366/OZWEEGO_Shoes_Beige_GY6177_09_standard.jpg"
  },
  {
    name: "Rivalry Low",
    brand: "Adidas",
    category: "Streetwear",
    color: "White",
    description: "The adidas Rivalry Low takes inspiration from classic basketball footwear with a leather upper and sturdy rubber cupsole.",
    price: 8999,
    image: "https://assets.adidas.com/images/h_840%2Cf_auto%2Cq_auto%2Cfl_lossy%2Cc_fill%2Cg_auto/976c881bb91e4b14aecbd1db35e26b64_9366/Rivalry_Low_Shoes_White_IG6495_01_standard.jpg"
  },
  {
    name: "Palermo",
    brand: "Puma",
    category: "Casual",
    color: "Blue White",
    description: "The PUMA Palermo features a retro terrace-inspired design with a suede upper, contrasting Formstrip and gum rubber outsole.",
    price: 7999,
    image: "https://images.puma.com/image/upload/f_auto%2Cq_auto%2Cb_rgb%3Afafafa%2Cw_2000%2Ch_2000/global/383011/01/sv01/fnd/IND/fmt/png/Palermo-OG-Sneakers"
  },
  {
    name: "Future Rider",
    brand: "Puma",
    category: "Lifestyle",
    color: "White Black",
    description: "The PUMA Future Rider brings retro running style together with a lightweight upper, cushioned midsole and distinctive heel design.",
    price: 8999,
    image: "https://images.puma.com/image/upload/f_auto%2Cq_auto%2Cb_rgb%3Afafafa%2Cw_2000%2Ch_2000/global/380639/02/sv01/fnd/SEA/fmt/png/Future-Rider-Double-Trainers"
  },
  {
    name: "Velocity Nitro 3",
    brand: "Puma",
    category: "Running",
    color: "Black White",
    description: "The PUMA Velocity Nitro 3 is a road-running shoe with responsive NITRO cushioning, breathable mesh and durable PUMAGRIP traction.",
    price: 10999,
    image: "https://thumblr.uniid.it/product/336445/6dd8db8c9eac.jpg"
  },
  {
    name: "ForeverRun Nitro 3",
    brand: "Puma",
    category: "Running",
    color: "Black Red",
    description: "The PUMA ForeverRun Nitro 3 is a stability running shoe with dual-density cushioning, an engineered mesh upper and supportive guidance.",
    price: 14999,
    image: "https://www.running-point.de/cdn/shop/files/P000000998080100_1.jpg?crop=center&v=1790205395&width=2500"
  },
  {
    name: "327",
    brand: "New Balance",
    category: "Lifestyle",
    color: "Grey White",
    description: "The New Balance 327 combines a retro running-inspired upper, oversized N branding and a distinctive lugged outsole.",
    price: 9999,
    image: "https://images.jdsports.id/i/jpl/jd_MS327JSG_a?fmt=webp&qlt=70&resmode=sharp&w=700"
  },
  {
    name: "530",
    brand: "New Balance",
    category: "Lifestyle",
    color: "White Silver",
    description: "The New Balance 530 brings back a classic running silhouette with breathable mesh, synthetic overlays and ABZORB cushioning.",
    price: 10999,
    image: "https://leftfoot.com.sg/cdn/shop/files/Untitled_design_-_2026-01-07T142400.648_1200x1200.png?v=1767767587"
  },
  {
    name: "550",
    brand: "New Balance",
    category: "Streetwear",
    color: "Triple White",
    description: "The New Balance 550 features an old-school basketball silhouette with a leather upper, perforated detailing and sturdy rubber outsole.",
    price: 11999,
    image: "https://item.elandrs.com/r/image/item/2024-04-22/2e3a01c5-713b-47d7-ae4f-45b44bdfa6fb.jpg"
  },
  {
    name: "990v6",
    brand: "New Balance",
    category: "Lifestyle",
    color: "Grey",
    description: "The New Balance 990v6 combines premium suede and mesh materials with modern cushioning and a supportive everyday fit.",
    price: 18999,
    image: "https://www.vermontgear.com/mm5/graphics/00000006/43/m990gl6_1.webp"
  },
  {
    name: "GEL-Kayano 14",
    brand: "ASICS",
    category: "Lifestyle",
    color: "White Silver",
    description: "The ASICS GEL-Kayano 14 features a retro performance-running design, breathable mesh, metallic overlays and GEL cushioning.",
    price: 15999,
    image: "https://www.asics.co.in/media/catalog/product/1/2/1203a961_100_sl_lt_glb_1.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width="
  },
  {
    name: "GEL-1130",
    brand: "ASICS",
    category: "Lifestyle",
    color: "White Green",
    description: "The ASICS GEL-1130 takes inspiration from classic stability running shoes with breathable mesh, synthetic overlays and supportive cushioning.",
    price: 9999,
    image: "https://media.jdsports.com/i/finishline/1203A609_100_P1?bg=rgb%28237%2C237%2C237%29&fmt=auto&h=1600&w=1600"
  },
  {
    name: "GEL-Nimbus 26",
    brand: "ASICS",
    category: "Running",
    color: "Blue",
    description: "The ASICS GEL-Nimbus 26 is a cushioned road-running shoe with an engineered upper, GEL technology and a responsive midsole.",
    price: 16999,
    image: "https://www.asics.co.in/media/catalog/product/1/0/1011b794_403_sr_rt_glb-base.jpg?optimize=high&bg-color=255,255,255&fit=bounds&height=&width="
  },
  {
    name: "Club C 85",
    brand: "Reebok",
    category: "Casual",
    color: "White Green",
    description: "The Reebok Club C 85 is a clean tennis-inspired sneaker with a leather upper, perforated details and a durable rubber outsole.",
    price: 7999,
    image: "https://i8.amplience.net/i/jpl/jd_ANZ0109794_a?v=1"
  },
  {
    name: "Classic Leather",
    brand: "Reebok",
    category: "Casual",
    color: "White",
    description: "The Reebok Classic Leather features a soft leather upper, low-cut profile and lightweight cushioning for everyday wear.",
    price: 6999,
    image: "https://reebok.ca/cdn/shop/products/188e3BXquky9acNkRriYOtFEk9juq0-GQ.jpg?v=1663433463"
  },
  {
    name: "Run Star Hike",
    brand: "Converse",
    category: "Streetwear",
    color: "Black White",
    description: "The Converse Run Star Hike updates the classic high-top canvas silhouette with a bold platform midsole and rugged sawtooth outsole.",
    price: 9999,
    image: "https://www.cosmossport.gr/2215942-product_medium/converse-run-star-hike.jpg"
  }
];

const normalize = value =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const seedProducts = async () => {
  let connected = false;

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing. Check your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;

    console.log("Connected to MongoDB.");

    const admin = await User.findOne({ role: "admin" }).select("_id");

    if (!admin) {
      throw new Error("No admin account found. Create an admin account before seeding products.");
    }

    const existingProducts = await Product.find({})
      .select("name brand")
      .lean();

    const existingKeys = new Set(
      existingProducts.map(product =>
        `${normalize(product.name)}-${normalize(product.brand)}`
      )
    );

    const newProducts = products.filter(product => {
      const key = `${normalize(product.name)}-${normalize(product.brand)}`;
      return !existingKeys.has(key);
    });

    if (newProducts.length === 0) {
      console.log("All 25 products already exist. Nothing was inserted.");
      return;
    }

    const documents = newProducts.map(product => ({
      name: product.name,
      brand: product.brand,
      category: product.category,
      color: product.color,
      description: product.description,
      images: [product.image],
      sellerId: admin._id,
      sizes: [
        { size: 7, price: product.price, stock: 5 },
        { size: 8, price: product.price, stock: 5 },
        { size: 9, price: product.price, stock: 4 },
        { size: 10, price: product.price, stock: 4 }
      ]
    }));

    await Product.insertMany(documents, { ordered: false });

    console.log(`${documents.length} new products added successfully.`);
    console.log(`${existingProducts.length + documents.length} total product records now exist.`);
    console.log("Existing products, customers, orders and stock records were not deleted or overwritten.");
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connected || mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("MongoDB connection closed.");
    }
  }
};

seedProducts();
