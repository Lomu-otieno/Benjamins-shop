import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { getCartCount } = useCart();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Benjamin's Shop
        </Link>

        <div className="nav-search">
          <input type="text" placeholder="Search products..." />
          <Search size={20} />
        </div>

        <div className="nav-links">
          <Link to="/products">Products</Link>
          <Link to="/cart" className="cart-link">
            <ShoppingCart size={20} />
            <span className="cart-count">{getCartCount()}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
