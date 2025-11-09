// backend/config/elastic.js
import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";

dotenv.config();

// ✅ Create Elasticsearch client
const elasticClient = new Client({
  node: process.env.ELASTIC_URL || "http://localhost:9200", // default node
});

// ✅ Optional: Test connection once at startup
(async () => {
  try {
    await elasticClient.ping();
    console.log("✅ Connected to Elasticsearch");
  } catch (error) {
    console.error("❌ Elasticsearch connection failed:", error.message);
  }
})();

// ✅ Export for use in controllers
export default elasticClient;
