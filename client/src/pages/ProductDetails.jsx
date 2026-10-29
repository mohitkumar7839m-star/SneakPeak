
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const products = [
  {
    _id: "sample-1",
    name: "Air Motion Red",
    category: "Running / Performance",
    price: 7499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
    description: "Bold performance sneakers designed for everyday movement, comfort, and standout street style.",
    badge: "BESTSELLER"
  },
  {
    _id: "sample-2",
    name: "Urban Classic",
    category: "Lifestyle / Everyday",
    price: 5299,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80",
    description: "Clean everyday sneakers that combine a versatile silhouette with all-day comfort.",
    badge: "POPULAR"
  },
  {
    _id: "sample-3",
    name: "Street Form",
    category: "Streetwear / Essentials",
    price: 6199,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
    description: "Modern streetwear sneakers made to bring a confident edge to your everyday outfits.",
    badge: "NEW ARRIVAL"
  },
  {
    _id: "sneak-101",
    name: "Air Motion Red",
    category: "Running / Performance",
    price: 7499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
    description: "Bold performance sneakers designed for everyday movement, comfort, and standout street style.",
    badge: "BESTSELLER"
  },
  {
    _id: "sneak-102",
    name: "Urban Classic",
    category: "Lifestyle / Everyday",
    price: 5299,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80",
    description: "Clean everyday sneakers that combine a versatile silhouette with all-day comfort.",
    badge: "POPULAR"
  },
  {
    _id: "sneak-103",
    name: "Street Form",
    category: "Streetwear / Essentials",
    price: 6199,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
    description: "Modern streetwear sneakers made to bring a confident edge to your everyday outfits.",
    badge: "NEW ARRIVAL"
  },
  {
    _id: "sneak-104",
    name: "Cloud Runner",
    category: "Running / Performance",
    price: 8999,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1000&q=80",
    description: "Lightweight running-inspired sneakers for a comfortable, energetic everyday feel.",
    badge: "FEATURED"
  },
  {
    _id: "sneak-105",
    name: "Mono Street",
    category: "Streetwear / Essentials",
    price: 4599,
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1000&q=80",
    description: "Minimal street sneakers with an easy-to-style design for everyday wear.",
    badge: "TRENDING"
  },
  {
    _id: "sneak-106",
    name: "Court Legend",
    category: "Lifestyle / Everyday",
    price: 6899,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80",
    description: "A classic court-inspired look that works with casual outfits and weekend fits.",
    badge: "CLASSIC"
  },
  {
    _id: "sneak-107",
    name: "Velocity Pro",
    category: "Running / Performance",
    price: 9999,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1000&q=80",
    description: "Sporty sneakers with a performance-inspired profile and a bold modern finish.",
    badge: "PREMIUM"
  },
  {
    _id: "sneak-108",
    name: "Daily Essential",
    category: "Lifestyle / Everyday",
    price: 3999,
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1000&q=80",
    description: "An everyday essential with a versatile shape and a clean, understated style.",
    badge: "VALUE PICK"
  }
];

const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

function ProductDetails() {
  const { id } = useParams();
  const product = products.find((item) => item._id === id);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  function addToCart() {
    if (!selectedSize) {
      setMessage("Please select your shoe size first.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("sneakpeak_cart") || "[]");
    const existingItem = cart.find(
      (item) => item.productId === product._id && item.size === selectedSize
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        quantity
      });
    }

    localStorage.setItem("sneakpeak_cart", JSON.stringify(cart));
    setMessage("Added to your cart successfully!");
  }

  function addToWishlist() {
    const wishlist = JSON.parse(localStorage.getItem("sneakpeak_wishlist") || "[]");
    const alreadySaved = wishlist.some((item) => item.productId === product._id);

    if (alreadySaved) {
      setMessage("This sneaker is already in your wishlist.");
      return;
    }

    wishlist.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image
    });

    localStorage.setItem("sneakpeak_wishlist", JSON.stringify(wishlist));
    setMessage("Added to your wishlist!");
  }

  if (!product) {
    return (
      <section className="page-container product-not-found">
        <h1>Sneaker not found</h1>
        <p>This sneaker may no longer be available.</p>
        <Link to="/products" className="details-back-link">
          Back to sneakers
        </Link>
      </section>
    );
  }

  return (
    <section className="details-page">
      <div className="details-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Sneakers</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="details-layout">
        <div className="details-image-wrap">
          <span className="details-badge">{product.badge}</span>
          <img src={product.image} alt={product.name} />
        </div>

        <div className="details-info">
          <p className="details-category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="details-price">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="details-description">{product.description}</p>

          <div className="details-size-heading">
            <h3>Select Size</h3>
            <span>UK sizing</span>
          </div>

          <div className="details-sizes">
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                className={`size-option ${selectedSize === size ? "selected" : ""}`}
                onClick={() => {
                  setSelectedSize(size);
                  setMessage("");
                }}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="details-quantity">
            <span>Quantity</span>
            <div className="quantity-control">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(10, current + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button type="button" className="details-add-cart" onClick={addToCart}>
            Add to Cart — ₹{(product.price * quantity).toLocaleString("en-IN")}
          </button>

          <button type="button" className="details-wishlist" onClick={addToWishlist}>
            ♡ Add to Wishlist
          </button>

          {message && <p className="details-message" role="status">{message}</p>}

          <div className="details-perks">
            <p>✓ Cash on Delivery available</p>
            <p>✓ Secure checkout</p>
            <p>✓ Size selection before purchase</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;
