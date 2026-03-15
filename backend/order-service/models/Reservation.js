const mongoose = require("mongoose");

// queue is ordered by reservationDate ascending, whoever reserved first gets notified first
const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      index: true,
    },
    bookId: {
      type: String,
      required: [true, "bookId is required"],
      index: true,
    },
    reservationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "notified", "fulfilled", "cancelled", "expired"],
      default: "pending",
    },
    // timestamp for when we told the user the book is available
    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// stops a user from queuing twice for the same book
reservationSchema.index(
  { userId: 1, bookId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  },
);

module.exports = mongoose.model("Reservation", reservationSchema);
