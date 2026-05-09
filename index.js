import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "plasticycle-backend"
  });
});

app.get("/api/db-check", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now, current_user AS user");

    res.json({
      status: "connected",
      databaseTime: result.rows[0].now,
      databaseUser: result.rows[0].user
    });
  } catch (error) {
    console.error("Database check failed:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed"
    });
  }
});

app.get("/api/plastic-items", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, category, created_at
      FROM plastic_items
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json({
      data: result.rows
    });
  } catch (error) {
    console.error("Failed to fetch plastic items:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch plastic items"
    });
  }
});

const port = Number(process.env.PORT || 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Plasticycle backend running on port ${port}`);
});