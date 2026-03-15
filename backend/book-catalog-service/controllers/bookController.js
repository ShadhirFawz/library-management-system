const Book = require("../models/Book");
const { buildBookFilter } = require("../services/catalogService");

const createBook = async (req, res) => {
  const {
    title,
    isbn,
    description,
    publisher,
    publicationYear,
    language,
    pages,
    authors,
    categories,
    coverImage,
  } = req.body;

  try {
    const book = await Book.create({
      title,
      isbn,
      description,
      publisher,
      publicationYear,
      language,
      pages,
      authors,
      categories,
      coverImage,
    });

    await book.populate(["authors", "categories"]);
    res.status(201).json({ book });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "A book with this ISBN already exists" });
    }
    console.error("[bookController] createBook error:", err);
    res.status(500).json({ error: "Failed to create book" });
  }
};

const getBooks = async (req, res) => {
  const {
    q,
    authorId,
    categoryId,
    language,
    isbn,
    page = 1,
    limit = 20,
  } = req.query;

  try {
    const filter = buildBookFilter({ q, authorId, categoryId, language, isbn });
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const queryOptions = {
      sort: { createdAt: -1 },
      skip,
      limit: parseInt(limit),
    };
    // When doing full-text search, rank by relevance score
    if (q) {
      queryOptions.sort = { score: { $meta: "textScore" }, createdAt: -1 };
    }

    const [books, total] = await Promise.all([
      Book.find(filter, q ? { score: { $meta: "textScore" } } : {})
        .populate("authors", "name")
        .populate("categories", "name")
        .sort(queryOptions.sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Book.countDocuments(filter),
    ]);

    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[bookController] getBooks error:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("authors")
      .populate("categories");

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ book });
  } catch (err) {
    console.error("[bookController] getBookById error:", err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
};

const updateBook = async (req, res) => {
  const allowedFields = [
    "title",
    "description",
    "publisher",
    "publicationYear",
    "language",
    "pages",
    "authors",
    "categories",
    "coverImage",
  ];

  // Build update payload only from provided fields
  const update = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      update[field] = req.body[field];
    }
  }

  try {
    const book = await Book.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate("authors")
      .populate("categories");

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ book });
  } catch (err) {
    console.error("[bookController] updateBook error:", err);
    res.status(500).json({ error: "Failed to update book" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error("[bookController] deleteBook error:", err);
    res.status(500).json({ error: "Failed to delete book" });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};
