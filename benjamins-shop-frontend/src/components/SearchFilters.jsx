// src/components/SearchFilters.jsx - SIMPLE VERSION
import React, { useState } from "react";
import "../styles/SearchFilters.css";

const SearchFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSearchChange = (value) => {
    const newFilters = { ...localFilters, search: value };
    setLocalFilters(newFilters);
    // Don't call onFilterChange here - wait for user to press Enter or blur
  };

  const handleSearchSubmit = () => {
    onFilterChange(localFilters);
  };

  const handleCategoryChange = (value) => {
    const newFilters = { ...localFilters, category: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters); // Category changes can be immediate
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  return (
    <div className="search-filters">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search products..."
          value={localFilters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleSearchSubmit}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={localFilters.category || ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          <option value="kitchen">Kitchen</option>
          <option value="food">Food</option>
          <option value="beauty">Beauty</option>
          <option value="sport">Sports</option>
          <option value="laundry">Laundry</option>
          <option value="home">Home & Garden</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="electronics">Electronics</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilters;
