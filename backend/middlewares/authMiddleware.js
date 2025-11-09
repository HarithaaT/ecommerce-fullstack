// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../config/db.js";

dotenv.config();

export const verifyToken = async (req, res, next) => {
  try {
    // ✅ Get token from cookie or Authorization header
    const token =
      req.cookies?.token || // ✅ primary source (cookie)
      req.headers["authorization"]?.split(" ")[1]; // optional: header

    // ✅ If no token is found
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // ✅ Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user from DB (optional but good for extra validation)
    const [rows] = await db.query(
      "SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?",
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach user info to request for use in controllers
    req.user = {
      id: rows[0].user_id,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      email: rows[0].email,
    };

    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
