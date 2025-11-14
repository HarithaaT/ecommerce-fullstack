import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    try {
      // AUTO SEARCH MODE: short = simple, long = elastic
      let mode = query.length <= 2 ? "simple" : "elastic";

      let endpoint =
        mode === "simple"
          ? `http://localhost:5000/api/search/simple?q=${encodeURIComponent(
              query
            )}`
          : `http://localhost:5000/api/search/elastic?q=${encodeURIComponent(
              query
            )}`;

      const res = await axios.get(endpoint);

      setResults(res.data?.results || []);
      navigate(`/products?search=${encodeURIComponent(query)}&mode=${mode}`);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch(e);
  };

  return (
    <div className="container mt-5 pt-5 text-center">
      <h3 className="mb-4">🔍 Search Products</h3>

      {/* Search Bar */}
      <form className="d-flex justify-content-center mb-3" onSubmit={handleSearch}>
        <div className="input-group w-50">
          <input
            type="search"
            className="form-control"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="row justify-content-center">
        {results.length > 0 ? (
          results.map((item, index) => {
            const product = item._source || item;

            return (
              <div key={index} className="col-md-3 mb-3">
                <div className="card text-center shadow-sm p-3">
                  <h5 className="fw-semibold">
                    {product.name || product.product_name || "Unnamed Product"}
                  </h5>

                  <p className="text-success mb-1">
                    ₹{(product.price || product.discount_price || 0).toFixed(2)}
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
