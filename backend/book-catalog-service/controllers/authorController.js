const Author = require("../models/Author");

const createAuthor = async (req, res) => {
  const { name, bio, birthYear, nationality } = req.body;

  try {
    const author = await Author.create({ name, bio, birthYear, nationality });
    res.status(201).json({ author });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Author with that name already exists" });
    }
    console.error("[authorController] createAuthor error:", err);
    res.status(500).json({ error: "Failed to create author" });
  }
};

const getAuthors = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [authors, total] = await Promise.all([
      Author.find().sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Author.countDocuments(),
    ]);

    res.json({
      authors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[authorController] getAuthors error:", err);
    res.status(500).json({ error: "Failed to fetch authors" });
  }
};

const getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    res.json({ author });
  } catch (err) {
    console.error("[authorController] getAuthorById error:", err);
    res.status(500).json({ error: "Failed to fetch author" });
  }
};

const updateAuthor = async (req, res) => {
  const { name, bio, birthYear, nationality } = req.body;

  try {
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { name, bio, birthYear, nationality },
      { new: true, runValidators: true },
    );

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.json({ author });
  } catch (err) {
    console.error("[authorController] updateAuthor error:", err);
    res.status(500).json({ error: "Failed to update author" });
  }
};

const deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    res.json({ message: "Author deleted" });
  } catch (err) {
    console.error("[authorController] deleteAuthor error:", err);
    res.status(500).json({ error: "Failed to delete author" });
  }
};

module.exports = {
  createAuthor,
  getAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
};
