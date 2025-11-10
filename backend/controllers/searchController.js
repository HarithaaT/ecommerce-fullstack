import sequelize from "../config/db.js";
import ProductModel from "../models/productModel.js";
import CategoryModel from "../models/categoryModel.js";
import elasticClient from "../config/elastic.js";

// ✅ Initialize Sequelize models
const Product = ProductModel(sequelize, sequelize.DataTypes);
const Category = CategoryModel(sequelize, sequelize.DataTypes);

// ✅ Setup associations
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
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("product_name")),
        "LIKE",
        searchTerm
      ),
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No matching results found" });
    }

    const results = products.map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      mrp_price: p.mrp_price,
      discount_price: p.discount_price,
      quantity: p.quantity,
      category_name: p.category?.category_name || "",
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

// ---------------------------
// ELASTICSEARCH FULL-TEXT SEARCH
// ---------------------------
export const elasticSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Please provide a search query" });
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
      id: hit._id,
      name: hit._source.product_name || "Unnamed product",
      price: hit._source.discount_price || 0,
      originalPrice: hit._source.mrp_price || 0,
      quantity: hit._source.quantity || 0,
      category: hit._source.category_name || "",
    }));

    if (!hits || hits.length === 0) {
      return res.status(404).json({ message: "No matching products found" });
    }

    const formattedResults = hits.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      mrp_price: item.originalPrice,
      discount_price: item.price,
      category_name: item.category || "Electronics",
      quantity: item.quantity,
    }));

    return res.status(200).json({
      message: "✅ Full-text search results fetched successfully",
      count: formattedResults.length,
      results: formattedResults,
    });
  } catch (err) {
    console.error("❌ Elasticsearch search error:", err);
    return res.status(500).json({
      message: "Elasticsearch search failed",
      error: err.message,
    });
  }
};

// ---------------------------
// HELPER: Index a new product into Elasticsearch
// ---------------------------
export const indexProduct = async (product) => {
  try {
    await elasticClient.index({
      index: process.env.ELASTIC_INDEX || "products_index",
      id: product.product_id?.toString(),
      document: {
        product_name: product.product_name,
        category_name: product.category_name || "",
        mrp_price: product.mrp_price,
        discount_price: product.discount_price,
        quantity: product.quantity || 0,
        category_id: product.category_id,
      },
    });
    console.log(`✅ Indexed product in Elasticsearch: ${product.product_name}`);
  } catch (err) {
    console.error("❌ Error indexing product:", err);
  }
};

// ✅ Export models for reindexing
export { Product, Category, elasticClient };
