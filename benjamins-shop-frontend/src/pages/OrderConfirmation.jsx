import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersAPI } from "../services/api";

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
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="container">
        <div className="error-page">
          <h2>Order not found</h2>
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
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
          </div>

          <div className="order-details">
            <div className="detail-row">
              <span>Order Number:</span>
              <strong>{order.orderNumber}</strong>
            </div>
            <div className="detail-row">
              <span>Order Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span>Total Amount:</span>
              <strong>${order.totalAmount.toFixed(2)}</strong>
            </div>
          </div>

          <div className="shipping-info">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>

          <div className="order-items">
            <h3>Order Items</h3>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="confirmation-actions">
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
