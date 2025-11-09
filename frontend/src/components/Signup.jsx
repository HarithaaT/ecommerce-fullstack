// src/components/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../App.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  // ✅ Toggle for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Handle form input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Basic client-side validation
  const validate = () => {
    if (!formData.firstName || !formData.lastName)
      return "⚠️ First and last name are required!";
    if (!formData.email) return "⚠️ Email is required!";
    if (!formData.password || formData.password.length < 6)
      return "⚠️ Password must be at least 6 characters!";
    if (formData.password !== formData.confirmPassword)
      return "❌ Passwords do not match!";
    return null;
  };

  // ✅ Handle signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const validationError = validate();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      if (res.status === 201 || res.status === 200) {
        setMessage({
          type: "success",
          text: "✅ Signup successful! Redirecting to Signin...",
        });
        setTimeout(() => navigate("/signin"), 1500);
      }

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Signup Error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "❌ Signup failed!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Signup Form Card */}
      <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div
          className="card shadow-lg p-5 bg-white rounded-4"
          style={{ width: "500px", minHeight: "550px" }}
        >
          <h4 className="text-center mb-2 fw-semibold">Create an Account</h4>
          <p className="text-center text-muted mb-3">
            Please fill in the details below to sign up.
          </p>

          {/* ✅ Feedback message */}
          {message.text && (
            <div
              className={`alert ${
                message.type === "error" ? "alert-danger" : "alert-success"
              } py-2`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="form-control mb-3"
                />
              </div>
              <div className="col">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="form-control mb-3"
                />
              </div>
            </div>

            <input
              type="email"
              name="email"
              placeholder="example@mail.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control mb-3"
            />

            {/* ✅ Password field with toggle */}
            <div className="mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                value={formData.password}
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

            {/* ✅ Confirm Password field with toggle */}
            <div className="mb-3 position-relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="form-control pe-5"
              />
              <i
                className={`bi ${
                  showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                } position-absolute end-0 top-50 translate-middle-y me-3`}
                style={{ cursor: "pointer", fontSize: "1.2rem" }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              ></i>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center mb-0">
            Already have an account?{" "}
            <Link to="/signin" className="text-decoration-none fw-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;
