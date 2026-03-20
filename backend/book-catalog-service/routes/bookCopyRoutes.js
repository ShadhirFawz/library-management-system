const express = require("express");
const { body, param, query } = require("express-validator");

const { authenticate, staffOnly, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getAllCopies,
  addCopy,
  getCopiesByBook,
  getCopyById,
  updateCopy,
  deleteCopy,
  markCopyAsBorrowed,
  markCopyAsReturned,
} = require("../controllers/bookCopyController");

const router = express.Router();

// GET /api/books/copies — list all book copies across all books (for staff inventory)
router.get(
  "/copies",
  authenticate,
  staffOnly,
  [
    query("status")
      .optional()
      .isIn(["available", "borrowed", "lost", "damaged"]),
  ],
  validate,
  getAllCopies,
);

// POST /api/books/:bookId/copies — add a new physical copy to a book
router.post(
  "/:bookId/copies",
  authenticate,
  staffOnly,
  [
    param("bookId").isMongoId().withMessage("Invalid book ID"),
    body("barcode")
      .notEmpty()
      .withMessage("barcode is required")
      .isString()
      .trim(),
    body("location").optional().isString().trim(),
    body("condition")
      .optional()
      .isIn(["new", "good", "fair", "poor"])
      .withMessage("Invalid condition"),
  ],
  validate,
  addCopy,
);

// GET /api/books/:bookId/copies — list all copies for a book
router.get(
  "/:bookId/copies",
  authenticate,
  [
    param("bookId").isMongoId().withMessage("Invalid book ID"),
    query("status")
      .optional()
      .isIn(["available", "borrowed", "lost", "damaged"]),
  ],
  validate,
  getCopiesByBook,
);

// GET /api/books/copies/:copyId — fetch a single copy (used by Order Service)
router.get(
  "/copies/:copyId",
  authenticate,
  [param("copyId").isMongoId().withMessage("Invalid copy ID")],
  validate,
  getCopyById,
);

// PATCH /api/books/copies/:copyId — update status / location / condition
router.patch(
  "/copies/:copyId",
  authenticate,
  staffOnly,
  [
    param("copyId").isMongoId().withMessage("Invalid copy ID"),
    body("status")
      .optional()
      .isIn(["available", "borrowed", "lost", "damaged"]),
    body("location").optional().isString().trim(),
    body("condition").optional().isIn(["new", "good", "fair", "poor"]),
  ],
  validate,
  updateCopy,
);

// DELETE /api/books/copies/:copyId — staff only
router.delete(
  "/copies/:copyId",
  authenticate,
  staffOnly,
  [param("copyId").isMongoId().withMessage("Invalid copy ID")],
  validate,
  deleteCopy,
);

// PATCH /api/books/copies/:copyId/borrow — called by Order Service
router.patch(
  "/copies/:copyId/borrow",
  authenticate,
  [param("copyId").isMongoId().withMessage("Invalid copy ID")],
  validate,
  markCopyAsBorrowed,
);

// PATCH /api/books/copies/:copyId/return — called by Order Service
router.patch(
  "/copies/:copyId/return",
  authenticate,
  [param("copyId").isMongoId().withMessage("Invalid copy ID")],
  validate,
  markCopyAsReturned,
);

module.exports = router;
