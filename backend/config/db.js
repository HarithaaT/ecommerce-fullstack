// config/db.js
import mysql from "mysql2";
import dotenv from "./dotenv.js"; // ✅ Keep your existing dotenv import path

// ✅ Load environment variables
dotenv.config();

// ✅ Create a Promise-based MySQL connection pool
const db = mysql
  .createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ecommerce_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise(); // ✅ Key fix — enables use of async/await properly

// ✅ Export the connection
export default db;
