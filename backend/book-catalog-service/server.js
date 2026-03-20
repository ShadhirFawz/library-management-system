require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const bookCopyRoutes = require("./routes/bookCopyRoutes");
const authorRoutes = require("./routes/authorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// TEST CI/CD - March 2026

app.use(helmet());
app.use(cors());
app.use(express.json());

// 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/api/books", bookCopyRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "book-catalog-service",
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("[book-catalog-service] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 80;
  app.listen(PORT, () => {
    console.log(`[book-catalog-service] Running on port ${PORT}`);
  });
};

startServer();
