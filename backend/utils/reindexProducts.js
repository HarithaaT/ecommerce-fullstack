// backend/utils/reindexProducts.js
import db from "../config/db.js";
import elasticClient from "../config/elastic.js";

// ✅ Function to reindex all existing products into Elasticsearch
export async function reindexAllProducts() {
  try {
    // Fetch all products from MySQL
    const [products] = await db.execute(`
      SELECT product_id, product_name, category_id, quantity, mrp_price, discount_price
      FROM products
    `);

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
          name: product.product_name,
          category_id: product.category_id,
          quantity: product.quantity, // ✅ ensure quantity is included
          mrp_price: product.mrp_price,
          discount_price: product.discount_price,
        },
      });
    }

    console.log(`✅ Reindexed ${products.length} products into Elasticsearch (with quantity)`);
  } catch (error) {
    console.error("❌ Error during product reindexing:", error.message);
  }
}

// ✅ Run directly if executed as a standalone script
if (process.argv[1].includes("reindexProducts.js")) {
  reindexAllProducts();
}
