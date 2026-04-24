require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const connectDB = require("./config/db");
const bookRoutes = require("./routes/bookRoutes");
const bookCopyRoutes = require("./routes/bookCopyRoutes");
const authorRoutes = require("./routes/authorRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

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
      title: "Library Book Catalog Service API",
      version: "1.0.0",
      description:
        "Book Catalog Service for Library Management System - handles books, authors, categories, and book copies",
    },
    servers: [{ url: "/" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Book: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Book ID" },
            title: { type: "string" },
            isbn: { type: "string" },
            authors: {
              type: "array",
              items: { $ref: "#/components/schemas/Author" },
            },
            description: { type: "string" },
            publisher: { type: "string" },
            publicationYear: { type: "integer" },
            language: { type: "string" },
            pages: { type: "integer" },
            categories: {
              type: "array",
              items: { $ref: "#/components/schemas/Category" },
            },
            coverImage: { type: "string", format: "uri" },
            copiesCount: {
              type: "integer",
              description: "Total copies available",
            },
            availableCopies: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Author: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Author ID" },
            name: { type: "string" },
            bio: { type: "string" },
            birthYear: { type: "integer" },
            nationality: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Category: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Category ID" },
            name: { type: "string" },
            description: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        BookCopy: {
          type: "object",
          properties: {
            _id: { type: "string", description: "Book Copy ID" },
            bookId: { type: "string", description: "Associated Book ID" },
            barcode: { type: "string" },
            location: { type: "string" },
            condition: {
              type: "string",
              enum: ["new", "good", "fair", "poor"],
            },
            status: {
              type: "string",
              enum: ["available", "borrowed", "lost", "damaged"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
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

app.use("/api/books", bookCopyRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "book-catalog-service v1.0",
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
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`[book-catalog-service] Running on port ${PORT}`);
  });
};


startServer();
