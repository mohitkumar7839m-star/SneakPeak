
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div>
        <Link to="/" className="logo">
          SNEAK<span>PEAK</span><span className="logo-dot">.</span>
        </Link>
        <p>Find your pair. Own your style.</p>
      </div>

      <div className="footer-links">
        <Link to="/products">Shop sneakers</Link>
        <Link to="/login">Your account</Link>
        <Link to="/register">Become a member</Link>
      </div>

      <p className="footer-copy">© 2026 SneakPeak. Built for sneaker culture.</p>
    </footer>
  );
}

export default Footer;
