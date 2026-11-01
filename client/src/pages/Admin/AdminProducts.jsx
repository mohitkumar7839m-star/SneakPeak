
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./AdminProducts.css";

const emptyForm = {
  name: "",
  brand: "",
  category: "",
  color: "",
  description: "",
  image: "",
  sizes: [{ size: "7", price: "", stock: "0" }],
};

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  "Something went wrong. Please try again.";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [visibility, setVisibility] = useState("Active");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchProducts = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/products/all",
        {
          ...getAuthConfig(),
          params: {
            page: 1,
            limit: 50,
          },
        }
      );

      const data = response.data;

      if (!data.success || !Array.isArray(data.products)) {
        throw new Error("Unable to load products from the server.");
      }

      setProducts(data.products);
      setTotalProducts(data.total ?? data.products.length);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ],
    [products]
  );

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const term = search.trim().toLowerCase();

      const matchesSearch =
        (product.name || "").toLowerCase().includes(term) ||
        (product.brand || "").toLowerCase().includes(term);

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesVisibility =
        visibility === "All" ||
        (visibility === "Active" && !product.isArchived) ||
        (visibility === "Archived" && product.isArchived);

      return matchesSearch && matchesCategory && matchesVisibility;
    });
  }, [products, search, category, visibility]);

  const activeProducts = products.filter(
    (product) => !product.isArchived
  );

  const getStock = (product) =>
    (product.sizes || []).reduce(
      (sum, item) => sum + Number(item.stock || 0),
      0
    );

  const getPrice = (product) => {
    const prices = (product.sizes || []).map(
      (item) => Number(item.price)
    );

    return prices.length ? Math.min(...prices) : 0;
  };

  const totalStock = activeProducts.reduce(
    (sum, product) => sum + getStock(product),
    0
  );

  const lowStock = activeProducts.filter((product) => {
    const stock = getStock(product);
    return stock > 0 && stock <= 10;
  }).length;

  const outOfStock = activeProducts.filter(
    (product) => getStock(product) === 0
  ).length;

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sizes: [{ size: "7", price: "", stock: "0" }],
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    if (product.isArchived) return;

    setEditingId(product._id);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      color: product.color || "",
      description: product.description || "",
      image: product.images?.[0] || "",
      sizes: (product.sizes || []).map((item) => ({
        size: String(item.size),
        price: String(item.price),
        stock: String(item.stock),
      })),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const changeField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const changeSize = (index, field, value) => {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));
  };

  const addSize = () => {
    setForm((current) => ({
      ...current,
      sizes: [
        ...current.sizes,
        { size: "", price: "", stock: "0" },
      ],
    }));
  };

  const removeSize = (index) => {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.filter((_, i) => i !== index),
    }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.brand.trim() ||
      !form.description.trim() ||
      !form.sizes.length
    ) {
      setError("Complete all required product details.");
      return;
    }

    const sizes = form.sizes.map((item) => ({
      size: Number(item.size),
      price: Number(item.price),
      stock: Number(item.stock),
    }));

    if (
      sizes.some(
        (item) =>
          !Number.isFinite(item.size) ||
          item.size <= 0 ||
          !Number.isFinite(item.price) ||
          item.price < 0 ||
          !Number.isInteger(item.stock) ||
          item.stock < 0
      )
    ) {
      setError(
        "Enter valid sizes, prices and whole-number stock quantities."
      );
      return;
    }

    if (
      new Set(sizes.map((item) => item.size)).size !== sizes.length
    ) {
      setError("Each shoe size can only be listed once.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category.trim(),
      color: form.color.trim(),
      description: form.description.trim(),
      images: form.image.trim() ? [form.image.trim()] : [],
      sizes,
    };

    try {
      setSaving(true);

      const config = getAuthConfig();

      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          productData,
          config
        );

        setSuccess("Product updated successfully.");
      } else {
        await api.post(
          "/products",
          productData,
          config
        );

        setSuccess("Product created successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await fetchProducts(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const archiveProduct = async (product) => {
    const confirmed = window.confirm(
      `Archive "${product.name}"? It will disappear from the active product list.`
    );

    if (!confirmed) return;

    try {
      setActionId(product._id);
      setError("");
      setSuccess("");

      await api.patch(
        `/products/${product._id}/archive`,
        { isArchived: true },
        getAuthConfig()
      );

      setSuccess(`${product.name} archived successfully.`);
      await fetchProducts(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const restoreProduct = async (product) => {
    try {
      setActionId(product._id);
      setError("");
      setSuccess("");

      await api.patch(
        `/products/${product._id}/archive`,
        { isArchived: false },
        getAuthConfig()
      );

      setSuccess(`${product.name} restored successfully.`);
      await fetchProducts(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="admin-products-layout">
      <aside className="admin-products-sidebar">
        <Link to="/admin" className="admin-products-brand">
          SNEAK<span>PEAK</span>
        </Link>

        <p className="admin-products-menu-label">WORKSPACE</p>

        <Link to="/admin" className="admin-products-nav">
          ▦ Dashboard
        </Link>

        <Link to="/admin/orders" className="admin-products-nav">
          ▤ Orders
        </Link>

        <Link
          to="/admin/products"
          className="admin-products-nav active"
        >
          ◈ Products
        </Link>

        <Link to="/admin/inventory" className="admin-products-nav">
          ▥ Inventory
        </Link>

        <Link to="/admin/customers" className="admin-products-nav">
          ♙ Customers
        </Link>

        <div className="admin-products-sidebar-bottom">
          <Link to="/" className="admin-products-store-link">
            ← Back to Store
          </Link>
          <p>ADMIN PANEL</p>
          <span>Live database</span>
        </div>
      </aside>

      <main className="admin-products-main">
        <header className="admin-products-header">
          <div>
            <p className="admin-products-eyebrow">
              MANAGEMENT / PRODUCTS
            </p>
            <h1>Products</h1>
            <p className="admin-products-subtitle">
              Manage your sneaker catalogue and stock.
            </p>
          </div>

          <button
            className="admin-products-add-btn"
            onClick={openAddForm}
            disabled={loading}
          >
            + Add Product
          </button>
        </header>

        {error && !showForm && (
          <div className="admin-products-alert error" role="alert">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {success && (
          <div className="admin-products-alert success" role="status">
            {success}
            <button onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        <section className="admin-products-stats">
          <article>
            <span>Active Products</span>
            <strong>{activeProducts.length}</strong>
          </article>

          <article>
            <span>Total Units in Stock</span>
            <strong>{totalStock}</strong>
          </article>

          <article>
            <span>Low Stock Products</span>
            <strong>{lowStock}</strong>
          </article>

          <article>
            <span>Out of Stock</span>
            <strong>{outOfStock}</strong>
          </article>
        </section>

        <section className="admin-products-panel">
          <div className="admin-products-panel-heading">
            <div>
              <h2>Product Catalogue</h2>
              <p>
                {loading
                  ? "Loading products..."
                  : `${visibleProducts.length} shown of ${totalProducts} products`}
              </p>
            </div>

            <div className="admin-products-filters">
              <input
                type="search"
                placeholder="Search products or brands..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
                <option value="All">All Products</option>
              </select>

              <button
                type="button"
                className="admin-products-refresh"
                onClick={() => fetchProducts(true)}
                disabled={refreshing || loading}
              >
                {refreshing ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>
          </div>

          <div className="admin-products-table-wrap">
            <table className="admin-products-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>BRAND</th>
                  <th>CATEGORY</th>
                  <th>STARTING PRICE</th>
                  <th>TOTAL STOCK</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="admin-products-empty">
                      Loading products from database...
                    </td>
                  </tr>
                ) : visibleProducts.length > 0 ? (
                  visibleProducts.map((product) => {
                    const stock = getStock(product);
                    const image =
                      product.images?.[0] ||
                      "https://placehold.co/70x70/171b16/c6ff00?text=S";

                    return (
                      <tr key={product._id}>
                        <td>
                          <div className="admin-products-product-cell">
                            <img
                              src={image}
                              alt={product.name}
                              onError={(event) => {
                                event.currentTarget.src =
                                  "https://placehold.co/70x70/171b16/c6ff00?text=S";
                              }}
                            />
                            <div>
                              <strong>{product.name}</strong>
                              <span>{product._id}</span>
                            </div>
                          </div>
                        </td>

                        <td>{product.brand}</td>
                        <td>{product.category || "—"}</td>

                        <td className="admin-products-price">
                          {money(getPrice(product))}
                        </td>

                        <td>{stock} units</td>

                        <td>
                          <span
                            className={`admin-products-status ${
                              product.isArchived
                                ? "archived"
                                : stock === 0
                                  ? "out"
                                  : stock <= 10
                                    ? "low"
                                    : "active"
                            }`}
                          >
                            {product.isArchived
                              ? "Archived"
                              : stock === 0
                                ? "Out of stock"
                                : stock <= 10
                                  ? "Low stock"
                                  : "Active"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-products-actions">
                            {!product.isArchived && (
                              <button
                                onClick={() => openEditForm(product)}
                                disabled={actionId === product._id}
                              >
                                Edit
                              </button>
                            )}

                            {product.isArchived ? (
                              <button
                                onClick={() => restoreProduct(product)}
                                disabled={actionId === product._id}
                              >
                                {actionId === product._id
                                  ? "Please wait..."
                                  : "Restore"}
                              </button>
                            ) : (
                              <button
                                className="archive"
                                onClick={() => archiveProduct(product)}
                                disabled={actionId === product._id}
                              >
                                {actionId === product._id
                                  ? "Please wait..."
                                  : "Archive"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="admin-products-empty">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showForm && (
        <div
          className="admin-products-modal-backdrop"
          onClick={() => !saving && setShowForm(false)}
        >
          <form
            className="admin-products-modal"
            onSubmit={saveProduct}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-products-modal-heading">
              <div>
                <p>PRODUCT CATALOGUE</p>
                <h2>
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-products-close"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {error && (
              <p className="admin-products-error" role="alert">
                {error}
              </p>
            )}

            <div className="admin-products-form-grid">
              <label>
                Product Name *
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    changeField("name", event.target.value)
                  }
                  placeholder="e.g. Air Max Pulse"
                />
              </label>

              <label>
                Brand *
                <input
                  required
                  value={form.brand}
                  onChange={(event) =>
                    changeField("brand", event.target.value)
                  }
                  placeholder="e.g. Nike"
                />
              </label>

              <label>
                Category
                <input
                  value={form.category}
                  onChange={(event) =>
                    changeField("category", event.target.value)
                  }
                  placeholder="e.g. Running"
                />
              </label>

              <label>
                Color
                <input
                  value={form.color}
                  onChange={(event) =>
                    changeField("color", event.target.value)
                  }
                  placeholder="e.g. Black"
                />
              </label>

              <label className="full">
                Image URL
                <input
                  type="url"
                  value={form.image}
                  onChange={(event) =>
                    changeField("image", event.target.value)
                  }
                  placeholder="https://example.com/shoe.jpg"
                />
              </label>

              <label className="full">
                Description *
                <textarea
                  required
                  rows="3"
                  value={form.description}
                  onChange={(event) =>
                    changeField("description", event.target.value)
                  }
                  placeholder="Describe this sneaker..."
                />
              </label>
            </div>

            <div className="admin-products-size-heading">
              <h3>Sizes, Prices & Stock *</h3>
              <button type="button" onClick={addSize}>
                + Add Size
              </button>
            </div>

            {form.sizes.map((item, index) => (
              <div className="admin-products-size-row" key={index}>
                <label>
                  Size
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={item.size}
                    onChange={(event) =>
                      changeSize(index, "size", event.target.value)
                    }
                  />
                </label>

                <label>
                  Price (₹)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={item.price}
                    onChange={(event) =>
                      changeSize(index, "price", event.target.value)
                    }
                  />
                </label>

                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={item.stock}
                    onChange={(event) =>
                      changeSize(index, "stock", event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="remove-size"
                  disabled={form.sizes.length === 1}
                  onClick={() => removeSize(index)}
                >
                  ×
                </button>
              </div>
            ))}

            <div className="admin-products-form-actions">
              <button
                type="button"
                className="cancel"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
