const Reservation = require("../models/Reservation");
const Order = require("../models/Order");
const bookService = require("../services/bookService");
const userService = require("../services/userService");
const { calculateDueDate } = require("../services/fineService");

const extractToken = (req) => req.headers.authorization?.split(" ")[1];

const createReservation = async (req, res) => {
  const token = extractToken(req);
  const userId = req.user.id;
  const { bookId } = req.body;

  try {
    // make sure the book exists before we queue anyone up for it
    await bookService.getBookById(bookId, token);

    // don't let the same user reserve the same book twice
    const existing = await Reservation.findOne({
      userId,
      bookId,
      status: "pending",
    });
    if (existing) {
      return res.status(409).json({
        error: "You already have a pending reservation for this book",
        reservation: existing,
      });
    }

    const reservation = await Reservation.create({
      userId,
      bookId,
      reservationDate: new Date(),
    });

    // tell the user their position in the queue (1 = next in line)
    const queuePosition = await Reservation.countDocuments({
      bookId,
      status: "pending",
      reservationDate: { $lte: reservation.reservationDate },
    });

    return res.status(201).json({
      message: "Reservation placed successfully",
      reservation,
      queuePosition,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    // duplicate key means the unique partial index caught a race condition
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate reservation" });
    }
    console.error("[reservationController] createReservation error:", err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

const cancelReservation = async (req, res) => {
  const userId = req.user.id;
  const isStaff = ["admin", "librarian"].includes(req.user.role);

  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (!isStaff && reservation.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!["pending", "notified"].includes(reservation.status)) {
      return res.status(400).json({
        error: `Cannot cancel a reservation with status '${reservation.status}'`,
      });
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.json({ message: "Reservation cancelled", reservation });
  } catch (err) {
    console.error("[reservationController] cancelReservation error:", err);
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
};

const getMyReservations = async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  try {
    const filter = { userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .sort({ reservationDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reservation.countDocuments(filter),
    ]);

    res.json({
      reservations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[reservationController] getMyReservations error:", err);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
};

const getAllReservations = async (req, res) => {
  const { userId, bookId, status, page = 1, limit = 20 } = req.query;

  try {
    const filter = {};
    if (userId) filter.userId = userId;
    if (bookId) filter.bookId = bookId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .sort({ reservationDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reservation.countDocuments(filter),
    ]);

    res.json({
      reservations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[reservationController] getAllReservations error:", err);
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
};

// returns the waiting list for a book, ordered by who reserved first
const getReservationsForBook = async (req, res) => {
  const { bookId } = req.params;

  try {
    const reservations = await Reservation.find({
      bookId,
      status: { $in: ["pending", "notified"] },
    }).sort({ reservationDate: 1 });

    res.json({
      bookId,
      queueLength: reservations.length,
      reservations,
    });
  } catch (err) {
    console.error("[reservationController] getReservationsForBook error:", err);
    res.status(500).json({ error: "Failed to fetch book reservation queue" });
  }
};

// staff approves a reservation → creates a borrow order
const approveReservation = async (req, res) => {
  const token = extractToken(req);
  const { id } = req.params;
  const { bookCopyId } = req.body; // optionally specify which copy

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (!["pending", "notified"].includes(reservation.status)) {
      return res.status(400).json({
        error: `Cannot approve reservation with status '${reservation.status}'`,
      });
    }

    // find an available copy — use specified copy or pick first available
    let copy;
    if (bookCopyId) {
      copy = await bookService.getBookCopyById(bookCopyId, token);
      if (!copy.isAvailable) {
        return res.status(400).json({
          error: "Specified book copy is not available",
        });
      }
    } else {
      const availableCopies = await bookService.getAvailableCopiesForBook(
        reservation.bookId,
        token,
      );
      if (!availableCopies.length) {
        return res.status(400).json({
          error: "No available copies for this book",
        });
      }
      copy = availableCopies[0];
    }

    // check member's borrow limits
    const user = await userService.getUserById(reservation.userId, token);
    const membership = user.membership || {};
    const borrowLimit = membership.borrowLimit ?? 5;
    const activeBorrowCount = membership.activeBorrowCount ?? 0;
    const borrowDurationDays =
      membership.borrowDurationDays ??
      parseInt(process.env.DEFAULT_BORROW_DAYS, 10) ??
      14;

    if (activeBorrowCount >= borrowLimit) {
      return res.status(400).json({
        error: `Member has reached borrow limit (${activeBorrowCount}/${borrowLimit})`,
      });
    }

    const borrowDate = new Date();
    const dueDate = calculateDueDate(borrowDate, borrowDurationDays);

    // create the order
    const order = await Order.create({
      userId: reservation.userId,
      bookCopyId: copy._id || copy.id,
      bookId: reservation.bookId,
      borrowDate,
      dueDate,
      status: "borrowed",
    });

    // mark copy as borrowed
    try {
      await bookService.markCopyAsBorrowed(copy._id || copy.id, token);
    } catch (bookErr) {
      await Order.findByIdAndDelete(order._id);
      return res.status(bookErr.statusCode || 503).json({
        error: bookErr.message,
      });
    }

    // update user's borrow count (best effort)
    await userService.updateBorrowCount(reservation.userId, +1, token);

    // mark reservation as fulfilled
    reservation.status = "fulfilled";
    await reservation.save();

    return res.json({
      message: "Reservation approved and book issued",
      reservation,
      order,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("[reservationController] approveReservation error:", err);
    res.status(500).json({ error: "Failed to approve reservation" });
  }
};

// staff rejects a reservation
const rejectReservation = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    if (!["pending", "notified"].includes(reservation.status)) {
      return res.status(400).json({
        error: `Cannot reject reservation with status '${reservation.status}'`,
      });
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.json({
      message: "Reservation rejected",
      reservation,
      ...(reason && { reason }),
    });
  } catch (err) {
    console.error("[reservationController] rejectReservation error:", err);
    res.status(500).json({ error: "Failed to reject reservation" });
  }
};

module.exports = {
  createReservation,
  cancelReservation,
  getMyReservations,
  getAllReservations,
  getReservationsForBook,
  approveReservation,
  rejectReservation,
};
