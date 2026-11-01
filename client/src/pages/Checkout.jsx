
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

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

    return () => {
      active = false;
    };
  }, [navigate]);

  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const product = item.product;

      if (!product || typeof product !== "object") {
        return total;
      }

      const selectedSize = product.sizes?.find(
        (size) => Number(size.size) === Number(item.size)
      );

      return total +
        Number(selectedSize?.price || 0) *
        Number(item.quantity || 0);
    }, 0);
  }, [cart]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty. Add a sneaker before checkout.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const response = await api.post(
        "/orders/checkout",
        {
          shippingAddress: {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            state: formData.state.trim(),
            pincode: formData.pincode.trim()
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      localStorage.removeItem("sneakpeak_cart");
      window.dispatchEvent(new Event("cartUpdated"));

      setSuccessOrder(response.data?.order || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to place your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <section className="checkout-page">
        <p className="checkout-loading">Loading checkout...</p>
      </section>
    );
  }

  if (successOrder) {
    return (
      <section className="checkout-page">
        <div className="checkout-success">
          <div className="checkout-success-icon">✓</div>
          <p className="checkout-eyebrow">ORDER CONFIRMED</p>
          <h1>Your pair is <span>on its way.</span></h1>
          <p>
            Your SneakPeak order has been placed successfully.
            Pay when your order is delivered.
          </p>

          <div className="checkout-success-details">
            <div>
              <span>Order ID</span>
              <strong>{successOrder._id}</strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>Cash on Delivery</strong>
            </div>
            <div>
              <span>Order Total</span>
              <strong>
                ₹{Number(successOrder.totalAmount || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="checkout-primary-button"
            onClick={() => navigate("/orders")}
          >
            View My Orders →
          </button>

          <Link to="/products" className="checkout-back-link">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="checkout-page">
        <div className="checkout-empty">
          <h1>Your cart is empty.</h1>
          <p>Add your favourite sneakers before proceeding to checkout.</p>
          <Link to="/products" className="checkout-primary-button">
            Explore Sneakers →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="checkout-heading">
        <p className="checkout-eyebrow">ALMOST YOURS</p>
        <h1>Secure <span>Checkout.</span></h1>
        <p>Complete your delivery details and get ready for your next pair.</p>
      </div>

      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-card">
            <p className="checkout-section-label">01 — DELIVERY</p>
            <h2>Shipping Address</h2>
            <p className="checkout-description">
              Where should we deliver your sneakers?
            </p>

            <div className="checkout-fields">
              <div className="checkout-field checkout-full">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="checkout-field checkout-full">
                <label htmlFor="phone">Mobile Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="checkout-field checkout-full">
                <label htmlFor="address">Full Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House number, street, area, landmark"
                  rows={3}
                  maxLength={500}
                  autoComplete="street-address"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  maxLength={100}
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  maxLength={100}
                  autoComplete="address-level1"
                  required
                />
              </div>

              <div className="checkout-field checkout-full">
                <label htmlFor="pincode">PIN Code</label>
                <input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  required
                />
              </div>
            </div>
          </div>

          <div className="checkout-card">
            <p className="checkout-section-label">02 — PAYMENT</p>
            <h2>Payment Method</h2>

            <div className="checkout-cod-option">
              <span className="checkout-cod-icon">₹</span>
              <div>
                <strong>Cash on Delivery</strong>
                <p>Pay when your sneakers arrive at your doorstep.</p>
              </div>
              <span className="checkout-selected">✓</span>
            </div>
          </div>

          <button
            type="submit"
            className="checkout-primary-button checkout-place-order"
            disabled={placingOrder}
          >
            {placingOrder ? "Placing Your Order..." : "Place Order — Cash on Delivery"}
            {!placingOrder && <span> →</span>}
          </button>

          <p className="checkout-secure-note">
            Your order will be verified against current product prices and stock.
          </p>
        </form>

        <aside className="checkout-summary">
          <p className="checkout-section-label">YOUR SELECTION</p>
          <h2>Order Summary</h2>

          <div className="checkout-summary-items">
            {cart.map((item) => {
              const product = item.product;
              const selectedSize = product?.sizes?.find(
                (size) => Number(size.size) === Number(item.size)
              );

              const firstImage = product?.images?.[0];
              const image = typeof firstImage === "string"
                ? firstImage
                : firstImage?.url || firstImage?.imageUrl || "";

              const price = Number(selectedSize?.price || 0);

              return (
                <div className="checkout-summary-item" key={item._id}>
                  <div className="checkout-item-image">
                    {image && (
                      <img src={image} alt={product?.name || "Sneaker"} />
                    )}
                    <span>{item.quantity}</span>
                  </div>

                  <div className="checkout-item-info">
                    <strong>{product?.name || "Sneaker"}</strong>
                    <span>UK {item.size}</span>
                  </div>

                  <strong className="checkout-item-price">
                    ₹{(price * Number(item.quantity)).toLocaleString("en-IN")}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="checkout-summary-row">
            <span>Items ({totalItems})</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="checkout-summary-row">
            <span>Delivery</span>
            <span className="checkout-free">FREE</span>
          </div>

          <div className="checkout-summary-total">
            <span>Total to Pay</span>
            <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
          </div>

          <p className="checkout-summary-note">
            Final amount is calculated and verified by the server when you place your order.
          </p>

          <Link to="/cart" className="checkout-back-link">
            ← Back to Cart
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
