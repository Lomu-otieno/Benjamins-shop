import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const Cart = () => {
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
    try {
      await removeFromCart(productId);
    } catch (error) {
      alert("Failed to remove item");
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-items">
          {items.map((item) => (
            <div key={item.product._id} className="cart-item">
              <div className="item-image">
                <img
                  src={item.product.images?.[0]?.url || "/placeholder.jpg"}
                  alt={item.product.name}
                />
              </div>

              <div className="item-details">
                <h3>{item.product.name}</h3>
                <p className="item-price">${item.product.price}</p>
              </div>

              <div className="quantity-controls">
                <button
                  onClick={() =>
                    handleQuantityChange(item.product._id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.product._id, item.quantity + 1)
                  }
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="item-total">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>

              <button
                className="remove-btn"
                onClick={() => handleRemove(item.product._id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="total">
            <strong>Total: ${getCartTotal().toFixed(2)}</strong>
          </div>
          <Link to="/checkout" className="btn btn-primary">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
