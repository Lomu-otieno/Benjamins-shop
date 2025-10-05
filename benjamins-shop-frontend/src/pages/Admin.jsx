import React from "react";

const Admin = () => {
  return (
    <div className="admin-page">
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div className="admin-cards">
          <div className="admin-card">
            <h3>Product Management</h3>
            <p>Add, edit, or remove products</p>
          </div>
          <div className="admin-card">
            <h3>Order Management</h3>
            <p>View and manage customer orders</p>
          </div>
          <div className="admin-card">
            <h3>Inventory</h3>
            <p>Manage product stock and categories</p>
          </div>
        </div>
        <p className="admin-note">
          Note: Full admin functionality requires backend authentication.
        </p>
      </div>
    </div>
  );
};

export default Admin;
