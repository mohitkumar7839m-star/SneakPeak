
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function getWishlist() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("sneakpeak_wishlist") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function ProductCard({ product }) {
  const productId = product._id || product.productId;

  const [imageError, setImageError] = useState(false);
  const [wishlisted, setWishlisted] = useState(() =>
    getWishlist().some(
      (item) =>
        String(item.productId || item._id) === String(productId)
    )
  );

  useEffect(() => {
    function syncWishlist() {
      setWishlisted(
        getWishlist().some(
          (item) =>
            String(item.productId || item._id) === String(productId)
        )
      );
    }

    window.addEventListener("wishlistUpdated", syncWishlist);

    return () => {
      window.removeEventListener("wishlistUpdated", syncWishlist);
    };
  }, [productId]);

  function toggleWishlist() {
    const wishlist = getWishlist();

    const exists = wishlist.some(
      (item) =>
        String(item.productId || item._id) === String(productId)
    );

    const updatedWishlist = exists
      ? wishlist.filter(
          (item) =>
            String(item.productId || item._id) !== String(productId)
        )
      : [
          ...wishlist,
          {
            productId,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            seller: product.seller || "SneakPeak Select"
          }
        ];

    try {
      localStorage.setItem(
        "sneakpeak_wishlist",
        JSON.stringify(updatedWishlist)
      );

      setWishlisted(!exists);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {
      alert("Unable to update wishlist. Please try again.");
    }
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <Link
          to={`/products/${productId}`}
          className="product-image-link"
          aria-label={`View ${product.name}`}
        >
          <span className="product-badge">
            {product.badge || "FEATURED"}
          </span>

          {imageError ? (
            <div className="product-image-fallback">
              Image unavailable
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}

          <span className="product-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>

        <button
          type="button"
          className={`product-wishlist ${wishlisted ? "active" : ""}`}
          onClick={toggleWishlist}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
        >
          {wishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-info">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>
            <Link to={`/products/${productId}`}>
              {product.name}
            </Link>
          </h3>
        </div>

        <strong>
          ₹{Number(product.price).toLocaleString("en-IN")}
        </strong>
      </div>

      <p className="product-seller">
        {product.seller || "SneakPeak Select"}
      </p>
    </article>
  );
}

export default ProductCard;
