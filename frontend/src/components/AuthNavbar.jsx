// src/components/AuthNavbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // ✅ Bootstrap icons

function AuthNavbar() {
  const location = useLocation();

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top"
      style={{
        width: "100%",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      <div className="container">
        {/* ✅ Website Name + Icon */}
        <Link
          className="navbar-brand fw-bold fs-4 text-dark d-flex align-items-center"
          to="/"
        >
          <i className="bi bi-bag-check-fill me-2 text-primary"></i>
          MyEcomSite
        </Link>

        {/* ✅ Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#authNavbarNav"
          aria-controls="authNavbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* ✅ Sign In / Sign Up Buttons */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="authNavbarNav"
        >
          <div className="d-flex">
            <Link
              to="/signin"
              className={`btn me-2 ${
                location.pathname === "/signin"
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className={`btn ${
                location.pathname === "/signup"
                  ? "btn-dark"
                  : "btn-outline-dark"
              }`}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AuthNavbar;
