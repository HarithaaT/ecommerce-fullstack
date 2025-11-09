import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Search() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("simple"); // 'simple' or 'elastic'
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // ✅ Simple local sample data (for fallback)
  const sampleProducts = [
    { id: 1, name: "Smartphone", category: "Electronics", price: 89999, originalPrice: 99999, quantity: 20 },
    { id: 2, name: "T-Shirt", category: "Fashion", price: 499, originalPrice: 699, quantity: 50 },
  ];

  // ✅ Triggered when form is submitted or search button is clicked
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      let filtered = [];

      if (mode === "simple") {
        // Local filtering demo (or replace with your real API)
        const lowerQuery = query.toLowerCase();
        filtered = sampleProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        );
      } else {
        // ✅ Elasticsearch API call
        const res = await axios.get(
          `http://localhost:5000/api/search/elastic?query=${encodeURIComponent(query)}`
        );
        filtered = res.data?.results || res.data?.hits || [];
      }

      setResults(filtered);
      navigate(`/products?search=${encodeURIComponent(query)}&mode=${mode}`);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // ✅ Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch(e);
  };

  return (
    <div className="container mt-5 pt-5 text-center">
      <h3 className="mb-4">🔍 Search Products</h3>

      {/* ✅ Search bar + dropdown */}
      <form className="d-flex justify-content-center mb-3" onSubmit={handleSearch}>
        <div className="input-group w-50">
          {/* Dropdown */}
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {mode === "simple" ? "Simple" : "Elastic"}
          </button>
          <ul className="dropdown-menu">
            <li>
              <button className="dropdown-item" type="button" onClick={() => setMode("simple")}>
                Simple
              </button>
            </li>
            <li>
              <button className="dropdown-item" type="button" onClick={() => setMode("elastic")}>
                Elastic
              </button>
            </li>
          </ul>

          {/* Input */}
          <input
            type="search"
            className="form-control"
            placeholder="Search by product or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Button */}
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </form>

      {/* ✅ Display results */}
      <div className="row justify-content-center">
        {results.length > 0 ? (
          results.map((item, index) => {
            const product = item._source || item; // works for elastic + normal

            return (
              <div key={index} className="col-md-3 mb-3">
                <div className="card text-center shadow-sm p-3">
                  <h5 className="fw-semibold">
                    {product.name || product.product_name || "Unnamed Product"}
                  </h5>

                  <p className="text-success mb-1">
                    ₹{(product.price || product.discount_price || 0).toFixed(2)}{" "}
                    {(product.originalPrice || product.mrp_price) >
                      (product.price || product.discount_price) && (
                      <span className="text-muted text-decoration-line-through text-danger">
                        ₹{(product.originalPrice || product.mrp_price)?.toFixed(2)}
                      </span>
                    )}
                  </p>

                  <p className="text-muted">Qty: {product.quantity || 0}</p>
                </div>
              </div>
            );
          })
        ) : (
          query && <p className="text-danger mt-3">No results found.</p>
        )}
      </div>
    </div>
  );
}

export default Search;
