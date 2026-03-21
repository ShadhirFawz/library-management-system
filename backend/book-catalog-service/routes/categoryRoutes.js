const express = require("express");
const { body, param, query } = require("express-validator");

const { authenticate, staffOnly, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

// POST /api/categories
router.post(
  "/",
  authenticate,
  staffOnly,
  [
    body("name").notEmpty().withMessage("name is required").isString().trim(),
    body("description").optional().isString().trim(),
  ],
  validate,
  createCategory,
);

// GET /api/categories
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  getCategories,
);

// GET /api/categories/:id
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid category ID")],
  validate,
  getCategoryById,
);

// PATCH /api/categories/:id
router.patch(
  "/:id",
  authenticate,
  staffOnly,
  [
    param("id").isMongoId().withMessage("Invalid category ID"),
    body("name").optional().isString().trim(),
    body("description").optional().isString().trim(),
  ],
  validate,
  updateCategory,
);

// DELETE /api/categories/:id — staff only
router.delete(
  "/:id",
  authenticate,
  staffOnly,
  [param("id").isMongoId().withMessage("Invalid category ID")],
  validate,
  deleteCategory,
);

module.exports = router;
