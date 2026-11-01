import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const accountRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenu = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    closeMenu();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          SNEAK<span>PEAK</span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav
          id="main-navigation"
          className={`nav-links ${menuOpen ? "active" : ""}`}
        >
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/products" onClick={closeMenu}>
            Sneakers
          </NavLink>

          <NavLink to="/wishlist" onClick={closeMenu}>
            ♡ Wishlist
          </NavLink>

          <NavLink to="/cart" onClick={closeMenu}>
            🛒 Cart
          </NavLink>

          {!isLoggedIn ? (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                Login
              </NavLink>

              <NavLink
                to="/register"
                className="nav-register"
                onClick={closeMenu}
              >
                Join Us
              </NavLink>
            </>
          ) : (
            <div className="account-menu" ref={accountRef}>
              <button
                type="button"
                className={`account-trigger ${accountOpen ? "active" : ""}`}
                onClick={() => setAccountOpen((open) => !open)}
                aria-label="My account"
                aria-expanded={accountOpen}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
                <span>Account</span>
              </button>

              {accountOpen && (
                <div className="account-dropdown">
                  <div className="account-dropdown-heading">
                    <span className="account-dropdown-label">
                      MY ACCOUNT
                    </span>
                    <span className="account-dropdown-subtitle">
                      Manage your SneakPeak account
                    </span>
                  </div>

                  <NavLink to="/profile" onClick={closeMenu}>
                    <span>♙</span>
                    My Profile
                  </NavLink>

                  <NavLink to="/orders" onClick={closeMenu}>
                    <span>▤</span>
                    My Orders
                  </NavLink>

                  <NavLink to="/wishlist" onClick={closeMenu}>
                    <span>♡</span>
                    My Wishlist
                  </NavLink>

                  <button
                    type="button"
                    className="account-logout"
                    onClick={handleLogout}
                  >
                    <span>↪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;