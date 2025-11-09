// routes/categoryRoutes.js
import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Get all categories
router.get("/", getCategories);

// ✅ Get a single category by ID (with its products)
router.get("/:id", getCategoryById);

// ✅ Create a new category (protected route)
router.post("/", verifyToken, createCategory);

// ✅ Update an existing category (protected route)
router.put("/:id", verifyToken, updateCategory);

// ✅ Delete a category (protected route)
router.delete("/:id", verifyToken, deleteCategory);

export default router;
