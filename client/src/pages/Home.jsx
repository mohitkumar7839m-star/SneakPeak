
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";

const products = [
  {
    _id: "sample-1",
    name: "Air Motion Red",
    category: "RUNNING / PERFORMANCE",
    price: 7499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    badge: "BESTSELLER"
  },
  {
    _id: "sample-2",
    name: "Urban Classic",
    category: "LIFESTYLE / EVERYDAY",
    price: 5299,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    badge: "POPULAR"
  },
  {
    _id: "sample-3",
    name: "Street Form",
    category: "STREETWEAR / ESSENTIALS",
    price: 6199,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
    badge: "NEW ARRIVAL"
  }
];

const categories = [
  { number: "01", name: "Running", description: "Built for every stride" },
  { number: "02", name: "Lifestyle", description: "Everyday, elevated" },
  { number: "03", name: "Streetwear", description: "Make your own rules" }
];


function Home() {
  return (
    <>
      <Hero />

      <section className="featured section-wrap" id="featured">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE ROTATION STARTS HERE</span>
            <h2>THE <span>HEAVY</span> HITTERS.</h2>
          </div>
          <Link to="/products" className="text-link">
            View all sneakers ↗
          </Link>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <section className="categories section-wrap" id="categories">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR GAME. YOUR RULES.</span>
            <h2>FIND YOUR <span>LANE.</span></h2>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${category.name}`}
              className="category-card"
              key={category.number}
            >
              <span>{category.number} / CATEGORY</span>
              <div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
              <span className="category-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="join-banner section-wrap">
        <div>
          <span className="eyebrow">GOOD TASTE STARTS HERE</span>
          <h2>YOUR NEXT PAIR<br />IS <span>CALLING.</span></h2>
        </div>
        <Link to="/register" className="button-primary">
          Join SneakPeak <span>↗</span>
        </Link>
      </section>
    </>
  );
}


export default Home;
