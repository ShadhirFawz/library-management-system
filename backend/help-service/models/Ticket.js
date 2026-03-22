const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      default: null,
      trim: true,
    },
    raisedBy: {
      type: String, // user ID from JWT
      required: true,
    },
    raisedByName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    adminResponse: {
      type: String,
      default: null,
    },
    respondedBy: {
      type: String, // admin ID from JWT
      default: null,
    },
    respondedByName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Ticket", ticketSchema);
