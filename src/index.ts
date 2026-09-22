import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import authRoutes from "./routes/authRoutes";
import documentRoutes from "./routes/documentRoutes";
import conversationRoutes from "./routes/conversationRoutes"
import { authMiddleware } from "./middlewares/authMiddleware";
import { errorHandler } from "./middlewares/errorHandler";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(errorHandler); 
app.listen()

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is alive" });
});
app.get("/version", [authMiddleware],(req:any, res:any) => {
  res.json({ version: "1.0.0", environment: process.env.NODE_ENV , user_email: req.user_email  });
});

app.get("/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    if (!result) {
      return res.status(500).json({ connected: false, error: "No result from database" });
    }
    res.json({ connected: true, users: result.rows });
  } catch (err) {
    console.log("Database connection error:", err);
    res.status(500).json({ connected: false, error: (err as Error).message });
  }
});
app.use("/auth", authRoutes);
app.use("/documents", documentRoutes);
app.use("/conversations", conversationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});