// controllers/categoryController.js
import sequelize from "../config/db.js";
import CategoryModel from "../models/categoryModel.js";
import ProductModel from "../models/productModel.js";

// Initialize models
const Category = CategoryModel(sequelize);
const Product = ProductModel(sequelize);

// Setup associations
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Get all categories with pagination
export const getCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Category.findAndCountAll({
      order: [["category_id", "ASC"]],
      limit,
      offset,
    });

    res.json({
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      categories: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error.message);
    res.status(500).json({ message: "Server error while fetching categories" });
  }
};

// Get category by ID (with products)
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id, {
      include: [{ model: Product, as: "products" }],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("❌ Error fetching category:", error.message);
    res.status(500).json({ message: "Server error while fetching category" });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  const { category_name, description } = req.body;

  try {
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const newCategory = await Category.create({
      category_name,
      description,
    });

    res.status(201).json({ message: "Category created successfully", category: newCategory });
  } catch (error) {
    console.error("❌ Error creating category:", error.message);
    res.status(500).json({ message: "Server error while creating category" });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { category_name, description } = req.body;

  try {
    if (!category_name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update({ category_name, description });
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("❌ Error updating category:", error.message);
    res.status(500).json({ message: "Server error while updating category" });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting category:", error.message);
    res.status(500).json({ message: "Server error while deleting category" });
  }
};
