import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../App.css";

// ✅ Ensure cookies/JWT are sent with requests
axios.defaults.withCredentials = true;

const Signin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/home");
  }, [navigate]);

  // ✅ Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Handle Sign In
  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("⚠️ Please enter both email and password!");
      return;
    }

    setLoading(true);
    try {
     const res = await axios.post(
  "http://localhost:5000/api/auth/signin",
  { email: form.email, password: form.password },
  { withCredentials: true }
);


      if (res.status === 200 && res.data.token) {
        const { token, user } = res.data;

        // ✅ Save token and user locally
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Notify parent
        if (onLogin) onLogin(token, user);

        // ✅ Feedback + redirect
        setError("✅ Login successful! Redirecting...");
        setTimeout(() => navigate("/home"), 1000);
      } else {
        setError("❌ Invalid response from server!");
      }
    } catch (err) {
      console.error("Signin failed:", err);
      setError(err.response?.data?.message || "❌ Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ width: "400px" }}>
        <h4 className="text-center mb-2 fw-semibold">Welcome Back</h4>
        <p className="text-center text-muted mb-3">
          Please enter your credentials to sign in.
        </p>

        {error && (
          <div
            className={`alert ${
              error.includes("❌") || error.includes("⚠️")
                ? "alert-danger"
                : "alert-success"
            } py-2`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignin}>
          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="example@mail.com"
            value={form.email}
            onChange={handleChange}
            required
            className="form-control mb-3"
          />

          {/* Password with toggle */}
          <div className="mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="form-control pe-5"
            />
            <i
              className={`bi ${
                showPassword ? "bi-eye-slash" : "bi-eye"
              } position-absolute end-0 top-50 translate-middle-y me-3`}
              style={{ cursor: "pointer", fontSize: "1.2rem" }}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mb-0">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-decoration-none fw-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
