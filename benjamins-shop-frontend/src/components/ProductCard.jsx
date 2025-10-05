import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      alert("Failed to add item to cart");
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-image">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0].url} alt={product.name} />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">${product.price}</p>
          <p className="product-description">
            {product.description?.substring(0, 100)}...
          </p>
        </div>
      </Link>

      <button
        className="add-to-cart-btn"
        onClick={handleAddToCart}
        disabled={product.stock === 0}
      >
        <ShoppingCart size={16} />
        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
