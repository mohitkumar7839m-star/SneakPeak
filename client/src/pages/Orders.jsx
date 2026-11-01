
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setOrders(
        Array.isArray(response.data?.orders)
          ? response.data.orders
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, retryCount]);

  async function handleCancelOrder(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(orderId);
      setError("");

      const response = await api.patch(
        `/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? response.data.order
            : order
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to cancel this order. Please try again."
      );
    } finally {
      setCancellingId("");
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(price) || 0);
  }

  function formatDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function canCancel(status) {
    return ["Placed", "Confirmed"].includes(status);
  }

  if (loading) {
    return (
      <section className="orders-page">
        <div className="orders-container">
          <p className="orders-message">Loading your orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="orders-page">
      <div className="orders-container">
        <div className="orders-heading">
          <div>
            <p className="orders-eyebrow">YOUR ACCOUNT</p>
            <h1>MY ORDERS</h1>
            <p className="orders-subtitle">
              Track and manage your sneaker orders.
            </p>
          </div>

          <Link to="/products" className="orders-shop-link">
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="orders-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && orders.length === 0 ? (
          <div className="orders-empty">
            <h2>No orders yet</h2>
            <p>
              Your orders will appear here after you complete checkout.
            </p>
            <Link to="/products" className="orders-primary-button">
              Explore Sneakers
            </Link>
          </div>
        ) : (
          !error && (
            <div className="orders-list">
              {orders.map((order) => (
                <article className="order-card" key={order._id}>
                  <div className="order-card-header">
                    <div>
                      <p className="order-label">ORDER ID</p>
                      <strong>#{order._id}</strong>
                      <p className="order-date">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`order-status order-status-${order.orderStatus
                        ?.toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items?.map((item, index) => (
                      <div
                        className="order-item"
                        key={`${order._id}-${item.product}-${index}`}
                      >
                        {item.image ? (
                          <img
                            className="order-item-image"
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <div className="order-item-placeholder">
                            SNEAKPEAK
                          </div>
                        )}

                        <div className="order-item-details">
                          <h3>{item.name}</h3>
                          <p>Size: UK {item.size}</p>
                          <p>Quantity: {item.quantity}</p>
                        </div>

                        <strong className="order-item-price">
                          {formatPrice(item.price * item.quantity)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-footer">
                    <div className="order-summary">
                      <p>
                        Payment: <strong>{order.paymentMethod}</strong>
                      </p>
                      <p>
                        Payment status: <strong>{order.paymentStatus}</strong>
                      </p>
                      <p className="order-total">
                        Total: <strong>{formatPrice(order.totalAmount)}</strong>
                      </p>
                    </div>

                    {canCancel(order.orderStatus) && (
                      <button
                        type="button"
                        className="order-cancel-button"
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={Boolean(cancellingId)}
                      >
                        {cancellingId === order._id
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}
                  </div>

                  <div className="order-shipping">
                    <p className="order-label">DELIVERING TO</p>
                    <p>
                      {order.shippingAddress?.fullName},{" "}
                      {order.shippingAddress?.address},{" "}
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.pincode}
                    </p>
                    <p>Phone: {order.shippingAddress?.phone}</p>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}

export default Orders;
