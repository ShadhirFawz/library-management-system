const Reservation = require("../models/Reservation");
const bookService = require("../services/bookService");

const extractToken = (req) => req.headers.authorization?.split(" ")[1];

const createReservation = async (req, res) => {
  const token = extractToken(req);
  const userId = req.user.userId;
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
  const userId = req.user.userId;
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
  const userId = req.user.userId;
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

module.exports = {
  createReservation,
  cancelReservation,
  getMyReservations,
  getAllReservations,
  getReservationsForBook,
};
