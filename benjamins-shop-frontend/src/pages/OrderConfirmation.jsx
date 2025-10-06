// src/pages/OrderConfirmation.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersAPI } from "../services/api";
import { CheckCircle, Package, ShoppingBag, Home } from "lucide-react";

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getByOrderNumber(orderNumber);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <div className="error-page">
          <h2>Order not found</h2>
          <p>We couldn't find the order you're looking for.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          <div className="confirmation-header">
            <CheckCircle size={48} color="#059669" />
            <h1>Order Confirmed!</h1>
            <p className="confirmation-subtitle">Thank you for your purchase</p>
          </div>

          <div className="order-details">
            <div className="detail-section">
              <h3>
                <Package size={20} />
                Order Information
              </h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Order Number:</span>
                  <strong>{order.orderNumber}</strong>
                </div>
                <div className="detail-item">
                  <span>Order Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span>Total Amount:</span>
                  <strong>${order.totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Shipping Address</h3>
              <div className="address-details">
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            <div className="detail-section">
              <h3>Order Items</h3>
              <div className="order-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-info">
                      <span className="item-name">{item.product?.name}</span>
                      <span className="item-quantity">
                        Quantity: {item.quantity}
                      </span>
                    </div>
                    <span className="item-price">
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/products" className="btn btn-primary">
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>
            <Link to="/" className="btn btn-outline">
              <Home size={16} />
              Back to Home
            </Link>
          </div>

          <div className="confirmation-footer">
            <p>
              We've sent a confirmation email to {order.customerInfo?.email}.
              You'll receive a shipping confirmation when your order ships.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
