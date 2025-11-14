import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

// ✅ Create Elasticsearch client
const elasticClient = new Client({
  node: process.env.ELASTIC_URL || "http://localhost:9200",
});

// ✅ Test connection and ensure index exists
(async () => {
  try {
    await elasticClient.ping();
    console.log("✅ Connected to Elasticsearch");

    const indexName = process.env.ELASTIC_INDEX || "products_index";

    // check index exists
    const exists = await elasticClient.indices.exists({ index: indexName });

    // ⭐ Create index with mapping if it does not exist
    if (!exists) {
      await elasticClient.indices.create({
        index: indexName,
        mappings: {
          properties: {
            product_name: { type: "text" },
            category_name: { type: "text" },   // ⭐ IMPORTANT for category search
            mrp_price: { type: "float" },
            discount_price: { type: "float" },
            quantity: { type: "integer" },
            category_id: { type: "integer" }
          }
        }
      });

      console.log(`✅ Elasticsearch index created with mapping: ${indexName}`);
    } else {
      console.log(`✅ Elasticsearch index already exists: ${indexName}`);
    }

  } catch (error) {
    console.error("❌ Elasticsearch connection failed:", error.message);
  }
})();

export default elasticClient;
