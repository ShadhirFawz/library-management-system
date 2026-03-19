const express = require("express");
const { body, param, query } = require("express-validator");

const { authenticate, staffOnly, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createAuthor,
  getAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
} = require("../controllers/authorController");

const router = express.Router();

// POST /api/authors
router.post(
  "/",
  authenticate,
  staffOnly,
  [
    body("name").notEmpty().withMessage("name is required").isString().trim(),
    body("bio").optional().isString().trim(),
    body("birthYear")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Invalid birth year"),
    body("nationality").optional().isString().trim(),
  ],
  validate,
  createAuthor,
);

// GET /api/authors
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAuthors,
);

// GET /api/authors/:id
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid author ID")],
  validate,
  getAuthorById,
);

// PATCH /api/authors/:id
router.patch(
  "/:id",
  authenticate,
  staffOnly,
  [
    param("id").isMongoId().withMessage("Invalid author ID"),
    body("name").optional().isString().trim(),
    body("bio").optional().isString().trim(),
    body("birthYear").optional().isInt({ min: 1 }),
    body("nationality").optional().isString().trim(),
  ],
  validate,
  updateAuthor,
);

// DELETE /api/authors/:id — admin only
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  [param("id").isMongoId().withMessage("Invalid author ID")],
  validate,
  deleteAuthor,
);

module.exports = router;
