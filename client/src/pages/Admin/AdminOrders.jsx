
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./AdminOrders.css";

const transitions = {
  Placed: ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Shipped"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: []
};

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/admin/all");
      setOrders(response.data.orders || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName = order.user?.name || "";
      const customerEmail = order.user?.email || "";
      const orderId = order._id || "";

      const matchesSearch =
        orderId.toLowerCase().includes(searchValue) ||
        customerName.toLowerCase().includes(searchValue) ||
        customerEmail.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const activeOrders = orders.filter(
    (order) =>
      !["Delivered", "Cancelled"].includes(order.orderStatus)
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;

  const orderValue = orders
    .filter((order) => order.orderStatus !== "Cancelled")
    .reduce(
      (total, order) => total + (order.totalAmount || 0),
      0
    );

  const openOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      setActionMessage("");
      setError("");

      const response = await api.get(`/orders/admin/${orderId}`);
      setSelectedOrder(response.data.order);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load order details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateStatus = async (nextStatus) => {
    if (!selectedOrder || updating) return;

    try {
      setUpdating(true);
      setActionMessage("");
      setError("");

      const response = await api.patch(
        `/orders/admin/${selectedOrder._id}/status`,
        { orderStatus: nextStatus }
      );

      setSelectedOrder(response.data.order);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === selectedOrder._id
            ? response.data.order
            : order
        )
      );

      setActionMessage(
        response.data.message || "Order status updated."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update order status."
      );
    } finally {
      setUpdating(false);
    }
  };

  const statusClass = (status) =>
    String(status || "").toLowerCase();

  const shippingAddress = selectedOrder?.shippingAddress || {};

  return (
    <div className="admin-orders-layout">
      <aside className="admin-orders-sidebar">
        <Link to="/admin" className="admin-orders-brand">
          SNEAK<span>PEAK</span>
        </Link>

        <p className="admin-orders-menu-label">WORKSPACE</p>

        <Link to="/admin" className="admin-orders-nav-link">
          <span>▦</span> Dashboard
        </Link>

        <Link to="/admin/orders" className="admin-orders-nav-link active">
          <span>▤</span> Orders
        </Link>

        <Link to="/admin/products" className="admin-orders-nav-link">
          <span>◈</span> Products
        </Link>

        <Link to="/admin/inventory" className="admin-orders-nav-link">
          <span>▥</span> Inventory
        </Link>

        <Link to="/admin/customers" className="admin-orders-nav-link">
          <span>♙</span> Customers
        </Link>

        <div className="admin-orders-sidebar-bottom">
          <Link to="/" className="admin-orders-store-link">
            ← Back to Store
          </Link>
          <p>ADMIN PANEL</p>
          <span>Live workspace</span>
        </div>
      </aside>

      <main className="admin-orders-main">
        <header className="admin-orders-header">
          <div>
            <p className="admin-orders-eyebrow">MANAGEMENT / ORDERS</p>
            <h1>Orders</h1>
            <p className="admin-orders-subtitle">
              Track and manage customer orders.
            </p>
          </div>

          <div className="admin-orders-admin-profile">
            <div className="admin-orders-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Store Management</span>
            </div>
          </div>
        </header>

        <div className="admin-orders-toolbar">
          <span>
            <span className="admin-orders-live-dot"></span>
            Live MongoDB orders
          </span>

          <button
            className="admin-orders-refresh"
            onClick={fetchOrders}
            disabled={loading}
          >
            ↻ {loading ? "Refreshing..." : "Refresh Orders"}
          </button>
        </div>

        {error && (
          <div className="admin-orders-error">
            {error}
            <button onClick={fetchOrders}>Try again</button>
          </div>
        )}

        {actionMessage && (
          <div className="admin-orders-success">
            {actionMessage}
          </div>
        )}

        <section className="admin-orders-stats">
          <article>
            <span>Total Orders</span>
            <strong>{loading ? "—" : orders.length}</strong>
            <small>Orders in database</small>
          </article>

          <article>
            <span>Active Orders</span>
            <strong>{loading ? "—" : activeOrders}</strong>
            <small>Currently in progress</small>
          </article>

          <article>
            <span>Delivered</span>
            <strong>{loading ? "—" : deliveredOrders}</strong>
            <small>Successfully completed</small>
          </article>

          <article>
            <span>Order Value</span>
            <strong>{loading ? "—" : formatPrice(orderValue)}</strong>
            <small>Excluding cancelled orders</small>
          </article>
        </section>

        <section className="admin-orders-panel">
          <div className="admin-orders-panel-heading">
            <div>
              <h2>All Orders</h2>
              <p>
                {loading
                  ? "Loading orders..."
                  : `${filteredOrders.length} orders found`}
              </p>
            </div>

            <div className="admin-orders-filters">
              <input
                type="search"
                placeholder="Search order or customer..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="admin-orders-empty">
                      Loading orders from database...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-orders-empty">
                      {orders.length === 0
                        ? "No orders have been placed yet."
                        : "No matching orders found."}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>
                          #{String(order._id || "").slice(-6).toUpperCase()}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {order.user?.name || "Unknown Customer"}
                        </strong>
                        <span className="admin-orders-cell-sub">
                          {order.user?.email || "No email"}
                        </span>
                      </td>

                      <td>{formatDate(order.createdAt)}</td>

                      <td className="admin-orders-amount">
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td>
                        <strong>{order.paymentMethod || "COD"}</strong>
                        <span className="admin-orders-cell-sub">
                          {order.paymentStatus || "Pending"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-orders-status ${statusClass(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="admin-orders-view-btn"
                          onClick={() => openOrderDetails(order._id)}
                          disabled={detailsLoading}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {detailsLoading && (
        <div className="admin-orders-modal-backdrop">
          <div className="admin-orders-modal-loading">
            Loading order details...
          </div>
        </div>
      )}

      {selectedOrder && (
        <div
          className="admin-orders-modal-backdrop"
          onClick={() => {
            if (!updating) setSelectedOrder(null);
          }}
        >
          <section
            className="admin-orders-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-orders-modal-heading">
              <div>
                <p>ORDER DETAILS</p>
                <h2>
                  #{String(selectedOrder._id || "").slice(-6).toUpperCase()}
                </h2>
              </div>

              <button
                className="admin-orders-close"
                onClick={() => setSelectedOrder(null)}
                disabled={updating}
              >
                ×
              </button>
            </div>

            <div className="admin-orders-detail-section">
              <h3>Customer</h3>
              <strong>
                {selectedOrder.user?.name || "Unknown Customer"}
              </strong>
              <p>{selectedOrder.user?.email || "No email available"}</p>
              <p>
                {selectedOrder.user?.phone ||
                  shippingAddress.phone ||
                  "No phone available"}
              </p>
            </div>

            <div className="admin-orders-detail-section">
              <h3>Shipping Address</h3>
              <strong>
                {shippingAddress.fullName ||
                  selectedOrder.user?.name ||
                  "Customer"}
              </strong>
              <p>{shippingAddress.address || "Address unavailable"}</p>
              <p>
                {[
                  shippingAddress.city,
                  shippingAddress.state,
                  shippingAddress.pincode
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{shippingAddress.phone || ""}</p>
            </div>

            <div className="admin-orders-detail-section">
              <h3>Items ({selectedOrder.items?.length || 0})</h3>

              {(selectedOrder.items || []).map((item, index) => (
                <div
                  className="admin-orders-item"
                  key={item._id || index}
                >
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      Size {item.size} · Qty {item.quantity}
                    </span>
                  </div>

                  <strong>
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="admin-orders-detail-total">
              <span>Total Amount</span>
              <strong>{formatPrice(selectedOrder.totalAmount)}</strong>
            </div>

            <div className="admin-orders-detail-section">
              <h3>Payment Information</h3>
              <p>Method: {selectedOrder.paymentMethod || "COD"}</p>
              <p>Status: {selectedOrder.paymentStatus || "Pending"}</p>
            </div>

            <div className="admin-orders-detail-section">
              <h3>Update Order Status</h3>

              <select
                value={selectedOrder.orderStatus}
                disabled={
                  updating ||
                  transitions[selectedOrder.orderStatus]?.length === 0
                }
                onChange={(event) => updateStatus(event.target.value)}
              >
                <option value={selectedOrder.orderStatus}>
                  {selectedOrder.orderStatus}
                </option>

                {(transitions[selectedOrder.orderStatus] || []).map(
                  (status) => (
                    <option value={status} key={status}>
                      {status}
                    </option>
                  )
                )}
              </select>

              {updating && (
                <p className="admin-orders-demo-hint">
                  Saving status to database...
                </p>
              )}

              {actionMessage && (
                <p className="admin-orders-modal-success">
                  {actionMessage}
                </p>
              )}

              {error && (
                <p className="admin-orders-modal-error">
                  {error}
                </p>
              )}

              {!updating &&
                transitions[selectedOrder.orderStatus]?.length === 0 && (
                  <p className="admin-orders-demo-hint">
                    This order has reached its final status.
                  </p>
                )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
