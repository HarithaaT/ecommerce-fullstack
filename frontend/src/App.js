// src/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

import AuthNavbar from "./components/AuthNavbar";
import MainNavbar from "./components/MainNavbar";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import Home from "./components/Home";
import Categories from "./components/Categories";
import Products from "./components/Products";

function App() {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Search states
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("simple");

  // ✅ Shared product/category states (for MainNavbar + Home/Products)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize auth from localStorage token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuth(true);
      axios
        .get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser({ name: res.data.message.replace("Welcome ", "") });
        })
        .catch(() => {
          localStorage.removeItem("token");
          setAuth(false);
        });
    }
  }, []);

  // ✅ Handle login success
  const handleLogin = (token, userPayload) => {
    localStorage.setItem("token", token);
    setAuth(true);
    if (userPayload) setUser(userPayload);
    navigate("/home");
  };

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    setUser(null);
    navigate("/signin");
  };

  return (
    <>
      {/* ✅ Navbar Handling */}
      <Routes>
        {/* White AuthNavbar only on Signin/Signup */}
        <Route path="/signin" element={<AuthNavbar />} />
        <Route path="/signup" element={<AuthNavbar />} />

        {/* MainNavbar everywhere else */}
        <Route
          path="*"
          element={
            <MainNavbar
              auth={auth}
              user={user}
              onLogout={handleLogout}
              query={query}
              setQuery={setQuery}
              searchType={searchType}
              setSearchType={setSearchType}
              setProducts={setProducts}
              setFilteredCategories={setFilteredCategories}
              setSelectedCategory={setSelectedCategory}
              setLoading={setLoading}
              categories={categories}
            />
          }
        />
      </Routes>

      {/* ✅ Page Content */}
      <div className="container my-4">
        <Routes>
          {/* Public routes */}
          <Route path="/signin" element={<Signin onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleLogin} />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              auth ? (
                <Home
                  auth={auth}
                  user={user}
                  products={products}
                  setProducts={setProducts}
                  categories={categories}
                  setCategories={setCategories}
                  filteredCategories={filteredCategories}
                  setFilteredCategories={setFilteredCategories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  loading={loading}
                  setLoading={setLoading}
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          <Route
            path="/categories"
            element={
              auth ? <Categories auth={auth} /> : <Navigate to="/signin" replace />
            }
          />
          <Route
            path="/categories/:categoryId"
            element={
              auth ? (
                <Products
                  auth={auth}
                  query={query}
                  searchType={searchType}
                  products={products}
                  setProducts={setProducts}
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          <Route
            path="/products"
            element={
              auth ? (
                <Products
                  auth={auth}
                  query={query}
                  searchType={searchType}
                  products={products}
                  setProducts={setProducts}
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
