// src/pages/Checkout.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersAPI } from "../services/api";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    shippingAddress: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
    },
  });

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await ordersAPI.create(formData);
      await clearCart();
      navigate(`/order-confirmation/${order.data.orderNumber}`);
    } catch (error) {
      alert("Failed to place order. Please try again.");
      console.error("Order error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="secure-badge">
            <Lock size={16} />
            Secure Checkout
          </div>
        </div>

        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <section className="form-section">
              <h2>Contact Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formData.customerInfo.firstName}
                    onChange={(e) =>
                      handleInputChange(
                        "customerInfo",
                        "firstName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formData.customerInfo.lastName}
                    onChange={(e) =>
                      handleInputChange(
                        "customerInfo",
                        "lastName",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.customerInfo.email}
                    onChange={(e) =>
                      handleInputChange("customerInfo", "email", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.customerInfo.phone}
                    onChange={(e) =>
                      handleInputChange("customerInfo", "phone", e.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="address">Address *</label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={formData.shippingAddress.address}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "address",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={formData.shippingAddress.city}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "city",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    type="text"
                    required
                    value={formData.shippingAddress.state}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "state",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code *</label>
                  <input
                    id="zipCode"
                    type="text"
                    required
                    value={formData.shippingAddress.zipCode}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "zipCode",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <select
                    id="country"
                    required
                    value={formData.shippingAddress.country}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "country",
                        e.target.value
                      )
                    }
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="checkout-actions">
              <button
                type="button"
                onClick={() => navigate("/cart")}
                className="btn btn-outline"
              >
                <ArrowLeft size={16} />
                Back to Cart
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-large"
              >
                <CreditCard size={20} />
                {loading
                  ? "Placing Order..."
                  : `Place Order - $${getCartTotal().toFixed(2)}`}
              </button>
            </div>
          </form>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="order-items">
              {items.map((item) => (
                <div key={item.product?._id} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.product?.name}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-price">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
