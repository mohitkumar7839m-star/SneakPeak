
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("sneakpeak_wishlist") || "[]"
      );
      setWishlist(Array.isArray(saved) ? saved : []);
    } catch {
      setWishlist([]);
    }
  }, []);

  function saveWishlist(updatedWishlist) {
    setWishlist(updatedWishlist);
    localStorage.setItem(
      "sneakpeak_wishlist",
      JSON.stringify(updatedWishlist)
    );
  }

  function removeItem(productId) {
    saveWishlist(
      wishlist.filter((item) => item.productId !== productId)
    );
  }

  function addToCart(item) {
    const cart = JSON.parse(localStorage.getItem("sneakpeak_cart") || "[]");
    const existingItem = cart.find(
      (cartItem) =>
        cartItem.productId === item.productId &&
        cartItem.size === (item.size || "UK 8")
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size || "UK 8",
        quantity: 1
      });
    }

    localStorage.setItem("sneakpeak_cart", JSON.stringify(cart));
    alert(`${item.name} added to your cart. Default size: ${item.size || "UK 8"}.`);
  }

  return (
    <section className="wishlist-page">
      <header className="wishlist-heading">
        <p className="wishlist-eyebrow">YOUR PERSONAL COLLECTION</p>
        <h1>Saved <span>Pairs.</span></h1>
        <p>Keep the sneakers you love, all in one place.</p>
      </header>

      <div className="wishlist-content">
        <div className="wishlist-toolbar">
          <h2>My Wishlist</h2>
          <span>{wishlist.length} {wishlist.length === 1 ? "item" : "items"}</span>
        </div>

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
            {wishlist.map((item) => (
              <article className="wishlist-card" key={item.productId}>
                <Link
                  to={`/products/${item.productId}`}
                  className="wishlist-image"
                >
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <span className="wishlist-saved-label">SAVED ♡</span>
                </Link>

                <div className="wishlist-card-info">
                  <h3>{item.name}</h3>
                  <strong>
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </strong>

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
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name} from wishlist`}
                      title="Remove from wishlist"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </article>
            ))}
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
