const mongoose = require("mongoose");

const userMembershipSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  membershipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership"
  },

  startDate: Date,

  expiryDate: Date,

  status: {
    type: String,
    enum: ["ACTIVE", "EXPIRED"],
    default: "ACTIVE"
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("UserMembership", userMembershipSchema);