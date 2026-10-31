import { useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Box,
  Check,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './SellerDashboard.css'

const initialProducts = [
  {
    id: 'SP-001',
    name: 'Air Runner Pro',
    category: 'Running',
    price: 7499,
    stock: 24,
    status: 'Active',
    color: '#e8e5de',
    icon: '👟',
  },
  {
    id: 'SP-002',
    name: 'Street Classic Low',
    category: 'Lifestyle',
    price: 5299,
    stock: 12,
    status: 'Active',
    color: '#e4e9df',
    icon: '👟',
  },
  {
    id: 'SP-003',
    name: 'Retro Court 88',
    category: 'Basketball',
    price: 8999,
    stock: 0,
    status: 'Out of stock',
    color: '#e9e0d9',
    icon: '👟',
  },
  {
    id: 'SP-004',
    name: 'Cloud Flex',
    category: 'Running',
    price: 6199,
    stock: 8,
    status: 'Active',
    color: '#e0e6ef',
    icon: '👟',
  },
]

const initialOrders = [
  {
    id: '#ORD-2048',
    customer: 'Aarav Sharma',
    product: 'Air Runner Pro',
    date: 'Oct 30, 2026',
    total: 7499,
    status: 'Processing',
  },
  {
    id: '#ORD-2047',
    customer: 'Priya Verma',
    product: 'Street Classic Low',
    date: 'Oct 29, 2026',
    total: 5299,
    status: 'Shipped',
  },
  {
    id: '#ORD-2046',
    customer: 'Rohan Singh',
    product: 'Cloud Flex',
    date: 'Oct 29, 2026',
    total: 6199,
    status: 'Delivered',
  },
  {
    id: '#ORD-2045',
    customer: 'Ananya Gupta',
    product: 'Air Runner Pro',
    date: 'Oct 28, 2026',
    total: 7499,
    status: 'Processing',
  },
]

const initialActivity = [
  {
    icon: ShoppingBag,
    title: 'New order received',
    detail: 'Order #ORD-2048 has been placed.',
    time: '12 minutes ago',
  },
  {
    icon: Package,
    title: 'Stock running low',
    detail: 'Cloud Flex has only 8 pairs left.',
    time: '1 hour ago',
  },
  {
    icon: Check,
    title: 'Order delivered',
    detail: 'Order #ORD-2046 was delivered.',
    time: '3 hours ago',
  },
]

const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

function SellerDashboard() {
  const [products, setProducts] = useState(initialProducts)
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [notice, setNotice] = useState('')
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Lifestyle',
    price: '',
    stock: '',
  })

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category} ${product.id}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const filteredOrders = orders.filter((order) =>
    `${order.id} ${order.customer} ${order.product}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0,
  )

  const activeProducts = products.filter(
    (product) => product.status === 'Active',
  ).length

  const processingOrders = orders.filter(
    (order) => order.status === 'Processing',
  ).length

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Products', icon: Package },
    { label: 'Orders', icon: ShoppingCart },
  ]

  function notify(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3500)
  }

  function navigateTo(label) {
    setActiveTab(label)
    setSearch('')
    setSidebarOpen(false)
  }

  function addProduct(event) {
    event.preventDefault()

    const price = Number(newProduct.price)
    const stock = Number(newProduct.stock)

    if (
      !newProduct.name.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      notify('Enter a valid name, price and whole-number stock quantity.')
      return
    }

    const product = {
      id: `SP-${String(Date.now()).slice(-6)}`,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price,
      stock,
      status: stock > 0 ? 'Active' : 'Out of stock',
      color: '#e8e5de',
      icon: '👟',
    }

    setProducts((current) => [product, ...current])
    setNewProduct({
      name: '',
      category: 'Lifestyle',
      price: '',
      stock: '',
    })
    setShowProductForm(false)
    setActiveTab('Products')
    notify('Product added to this demo dashboard.')
  }

  function updateOrderStatus(orderId, status) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    )
    notify(`${orderId} status changed to ${status}.`)
  }

  function toggleProductStatus(productId) {
    setProducts((current) =>
      current.map((product) => {
        if (product.id !== productId) return product

        const status =
          product.status === 'Active' ? 'Draft' : 'Active'

        return {
          ...product,
          status: product.stock === 0 ? 'Out of stock' : status,
        }
      }),
    )
  }

  function deleteProduct(productId) {
    setProducts((current) =>
      current.filter((product) => product.id !== productId),
    )
    notify('Product removed from this demo dashboard.')
  }

  return (
    <div className="seller-app">
      <aside className={`seller-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Link
          to="/seller"
          className="seller-brand"
          onClick={() => navigateTo('Overview')}
        >
          <span className="brand-symbol">s.</span>
          <span>
            <strong>sneakpeak</strong>
            <small>SELLER STUDIO</small>
          </span>
        </Link>

        <div className="sidebar-store">
          <div className="store-avatar">S</div>
          <div className="store-details">
            <strong>Street Sole Co.</strong>
            <span>Seller account</span>
          </div>
          <ChevronDown size={16} />
        </div>

        <span className="sidebar-heading">WORKSPACE</span>

        <nav className="seller-nav" aria-label="Seller navigation">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`nav-item ${activeTab === label ? 'nav-active' : ''}`}
              onClick={() => navigateTo(label)}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Orders' && (
                <span className="nav-count">{orders.length}</span>
              )}
            </button>
          ))}
        </nav>

        <span className="sidebar-heading sidebar-tools-heading">
          PREFERENCES
        </span>

        <button
          type="button"
          className="nav-item"
          onClick={() => notify('Store settings will be connected later.')}
        >
          <Store size={19} strokeWidth={1.8} />
          <span>My store</span>
        </button>

        <button
          type="button"
          className="nav-item"
          onClick={() => notify('Settings will be connected later.')}
        >
          <Settings size={19} strokeWidth={1.8} />
          <span>Settings</span>
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <CircleHelp size={19} />
            </div>
            <strong>Need a hand?</strong>
            <p>We are here to help you grow.</p>
            <button
              type="button"
              onClick={() => notify('Support integration is not configured.')}
            >
              Get support <ArrowRight size={14} />
            </button>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={() => notify('Authentication is not connected yet.')}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="seller-main">
        <header className="seller-topbar">
          <button
            type="button"
            className="mobile-menu"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{activeTab}</strong>
          </div>

          <div className="topbar-right">
            <div className="topbar-date">
              <span className="live-dot" />
              Seller workspace
            </div>

            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              onClick={() => notify('You are all caught up.')}
            >
              <Bell size={19} />
              <span />
            </button>

            <div className="topbar-profile">
              <div className="profile-avatar">SS</div>
              <div>
                <strong>Street Sole Co.</strong>
                <span>Store owner</span>
              </div>
            </div>
          </div>
        </header>

        <div className="seller-content">
          <div className="dashboard-welcome">
            <div>
              <div className="eyebrow">
                <Activity size={14} /> YOUR BUSINESS AT A GLANCE
              </div>
              <h1>
                {activeTab === 'Overview'
                  ? 'Good things are in motion.'
                  : activeTab}
              </h1>
              <p>
                {activeTab === 'Overview'
                  ? 'Here’s what’s happening with your store today.'
                  : activeTab === 'Products'
                    ? 'Manage your sneaker catalogue and inventory.'
                    : 'Keep track of orders and fulfilment.'}
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setNewProduct({
                  name: '',
                  category: 'Lifestyle',
                  price: '',
                  stock: '',
                })
                setShowProductForm(true)
              }}
            >
              <Plus size={18} /> Add product
            </button>
          </div>

          {activeTab === 'Overview' && (
            <>
              <section className="seller-stat-grid">
                <article className="seller-stat-card">
                  <div className="stat-top">
                    <span>Total revenue</span>
                    <span className="stat-icon green-icon">
                      <TrendingUp size={19} />
                    </span>
                  </div>
                  <div className="stat-value">{money(128450)}</div>
                  <div className="stat-foot">
                    <span className="trend-positive">
                      <ArrowUpRight size={15} /> 12.8%
                    </span>
                    <span>vs. last month</span>
                  </div>
                  <div className="stat-mini-bar">
                    <span style={{ width: '74%' }} />
                  </div>
                </article>

                <article className="seller-stat-card">
                  <div className="stat-top">
                    <span>Total orders</span>
                    <span className="stat-icon purple-icon">
                      <ShoppingBag size={19} />
                    </span>
                  </div>
                  <div className="stat-value">84</div>
                  <div className="stat-foot">
                    <span className="trend-positive">
                      <ArrowUpRight size={15} /> 8.2%
                    </span>
                    <span>vs. last month</span>
                  </div>
                  <div className="stat-mini-bar purple-bar">
                    <span style={{ width: '62%' }} />
                  </div>
                </article>

                <article className="seller-stat-card">
                  <div className="stat-top">
                    <span>Active products</span>
                    <span className="stat-icon orange-icon">
                      <Package size={19} />
                    </span>
                  </div>
                  <div className="stat-value">{activeProducts}</div>
                  <div className="stat-foot">
                    <span className="stat-neutral">
                      {totalStock} pairs
                    </span>
                    <span>in inventory</span>
                  </div>
                  <div className="stat-mini-bar orange-bar">
                    <span style={{ width: '48%' }} />
                  </div>
                </article>

                <article className="seller-stat-card">
                  <div className="stat-top">
                    <span>Pending orders</span>
                    <span className="stat-icon blue-icon">
                      <ShoppingCart size={19} />
                    </span>
                  </div>
                  <div className="stat-value">{processingOrders}</div>
                  <div className="stat-foot">
                    <span className="stat-neutral">Needs attention</span>
                    <span>right now</span>
                  </div>
                  <div className="stat-mini-bar blue-bar">
                    <span style={{ width: '35%' }} />
                  </div>
                </article>
              </section>

              <section className="seller-middle-grid">
                <article className="seller-panel revenue-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Revenue overview</h2>
                      <p>Your sales performance at a glance.</p>
                    </div>
                    <button
                      type="button"
                      className="period-select"
                      onClick={() =>
                        notify('Monthly chart uses illustrative demo data.')
                      }
                    >
                      Last 7 months <ChevronDown size={15} />
                    </button>
                  </div>

                  <div className="revenue-summary">
                    <strong>{money(128450)}</strong>
                    <span className="trend-positive">
                      <ArrowUpRight size={15} /> 12.8%
                    </span>
                  </div>

                  <div
                    className="revenue-chart"
                    role="img"
                    aria-label="Illustrative monthly revenue chart"
                  >
                    {[35, 48, 41, 64, 54, 78, 68, 92, 72, 84, 62, 100].map(
                      (height, index) => (
                        <div className="chart-column" key={index}>
                          <div
                            className={`chart-bar ${index === 11 ? 'chart-bar-highlight' : ''}`}
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ),
                    )}
                  </div>

                  <div className="chart-labels">
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                  </div>
                  <p className="demo-note">
                    Illustrative chart — connect sales API for live figures.
                  </p>
                </article>

                <article className="seller-panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Recent activity</h2>
                      <p>Latest updates from your store.</p>
                    </div>
                    <button
                      type="button"
                      className="icon-plain"
                      aria-label="Activity options"
                      onClick={() => notify('Showing the latest demo activity.')}
                    >
                      <SlidersHorizontal size={17} />
                    </button>
                  </div>

                  <div className="activity-list">
                    {initialActivity.map((activity, index) => {
                      const Icon = activity.icon
                      return (
                        <div className="activity-item" key={activity.title}>
                          <div className={`activity-icon activity-${index}`}>
                            <Icon size={17} />
                          </div>
                          <div className="activity-copy">
                            <strong>{activity.title}</strong>
                            <p>{activity.detail}</p>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    className="text-link"
                    onClick={() => navigateTo('Orders')}
                  >
                    View orders <ArrowRight size={15} />
                  </button>
                </article>
              </section>
            </>
          )}

          {activeTab === 'Products' && (
            <section className="seller-panel table-panel">
              <div className="panel-heading table-heading">
                <div>
                  <h2>Your products</h2>
                  <p>
                    {products.length} products in your demo catalogue.
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setSearch('')}
                >
                  <X size={15} /> Clear search
                </button>
              </div>

              <div className="table-toolbar">
                <label className="search-box">
                  <Search size={17} />
                  <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <span className="table-count">
                  {filteredProducts.length} products
                </span>
              </div>

              <div className="table-scroll">
                <table className="seller-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>SKU</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <div
                              className="product-thumb"
                              style={{ background: product.color }}
                            >
                              {product.icon}
                            </div>
                            <strong>{product.name}</strong>
                          </div>
                        </td>
                        <td className="muted-cell">{product.id}</td>
                        <td>{product.category}</td>
                        <td className="price-cell">{money(product.price)}</td>
                        <td>
                          <span
                            className={
                              product.stock <= 8
                                ? 'stock-low'
                                : 'stock-normal'
                            }
                          >
                            {product.stock} pairs
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${product.status === 'Active' ? 'status-active' : product.status === 'Draft' ? 'status-draft' : 'status-warning'}`}
                          >
                            <span />
                            {product.status}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              onClick={() => toggleProductStatus(product.id)}
                              title="Toggle active status"
                            >
                              {product.status === 'Active'
                                ? 'Pause'
                                : 'Activate'}
                            </button>
                            <button
                              type="button"
                              className="delete-action"
                              onClick={() => deleteProduct(product.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-state">
                          No products match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'Orders' && (
            <section className="seller-panel table-panel">
              <div className="panel-heading table-heading">
                <div>
                  <h2>Order management</h2>
                  <p>Review orders and update fulfilment status.</p>
                </div>
                <span className="order-summary-pill">
                  {processingOrders} processing
                </span>
              </div>

              <div className="table-toolbar">
                <label className="search-box">
                  <Search size={17} />
                  <input
                    type="search"
                    placeholder="Search orders or customers..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <span className="table-count">
                  {filteredOrders.length} orders
                </span>
              </div>

              <div className="table-scroll">
                <table className="seller-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER</th>
                      <th>PRODUCT</th>
                      <th>DATE</th>
                      <th>TOTAL</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="order-id">{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.product}</td>
                        <td className="muted-cell">{order.date}</td>
                        <td className="price-cell">{money(order.total)}</td>
                        <td>
                          <select
                            className={`order-status-select order-${order.status.toLowerCase()}`}
                            value={order.status}
                            onChange={(event) =>
                              updateOrderStatus(order.id, event.target.value)
                            }
                            aria-label={`Update status for ${order.id}`}
                          >
                            <option>Processing</option>
                            <option>Shipped</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="empty-state">
                          No orders match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="demo-note table-demo-note">
                Order updates are temporary in this demo and are not saved to a
                database.
              </p>
            </section>
          )}

          <footer className="seller-footer">
            <span>© 2026 SneakPeak Marketplace</span>
            <span>
              Built for sellers <span className="footer-heart">♥</span>
            </span>
          </footer>
        </div>
      </main>

      {showProductForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowProductForm(false)
            }
          }}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">PRODUCT CATALOGUE</span>
                <h2 id="product-modal-title">Add a sneaker</h2>
              </div>
              <button
                type="button"
                className="icon-plain"
                aria-label="Close dialog"
                onClick={() => setShowProductForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addProduct}>
              <label>
                Product name
                <input
                  required
                  autoFocus
                  maxLength={100}
                  placeholder="e.g. Air Runner Pro"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Category
                <select
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      category: event.target.value,
                    })
                  }
                >
                  <option>Lifestyle</option>
                  <option>Running</option>
                  <option>Basketball</option>
                  <option>Training</option>
                  <option>Skateboarding</option>
                </select>
              </label>

              <div className="modal-form-row">
                <label>
                  Price (₹)
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    placeholder="4999"
                    value={newProduct.price}
                    onChange={(event) =>
                      setNewProduct({
                        ...newProduct,
                        price: event.target.value,
                      })
                    }
                  />
                </label>

                <label>
                  Stock (pairs)
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    placeholder="20"
                    value={newProduct.stock}
                    onChange={(event) =>
                      setNewProduct({
                        ...newProduct,
                        stock: event.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowProductForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={17} /> Add product
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {notice && (
        <div className="seller-toast" role="status">
          <span className="toast-check">
            <Check size={15} />
          </span>
          {notice}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default SellerDashboard