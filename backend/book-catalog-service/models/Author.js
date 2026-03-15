const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    birthYear: {
      type: Number,
      min: [1, "Birth year must be positive"],
    },
    nationality: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Full-text index so search can match author names
authorSchema.index({ name: "text" });

module.exports = mongoose.model("Author", authorSchema);
