// controllers/productController.js
import elasticClient from "../config/elastic.js";
import db from "../config/db.js";
import { paginate } from "../utils/pagination.js";

// ✅ Get all products with pagination (fetches products from all categories)
export const getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;

  try {
    // ✅ Get total count
    const [countResult] = await db.query("SELECT COUNT(*) AS count FROM products");
    const total = countResult[0].count;

    // ✅ Get paginated products (order by product_id ascending)
    const [rows] = await db.query(
      "SELECT * FROM products ORDER BY product_id ASC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.json({
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      products: rows,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

// ✅ Get products (with optional category filter + pagination)
export const getProducts = async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;

  try {
    let query = "SELECT * FROM products";
    const params = [];

    // ✅ Filter by category if provided
    if (category) {
      query += " WHERE category_id = ?";
      params.push(category);
    }

    // ✅ Execute query
    const [rows] = await db.query(query, params);

    // ✅ Apply pagination helper
    const data = paginate(rows, page, limit);

    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// ✅ Create a new product (with Elasticsearch indexing)
export const createProduct = async (req, res) => {
  const { product_name, mrp_price, discount_price, quantity, category_id } = req.body;

  try {
    // ✅ Validate required fields
    if (!product_name || !mrp_price || category_id === undefined) {
      return res.status(400).json({
        message: "product_name, mrp_price, and category_id are required",
      });
    }

    // ✅ Check if the category exists
    const [category] = await db.query(
      "SELECT * FROM categories WHERE category_id = ?",
      [category_id]
    );

    if (category.length === 0) {
      return res.status(400).json({ message: "Invalid category_id" });
    }

    // ✅ Insert product
    const [result] = await db.query(
      `INSERT INTO products (product_name, mrp_price, discount_price, quantity, category_id)
       VALUES (?, ?, ?, ?, ?)`,
      [product_name, mrp_price, discount_price || null, quantity || 0, category_id]
    );

    // ✅ Prepare the product object for Elasticsearch
    const newProduct = {
      id: result.insertId,
      name: product_name,
      description: "",
      price: mrp_price,
      stock: quantity || 0,
      category_id,
    };

    // ✅ Index in Elasticsearch
    await elasticClient.index({
      index: process.env.ELASTIC_INDEX,
      id: newProduct.id.toString(),
      body: newProduct,
    });

    console.log("✅ Product indexed in Elasticsearch:", newProduct.id);

    res.status(201).json({
      message: "Product added & indexed successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(500).json({ message: "Failed to create product" });
  }
};

// ✅ Get products by category ID
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM products WHERE category_id = ?",
      [categoryId]
    );
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching products by category:", error.message);
    res.status(500).json({ message: "Error fetching products" });
  }
};
