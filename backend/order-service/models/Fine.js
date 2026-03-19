const mongoose = require("mongoose");

// one Fine document per overdue return
const fineSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "orderId is required"],
      index: true,
    },
    userId: {
      type: String,
      required: [true, "userId is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
      min: [0, "Fine amount cannot be negative"],
    },
    reason: {
      type: String,
      required: [true, "reason is required"],
      trim: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Fine", fineSchema);
