const Order = require("../models/Order");
const Fine = require("../models/Fine");
const Reservation = require("../models/Reservation");

const userService = require("../services/userService");
const bookService = require("../services/bookService");
const {
  calculateOverdueDays,
  calculateFineAmount,
  buildFineReason,
  calculateDueDate,
} = require("../services/fineService");

const extractToken = (req) => req.headers.authorization?.split(" ")[1];

const borrowBook = async (req, res) => {
  const token = extractToken(req);
  const userId = req.user.userId;
  const { bookCopyId, bookId } = req.body;

  try {
    // check the user's membership limits
    const user = await userService.getUserById(userId, token);
    const membership = user.membership || {};
    const borrowLimit = membership.borrowLimit ?? 5;
    const activeBorrowCount = membership.activeBorrowCount ?? 0;
    const finePerDay =
      membership.finePerDay ??
      parseFloat(process.env.DEFAULT_FINE_PER_DAY) ??
      0.5;
    const borrowDurationDays =
      membership.borrowDurationDays ??
      parseInt(process.env.DEFAULT_BORROW_DAYS, 10) ??
      14;

    if (activeBorrowCount >= borrowLimit) {
      return res.status(400).json({
        error: `Borrow limit reached. You have ${activeBorrowCount} of ${borrowLimit} allowed books borrowed.`,
      });
    }

    // make sure the copy is actually available
    const copy = await bookService.getBookCopyById(bookCopyId, token);
    if (!copy.isAvailable) {
      return res.status(400).json({
        error: "This book copy is not currently available for borrowing.",
      });
    }

    const borrowDate = new Date();
    const dueDate = calculateDueDate(borrowDate, borrowDurationDays);

    const order = await Order.create({
      userId,
      bookCopyId,
      bookId: bookId || copy.bookId,
      borrowDate,
      dueDate,
      status: "borrowed",
    });

    // lock the copy in the Book Service — if this fails we roll back the order
    try {
      await bookService.markCopyAsBorrowed(bookCopyId, token);
    } catch (bookErr) {
      // book service failed — delete the order so we don't have a dangling record
      await Order.findByIdAndDelete(order._id);
      return res
        .status(bookErr.statusCode || 503)
        .json({ error: bookErr.message });
    }

    // tell user service to bump the borrow count, not critical if it fails
    await userService.updateBorrowCount(userId, +1, token);

    return res.status(201).json({
      message: "Book borrowed successfully",
      order,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("[orderController] borrowBook error:", err);
    res.status(500).json({ error: "Failed to borrow book" });
  }
};

const returnBook = async (req, res) => {
  const token = extractToken(req);
  const userId = req.user.userId;
  const isStaff = ["admin", "librarian"].includes(req.user.role);
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // members can only return their own books
    if (!isStaff && order.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only return your own borrowed books" });
    }

    if (order.status === "returned") {
      return res
        .status(400)
        .json({ error: "This book has already been returned" });
    }

    const returnDate = new Date();
    const overdueDays = calculateOverdueDays(order.dueDate, returnDate);
    const isOverdue = overdueDays > 0;

    // try to get the real fine rate from the membership plan, fall back to env default
    let finePerDay = parseFloat(process.env.DEFAULT_FINE_PER_DAY) ?? 0.5;
    try {
      const user = await userService.getUserById(order.userId, token);
      finePerDay = user.membership?.finePerDay ?? finePerDay;
    } catch (_) {
      // user service is down, just use the default rate
    }

    const fineAmount = calculateFineAmount(overdueDays, finePerDay);

    order.returnDate = returnDate;
    order.status = isOverdue ? "overdue" : "returned";
    order.fineAmount = fineAmount;
    await order.save();

    // create a fine record if the book came back late
    let fine = null;
    if (isOverdue && fineAmount > 0) {
      fine = await Fine.create({
        orderId: order._id,
        userId: order.userId,
        amount: fineAmount,
        reason: buildFineReason(overdueDays, order.dueDate, returnDate),
      });
    }

    await bookService.markCopyAsReturned(order.bookCopyId, token);
    await userService.updateBorrowCount(order.userId, -1, token);

    // move the next person in the reservation queue to "notified"
    const nextReservation = await Reservation.findOneAndUpdate(
      { bookId: order.bookId, status: "pending" },
      { status: "notified", notifiedAt: new Date() },
      { sort: { reservationDate: 1 }, new: true },
    );
    if (nextReservation) {
      console.log(
        `[order-service] Notified reservation ${nextReservation._id} for book ${order.bookId} (user: ${nextReservation.userId})`,
      );
    }

    return res.json({
      message: isOverdue
        ? `Book returned ${overdueDays} day(s) late. Fine issued: $${fineAmount.toFixed(2)}`
        : "Book returned on time",
      order,
      ...(fine && { fine }),
    });
  } catch (err) {
    console.error("[orderController] returnBook error:", err);
    res.status(500).json({ error: "Failed to process return" });
  }
};

const getMyOrders = async (req, res) => {
  const userId = req.user.userId;
  const { status, page = 1, limit = 10 } = req.query;

  try {
    const filter = { userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[orderController] getMyOrders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const getAllOrders = async (req, res) => {
  const { userId, status, page = 1, limit = 20 } = req.query;

  try {
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[orderController] getAllOrders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const getOrderById = async (req, res) => {
  const userId = req.user.userId;
  const isStaff = ["admin", "librarian"].includes(req.user.role);

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!isStaff && order.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ order });
  } catch (err) {
    console.error("[orderController] getOrderById error:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// used by Customer Care to pull the full history for any user
const getOrderHistoryByUser = async (req, res) => {
  const { userId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  try {
    const filter = { userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    // flag any "borrowed" orders where the due date has already passed
    const now = new Date();
    const overdueCount = orders.filter(
      (o) => o.status === "borrowed" && now > o.dueDate,
    ).length;

    res.json({
      orders,
      overdueCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[orderController] getOrderHistoryByUser error:", err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderHistoryByUser,
};
