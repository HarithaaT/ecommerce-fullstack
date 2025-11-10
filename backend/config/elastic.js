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
    const exists = await elasticClient.indices.exists({ index: indexName });

    if (!exists) {
      await elasticClient.indices.create({ index: indexName });
      console.log(`✅ Elasticsearch index created: ${indexName}`);
    } else {
      console.log(`✅ Elasticsearch index exists: ${indexName}`);
    }
  } catch (error) {
    console.error("❌ Elasticsearch connection failed:", error.message);
  }
})();

export default elasticClient;
