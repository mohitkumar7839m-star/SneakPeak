
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminInventory.css";

const API_URL = "http://localhost:5000/api/inventory";

function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [operation, setOperation] = useState("increase");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Please sign in to access inventory management.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load inventory.");
      }

      setInventory(data.inventory || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const statistics = useMemo(() => {
    const sizes = inventory.flatMap((product) =>
      (product.sizes || []).map((item) => ({
        ...item,
        productId: product.productId
      }))
    );

    return {
      products: inventory.length,
      totalStock: sizes.reduce((total, item) => total + item.stock, 0),
      lowStock: sizes.filter((item) => item.stock > 0 && item.stock <= 5).length,
      outOfStock: sizes.filter((item) => item.stock === 0).length
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory
      .map((product) => {
        const matchingSizes = (product.sizes || []).filter((item) => {
          if (filter === "low") return item.stock > 0 && item.stock <= 5;
          if (filter === "out") return item.stock === 0;
          return true;
        });

        return {
          ...product,
          sizes: matchingSizes
        };
      })
      .filter((product) => {
        const matchesSearch =
          product.name?.toLowerCase().includes(search.toLowerCase()) ||
          product.brand?.toLowerCase().includes(search.toLowerCase());

        return matchesSearch && product.sizes.length > 0;
      });
  }, [inventory, search, filter]);

  function openStockEditor(product, sizeItem) {
    setSelectedItem({
      productId: product.productId,
      productName: product.name,
      brand: product.brand,
      size: sizeItem.size,
      currentStock: sizeItem.stock
    });

    setOperation("increase");
    setQuantity("");
    setMessage("");
    setError("");
  }

  async function handleStockUpdate(event) {
    event.preventDefault();

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount < 0) {
      setError("Enter a valid whole number.");
      return;
    }

    if (operation !== "set" && amount < 1) {
      setError("Enter a quantity greater than zero.");
      return;
    }

    if (operation === "decrease" && amount > selectedItem.currentStock) {
      setError("You cannot remove more pairs than the available stock.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const body =
        operation === "set"
          ? {
              size: selectedItem.size,
              stock: amount
            }
          : {
              size: selectedItem.size,
              change: operation === "increase" ? amount : -amount
            };

      const response = await fetch(
        `${API_URL}/${selectedItem.productId}/stock`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update stock.");
      }

      setSelectedItem(null);
      setQuantity("");
      setMessage(data.message || "Inventory updated successfully.");
      await fetchInventory();
    } catch (err) {
      setError(err.message || "Stock update failed.");
    } finally {
      setSaving(false);
    }
  }

  function getStockStatus(stock) {
    if (stock === 0) {
      return { label: "Out of stock", className: "out" };
    }

    if (stock <= 5) {
      return { label: "Low stock", className: "low" };
    }

    return { label: "In stock", className: "good" };
  }

  return (
    <div className="inventory-admin">
      <aside className="inventory-sidebar">
        <Link to="/admin" className="inventory-brand">
          SNEAK<span>PEAK</span>
          <small>ADMIN PANEL</small>
        </Link>

        <div className="inventory-nav-label">WORKSPACE</div>

        <nav className="inventory-nav">
          <Link to="/admin" className="inventory-nav-link">
            <span>▦</span> Dashboard
          </Link>

          <Link to="/admin/orders" className="inventory-nav-link">
            <span>▤</span> Orders
          </Link>

          <Link to="/admin/products" className="inventory-nav-link">
            <span>◈</span> Products
          </Link>

          <Link
            to="/admin/inventory"
            className="inventory-nav-link active"
          >
            <span>▥</span> Inventory
          </Link>
        </nav>

        <div className="inventory-sidebar-bottom">
          <Link to="/" className="inventory-store-link">
            ← Back to Store
          </Link>
        </div>
      </aside>

      <main className="inventory-main">
        <header className="inventory-topbar">
          <div>
            <p>ADMINISTRATION / INVENTORY</p>
            <h2>Inventory Management</h2>
          </div>

          <div className="inventory-admin-profile">
            <div className="inventory-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Store Management</span>
            </div>
          </div>
        </header>

        <section className="inventory-content">
          <div className="inventory-heading">
            <div>
              <span className="inventory-eyebrow">STOCK CONTROL</span>
              <h1>Inventory Overview</h1>
              <p>Monitor sneaker stock and manage available sizes.</p>
            </div>

            <button
              className="inventory-refresh"
              onClick={fetchInventory}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          <div className="inventory-stats">
            <div className="inventory-stat-card">
              <span className="inventory-stat-icon">▦</span>
              <p>Total Products</p>
              <h2>{statistics.products}</h2>
              <span>Active products</span>
            </div>

            <div className="inventory-stat-card">
              <span className="inventory-stat-icon">▥</span>
              <p>Total Available Pairs</p>
              <h2>{statistics.totalStock}</h2>
              <span>Across all sizes</span>
            </div>

            <div className="inventory-stat-card">
              <span className="inventory-stat-icon warning">!</span>
              <p>Low Stock Sizes</p>
              <h2>{statistics.lowStock}</h2>
              <span>1–5 pairs remaining</span>
            </div>

            <div className="inventory-stat-card">
              <span className="inventory-stat-icon danger">×</span>
              <p>Out of Stock Sizes</p>
              <h2>{statistics.outOfStock}</h2>
              <span>Zero pairs remaining</span>
            </div>
          </div>

          {message && (
            <div className="inventory-alert success">
              <span>✓</span> {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {error && (
            <div className="inventory-alert error">
              <span>!</span> {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}

          <section className="inventory-table-section">
            <div className="inventory-table-heading">
              <div>
                <h2>Stock Details</h2>
                <p>Manage stock for each available shoe size.</p>
              </div>

              <span className="inventory-live-label">
                <span></span> LIVE INVENTORY
              </span>
            </div>

            <div className="inventory-toolbar">
              <div className="inventory-search">
                <span>⌕</span>
                <input
                  type="text"
                  placeholder="Search product or brand..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="inventory-filters">
                <button
                  className={filter === "all" ? "selected" : ""}
                  onClick={() => setFilter("all")}
                >
                  All Stock
                </button>
                <button
                  className={filter === "low" ? "selected" : ""}
                  onClick={() => setFilter("low")}
                >
                  Low Stock
                </button>
                <button
                  className={filter === "out" ? "selected" : ""}
                  onClick={() => setFilter("out")}
                >
                  Out of Stock
                </button>
              </div>
            </div>

            {loading ? (
              <div className="inventory-empty">
                <div className="inventory-loader"></div>
                <p>Loading inventory...</p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="inventory-empty">
                <span>▥</span>
                <h3>No inventory found</h3>
                <p>Try another search or change the stock filter.</p>
              </div>
            ) : (
              <div className="inventory-table-wrap">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>SIZE</th>
                      <th>AVAILABLE PAIRS</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInventory.flatMap((product) =>
                      product.sizes.map((item, index) => {
                        const status = getStockStatus(item.stock);

                        return (
                          <tr key={`${product.productId}-${item.size}`}>
                            <td>
                              <div className="inventory-product-cell">
                                <div className="inventory-product-icon">
                                  SP
                                </div>
                                <div>
                                  <strong>
                                    {index === 0 ? product.name : ""}
                                  </strong>
                                  <span>
                                    {index === 0 ? product.brand : ""}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="inventory-size">
                                UK {item.size}
                              </span>
                            </td>

                            <td>
                              <strong className="inventory-stock-number">
                                {item.stock}
                              </strong>
                              <span className="inventory-pairs"> pairs</span>
                            </td>

                            <td>
                              <span
                                className={`inventory-status ${status.className}`}
                              >
                                {status.label}
                              </span>
                            </td>

                            <td>
                              <button
                                className="inventory-edit-button"
                                onClick={() =>
                                  openStockEditor(product, item)
                                }
                              >
                                Manage Stock <span>→</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="inventory-table-footer">
              Showing {filteredInventory.reduce(
                (total, product) => total + product.sizes.length,
                0
              )} size entries
            </div>
          </section>
        </section>
      </main>

      {selectedItem && (
        <div
          className="inventory-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setSelectedItem(null);
              setError("");
            }
          }}
        >
          <div
            className="inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-modal-title"
          >
            <div className="inventory-modal-heading">
              <div>
                <span>STOCK ADJUSTMENT</span>
                <h2 id="inventory-modal-title">Manage Inventory</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setError("");
                }}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="inventory-selected-product">
              <strong>{selectedItem.productName}</strong>
              <span>{selectedItem.brand} · UK {selectedItem.size}</span>
              <p>
                Current stock: <strong>{selectedItem.currentStock} pairs</strong>
              </p>
            </div>

            <form onSubmit={handleStockUpdate}>
              <label htmlFor="inventory-operation">Stock operation</label>
              <select
                id="inventory-operation"
                value={operation}
                onChange={(event) => {
                  setOperation(event.target.value);
                  setQuantity("");
                  setError("");
                }}
              >
                <option value="increase">Increase stock</option>
                <option value="decrease">Decrease stock</option>
                <option value="set">Set exact stock quantity</option>
              </select>

              <label htmlFor="inventory-quantity">
                {operation === "set" ? "New total stock" : "Quantity"}
              </label>
              <input
                id="inventory-quantity"
                type="number"
                min={operation === "set" ? "0" : "1"}
                step="1"
                placeholder={
                  operation === "set"
                    ? "Enter new total stock"
                    : "Enter number of pairs"
                }
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setError("");
                }}
                required
              />

              {error && (
                <p className="inventory-modal-error">{error}</p>
              )}

              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="inventory-cancel-button"
                  disabled={saving}
                  onClick={() => {
                    setSelectedItem(null);
                    setError("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-save-button"
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Update Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInventory;
