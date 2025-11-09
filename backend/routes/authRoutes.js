// routes/authRoutes.js
import express from "express";
import { signup, signin, logout } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ User Signup
router.post("/signup", signup);

// ✅ User Signin
router.post("/signin", signin);

// ✅ User Logout
router.post("/logout", logout);

// ✅ Example Protected Route (for testing token)
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.first_name}` });
});

// ✅ NEW — Token Verification Route
router.get("/verify", verifyToken, (req, res) => {
  // If token is valid, send success response
  res.status(200).json({
    valid: true,
    user: req.user, // Optional — helps frontend display user info
  });
});

export default router;
