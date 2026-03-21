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

/**
 * @swagger
 * /api/authors:
 *   post:
 *     summary: Create a new author (Staff only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               birthYear:
 *                 type: integer
 *               nationality:
 *                 type: string
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       401:
 *         description: Unauthorized - Auth required
 *       403:
 *         description: Forbidden - Staff access required
 */
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

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Get all authors (Public)
 *     tags: [Authors]
 *     parameters:
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
 *         description: List of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Author'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
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

/**
 * @swagger
 * /api/authors/{id}:
 *   get:
 *     summary: Get a specific author by ID (Public)
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       404:
 *         description: Author not found
 */
// GET /api/authors/:id
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid author ID")],
  validate,
  getAuthorById,
);

/**
 * @swagger
 * /api/authors/{id}:
 *   patch:
 *     summary: Update an author (Staff only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               birthYear:
 *                 type: integer
 *               nationality:
 *                 type: string
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Author not found
 */
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

/**
 * @swagger
 * /api/authors/{id}:
 *   delete:
 *     summary: Delete an author (Staff only)
 *     tags: [Authors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Author deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Author not found
 */
// DELETE /api/authors/:id — staff only
router.delete(
  "/:id",
  authenticate,
  staffOnly,
  [param("id").isMongoId().withMessage("Invalid author ID")],
  validate,
  deleteAuthor,
);

module.exports = router;
