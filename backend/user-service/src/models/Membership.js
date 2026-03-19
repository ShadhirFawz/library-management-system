const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  maxBorrowLimit: Number,

  borrowDurationDays: Number,

  finePerDay: Number,

  membershipDurationMonths: Number
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Membership", membershipSchema);