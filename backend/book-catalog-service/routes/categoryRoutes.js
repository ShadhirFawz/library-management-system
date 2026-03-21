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

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Staff only)
 *     tags: [Categories]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized - Auth required
 *       403:
 *         description: Forbidden - Staff access required
 */
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

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories (Public)
 *     tags: [Categories]
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
 *           maximum: 200
 *           default: 10
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
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

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a specific category by ID (Public)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Category not found
 */
// GET /api/categories/:id
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid category ID")],
  validate,
  getCategoryById,
);

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update a category (Staff only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Category not found
 */
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

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (Staff only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 *       404:
 *         description: Category not found
 */
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
