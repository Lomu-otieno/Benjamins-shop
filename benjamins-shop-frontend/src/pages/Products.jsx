// src/pages/Products.jsx
import React, { useState, useEffect } from "react";
import { productsAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchFilters from "../components/SearchFilters";
import "../styles/Products.css";
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAll(filters);
      console.log("Products data:", response.data); // Debug log
      setProducts(response.data.products);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total,
      });
    } catch (err) {
      setError("Failed to load products. Please try again.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="loading">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1>Our Products</h1>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchProducts} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {products.length === 0 && !error && (
          <div className="no-products">
            <p>No products found matching your criteria.</p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={filters.page === 1}
              onClick={() => handlePageChange(filters.page - 1)}
              className="pagination-btn"
            >
              Previous
            </button>

            <span className="pagination-info">
              Page {filters.page} of {pagination.totalPages}
            </span>

            <button
              disabled={filters.page === pagination.totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
