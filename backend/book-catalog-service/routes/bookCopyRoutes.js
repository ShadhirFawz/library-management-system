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

/**
 * @swagger
 * /api/books/copies:
 *   get:
 *     summary: Get all book copies (Staff inventory) (Staff only)
 *     tags: [Book Copies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, borrowed, lost, damaged]
 *         description: Filter by copy status
 *     responses:
 *       200:
 *         description: List of all book copies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 copies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BookCopy'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 */
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

/**
 * @swagger
 * /api/books/{bookId}/copies:
 *   post:
 *     summary: Add a new physical copy to a book (Staff only)
 *     tags: [Book Copies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [barcode]
 *             properties:
 *               barcode:
 *                 type: string
 *               location:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [new, good, fair, poor]
 *     responses:
 *       201:
 *         description: Book copy added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookCopy'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 */
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

/**
 * @swagger
 * /api/books/{bookId}/copies:
 *   get:
 *     summary: Get all copies for a specific book
 *     tags: [Book Copies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, borrowed, lost, damaged]
 *         description: Filter by copy status
 *     responses:
 *       200:
 *         description: List of book copies for the book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 copies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BookCopy'
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/books/copies/{copyId}:
 *   get:
 *     summary: Get a specific book copy by ID
 *     tags: [Book Copies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: copyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book Copy ID
 *     responses:
 *       200:
 *         description: Book copy details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookCopy'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Copy not found
 */
// GET /api/books/copies/:copyId — fetch a single copy (used by Order Service)
router.get(
  "/copies/:copyId",
  authenticate,
  [param("copyId").isMongoId().withMessage("Invalid copy ID")],
  validate,
  getCopyById,
);

/**
 * @swagger
 * /api/books/copies/{copyId}:
 *   patch:
 *     summary: Update a book copy status/location/condition (Staff only)
 *     tags: [Book Copies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: copyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book Copy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, borrowed, lost, damaged]
 *               location:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [new, good, fair, poor]
 *     responses:
 *       200:
 *         description: Book copy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookCopy'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Copy not found
 */
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

/**
 * @swagger
 * /api/books/copies/{copyId}:
 *   delete:
 *     summary: Delete a book copy (Staff only)
 *     tags: [Book Copies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: copyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book Copy ID
 *     responses:
 *       200:
 *         description: Book copy deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Copy not found
 */
// DELETE /api/books/copies/:copyId — staff only
router.delete(
  "/copies/:copyId",
  authenticate,
  staffOnly,
  [param("copyId").isMongoId().withMessage("Invalid copy ID")],
  validate,
  deleteCopy,
);

/**
 * @swagger
 * /api/books/copies/{copyId}/borrow:
 *   patch:
 *     summary: Mark a book copy as borrowed
 *     tags: [Book Copies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: copyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book Copy ID
 *     responses:
 *       200:
 *         description: Book copy marked as borrowed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookCopy'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Copy not found
 */
// PATCH /api/books/copies/:copyId/borrow — called by Order Service
router.patch(
  "/copies/:copyId/borrow",
  authenticate,
  [param("copyId").isMongoId().withMessage("Invalid copy ID")],
  validate,
  markCopyAsBorrowed,
);

/**
 * @swagger
 * /api/books/copies/{copyId}/return:
 *   patch:
 *     summary: Mark a book copy as returned
 *     tags: [Book Copies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: copyId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book Copy ID
 *     responses:
 *       200:
 *         description: Book copy marked as returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookCopy'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Copy not found
 */
// PATCH /api/books/copies/:copyId/return — called by Order Service
router.patch(
  "/copies/:copyId/return",
  authenticate,
  [param("copyId").isMongoId().withMessage("Invalid copy ID")],
  validate,
  markCopyAsReturned,
);

module.exports = router;
