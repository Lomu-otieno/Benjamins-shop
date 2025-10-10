import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Benjamin's Shop</h3>
            <p>Your one-stop shop for quality products at great prices.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/products">Products</a>
              </li>
              <li>
                <a href="/cart">Cart</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>Email: support@benjaminshop.com</p>
            <p>Phone: +254 725 152 364</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Benjamin's Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
