const jwt = require("jsonwebtoken");

// Pulls the Bearer token off the Authorization header and puts the decoded
// payload on req.user so controllers can read userId and role.
const authenticate = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[auth] Authenticated user:", req.user);
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Admins only — must come after authenticate.
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};

// Admins and librarians — must come after authenticate.
const staffOnly = (req, res, next) => {
  const staffRoles = ["admin", "LIBRARIAN"];
  if (!staffRoles.includes(req.user?.role)) {
    return res.status(403).json({ error: "Staff access only" });
  }
  next();
};

module.exports = { authenticate, adminOnly, staffOnly };
