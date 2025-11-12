// routes/productRoutes.js
import express from "express";
import {
  getAllProducts,
  getProductsByCategory,
  createProduct,
} from "../controllers/productController.js"; // ✅ Only import existing exports
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Fetch all products with pagination (for All Products page)
router.get("/all", getAllProducts);

// ✅ Get products by category (public route)
router.get("/category/:id", getProductsByCategory);

// ✅ Create product (protected route)
router.post("/", verifyToken, createProduct);

export default router;
