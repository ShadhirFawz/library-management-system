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

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book (Staff only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, isbn, authors]
 *             properties:
 *               title:
 *                 type: string
 *               isbn:
 *                 type: string
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of author IDs
 *               description:
 *                 type: string
 *               publisher:
 *                 type: string
 *               publicationYear:
 *                 type: integer
 *               language:
 *                 type: string
 *               pages:
 *                 type: integer
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 isbn:
 *                   type: string
 *       401:
 *         description: Unauthorized - Auth required
 *       403:
 *         description: Forbidden - Staff access required
 */
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

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Search and browse books (Public)
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (title, description, etc)
 *       - in: query
 *         name: isbn
 *         schema:
 *           type: string
 *         description: Filter by ISBN
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by language
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
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

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a specific book by ID (Public)
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
// GET /api/books/:id  (public)
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid book ID")],
  validate,
  getBookById,
);

/**
 * @swagger
 * /api/books/{id}:
 *   patch:
 *     summary: Update a book (Staff only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               publisher:
 *                 type: string
 *               publicationYear:
 *                 type: integer
 *               language:
 *                 type: string
 *               pages:
 *                 type: integer
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Book not found
 */
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

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book (Staff only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Book not found
 */
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
