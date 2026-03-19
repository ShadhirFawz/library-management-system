const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "User Service",
    status: "running"
  });
});

// Used by other microservices (e.g., help-service) to validate JWT and read user role
app.get("/api/auth/verify", (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user: payload });
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});