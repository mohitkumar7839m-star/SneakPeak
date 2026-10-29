
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-image">
        <span className="product-badge">{product.badge || "FEATURED"}</span>
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="product-arrow">↗</span>
      </Link>

      <div className="product-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
      </div>

      <p className="product-seller">{product.seller || "SneakPeak Select"}</p>
    </article>
  );
}

export default ProductCard;
