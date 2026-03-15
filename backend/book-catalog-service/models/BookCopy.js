const mongoose = require("mongoose");

const bookCopySchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "bookId is required"],
      index: true,
    },
    // unique physical identifier printed on the label (barcode / RFID)
    barcode: {
      type: String,
      required: [true, "barcode is required"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "borrowed", "lost", "damaged"],
      default: "available",
    },
    // shelf location, e.g. "A3-12" — optional but helpful for staff
    location: {
      type: String,
      trim: true,
      default: "",
    },
    condition: {
      type: String,
      enum: ["new", "good", "fair", "poor"],
      default: "good",
    },
  },
  { timestamps: true },
);

// Virtual consumed by the Order Service bookService — avoids leaking internal enums
bookCopySchema.virtual("isAvailable").get(function () {
  return this.status === "available";
});

bookCopySchema.set("toJSON", { virtuals: true });
bookCopySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("BookCopy", bookCopySchema);
