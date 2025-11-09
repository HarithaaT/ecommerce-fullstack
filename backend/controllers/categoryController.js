// controllers/categoryController.js
import db from "../config/db.js";

// ✅ Get all categories with pagination
export const getCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // ✅ Get total count
    const [countResult] = await db.query("SELECT COUNT(*) AS count FROM categories");
    const total = countResult[0].count;

    // ✅ Get paginated categories (changed DESC → ASC for ascending order)
    const [rows] = await db.query(
      "SELECT * FROM categories ORDER BY category_id ASC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.json({
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      categories: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error.message);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};

// ✅ Get category by ID (with its products)
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    // ✅ Fetch category info
    const [category] = await db.query("SELECT * FROM categories WHERE category_id = ?", [id]);

    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // ✅ Fetch products under this category
    const [products] = await db.query("SELECT * FROM products WHERE category_id = ?", [id]);

    res.status(200).json({
      category: category[0],
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching category:", error.message);
    res.status(500).json({ message: "Server error while fetching category" });
  }
};

// ✅ Create new category
export const createCategory = async (req, res) => {
  const { category_name, description } = req.body;

  try {
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    await db.query(
      "INSERT INTO categories (category_name, description) VALUES (?, ?)",
      [category_name, description]
    );

    res.status(201).json({ message: "Category created successfully" });
  } catch (error) {
    console.error("❌ Error creating category:", error.message);
    res.status(500).json({ message: "Server error while creating category" });
  }
};

// ✅ Update category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name, description } = req.body;

  try {
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const [result] = await db.query(
      "UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?",
      [category_name, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("❌ Error updating category:", error.message);
    res.status(500).json({ message: "Server error while updating category" });
  }
};

// ✅ Delete category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM categories WHERE category_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting category:", error.message);
    res.status(500).json({ message: "Server error while deleting category" });
  }
};
