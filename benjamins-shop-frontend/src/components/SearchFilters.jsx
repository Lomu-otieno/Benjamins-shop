import React, { useState } from "react";

const SearchFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="search-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search products..."
          value={localFilters.search || ""}
          onChange={(e) => handleChange("search", e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={localFilters.category || ""}
          onChange={(e) => handleChange("category", e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="home">Home & Garden</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilters;
