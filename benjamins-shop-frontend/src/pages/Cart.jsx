// src/pages/Cart.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";
const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, getCartTotal, loading } =
    useCart();

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      alert("Failed to update quantity");
    }
  };

  const handleRemove = async (productId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your cart?"
      )
    ) {
      try {
        await removeFromCart(productId);
      } catch (error) {
        alert("Failed to remove item");
      }
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <ShoppingBag size={64} color="#6b7280" />
            <h2>Your cart is empty</h2>
            <p>Browse our products and add some items to your cart.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.product?._id} className="cart-item">
                <br></br>

                <div className="item-details">
                  <h3>{item.product?.name}</h3>
                  <br></br>
                  <div className="item-image">
                    <img
                      src={item.product?.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.product?.name}
                    />
                  </div>
                  <p className="item-price">${item.product?.price}</p>
                  {item.product?.stock < 5 && item.product?.stock > 0 && (
                    <p className="low-stock">
                      Only {item.product.stock} left in stock!
                    </p>
                  )}
                </div>

                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.product?._id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="quantity-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.product?._id, item.quantity + 1)
                    }
                    disabled={item.quantity >= (item.product?.stock || 0)}
                    className="quantity-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="item-total">
                  ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                </div>

                <button
                  className="remove-btn"
                  onClick={() => handleRemove(item.product?._id)}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>

            <div className="cart-actions">
              <Link to="/checkout" className="btn btn-primary btn-large">
                Proceed to Checkout
              </Link>
              <button
                onClick={() => navigate("/products")}
                className="btn btn-outline"
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
