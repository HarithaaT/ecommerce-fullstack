import sequelize from "../config/db.js";
import ProductModel from "../models/productModel.js";
import elasticClient from "../config/elastic.js";

// Initialize Product model
const Product = ProductModel(sequelize, sequelize.DataTypes);

// ✅ Function to reindex all products into Elasticsearch
export async function reindexAllProducts() {
  try {
    // Fetch all products using Sequelize
    const products = await Product.findAll();

    if (!products.length) {
      console.log("⚠️ No products found in database to reindex.");
      return;
    }

    // Loop through each product and index it in Elasticsearch
    for (const product of products) {
      await elasticClient.index({
        index: process.env.ELASTIC_INDEX || "products_index",
        id: product.product_id.toString(),
        document: {
          id: product.product_id,
          product_name: product.product_name,
          category_id: product.category_id,
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

// ✅ Run script directly
if (process.argv[1].includes("reindexProducts.js")) {
  reindexAllProducts();
}
