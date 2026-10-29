
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
            🛍 Cart
          </NavLink>

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
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
