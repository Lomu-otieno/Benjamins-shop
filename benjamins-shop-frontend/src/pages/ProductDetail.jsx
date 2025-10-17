// src/pages/ProductDetail.jsx - UPDATED WITH CSS IMPORT
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productsAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import "../styles/ProductDetail.css"; // Import the new CSS file

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data);
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      alert("Product added to cart!");
    } catch (error) {
      alert("Failed to add product to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="error-page">
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> &gt;
          <Link to="/products">Products</Link> &gt;
          <span>{product.name}</span>
        </nav>

        <div className="product-detail">
          <div className="product-images">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0].url} alt={product.name} />
            ) : (
              <div className="no-image-large">No Image Available</div>
            )}
          </div>

          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="product-price">Ksh {product.price}</p>
            <p className="product-description">{product.description}</p>

            <div className="product-meta">
              <p>
                <strong>Category:</strong> {product.category || "Uncategorized"}
              </p>
              <p>
                <strong>Stock:</strong> {product.stock}
              </p>
              <p>
                <strong>Status:</strong>
                <span
                  className={
                    product.isActive ? "status-active" : "status-inactive"
                  }
                >
                  {product.isActive ? " Active" : " Inactive"}
                </span>
              </p>
            </div>

            <div className="purchase-section">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  disabled={product.stock === 0}
                >
                  {[...Array(Math.min(10, product.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className={`btn btn-primary btn-large ${
                  addingToCart ? "adding-to-cart" : ""
                }`}
              >
                <ShoppingCart size={20} />
                {addingToCart
                  ? "Adding..."
                  : product.stock === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            </div>

            <div className="action-buttons">
              <Link to="/products" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
