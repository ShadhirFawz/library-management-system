const User = require("../models/User");

// GET ALL USERS
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET USER BY ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// CREATE USER (ADMIN / LIBRARIAN)
exports.createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const user = await User.create({
      fullName,
      email,
      password,
      role: role || "MEMBER"
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// UPDATE USER
exports.updateUser = async (req, res, next) => {
  try {
    const updates = req.body;

    // Librarian cannot change roles
    if (req.user.role === "LIBRARIAN" && updates.role) {
      return res.status(403).json({
        message: "Librarian cannot change user roles"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE USER (ADMIN ONLY)
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// PROMOTE USER TO LIBRARIAN (ADMIN ONLY)
exports.promoteToLibrarian = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "LIBRARIAN" },
      { new: true }
    ).select("-password");

    res.json({
      message: "User promoted to librarian",
      user
    });
  } catch (err) {
    next(err);
  }
};