const Fine = require("../models/Fine");
const Order = require("../models/Order");

const getMyFines = async (req, res) => {
  const userId = req.user.id;
  const { isPaid, page = 1, limit = 10 } = req.query;

  try {
    const filter = { userId };
    if (isPaid !== undefined) filter.isPaid = isPaid === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [fines, total] = await Promise.all([
      Fine.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("orderId", "bookCopyId bookId borrowDate dueDate returnDate"),
      Fine.countDocuments(filter),
    ]);

    // also show the total unpaid amount so the UI can display a balance
    const totalUnpaid = await Fine.aggregate([
      { $match: { userId, isPaid: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      fines,
      unpaidTotal: totalUnpaid[0]?.total ?? 0,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[fineController] getMyFines error:", err);
    res.status(500).json({ error: "Failed to fetch fines" });
  }
};

const getAllFines = async (req, res) => {
  const { userId, isPaid, page = 1, limit = 20 } = req.query;

  try {
    const filter = {};
    if (userId) filter.userId = userId;
    if (isPaid !== undefined) filter.isPaid = isPaid === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [fines, total] = await Promise.all([
      Fine.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("orderId", "bookCopyId bookId borrowDate dueDate returnDate"),
      Fine.countDocuments(filter),
    ]);

    res.json({
      fines,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[fineController] getAllFines error:", err);
    res.status(500).json({ error: "Failed to fetch fines" });
  }
};

const getFineByOrderId = async (req, res) => {
  const userId = req.user.id;
  const isStaff = ["admin", "librarian"].includes(req.user.role);

  try {
    const fine = await Fine.findOne({ orderId: req.params.orderId }).populate(
      "orderId",
      "bookCopyId bookId borrowDate dueDate returnDate status",
    );

    if (!fine) {
      return res.status(404).json({ error: "No fine found for this order" });
    }

    if (!isStaff && fine.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ fine });
  } catch (err) {
    console.error("[fineController] getFineByOrderId error:", err);
    res.status(500).json({ error: "Failed to fetch fine" });
  }
};

const getFineById = async (req, res) => {
  const userId = req.user.id;
  const isStaff = ["admin", "librarian"].includes(req.user.role);

  try {
    const fine = await Fine.findById(req.params.id).populate(
      "orderId",
      "bookCopyId bookId borrowDate dueDate returnDate status",
    );

    if (!fine) {
      return res.status(404).json({ error: "Fine not found" });
    }

    if (!isStaff && fine.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ fine });
  } catch (err) {
    console.error("[fineController] getFineById error:", err);
    res.status(500).json({ error: "Failed to fetch fine" });
  }
};

const payFine = async (req, res) => {
  const userId = req.user.id;
  const isStaff = ["admin", "librarian"].includes(req.user.role);

  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) {
      return res.status(404).json({ error: "Fine not found" });
    }

    if (!isStaff && fine.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (fine.isPaid) {
      return res.status(400).json({ error: "This fine has already been paid" });
    }

    fine.isPaid = true;
    fine.paidAt = new Date();
    await fine.save();

    // zero out fineAmount on the order so the UI shows it as settled
    await Order.findByIdAndUpdate(fine.orderId, { fineAmount: 0 });

    res.json({
      message: `Fine of $${fine.amount.toFixed(2)} marked as paid`,
      fine,
    });
  } catch (err) {
    console.error("[fineController] payFine error:", err);
    res.status(500).json({ error: "Failed to process payment" });
  }
};

module.exports = {
  getMyFines,
  getAllFines,
  getFineByOrderId,
  getFineById,
  payFine,
};
