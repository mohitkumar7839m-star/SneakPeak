
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");

      setStats(response.data.stats);
      setRecentOrders(response.data.recentOrders || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusClass = (status) => {
    return `status-${String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  const statCards = stats
    ? [
        {
          label: "Total Revenue",
          value: formatCurrency(stats.totalRevenue),
          icon: "₹",
          description: "Revenue from delivered orders"
        },
        {
          label: "Total Orders",
          value: stats.totalOrders,
          icon: "▣",
          description: "All orders placed"
        },
        {
          label: "Total Customers",
          value: stats.totalCustomers,
          icon: "♙",
          description: "Registered customer accounts"
        },
        {
          label: "Total Products",
          value: stats.totalProducts,
          icon: "◈",
          description: "Active products in store"
        },
        {
          label: "Pending Orders",
          value: stats.pendingOrders,
          icon: "◷",
          description: "Orders awaiting completion"
        },
        {
          label: "Low Stock Products",
          value: stats.lowStockProducts,
          icon: "⚠",
          description: "Products with at least one size having 1–5 pairs"
        },
        {
          label: "Out of Stock Products",
          value: stats.outOfStockProducts,
          icon: "⊘",
          description: "Products with at least one size having zero pairs"
        }
      ]
    : [];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>
            SNEAK<span>PEAK</span>
          </span>
          <small>ADMIN CONTROL CENTER</small>
        </div>

        <div className="admin-nav-label">MAIN MENU</div>

        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link active">
            <span>▦</span>
            Dashboard
          </Link>

          <Link to="/admin/orders" className="admin-nav-link">
            <span>▤</span>
            Orders
          </Link>

          <Link to="/admin/products" className="admin-nav-link">
            <span>◈</span>
            Products
          </Link>

          <Link to="/admin/inventory" className="admin-nav-link">
            <span>▣</span>
            Inventory
          </Link>

          <Link to="/admin/customers" className="admin-nav-link">
            <span>♙</span>
            Customers
          </Link>
        </nav>

        <div className="admin-sidebar-bottom">
          <Link to="/" className="admin-back-link">
            <span>←</span>
            Back to Store
          </Link>

          <p>
            SNEAKPEAK ADMIN PANEL
            <br />
            Manage your store operations.
          </p>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <div className="admin-breadcrumb">ADMIN / DASHBOARD</div>
            <h1>Dashboard Overview</h1>
            <p className="admin-welcome">
              Monitor your store performance and activity.
            </p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Store Management</span>
            </div>
          </div>
        </header>

        <div className="admin-dashboard-toolbar">
          <div>
            <span className="admin-live-dot"></span>
            Live store analytics
          </div>

          <button
            className="admin-refresh-button"
            onClick={fetchDashboard}
            disabled={loading}
          >
            ↻ {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {error && (
          <div className="admin-error-message">
            {error}
            <button onClick={fetchDashboard}>Try again</button>
          </div>
        )}

        <section className="admin-stats">
          {loading && !stats ? (
            <div className="admin-loading">
              Loading dashboard statistics...
            </div>
          ) : (
            statCards.map((card) => (
              <div className="admin-stat-card" key={card.label}>
                <div className="admin-stat-top">
                  <span>{card.label}</span>
                  <div className="admin-stat-icon">{card.icon}</div>
                </div>

                <h2>{card.value}</h2>
                <p>{card.description}</p>
              </div>
            ))
          )}
        </section>

        <section className="admin-content-grid">
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <div className="admin-section-label">LATEST ACTIVITY</div>
                <h2>Recent Orders</h2>
              </div>

              <Link to="/admin/orders" className="admin-view-link">
                View all →
              </Link>
            </div>

            {loading && !stats ? (
              <div className="admin-loading">
                Loading recent orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="admin-empty-state">
                No orders have been placed yet.
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-orders-table">
                  <thead>
                    <tr>
                      <th>ORDER ID</th>
                      <th>CUSTOMER</th>
                      <th>PRODUCT</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                      <th>DATE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="admin-order-id">
                          #{String(order.id || "").slice(-6).toUpperCase()}
                        </td>

                        <td>
                          <strong>{order.customer || "Unknown Customer"}</strong>
                          <small className="admin-customer-email">
                            {order.email || "No email"}
                          </small>
                        </td>

                        <td className="admin-product-cell">
                          {order.product || "—"}
                        </td>

                        <td>{formatCurrency(order.amount)}</td>

                        <td>
                          <span
                            className={`admin-order-status ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {order.status || "Unknown"}
                          </span>
                        </td>

                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-panel admin-quick-panel">
            <div className="admin-section-label">STORE HEALTH</div>
            <h2>Quick Overview</h2>

            <div className="admin-quick-item">
              <div className="admin-quick-icon">▤</div>
              <div>
                <strong>{stats?.totalOrders ?? "—"} Total Orders</strong>
                <p>Orders recorded in your store.</p>
              </div>
            </div>

            <div className="admin-quick-item">
              <div className="admin-quick-icon">◷</div>
              <div>
                <strong>{stats?.pendingOrders ?? "—"} Pending Orders</strong>
                <p>Orders that need attention.</p>
              </div>
            </div>

            <div className="admin-quick-item">
              <div className="admin-quick-icon">⚠</div>
              <div>
                <strong>
                  {stats?.lowStockProducts ?? "—"} Low Stock Products
                </strong>
                <p>
                  Products with at least one size having 1–5 pairs.
                </p>
              </div>
            </div>

            <div className="admin-quick-item">
              <div className="admin-quick-icon">⊘</div>
              <div>
                <strong>
                  {stats?.outOfStockProducts ?? "—"} Out of Stock Products
                </strong>
                <p>
                  Products with at least one size having zero pairs.
                </p>
              </div>
            </div>

            <Link to="/admin/inventory" className="admin-inventory-link">
              Manage Inventory →
            </Link>

            <div className="admin-preview-note">
              Dashboard figures are fetched directly from your store database.
              Refresh to retrieve the latest information.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
