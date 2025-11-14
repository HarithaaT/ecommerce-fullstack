import sequelize from "../config/db.js";
import ProductModel from "../models/productModel.js";
import CategoryModel from "../models/categoryModel.js";
import elasticClient from "../config/elastic.js";
import { Op } from "sequelize";

// Initialize models
const Product = ProductModel(sequelize, sequelize.DataTypes);
const Category = CategoryModel(sequelize, sequelize.DataTypes);

// Associations
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });

// ---------------------------
// SIMPLE SEARCH (Sequelize)
// ---------------------------
export const simpleSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Please provide a search term" });
    }

    const searchTerm = `%${q.toLowerCase()}%`;

    const products = await Product.findAll({
      include: [{ model: Category, as: "category" }],
      where: {
        [Op.or]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("product_name")),
            "LIKE",
            searchTerm
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("category.category_name")),
            "LIKE",
            searchTerm
          )
        ]
      }
    });

    if (!products.length) {
      return res.status(404).json({ message: "No matching results found" });
    }

    const results = products.map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      category_name: p.category?.category_name || "",
      mrp_price: p.mrp_price,
      discount_price: p.discount_price,
      quantity: p.quantity,
    }));

    return res.status(200).json({
      message: "✅ Search results fetched successfully",
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ Simple search error:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

/* ---------------------------------------------------
   ELASTICSEARCH (PRODUCT + CATEGORY)
--------------------------------------------------- */
export const elasticSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res
        .status(400)
        .json({ message: "Please provide a search query" });
    }

    const indexName = process.env.ELASTIC_INDEX || "products_index";

    const response = await elasticClient.search({
      index: indexName,
      query: {
        multi_match: {
          query: q,
          fields: ["product_name", "category_name"],
          fuzziness: "AUTO",
        },
      },
    });

    const hits = response.hits.hits.map((hit) => ({
      type: "product",
      id: hit._id,
      product_name: hit._source.product_name,
      mrp_price: hit._source.mrp_price,
      discount_price: hit._source.discount_price,
      quantity: hit._source.quantity,
      category_name: hit._source.category_name,
    }));

    if (!hits.length) {
      return res.status(404).json({ message: "No results found" });
    }

    return res.status(200).json({
      message: "Full-text search results",
      count: hits.length,
      results: hits,
    });
  } catch (err) {
    console.error("❌ Elasticsearch search error:", err);
    return res.status(500).json({
      message: "Elasticsearch search failed",
      error: err.message,
    });
  }
};

/* ---------------------------------------------------
   Helper - Index a new product
--------------------------------------------------- */
export const indexProduct = async (product) => {
  try {
    await elasticClient.index({
      index: process.env.ELASTIC_INDEX || "products_index",
      id: product.product_id.toString(),
      document: {
        product_name: product.product_name,
        category_name: product.category_name || "",
        mrp_price: product.mrp_price,
        discount_price: product.discount_price,
        quantity: product.quantity,
      },
    });
    console.log("Indexed:", product.product_name);
  } catch (err) {
    console.error("❌ Error indexing product:", err);
  }
};

export { Product, Category };
