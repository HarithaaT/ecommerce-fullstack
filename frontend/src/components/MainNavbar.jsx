import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

function MainNavbar({
  auth,
  user,
  searchType,
  setSearchType,
  query,
  setQuery,
  setProducts,
  setFilteredCategories,
  setSelectedCategory,
  setLoading,
  categories,
  onLogout, // from App.js
}) {
  const navigate = useNavigate();

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      localStorage.clear();
      if (onLogout) onLogout();
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("❌ Logout failed. Try again.");
    }
  };

  // ✅ Search handler (unchanged logic)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setFilteredCategories(categories);
      setProducts([]);
      return;
    }

    try {
      setLoading(true);
      const endpoint =
        searchType === "elastic"
          ? `http://localhost:5000/api/search/elastic?q=${encodeURIComponent(
              query
            )}`
          : `http://localhost:5000/api/search/simple?q=${encodeURIComponent(
              query
            )}`;

      const res = await axios.get(endpoint);
      setProducts(res.data.results || []);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
      <div className="container">
        {/* Brand */}
        <Link
          className="navbar-brand fw-bold fs-4 d-flex align-items-center text-dark"
          to="/home"
        >
          <i className="bi bi-bag-check-fill me-2 text-primary"></i>
          ShopEase
        </Link>

        {/* Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Content */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/home">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/products">
                All Products
              </Link>
            </li>
            
          </ul>

          {/* ✅ Search box (clean, functional, aligned) */}
          <form
            className="d-flex align-items-center ms-3 my-2 my-lg-0"
            onSubmit={handleSearch}
            style={{
              flexGrow: 1,
              maxWidth: "400px",
              minWidth: "280px",
            }}
          >
            <div className="input-group w-100">
              <input
                type="text"
                className="form-control border-end-0"
                placeholder={`Search (${searchType})`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px 0 0 8px",
                  fontSize: "0.9rem",
                }}
                required
              />
              <select
                className="form-select border-start-0 border-end-0 bg-light"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{
                  maxWidth: "110px",
                  fontSize: "0.85rem",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <option value="simple">Simple</option>
                <option value="elastic">Elastic</option>
              </select>
              <button
                className="btn btn-primary"
                type="submit"
                style={{
                  borderRadius: "0 8px 8px 0",
                  fontSize: "0.9rem",
                }}
              >
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* ✅ Auth section */}
          <ul className="navbar-nav ms-auto align-items-center">
            {auth ? (
              <li className="nav-item dropdown">
                <span
                  className="nav-link dropdown-toggle"
                  id="accountDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ cursor: "pointer" }}
                >
                  {user ? `Hi, ${user.firstName || user.name || "User"}` : "Account"}
                </span>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="accountDropdown"
                >
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-dark me-2" to="/signin">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-dark" to="/signup">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default MainNavbar;
