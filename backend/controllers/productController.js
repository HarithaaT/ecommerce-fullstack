// controllers/productController.js
import sequelize from "../config/db.js";
import ProductModel from "../models/productModel.js";
import CategoryModel from "../models/categoryModel.js";
import elasticClient from "../config/elastic.js";

// Initialize models
const Product = ProductModel(sequelize);
const Category = CategoryModel(sequelize);

// Setup associations
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Get all products with pagination
export const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Product.findAndCountAll({
      order: [["product_id", "ASC"]],
      limit,
      offset,
      include: [{ model: Category, as: "category" }],
    });

    res.json({
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      products: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

// Get products by category with pagination
export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Product.findAndCountAll({
      where: { category_id: categoryId },
      order: [["product_id", "ASC"]],
      limit,
      offset,
      include: [{ model: Category, as: "category" }],
    });

    res.json({
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      products: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching products by category:", error.message);
    res.status(500).json({ message: "Server error while fetching products by category" });
  }
};

// Create a new product with Elasticsearch indexing
export const createProduct = async (req, res) => {
  const { product_name, mrp_price, discount_price, quantity, category_id } = req.body;

  try {
    if (!product_name || !mrp_price || category_id === undefined) {
      return res.status(400).json({ message: "product_name, mrp_price, category_id required" });
    }

    // Check if category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ message: "Invalid category_id" });
    }

    const newProduct = await Product.create({
      product_name,
      mrp_price,
      discount_price: discount_price || null,
      quantity: quantity || 0,
      category_id,
    });

    // Index in Elasticsearch
    await elasticClient.index({
      index: process.env.ELASTIC_INDEX,
      id: newProduct.product_id.toString(),
      body: {
        id: newProduct.product_id,
        name: product_name,
        description: "",
        price: mrp_price,
        stock: quantity || 0,
        category_id,
      },
    });

    res.status(201).json({ message: "Product added & indexed successfully", product: newProduct });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(500).json({ message: "Server error while creating product" });
  }
};
