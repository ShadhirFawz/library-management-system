const authService = require("../services/authService");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Verify token endpoint (for inter-service verification)
exports.verify = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Map 'id' to 'userId' for help-service compatibility
    // Also include basic user info so other services can show names/emails
    const User = require("../models/User");
    const userRecord = await User.findById(decoded.id)
      .select("fullName email role")
      .lean();
    if (userRecord) {
      return res.json({
        user: {
          userId: String(userRecord._id),
          role: userRecord.role,
          fullName: userRecord.fullName,
          email: userRecord.email,
        },
      });
    }

    // Fallback to token payload if DB lookup fails
    res.json({ user: { userId: decoded.id, role: decoded.role } });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
