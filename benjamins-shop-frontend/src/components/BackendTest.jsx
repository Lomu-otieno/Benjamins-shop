// src/components/BackendTest.jsx
import React, { useState, useEffect } from "react";
import { productsAPI } from "../services/api";

const BackendTest = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo("Testing connection...");

      // Test direct fetch first
      const testUrl = "https://benjamins-shop.onrender.com/api/products";
      setDebugInfo(`Testing: ${testUrl}`);

      const response = await productsAPI.getAll();
      setProducts(response.data.products);
      setDebugInfo(
        `Success! Received ${response.data.products.length} products`
      );
    } catch (err) {
      setError(err.message);
      setDebugInfo(`Failed: ${err.message}`);
      console.error("Backend connection failed:", err);

      // Try direct fetch as fallback
      testDirectFetch();
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    try {
      setDebugInfo("Trying direct fetch...");
      const response = await fetch(
        "https://benjamins-shop.onrender.com/api/products"
      );
      if (response.ok) {
        const data = await response.json();
        setDebugInfo(
          `Direct fetch successful! Got ${data.products.length} products`
        );
        setProducts(data.products);
        setError(null);
      } else {
        setDebugInfo(`Direct fetch failed with status: ${response.status}`);
      }
    } catch (fetchErr) {
      setDebugInfo(`Direct fetch also failed: ${fetchErr.message}`);
    }
  };

  const checkBackendStatus = async () => {
    try {
      setDebugInfo("Checking backend status...");
      const response = await fetch("https://benjamins-shop.onrender.com");
      if (response.ok) {
        setDebugInfo("Backend is running (root endpoint OK)");
      } else {
        setDebugInfo(`Backend responded with status: ${response.status}`);
      }
    } catch (err) {
      setDebugInfo(`Cannot reach backend: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>Testing backend connection...</h3>
        <p>{debugInfo}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          color: "red",
          padding: "20px",
          border: "1px solid red",
          borderRadius: "8px",
        }}
      >
        <h3>❌ Backend Connection Failed</h3>
        <p>
          <strong>Error:</strong> {error}
        </p>
        <p>
          <strong>Debug Info:</strong> {debugInfo}
        </p>

        <div style={{ margin: "15px 0" }}>
          <p>
            <strong>Backend URL:</strong> https://benjamins-shop.onrender.com
          </p>
          <p>
            <strong>API Endpoint:</strong>{" "}
            https://benjamins-shop.onrender.com/api/products
          </p>
        </div>

        <div style={{ margin: "15px 0" }}>
          <h4>Troubleshooting Steps:</h4>
          <ol>
            <li>Check if the backend URL works in your browser</li>
            <li>Verify Render.com service status</li>
            <li>Check backend CORS configuration</li>
            <li>Look for errors in Render.com logs</li>
          </ol>
        </div>

        <div style={{ gap: "10px", display: "flex", flexWrap: "wrap" }}>
          <button
            onClick={testBackendConnection}
            style={{ padding: "8px 16px" }}
          >
            Retry API Call
          </button>
          <button onClick={checkBackendStatus} style={{ padding: "8px 16px" }}>
            Check Backend Status
          </button>
          <button
            onClick={() =>
              window.open(
                "https://benjamins-shop.onrender.com/api/products",
                "_blank"
              )
            }
            style={{ padding: "8px 16px" }}
          >
            Test in Browser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        color: "green",
        padding: "20px",
        border: "1px solid green",
        borderRadius: "8px",
      }}
    >
      <h3>✅ Backend Connected Successfully!</h3>
      <p>
        <strong>Debug Info:</strong> {debugInfo}
      </p>
      <p>Found {products.length} products</p>

      <div style={{ marginTop: "20px" }}>
        <h4>Sample Products:</h4>
        {products.slice(0, 3).map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "5px",
              borderRadius: "4px",
            }}
          >
            <strong>{product.name}</strong> - ${product.price}
            {product.description && (
              <div style={{ fontSize: "0.9em", color: "#666" }}>
                {product.description.substring(0, 100)}...
              </div>
            )}
          </div>
        ))}

        {products.length > 3 && (
          <p style={{ marginTop: "10px", color: "#666" }}>
            ... and {products.length - 3} more products
          </p>
        )}
      </div>
    </div>
  );
};

export default BackendTest;
