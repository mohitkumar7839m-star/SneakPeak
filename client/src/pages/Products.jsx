
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";

const products = [
  {
    _id: "sneak-101",
    name: "Air Motion Red",
    category: "Running / Performance",
    price: 7499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    badge: "BESTSELLER",
    seller: "SneakPeak Select"
  },
  {
    _id: "sneak-102",
    name: "Urban Classic",
    category: "Lifestyle / Everyday",
    price: 5299,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    badge: "POPULAR",
    seller: "SneakPeak Select"
  },
  {
    _id: "sneak-103",
    name: "Street Form",
    category: "Streetwear / Essentials",
    price: 6199,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    badge: "NEW ARRIVAL",
    seller: "SneakPeak Select"
  },
  {
    _id: "sneak-104",
    name: "Cloud Runner",
    category: "Running / Performance",
    price: 4499,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
    badge: "VALUE PICK",
    seller: "SneakPeak Select"
  },
  {
    _id: "sneak-105",
    name: "Court Legend",
    category: "Lifestyle / Everyday",
    price: 6899,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    badge: "TRENDING",
    seller: "SneakPeak Select"
  },
  {
    _id: "sneak-106",
    name: "Velocity Pro",
    category: "Running / Performance",
    price: 8999,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80",
    badge: "PREMIUM",
    seller: "SneakPeak Select"
  },
  {
    _id: "sneak-107",
    name: "Metro Low",
    category: "Streetwear / Essentials",
    price: 3999,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
    badge: "EVERYDAY",
    seller: "SneakPeak Select"
  },
  {
    _id: "sneak-108",
    name: "Shadow Flex",
    category: "Streetwear / Essentials",
    price: 5799,
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=800&q=80",
    badge: "NEW ARRIVAL",
    seller: "SneakPeak Select"
  }
];

const categories = ["All Sneakers", "Running", "Lifestyle", "Streetwear"];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All Sneakers";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const term = search.trim().toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
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
  }, [search, category, sort, priceRange]);

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
        <h1>FIND YOUR <span>PAIR.</span></h1>
        <p>Fresh kicks. Timeless classics. Your style, your rules.</p>
      </div>

      <div className="catalog-content">
        <div className="catalog-toolbar">
          <div>
            <span className="catalog-label">THE COLLECTION</span>
            <h2>All Sneakers</h2>
            <p className="catalog-count">
              {filteredProducts.length} pairs found
            </p>
          </div>

          <label className="catalog-sort">
            <span>Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>

        <div className="catalog-filters">
          <label className="catalog-search">
            <span>⌕</span>
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

          <button type="button" className="catalog-clear" onClick={clearFilters}>
            Clear filters
          </button>
        </div>

        {filteredProducts.length > 0 ? (
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
