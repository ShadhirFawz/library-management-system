require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

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

// Swagger setup
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Library Order Service API",
      version: "1.0.0",
      description:
        "Order Service for Library Management System - handles borrowing, returns, reservations, and fines",
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Order: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Order ID" },
            userId: { type: "string", description: "User ID" },
            bookCopyId: { type: "string", description: "Book copy ID" },
            bookId: { type: "string", description: "Book ID" },
            borrowDate: { type: "string", format: "date-time" },
            dueDate: { type: "string", format: "date-time" },
            returnDate: { type: "string", format: "date-time", nullable: true },
            status: {
              type: "string",
              enum: ["borrowed", "returned", "overdue"],
            },
            fineAmount: { type: "number", default: 0 },
          },
        },
        Reservation: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Reservation ID" },
            userId: { type: "string", description: "User ID" },
            bookId: { type: "string", description: "Book ID" },
            reservationDate: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: [
                "pending",
                "notified",
                "fulfilled",
                "cancelled",
                "expired",
              ],
            },
            notifiedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
        Fine: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Fine ID" },
            orderId: { type: "string", description: "Associated order ID" },
            userId: { type: "string", description: "User ID" },
            amount: { type: "number", description: "Fine amount" },
            reason: { type: "string", description: "Reason for fine" },
            isPaid: { type: "boolean", default: false },
            paidAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            pages: { type: "integer" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/fines", fineRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "order-service v1.0",
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
