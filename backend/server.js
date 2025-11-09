import express from "express";
import dotenv from "dotenv"; // ✅ Use dotenv directly to load .env variables
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config(); // ✅ Initialize dotenv

const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000", // ✅ frontend URL
    credentials: true, // ✅ allow cookies & JWTs across domains
  })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);

// ✅ Global error handler
app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("✅ Backend server is running successfully!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("✅ Connected to MySQL Database");
});
