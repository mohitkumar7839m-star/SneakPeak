
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const sizes = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

function readStorage(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [message, setMessage] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    function syncWishlist() {
      setWishlist(readStorage("sneakpeak_wishlist"));
    }

    syncWishlist();

    window.addEventListener("wishlistUpdated", syncWishlist);
    window.addEventListener("storage", syncWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, []);

  function saveWishlist(updatedWishlist) {
    try {
      localStorage.setItem(
        "sneakpeak_wishlist",
        JSON.stringify(updatedWishlist)
      );

      setWishlist(updatedWishlist);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {
      setMessage("Unable to update your wishlist. Please try again.");
    }
  }

  function removeItem(productId) {
    const updatedWishlist = wishlist.filter(
      (item) =>
        String(item.productId || item._id) !== String(productId)
    );

    saveWishlist(updatedWishlist);
  }

  function addToCart(item) {
    const productId = item.productId || item._id;
    const selectedSize = selectedSizes[productId];

    if (!selectedSize) {
      setMessage(`Please select a size for ${item.name}.`);
      return;
    }

    const cart = readStorage("sneakpeak_cart");

    const existingItem = cart.find(
      (cartItem) =>
        String(cartItem.productId || cartItem._id) === String(productId) &&
        cartItem.size === selectedSize
    );

    if (existingItem) {
      const currentQuantity = Math.max(
        1,
        Number(existingItem.quantity) || 1
      );

      if (currentQuantity >= 10) {
        setMessage("Maximum quantity of 10 reached for this size.");
        return;
      }

      existingItem.quantity = Math.min(10, currentQuantity + 1);
    } else {
      cart.push({
        productId,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        size: selectedSize,
        quantity: 1
      });
    }

    try {
      localStorage.setItem("sneakpeak_cart", JSON.stringify(cart));
      setMessage(`${item.name} added to your cart in ${selectedSize}.`);
    } catch {
      setMessage("Unable to update your cart. Please try again.");
    }
  }

  return (
    <section className="wishlist-page">
      <header className="wishlist-heading">
        <p className="wishlist-eyebrow">YOUR PERSONAL COLLECTION</p>
        <h1>
          Saved <span>Pairs.</span>
        </h1>
        <p>Keep the sneakers you love, all in one place.</p>
      </header>

      <div className="wishlist-content">
        <div className="wishlist-toolbar">
          <h2>My Wishlist</h2>
          <span>
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
          </span>
        </div>

        {message && (
          <p className="details-message" role="status">
            {message}
          </p>
        )}

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-heart">♡</div>
            <h2>Nothing saved. Yet.</h2>
            <p>Find your favourite pairs and save them here for later.</p>
            <Link to="/products" className="wishlist-shop-button">
              Explore Sneakers <span>↗</span>
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const productId = item.productId || item._id;

              return (
                <article className="wishlist-card" key={productId}>
                  <Link
                    to={`/products/${productId}`}
                    className="wishlist-image"
                  >
                    {imageErrors[productId] ? (
                      <div className="product-image-fallback">
                        Image unavailable
                      </div>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        onError={() =>
                          setImageErrors((current) => ({
                            ...current,
                            [productId]: true
                          }))
                        }
                      />
                    )}

                    <span className="wishlist-saved-label">SAVED ♡</span>
                  </Link>

                  <div className="wishlist-card-info">
                    <h3>{item.name}</h3>

                    <strong>
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </strong>

                    <label htmlFor={`size-${productId}`}>
                      Select Size
                    </label>

                    <select
                      id={`size-${productId}`}
                      value={selectedSizes[productId] || ""}
                      onChange={(event) => {
                        setSelectedSizes((current) => ({
                          ...current,
                          [productId]: event.target.value
                        }));
                        setMessage("");
                      }}
                    >
                      <option value="">Choose your size</option>
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>

                    <div className="wishlist-card-actions">
                      <button
                        type="button"
                        className="wishlist-add-button"
                        onClick={() => addToCart(item)}
                      >
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        className="wishlist-remove-button"
                        onClick={() => removeItem(productId)}
                        aria-label={`Remove ${item.name} from wishlist`}
                        title="Remove from wishlist"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Link to="/products" className="wishlist-back-link">
          ← Continue Exploring
        </Link>
      </div>
    </section>
  );
}

export default Wishlist;
