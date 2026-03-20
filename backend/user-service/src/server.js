const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const healthRoutes = require("./routes/healthRoutes");
const errorHandler = require("./middleware/errorHandler");
const membershipRoutes = require("./routes/membershipRoutes");
const swaggerUi = require("swagger-ui-express");
const specs = require("./config/swagger");
const config = require("./config");

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/health", (req, res) => {
  res.json({
    service: "User Service",
    status: "running"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/memberships", membershipRoutes);

app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});