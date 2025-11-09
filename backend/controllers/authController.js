// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../config/db.js";

dotenv.config();

/**
 * ✅ SIGNUP Controller
 */
export const signup = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [first_name, last_name, email, hashed]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ SIGNIN Controller (Fixed to include token + user info)
 */
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    // ✅ Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // ✅ Set token in cookie
    res.cookie(process.env.COOKIE_NAME || "token", token, {
      httpOnly: true,
      secure: false, // set true for HTTPS
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Send both token and user object in response (frontend expects this)
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Signin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ LOGOUT Controller
 */
export const logout = (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || "token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
  });

  res.status(200).json({ message: "Logged out successfully" });
};

/**
 * ✅ CHECK AUTH Controller — verify if user has valid cookie token
 */
export const checkAuth = (req, res) => {
  try {
    const token = req.cookies[process.env.COOKIE_NAME || "token"];
    if (!token) return res.status(401).json({ authenticated: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      authenticated: true,
      user: decoded,
    });
  } catch (err) {
    return res.status(403).json({ authenticated: false, message: "Invalid or expired token" });
  }
};
