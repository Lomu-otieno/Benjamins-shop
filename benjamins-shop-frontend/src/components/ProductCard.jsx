// src/components/ProductCard.jsx
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
      alert("Added to cart!");
    } catch (error) {
      alert("Failed to add item to cart");
    }
  };

  // Handle different image formats in your products
  const getProductImage = () => {
    // Some products have images array, some have direct image property
    if (product.images && product.images.length > 0) {
      return product.images[0].url;
    } else if (product.image) {
      return product.image;
    }
    return null;
  };

  const productImage = getProductImage();

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-image">
          {productImage ? (
            <img src={productImage} alt={product.name} />
          ) : (
            <div className="no-image">No Image</div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">Ksh {product.price}</p>
          <p className="product-category">
            {product.category || "Uncategorized"}
          </p>
          <p className="product-description">
            {product.description?.substring(0, 100)}...
          </p>
          <p className="product-stock">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
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
