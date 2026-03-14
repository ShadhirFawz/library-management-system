const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "User Service",
    status: "running"
  });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});