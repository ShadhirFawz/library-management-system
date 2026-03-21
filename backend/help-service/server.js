const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const connectDB = require("./config/db");
const ticketRoutes = require("./routes/ticketRoutes");
const articleRoutes = require("./routes/articleRoutes");

require("dotenv").config();

const PORT = process.env.PORT || 3000;

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin:
        process.env.CORS_ORIGIN?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || "*",
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_MAX || 300),
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ service: "Help Service", status: "running successfully" });
  });

  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Library Help Service API",
        version: "1.0.0",
        description:
          "Help articles + customer care ticketing for the Library Management System",
      },
      servers: [{ url: "/" }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    apis: ["./routes/*.js"],
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/tickets", ticketRoutes);
  app.use("/api/faq", articleRoutes);

  return app;
}

const startServer = async () => {
  try {
    await connectDB();
    const app = createApp();
    app.listen(PORT, () =>
      console.log(`🚀 Help Service running on port ${PORT}`),
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
