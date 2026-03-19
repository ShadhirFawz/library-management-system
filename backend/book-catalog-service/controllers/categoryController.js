const Category = require("../models/Category");

const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const category = await Category.create({ name, description });
    res.status(201).json({ category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Category already exists" });
    }
    console.error("[categoryController] createCategory error:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
};

const getCategories = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [categories, total] = await Promise.all([
      Category.find().sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Category.countDocuments(),
    ]);

    res.json({
      categories,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("[categoryController] getCategories error:", err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ category });
  } catch (err) {
    console.error("[categoryController] getCategoryById error:", err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

const updateCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true },
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Category name already taken" });
    }
    console.error("[categoryController] updateCategory error:", err);
    res.status(500).json({ error: "Failed to update category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("[categoryController] deleteCategory error:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
