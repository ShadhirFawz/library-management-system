const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    category: {
      type: String,
      enum: ["borrowing", "returning", "account", "ordering", "general"],
      default: "general",
    },
    createdBy: {
      type: String, // admin ID from JWT
      required: true,
    },
    createdByName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Article", articleSchema);
