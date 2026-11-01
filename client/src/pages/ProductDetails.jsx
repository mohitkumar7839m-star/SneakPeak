import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function readStorage(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function getImages(product) {
  if (!Array.isArray(product?.images)) {
    return product?.image ? [product.image] : [];
  }

  return product.images
    .map((image) =>
      typeof image === "string" ? image : image?.url || image?.imageUrl || "",
    )
    .filter(Boolean);
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setSelectedSize(null);
        setQuantity(1);
        setMessage("");
        setImageError(false);

        const response = await api.get(`/products/${id}`);
        const fetchedProduct = response.data?.product;

        if (!fetchedProduct || fetchedProduct.isArchived) {
          throw new Error("This sneaker may no longer be available.");
        }

        if (isMounted) {
          setProduct(fetchedProduct);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load this sneaker.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const availableSizes = useMemo(() => {
    if (!Array.isArray(product?.sizes)) {
      return [];
    }

    return product.sizes
      .filter(
        (item) =>
          Number(item.stock) > 0 &&
          Number.isFinite(Number(item.size)) &&
          Number(item.price) > 0,
      )
      .sort((a, b) => Number(a.size) - Number(b.size));
  }, [product]);

  const selectedSizeData = availableSizes.find(
    (item) => Number(item.size) === Number(selectedSize),
  );

  const images = getImages(product);
  const currentImage = images[0] || "";

  const lowestPrice = useMemo(() => {
    const prices = (product?.sizes || [])
      .map((item) => Number(item.price))
      .filter((price) => Number.isFinite(price) && price > 0);

    return prices.length ? Math.min(...prices) : Number(product?.price) || 0;
  }, [product]);

  const currentPrice = selectedSizeData
    ? Number(selectedSizeData.price)
    : lowestPrice;

  async function addToCart() {
    if (!selectedSizeData) {
      setMessage("Please select an available shoe size first.");
      return;
    }

    if (quantity > Number(selectedSizeData.stock)) {
      setMessage(
        `Only ${selectedSizeData.stock} pairs are available in this size.`,
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login to add products to your cart.");
      navigate("/login");
      return;
    }

    try {
      setMessage("Adding sneaker to your cart...");

      await api.post(
        "/cart/add",
        {
          productId: product._id,
          size: Number(selectedSizeData.size),
          quantity: Number(quantity),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage("Added to your cart successfully!");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to add this sneaker to your cart. Please try again.",
      );
    }
  }

  function addToWishlist() {
    const wishlist = readStorage("sneakpeak_wishlist");

    const alreadySaved = wishlist.some(
      (item) => String(item.productId || item._id) === String(product._id),
    );

    if (alreadySaved) {
      setMessage("This sneaker is already in your wishlist.");
      return;
    }

    wishlist.push({
      productId: product._id,
      name: product.name,
      category: product.category,
      price: lowestPrice,
      image: currentImage,
      seller: "SneakPeak Select",
    });

    try {
      localStorage.setItem("sneakpeak_wishlist", JSON.stringify(wishlist));
      window.dispatchEvent(new Event("wishlistUpdated"));
      setMessage("Added to your wishlist!");
    } catch {
      setMessage("Unable to update your wishlist. Please try again.");
    }
  }

  if (loading) {
    return (
      <section className="page-container product-not-found">
        <h1>Loading sneaker...</h1>
        <p>Getting the product details for you.</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="page-container product-not-found">
        <h1>Sneaker not found</h1>
        <p>{error || "This sneaker may no longer be available."}</p>
        <Link to="/products" className="details-back-link">
          Back to sneakers
        </Link>
      </section>
    );
  }

  return (
    <section className="details-page">
      <div className="details-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Sneakers</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="details-layout">
        <div className="details-image-wrap">
          <span className="details-badge">{product.badge || "FEATURED"}</span>

          {imageError || !currentImage ? (
            <div className="product-image-fallback">Image unavailable</div>
          ) : (
            <img
              src={currentImage}
              alt={product.name}
              onError={() => setImageError(true)}
            />
          )}
        </div>

        <div className="details-info">
          <p className="details-category">{product.category || "Sneakers"}</p>

          <h1>{product.name}</h1>

          {product.brand && <p>{product.brand}</p>}

          <p className="details-price">
            ₹{currentPrice.toLocaleString("en-IN")}
          </p>

          <p className="details-description">
            {product.description ||
              "A fresh addition to the SneakPeak collection."}
          </p>

          <div className="details-size-heading">
            <h3>Select Size</h3>
            <span>UK sizing</span>
          </div>

          {availableSizes.length > 0 ? (
            <div className="details-sizes">
              {availableSizes.map((item) => (
                <button
                  type="button"
                  key={item.size}
                  className={`size-option ${
                    Number(selectedSize) === Number(item.size) ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedSize(Number(item.size));
                    setQuantity(1);
                    setMessage("");
                  }}
                  aria-pressed={Number(selectedSize) === Number(item.size)}
                >
                  UK {item.size}
                </button>
              ))}
            </div>
          ) : (
            <p className="details-message">
              Currently out of stock in all sizes.
            </p>
          )}

          {selectedSizeData && (
            <p className="details-message">
              {selectedSizeData.stock} pairs available in UK{" "}
              {selectedSizeData.size}.
            </p>
          )}

          <div className="details-quantity">
            <span>Quantity</span>

            <div className="quantity-control">
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) =>
                    Math.min(
                      10,
                      Number(selectedSizeData?.stock) || 10,
                      current + 1,
                    ),
                  )
                }
                aria-label="Increase quantity"
                disabled={
                  !selectedSizeData ||
                  quantity >= Math.min(10, Number(selectedSizeData.stock))
                }
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            className="details-add-cart"
            onClick={addToCart}
            disabled={!selectedSizeData}
          >
            Add to Cart — ₹{(currentPrice * quantity).toLocaleString("en-IN")}
          </button>

          <button
            type="button"
            className="details-wishlist"
            onClick={addToWishlist}
          >
            ♡ Add to Wishlist
          </button>

          {message && (
            <p className="details-message" role="status">
              {message}
            </p>
          )}

          <div className="details-perks">
            <p>✓ Cash on Delivery available</p>
            <p>✓ Secure checkout</p>
            <p>✓ Size selection before purchase</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;
