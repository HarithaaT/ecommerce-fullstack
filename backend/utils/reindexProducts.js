import sequelize from "../config/db.js";
import ProductModel from "../models/productModel.js";
import CategoryModel from "../models/categoryModel.js";
import elasticClient from "../config/elastic.js";

// Initialize models
const Product = ProductModel(sequelize, sequelize.DataTypes);
const Category = CategoryModel(sequelize, sequelize.DataTypes);

// Associations
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// ✅ Function to reindex all products into Elasticsearch
export async function reindexAllProducts() {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: "category" }],
    });

    if (!products.length) {
      console.log("⚠️ No products found in database to reindex.");
      return;
    }

    for (const product of products) {
      await elasticClient.index({
        index: process.env.ELASTIC_INDEX || "products_index",
        id: product.product_id.toString(),
        document: {
          id: product.product_id,
          product_name: product.product_name,
          category_id: product.category_id,
          category_name: product.category?.category_name || "",   
          quantity: product.quantity || 0,
          mrp_price: product.mrp_price,
          discount_price: product.discount_price,
        },
      });
    }

    console.log(`✅ Reindexed ${products.length} products into Elasticsearch`);
  } catch (error) {
    console.error("❌ Error during product reindexing:", error.message);
  }
}

// Auto-run script
if (process.argv[1].includes("reindexProducts.js")) {
  reindexAllProducts();
}
