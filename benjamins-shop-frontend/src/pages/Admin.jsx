// src/pages/Admin.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Package, Users, Settings, BarChart3 } from "lucide-react";

const Admin = () => {
  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your store and view analytics</p>
        </div>

        <div className="admin-cards">
          <Link to="/admin/products" className="admin-card">
            <Package size={32} color="#2563eb" />
            <h3>Product Management</h3>
            <p>Add, edit, or remove products from your store</p>
          </Link>

          <div className="admin-card">
            <Users size={32} color="#059669" />
            <h3>Customer Orders</h3>
            <p>View and manage customer orders and shipments</p>
          </div>

          <div className="admin-card">
            <BarChart3 size={32} color="#7c3aed" />
            <h3>Analytics</h3>
            <p>View sales data and store performance metrics</p>
          </div>

          <div className="admin-card">
            <Settings size={32} color="#dc2626" />
            <h3>Store Settings</h3>
            <p>Configure your store settings and preferences</p>
          </div>
        </div>

        <div className="admin-notes">
          <div className="note">
            <h4>Note:</h4>
            <p>
              Full admin functionality requires backend authentication.
              Currently showing basic admin interface structure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
