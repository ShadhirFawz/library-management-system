require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const fineRoutes = require("./routes/fineRoutes");

const app = express();

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

app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/fines", fineRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "order-service",
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("[order-service] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => {
    console.log(`[order-service] Running on port ${PORT}`);
  });
};

startServer();
