const jwt = require("jsonwebtoken");

async function verifyWithUserService(token) {
  const baseUrl = process.env.USER_SERVICE_URL;
  if (!baseUrl) throw new Error("USER_SERVICE_URL is not set");

  const controller = new AbortController();
  const timeoutMs = Number(process.env.USER_SERVICE_TIMEOUT_MS || 5001);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/verify`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`User-service verify failed: ${resp.status} ${text}`);
    }

    const data = await resp.json();
    // expected: { user: { userId, role, ... } } OR a JWT payload
    return data.user || data;
  } finally {
    clearTimeout(timeout);
  }
}

const authenticate = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    req.user = await verifyWithUserService(token);
    return next();
  } catch (e) {
    if (String(process.env.ALLOW_LOCAL_JWT_VERIFY).toLowerCase() === "true") {
      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
      } catch {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
    }

    return res.status(401).json({ error: "Unauthorized", details: e.message });
  }
};

const authorizeRoles =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };

// backward-compatible alias for existing code
const adminOnly = authorizeRoles("admin");

module.exports = { authenticate, adminOnly, authorizeRoles };
