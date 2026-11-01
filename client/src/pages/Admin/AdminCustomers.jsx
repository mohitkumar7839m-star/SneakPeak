
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminCustomers.css";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadCustomers(1, search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadCustomers(page, search);
  }, [page]);

  async function loadCustomers(currentPage, currentSearch) {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get("/admin/customers", {
        params: {
          page: currentPage,
          limit: 10,
          search: currentSearch
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCustomers(response.data.customers || []);
      setTotal(response.data.total || 0);
      setPages(response.data.pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function viewCustomer(customerId) {
    try {
      setDetailLoading(true);
      setDetailError("");
      setSelectedCustomer(null);

      const token = localStorage.getItem("token");

      const response = await api.get(`/admin/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSelectedCustomer(response.data.customer);
    } catch (err) {
      setDetailError(
        err.response?.data?.message ||
        "Unable to load customer details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  return (
    <div className="admin-customers">
      <aside className="customers-sidebar">
        <div className="customers-brand">
          SNEAK<span>PEAK</span>
          <small>ADMIN PANEL</small>
        </div>

        <nav className="customers-nav">
          <a href="/admin">Dashboard</a>
          <a href="/admin/orders">Orders</a>
          <a href="/admin/products">Products</a>
          <a href="/admin/inventory">Inventory</a>
          <a href="/admin/customers" className="active">Customers</a>
        </nav>

        <a href="/" className="customers-store-link">
          ← Back to Store
        </a>
      </aside>

      <main className="customers-main">
        <header className="customers-header">
          <div>
            <p>MANAGEMENT / CUSTOMERS</p>
            <h1>Customers</h1>
            <span>Manage your registered SneakPeak customers.</span>
          </div>

          <div className="customers-admin-badge">
            <span></span>
            ADMIN
          </div>
        </header>

        <section className="customers-stats">
          <div className="customer-stat-card">
            <span>Total Customers</span>
            <strong>{total}</strong>
            <small>Registered accounts</small>
          </div>

          <div className="customer-stat-card">
            <span>Current Page</span>
            <strong>{page} / {pages}</strong>
            <small>Customer directory</small>
          </div>
        </section>

        <section className="customers-content">
          <div className="customers-toolbar">
            <div>
              <h2>Customer Directory</h2>
              <p>View customer profiles and saved addresses.</p>
            </div>

            <input
              type="search"
              placeholder="Search name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && (
            <div className="customers-error">
              {error}
              <button onClick={() => loadCustomers(page, search)}>
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="customers-state">Loading customers...</div>
          ) : !error && customers.length === 0 ? (
            <div className="customers-state">
              No customers found.
            </div>
          ) : !error ? (
            <>
              <div className="customers-table-wrap">
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Addresses</th>
                      <th>Joined</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id}>
                        <td>
                          <div className="customer-name-cell">
                            <div className="customer-avatar">
                              {customer.name?.charAt(0).toUpperCase()}
                            </div>
                            <strong>{customer.name}</strong>
                          </div>
                        </td>

                        <td>{customer.email}</td>
                        <td>{customer.phone || "Not provided"}</td>
                        <td>{customer.addressCount}</td>
                        <td>{formatDate(customer.createdAt)}</td>
                        <td>
                          <button
                            className="customer-view-btn"
                            onClick={() => viewCustomer(customer._id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="customers-pagination">
                <span>
                  Showing {customers.length} of {total} customers
                </span>

                <div>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </button>

                  <strong>{page}</strong>

                  <button
                    disabled={page >= pages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </main>

      {(detailLoading || selectedCustomer || detailError) && (
        <div
          className="customer-modal-overlay"
          onClick={() => {
            setSelectedCustomer(null);
            setDetailError("");
          }}
        >
          <div
            className="customer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="customer-modal-header">
              <div>
                <p>CUSTOMER PROFILE</p>
                <h2>Customer Details</h2>
              </div>

              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setDetailError("");
                }}
              >
                ×
              </button>
            </div>

            {detailLoading ? (
              <div className="customers-state">Loading profile...</div>
            ) : detailError ? (
              <div className="customers-error">{detailError}</div>
            ) : selectedCustomer ? (
              <>
                <div className="customer-profile">
                  <div className="customer-profile-avatar">
                    {selectedCustomer.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3>{selectedCustomer.name}</h3>
                    <span>{selectedCustomer.email}</span>
                  </div>
                </div>

                <div className="customer-detail-grid">
                  <div>
                    <span>Phone</span>
                    <strong>{selectedCustomer.phone || "Not provided"}</strong>
                  </div>

                  <div>
                    <span>Account Type</span>
                    <strong>{selectedCustomer.role}</strong>
                  </div>

                  <div>
                    <span>Joined</span>
                    <strong>{formatDate(selectedCustomer.createdAt)}</strong>
                  </div>
                </div>

                <div className="customer-address-section">
                  <h3>Saved Addresses</h3>

                  {selectedCustomer.addresses?.length ? (
                    selectedCustomer.addresses.map((address) => (
                      <div className="customer-address-card" key={address._id}>
                        <div>
                          <strong>{address.label}</strong>
                          {address.isDefault && <span>DEFAULT</span>}
                        </div>

                        <p>{address.fullName} · {address.phone}</p>
                        <p>{address.addressLine}</p>
                        <p>
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="no-customer-address">
                      This customer has no saved addresses.
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
