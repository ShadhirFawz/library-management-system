const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    publisher: {
      type: String,
      trim: true,
    },
    publicationYear: {
      type: Number,
      min: [1, "Publication year must be positive"],
    },
    language: {
      type: String,
      trim: true,
      default: "English",
    },
    pages: {
      type: Number,
      min: [1, "Pages must be at least 1"],
    },
    // at least one author is required — validated at the controller level
    authors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: true,
      },
    ],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    coverImage: {
      type: String,
      trim: true,
      default: "",
    },
    // denormalised counters — kept in sync by catalogService whenever copies change
    totalCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableCopies: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

// Compound text index for full-text search across the most useful fields
bookSchema.index({ title: "text", description: "text" });
// Fast equality lookups
bookSchema.index({ isbn: 1 });
bookSchema.index({ authors: 1 });
bookSchema.index({ categories: 1 });

module.exports = mongoose.model("Book", bookSchema);
