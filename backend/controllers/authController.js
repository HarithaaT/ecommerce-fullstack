// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../config/db.js";
import UserModel from "../models/userModel.js";

dotenv.config();

// ✅ Initialize User model (just pass the sequelize instance)
const User = UserModel(db);

/**
 * ✅ SIGNUP Controller
 */
export const signup = async (req, res) => {
  try {
    const first_name = req.body.first_name || req.body.firstName;
    const last_name = req.body.last_name || req.body.lastName;
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ SIGNIN Controller
 */
export const signin = async (req, res) => {
  try {
    const email = req.body.email || req.body.Email;
    const password = req.body.password || req.body.Password;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.cookie(process.env.COOKIE_NAME || "token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

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
 * ✅ CHECK AUTH Controller
 */
export const checkAuth = (req, res) => {
  try {
    const token = req.cookies[process.env.COOKIE_NAME || "token"];
    if (!token) return res.status(401).json({ authenticated: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
      },
    });
  } catch (err) {
    return res.status(403).json({ authenticated: false, message: "Invalid or expired token" });
  }
};
