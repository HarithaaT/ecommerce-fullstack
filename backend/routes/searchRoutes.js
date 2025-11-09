// routes/searchRoutes.js
import express from "express";
import { simpleSearch, elasticSearch } from "../controllers/searchController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Simple MySQL search
router.get("/simple", simpleSearch);

// ✅ ElasticSearch full-text search
router.get("/elastic", elasticSearch);

// ✅ Optional protected search route (requires token)
router.get("/secure", verifyToken, simpleSearch);

export default router;
