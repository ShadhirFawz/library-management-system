const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  fullName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  phone: String,

  role: {
    type: String,
    enum: ["ADMIN", "LIBRARIAN", "MEMBER"],
    default: "MEMBER"
  },

  status: {
    type: String,
    enum: ["ACTIVE", "SUSPENDED"],
    default: "ACTIVE"
  },

  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership"
  },

  activeBorrowCount: {
    type: Number,
    default: 0,
    min: 0
  },

  address: {
    street: String,
    city: String,
    district: String,
    postalCode: String
  },

  profileImage: String,

  lastLogin: Date
},
{
  timestamps: true
}
);

module.exports = mongoose.model("User", userSchema);