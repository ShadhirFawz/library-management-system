const express = require("express");
const { body, param, query } = require("express-validator");

const { authenticate, staffOnly, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

const router = express.Router();

// POST /api/books
router.post(
  "/",
  authenticate,
  staffOnly,
  [
    body("title").notEmpty().withMessage("title is required").isString().trim(),
    body("isbn").notEmpty().withMessage("isbn is required").isString().trim(),
    body("authors")
      .isArray({ min: 1 })
      .withMessage("At least one author is required"),
    body("authors.*").isMongoId().withMessage("Each author must be a valid ID"),
    body("description").optional().isString().trim(),
    body("publisher").optional().isString().trim(),
    body("publicationYear").optional().isInt({ min: 1 }),
    body("language").optional().isString().trim(),
    body("pages").optional().isInt({ min: 1 }),
    body("categories").optional().isArray(),
    body("categories.*").optional().isMongoId(),
    body("coverImage")
      .optional()
      .isURL()
      .withMessage("coverImage must be a valid URL"),
  ],
  validate,
  createBook,
);

// GET /api/books  (public — search + browse)
router.get(
  "/",
  [
    query("q").optional().isString().trim(),
    query("isbn").optional().isString().trim(),
    query("authorId").optional().isMongoId(),
    query("categoryId").optional().isMongoId(),
    query("language").optional().isString().trim(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getBooks,
);

// GET /api/books/:id  (public)
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid book ID")],
  validate,
  getBookById,
);

// PATCH /api/books/:id
router.patch(
  "/:id",
  authenticate,
  staffOnly,
  [
    param("id").isMongoId().withMessage("Invalid book ID"),
    body("title").optional().isString().trim(),
    body("description").optional().isString().trim(),
    body("publisher").optional().isString().trim(),
    body("publicationYear").optional().isInt({ min: 1 }),
    body("language").optional().isString().trim(),
    body("pages").optional().isInt({ min: 1 }),
    body("authors").optional().isArray({ min: 1 }),
    body("authors.*").optional().isMongoId(),
    body("categories").optional().isArray(),
    body("categories.*").optional().isMongoId(),
    body("coverImage").optional().isURL(),
  ],
  validate,
  updateBook,
);

// DELETE /api/books/:id — staff only
router.delete(
  "/:id",
  authenticate,
  staffOnly,
  [param("id").isMongoId().withMessage("Invalid book ID")],
  validate,
  deleteBook,
);

module.exports = router;
