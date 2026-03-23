const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getUserProfile = async (userId) => {

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

exports.updateUserProfile = async (userId, data) => {

  const user = await User.findByIdAndUpdate(
    userId,
    data,
    { new: true }
  ).select("-password");

  return user;
};

exports.updateUserPassword = async (userId, currentPassword, newPassword) => {

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    const error = new Error("Current password is incorrect");
    error.statusCode = 400;
    throw error;
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    const error = new Error("New password must be different from current password");
    error.statusCode = 400;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};