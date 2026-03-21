const jwt = require("jsonwebtoken");

const normalizeRole = (role) =>
  typeof role === "string" ? role.toUpperCase() : "";

// pulls the Bearer token off the Authorization header and puts the decoded
// payload on req.user so controllers can read id and role
const authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

// admins only — must come after authenticate
const adminOnly = (req, res, next) => {
  if (normalizeRole(req.user?.role) !== "ADMIN") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};

// admins and librarians — must come after authenticate
const staffOnly = (req, res, next) => {
  const staffRoles = ["ADMIN", "LIBRARIAN"];
  if (!staffRoles.includes(normalizeRole(req.user?.role))) {
    return res.status(403).json({ error: "Staff access only" });
  }
  next();
};

module.exports = { authenticate, adminOnly, staffOnly };
