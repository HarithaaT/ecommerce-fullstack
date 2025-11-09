// backend/controllers/searchController.js
import db from "../config/db.js";
// backend/controllers/searchController.js
import elasticClient from "../config/elastic.js"; // ✅ default import (not in curly braces)

// ✅ SIMPLE SEARCH (MySQL LIKE query — by product or category name)
export const simpleSearch = async (req, res) => {
  try {
    const { q } = req.query; // ✅ unified to use "q" for consistency

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Please provide a search term" });
    }

    const searchTerm = `%${q.toLowerCase()}%`;

    const [products] = await db.execute(
      `SELECT p.product_id, p.product_name, p.mrp_price, p.discount_price, p.quantity, c.category_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.category_id
       WHERE LOWER(p.product_name) LIKE ? 
          OR LOWER(c.category_name) LIKE ?`,
      [searchTerm, searchTerm]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "No matching results found" });
    }

    res.status(200).json({
      message: "✅ Search results fetched successfully",
      count: products.length,
      results: products,
    });
  } catch (error) {
    console.error("❌ Simple search error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ ELASTICSEARCH FULL-TEXT SEARCH
export const elasticSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Please provide a search query" });
    }

    // ✅ Run the Elasticsearch query
    const response = await elasticClient.search({
      index: process.env.ELASTIC_INDEX || "products_index",
      query: {
        multi_match: {
          query: q,
          fields: ["name", "description", "categoryName"], // match your DB + index fields
          fuzziness: "AUTO",
        },
      },
    });

    const hits = response.hits.hits.map((hit) => ({
      id: hit._id,
      name: hit._source.name || hit._source.product_name || "Unnamed product",
      price: hit._source.price || hit._source.discount_price || 0,
      originalPrice: hit._source.originalPrice || hit._source.mrp_price || 0,
      quantity: hit._source.quantity || 0,
      category: hit._source.categoryName || hit._source.category_name || "",
    }));

    if (hits.length === 0) {
      return res.status(404).json({ message: "No matching products found" });
    }

    // ✅ Format to match simple search response
 const formattedResults = hits.map((item) => ({
  product_id: item.id,
  product_name: item.name,
  mrp_price: item.originalPrice || item.price,
  discount_price: item.price,
  category_name: item.category || "Electronics",
  quantity: item.quantity || 0, // ✅ Added quantity field
}));


    // ✅ Return consistent response
    res.status(200).json({
      message: "✅ Full-text search results fetched successfully",
      count: formattedResults.length,
      results: formattedResults,
    });
  } catch (error) {
    console.error("❌ Elasticsearch search error:", error);
    res.status(500).json({
      message: "Elasticsearch search failed",
      error: error.message,
    });
  }
};

// ✅ Helper — Index new product into Elasticsearch (used when product is added)
export const indexProduct = async (product) => {
  try {
    await elasticClient.index({
      index: process.env.ELASTIC_INDEX || "products_index",
      id: product.id?.toString(),
      document: {
        product_name: product.product_name,
        category_name: product.category_name || "",
        mrp_price: product.mrp_price,
        discount_price: product.discount_price,
        quantity: product.quantity,
        category_id: product.category_id,
      },
    });

    console.log(`✅ Indexed product in Elasticsearch: ${product.product_name}`);
  } catch (err) {
    console.error("❌ Error indexing product:", err);
  }
};
