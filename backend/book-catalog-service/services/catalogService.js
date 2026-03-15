const Book = require("../models/Book");
const BookCopy = require("../models/BookCopy");

// Recomputes totalCopies / availableCopies for a book by aggregating its copies.
// Call this whenever a BookCopy is created, updated, or deleted.
const syncCopyCounts = async (bookId) => {
  const [total, available] = await Promise.all([
    BookCopy.countDocuments({ bookId }),
    BookCopy.countDocuments({ bookId, status: "available" }),
  ]);

  await Book.findByIdAndUpdate(bookId, {
    totalCopies: total,
    availableCopies: available,
  });
};

// Builds a Mongoose query filter from the search parameters accepted by GET /api/books.
// All fields are optional; omitting them returns the full catalog.
const buildBookFilter = ({ q, authorId, categoryId, language, isbn }) => {
  const filter = {};

  if (q) {
    // Full-text match on the text index (title + description)
    filter.$text = { $search: q };
  }

  if (isbn) {
    filter.isbn = isbn.trim();
  }

  if (authorId) {
    filter.authors = authorId;
  }

  if (categoryId) {
    filter.categories = categoryId;
  }

  if (language) {
    filter.language = { $regex: new RegExp(`^${language.trim()}$`, "i") };
  }

  return filter;
};

module.exports = { syncCopyCounts, buildBookFilter };
