const BookCopy = require("../models/BookCopy");
const Book = require("../models/Book");
const { syncCopyCounts } = require("../services/catalogService");

// Get all book copies across all books (for staff inventory view)
const getAllCopies = async (req, res) => {
  const { status } = req.query;

  try {
    const filter = {};
    if (status) filter.status = status;

    const bookCopies = await BookCopy.find(filter)
      .populate("bookId", "title")
      .sort({ createdAt: -1 });

    res.json({ bookCopies });
  } catch (err) {
    console.error("[bookCopyController] getAllCopies error:", err);
    res.status(500).json({ error: "Failed to fetch book copies" });
  }
};

const addCopy = async (req, res) => {
  const { bookId } = req.params;
  const { barcode, location, condition } = req.body;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const copy = await BookCopy.create({
      bookId,
      barcode,
      location,
      condition,
    });
    await syncCopyCounts(bookId);

    res.status(201).json({ copy });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "A copy with this barcode already exists" });
    }
    console.error("[bookCopyController] addCopy error:", err);
    res.status(500).json({ error: "Failed to add book copy" });
  }
};

const getCopiesByBook = async (req, res) => {
  const { bookId } = req.params;
  const { status } = req.query;

  try {
    const filter = { bookId };
    if (status) filter.status = status;

    const copies = await BookCopy.find(filter).sort({ createdAt: -1 });
    res.json({ copies });
  } catch (err) {
    console.error("[bookCopyController] getCopiesByBook error:", err);
    res.status(500).json({ error: "Failed to fetch copies" });
  }
};

// Used by the Order Service to verify availability before borrowing
const getCopyById = async (req, res) => {
  try {
    const copy = await BookCopy.findById(req.params.copyId);
    if (!copy) {
      return res.status(404).json({ error: "Book copy not found" });
    }
    res.json(copy);
  } catch (err) {
    console.error("[bookCopyController] getCopyById error:", err);
    res.status(500).json({ error: "Failed to fetch copy" });
  }
};

const updateCopy = async (req, res) => {
  const { status, location, condition } = req.body;

  try {
    const copy = await BookCopy.findByIdAndUpdate(
      req.params.copyId,
      { status, location, condition },
      { new: true, runValidators: true },
    );

    if (!copy) {
      return res.status(404).json({ error: "Book copy not found" });
    }

    await syncCopyCounts(copy.bookId);
    res.json({ copy });
  } catch (err) {
    console.error("[bookCopyController] updateCopy error:", err);
    res.status(500).json({ error: "Failed to update copy" });
  }
};

const deleteCopy = async (req, res) => {
  try {
    const copy = await BookCopy.findByIdAndDelete(req.params.copyId);
    if (!copy) {
      return res.status(404).json({ error: "Book copy not found" });
    }

    await syncCopyCounts(copy.bookId);
    res.json({ message: "Copy deleted" });
  } catch (err) {
    console.error("[bookCopyController] deleteCopy error:", err);
    res.status(500).json({ error: "Failed to delete copy" });
  }
};

// Called by the Order Service when a borrow is confirmed.
// The copy must currently be "available" — reject anything else to prevent double-booking.
const markCopyAsBorrowed = async (req, res) => {
  try {
    const copy = await BookCopy.findById(req.params.copyId);
    if (!copy) {
      return res.status(404).json({ error: "Book copy not found" });
    }

    if (copy.status !== "available") {
      return res.status(409).json({
        error: `Cannot borrow copy with status "${copy.status}"`,
      });
    }

    copy.status = "borrowed";
    await copy.save();
    await syncCopyCounts(copy.bookId);

    res.json({ message: "Copy marked as borrowed", copy });
  } catch (err) {
    console.error("[bookCopyController] markCopyAsBorrowed error:", err);
    res.status(500).json({ error: "Failed to update copy status" });
  }
};

// Called by the Order Service when a book is returned.
const markCopyAsReturned = async (req, res) => {
  try {
    const copy = await BookCopy.findById(req.params.copyId);
    if (!copy) {
      return res.status(404).json({ error: "Book copy not found" });
    }

    copy.status = "available";
    await copy.save();
    await syncCopyCounts(copy.bookId);

    res.json({ message: "Copy marked as available", copy });
  } catch (err) {
    console.error("[bookCopyController] markCopyAsReturned error:", err);
    res.status(500).json({ error: "Failed to update copy status" });
  }
};

module.exports = {
  getAllCopies,
  addCopy,
  getCopiesByBook,
  getCopyById,
  updateCopy,
  deleteCopy,
  markCopyAsBorrowed,
  markCopyAsReturned,
};
