
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

const categories = ["All Sneakers", "Running", "Lifestyle", "Streetwear"];

function getProductPrice(product) {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const availableSizes = sizes.filter((item) => Number(item.stock) > 0);
  const pricesFromSizes = (availableSizes.length ? availableSizes : sizes)
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (pricesFromSizes.length) {
    return Math.min(...pricesFromSizes);
  }

  return Number(product.price) || 0;
}

function getProductImage(product) {
  if (!Array.isArray(product.images) || !product.images.length) {
    return product.image || "";
  }

  const firstImage = product.images[0];

  if (typeof firstImage === "string") {
    return firstImage;
  }

  return firstImage?.url || firstImage?.imageUrl || "";
}

function normalizeProduct(product) {
  const seller = product.sellerId;

  return {
    ...product,
    _id: product._id,
    name: product.name || "Unnamed Sneaker",
    category: product.category || "Sneakers",
    price: getProductPrice(product),
    image: getProductImage(product),
    badge: product.badge || "FEATURED",
    seller:
      typeof seller === "object"
        ? seller?.name || seller?.storeName || "SneakPeak Select"
        : "SneakPeak Select",
  };
}

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const validCategories = ["Running", "Lifestyle", "Streetwear"];

  const initialCategory = validCategories.includes(categoryFromUrl)
    ? categoryFromUrl
    : "All Sneakers";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products/all");
        const productList = response.data?.products;

        if (!Array.isArray(productList)) {
          throw new Error("Invalid product data received from server.");
        }

        const activeProducts = productList
          .filter((product) => !product.isArchived)
          .map(normalizeProduct);

        if (isMounted) {
          setProducts(activeProducts);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load sneakers. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const term = search.trim().toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          (product.brand || "").toLowerCase().includes(term)
      );
    }

    if (category !== "All Sneakers") {
      result = result.filter((product) =>
        product.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (priceRange === "under5000") {
      result = result.filter((product) => product.price < 5000);
    } else if (priceRange === "5000to7000") {
      result = result.filter(
        (product) => product.price >= 5000 && product.price <= 7000
      );
    } else if (priceRange === "above7000") {
      result = result.filter((product) => product.price > 7000);
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, category, sort, priceRange]);

  function selectCategory(value) {
    setCategory(value);

    if (value === "All Sneakers") {
      setSearchParams({});
    } else {
      setSearchParams({ category: value });
    }
  }

  function clearFilters() {
    setSearch("");
    setCategory("All Sneakers");
    setSort("featured");
    setPriceRange("all");
    setSearchParams({});
  }

  return (
    <section className="catalog-page">
      <div className="catalog-hero">
        <span className="eyebrow">THE SNEAKPEAK COLLECTION</span>
        <h1>
          FIND YOUR <span>PAIR.</span>
        </h1>
        <p>Fresh kicks. Timeless classics. Your style, your rules.</p>
      </div>

      <div className="catalog-content">
        <div className="catalog-toolbar">
          <div>
            <span className="catalog-label">THE COLLECTION</span>
            <h2>{category}</h2>
            <p className="catalog-count">
              {loading ? "Loading sneakers..." : `${filteredProducts.length} pairs found`}
            </p>
          </div>

          <label className="catalog-sort">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>

        <div className="catalog-filters">
          <label className="catalog-search">
            <input
              type="search"
              placeholder="Search sneakers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search sneakers"
            />
          </label>

          <div className="catalog-categories" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`category-filter ${category === item ? "selected" : ""}`}
                onClick={() => selectCategory(item)}
                aria-pressed={category === item}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="catalog-price">
            <span>Price</span>
            <select
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
            >
              <option value="all">All prices</option>
              <option value="under5000">Under ₹5,000</option>
              <option value="5000to7000">₹5,000–₹7,000</option>
              <option value="above7000">Above ₹7,000</option>
            </select>
          </label>

          <button
            type="button"
            className="catalog-clear"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

        {loading ? (
          <div className="catalog-empty">
            <h3>Loading sneakers...</h3>
            <p>Getting the latest collection for you.</p>
          </div>
        ) : error ? (
          <div className="catalog-empty">
            <h3>Couldn't load sneakers.</h3>
            <p>{error}</p>
            <button
              type="button"
              className="button-primary"
              onClick={() => setRetryCount((count) => count + 1)}
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="product-grid catalog-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <h3>No sneakers found.</h3>
            <p>Try another search or adjust your filters.</p>
            <button
              type="button"
              className="button-primary"
              onClick={clearFilters}
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;
