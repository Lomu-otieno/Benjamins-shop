import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersAPI } from "../services/api";

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
      country: "",
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
        <h1>Checkout</h1>

        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <section className="form-section">
              <h2>Customer Information</h2>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="First Name"
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
                <input
                  type="text"
                  placeholder="Last Name"
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
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.customerInfo.email}
                  onChange={(e) =>
                    handleInputChange("customerInfo", "email", e.target.value)
                  }
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.customerInfo.phone}
                  onChange={(e) =>
                    handleInputChange("customerInfo", "phone", e.target.value)
                  }
                />
              </div>
            </section>

            <section className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Address"
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
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={formData.shippingAddress.city}
                  onChange={(e) =>
                    handleInputChange("shippingAddress", "city", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="State"
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
                <input
                  type="text"
                  placeholder="ZIP Code"
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
                <input
                  type="text"
                  placeholder="Country"
                  required
                  value={formData.shippingAddress.country}
                  onChange={(e) =>
                    handleInputChange(
                      "shippingAddress",
                      "country",
                      e.target.value
                    )
                  }
                />
              </div>
            </section>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Placing Order..."
                : `Place Order - $${getCartTotal().toFixed(2)}`}
            </button>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>
            {items.map((item) => (
              <div key={item.product._id} className="summary-item">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total">
              <strong>Total: ${getCartTotal().toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
