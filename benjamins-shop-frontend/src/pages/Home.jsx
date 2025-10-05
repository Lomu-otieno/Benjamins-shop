import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Benjamin's Shop</h1>
            <p>Discover amazing products at unbeatable prices</p>
            <Link to="/products" className="btn btn-primary btn-large">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <h3>🚚 Free Shipping</h3>
              <p>Free shipping on orders over $50</p>
            </div>
            <div className="feature">
              <h3>💳 Secure Payment</h3>
              <p>Your payments are safe and secure</p>
            </div>
            <div className="feature">
              <h3>↩️ Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
