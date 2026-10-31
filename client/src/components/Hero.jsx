import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow">
          <span className="status-dot" /> THE NEXT STEP IN SNEAKER CULTURE
        </span>

        <h1>
          FIND YOUR PAIR.
          <br />
          OWN YOUR <span>STYLE.</span>
        </h1>

        <p>
          Discover the sneakers that move you. From everyday essentials to
          statement-making icons, your next pair is waiting.
        </p>

        <div className="hero-actions">
          <Link to="/products" className="button-primary">
            Explore Collection <span>↗</span>
          </Link>
          <a href="#featured" className="button-secondary">
            Discover More <span>↓</span>
          </a>
        </div>

        <div className="hero-stats">
          <div>
            <strong>01.</strong>
            <span>Find your fit</span>
          </div>
          <div>
            <strong>02.</strong>
            <span>Choose your style</span>
          </div>
          <div>
            <strong>03.</strong>
            <span>Make it yours</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-image">
          <img
            src="https://one8.com/cdn/shop/files/V10018201_03_2f0eb140-a784-451d-9138-e7436aebf7a0.jpg?v=1781597963&width=1080"
            alt="Red ONE8 cricket shoes"
          />
        </div>
        <div className="hero-tag tag-top">DESIGNED TO MOVE</div>
        <div className="hero-tag tag-bottom">
          <span>✳</span> YOUR NEXT FAVORITE PAIR
        </div>
        <span className="hero-index">SP / 001</span>
      </div>

      <div className="hero-bottom-label">STEP INTO SOMETHING DIFFERENT.</div>
    </section>
  );
}

export default Hero;
