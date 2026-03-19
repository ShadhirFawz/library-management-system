const mongoose = require("mongoose");

// userId and bookCopyId are plain strings, not ObjectIds — they belong to
// other services that run their own databases
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      index: true,
    },
    bookCopyId: {
      type: String,
      required: [true, "bookCopyId is required"],
    },
    // stored here so reservation lookups don't need a Book Service round-trip
    bookId: {
      type: String,
      required: [true, "bookId is required"],
      index: true,
    },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "dueDate is required"],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed",
    },
    // set when the order closes and a fine was issued
    fineAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

// computed on the fly — no need to store a redundant boolean
orderSchema.virtual("isOverdue").get(function () {
  if (this.returnDate) {
    return this.returnDate > this.dueDate;
  }
  return new Date() > this.dueDate;
});

module.exports = mongoose.model("Order", orderSchema);
