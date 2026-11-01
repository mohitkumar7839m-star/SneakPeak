
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCart() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get("/cart", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (active) {
          setCart(response.data?.cart?.items || []);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
            "Unable to load your cart. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCart();

    window.addEventListener("cartUpdated", loadCart);

    return () => {
      active = false;
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, [navigate]);

  async function updateQuantity(itemId, quantity) {
    const token = localStorage.getItem("token");

    try {
      setUpdating(itemId);
      setError("");

      const response = await api.put(
        `/cart/${itemId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCart(response.data?.cart?.items || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update quantity."
      );
    } finally {
      setUpdating("");
    }
  }

  async function removeItem(itemId) {
    const token = localStorage.getItem("token");

    try {
      setUpdating(itemId);
      setError("");

      const response = await api.delete(`/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCart(response.data?.cart?.items || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to remove this item."
      );
    } finally {
      setUpdating("");
    }
  }

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const subtotal = cart.reduce((total, item) => {
    const product = item.product;

    if (!product || typeof product !== "object") {
      return total;
    }

    const selectedSize = product.sizes?.find(
      (size) => Number(size.size) === Number(item.size)
    );

    return total + (
      Number(selectedSize?.price || 0) *
      Number(item.quantity || 0)
    );
  }, 0);

  if (loading) {
    return (
      <section className="cart-page">
        <div className="cart-heading">
          <p className="cart-eyebrow">YOUR SELECTION</p>
          <h1>Shopping <span>Cart.</span></h1>
          <p>Loading your shopping cart...</p>
        </div>
      </section>
    );
  }

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
            <span>
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>

          {error && (
            <p className="cart-message" role="alert">
              {error}
            </p>
          )}

          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍</div>
              <h2>Your cart is empty</h2>
              <p>
                Looks like you haven't found your perfect pair yet.
              </p>
              <Link to="/products" className="cart-shop-button">
                Explore Sneakers <span>↗</span>
              </Link>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item) => {
                const product = item.product;
                const productId = product?._id;
                const selectedSize = product?.sizes?.find(
                  (size) => Number(size.size) === Number(item.size)
                );

                const price = Number(selectedSize?.price || 0);
                const stock = Number(selectedSize?.stock || 0);
                const quantity = Number(item.quantity || 1);

                const firstImage = product?.images?.[0];
                const image = typeof firstImage === "string"
                  ? firstImage
                  : firstImage?.url || firstImage?.imageUrl || "";

                return (
                  <article className="cart-item" key={item._id}>
                    <Link
                      to={productId ? `/products/${productId}` : "/products"}
                      className="cart-item-image"
                    >
                      {image ? (
                        <img src={image} alt={product?.name || "Sneaker"} />
                      ) : (
                        <span>Image unavailable</span>
                      )}
                    </Link>

                    <div className="cart-item-info">
                      <p className="cart-item-category">
                        {product?.category || "SNEAKPEAK SELECT"}
                      </p>

                      <h3>{product?.name || "Unavailable product"}</h3>

                      <p className="cart-item-size">
                        Size: UK {item.size}
                      </p>

                      <strong>
                        ₹{(price * quantity).toLocaleString("en-IN")}
                      </strong>

                      <div className="cart-item-actions">
                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item._id, quantity - 1)
                            }
                            disabled={quantity <= 1 || updating === item._id}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span>{quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item._id, quantity + 1)
                            }
                            disabled={
                              quantity >= stock ||
                              updating === item._id
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() => removeItem(item._id)}
                          disabled={updating === item._id}
                        >
                          {updating === item._id ? "Updating..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
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
              <span>Total</span>
              <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
            </div>

            <p className="cart-summary-note">
              Final prices and stock will be verified when you place your order.
            </p>

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() => navigate("/checkout")}
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
