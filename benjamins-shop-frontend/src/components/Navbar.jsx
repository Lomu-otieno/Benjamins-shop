import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useGuest } from "../context/useGuest"; // ✅ Add import

const Navbar = () => {
  const { getCartCount } = useCart();
  const { sessionId } = useGuest();
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Benjamin's Shop
        </Link>

        {/* Example: If you want to show the session for debugging */}
        {/* <small style={{ color: "#ccc" }}>Session: {sessionId}</small> */}

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
