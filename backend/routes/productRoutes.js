// routes/productRoutes.js
import express from "express";
import {
  getProducts,
  createProduct,
  getProductsByCategory,
  getAllProducts, // ✅ added import
} from "../controllers/productController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Fetch all products with pagination (for All Products page)
router.get("/all", getAllProducts); // ✅ added new route

// ✅ Get all products (with optional pagination/category filter)
router.get("/", getProducts);

// ✅ Get products by category (public or protected — up to you)
// If you want it protected, uncomment verifyToken below
router.get("/category/:categoryId", getProductsByCategory);

// ✅ Create product (protected route)
router.post("/", verifyToken, createProduct);

export default router;
