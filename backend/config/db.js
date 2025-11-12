// backend/config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Initialize Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

// Test connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL via Sequelize");

    // ✅ Auto-create tables if they don't exist
    await sequelize.sync({ alter: true }); 
    // alter:true updates schema if needed, use {force:true} ONLY for resetting tables

    console.log("✅ Database synchronized successfully");
  } catch (error) {
    console.error("❌ Database connection or sync failed:", error.message);
  }
})();

export default sequelize;
