
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("sneakpeak_cart") || "[]"
      );
      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch {
      setCart([]);
    }
  }, []);

  function updateCart(updatedCart) {
    setCart(updatedCart);
    localStorage.setItem("sneakpeak_cart", JSON.stringify(updatedCart));
  }

  function updateQuantity(productId, size, change) {
    const updatedCart = cart
      .map((item) => {
        if (item.productId === productId && item.size === size) {
          return {
            ...item,
            quantity: Math.max(1, Math.min(10, item.quantity + change))
          };
        }
        return item;
      });

    updateCart(updatedCart);
  }

  function removeItem(productId, size) {
    const updatedCart = cart.filter(
      (item) => !(item.productId === productId && item.size === size)
    );

    updateCart(updatedCart);
  }

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  return (
    <section className="cart-page">
      <div className="cart-heading">
        <p className="cart-eyebrow">YOUR SELECTION</p>
        <h1>Shopping <span>Cart.</span></h1>
        <p>Good taste starts with the right pair.</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items-section">
          <div className="cart-section-heading">
            <h2>Your Items</h2>
            <span>{totalItems} {totalItems === 1 ? "item" : "items"}</span>
          </div>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍</div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't found your perfect pair yet.</p>
              <Link to="/products" className="cart-shop-button">
                Explore Sneakers <span>↗</span>
              </Link>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <article
                  className="cart-item"
                  key={`${item.productId}-${item.size}`}
                >
                  <Link
                    to={`/products/${item.productId}`}
                    className="cart-item-image"
                  >
                    <img src={item.image} alt={item.name} />
                  </Link>

                  <div className="cart-item-info">
                    <p className="cart-item-category">SNEAKPEAK SELECT</p>
                    <h3>{item.name}</h3>
                    <p className="cart-item-size">Size: {item.size}</p>
                    <strong>
                      ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                    </strong>

                    <div className="cart-item-actions">
                      <div className="cart-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, -1)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.size, 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => removeItem(item.productId, item.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <Link to="/products" className="cart-continue">
            ← Continue Shopping
          </Link>
        </div>

        {cart.length > 0 && (
          <aside className="cart-summary">
            <p className="cart-summary-label">ORDER SUMMARY</p>
            <h2>Summary</h2>

            <div className="cart-summary-row">
              <span>Items ({totalItems})</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="cart-summary-row">
              <span>Delivery</span>
              <span className="cart-free">FREE</span>
            </div>

            <div className="cart-summary-total">
              <span>Subtotal</span>
              <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
            </div>

            <p className="cart-summary-note">
              Delivery charges and final totals will be confirmed at checkout.
            </p>

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() =>
                alert("Checkout will be connected when the team checkout flow is ready.")
              }
            >
              Proceed to Checkout <span>→</span>
            </button>

            <div className="cart-payment-note">
              <span>✓</span> Cash on Delivery available
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}

export default Cart;
