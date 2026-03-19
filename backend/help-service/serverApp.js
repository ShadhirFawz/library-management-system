const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const ticketRoutes = require("./routes/ticketRoutes");
const articleRoutes = require("./routes/articleRoutes");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean) || "*"
    })
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_MAX || 300),
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ service: "Help Service", status: "running" });
  });

  const swaggerSpec = swaggerJSDoc({
    definition: {
      openapi: "3.0.3",
      info: {
        title: "Library Help Service API",
        version: "1.0.0",
        description: "Help articles + customer care ticketing for the Library Management System"
      },
      servers: [{ url: "/" }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
        }
      }
    },
    apis: ["./routes/*.js"]
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/tickets", ticketRoutes);
  app.use("/api/articles", articleRoutes);

  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;

