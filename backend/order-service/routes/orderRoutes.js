const express = require("express");
const { body, param, query } = require("express-validator");

const { authenticate, staffOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  borrowBook,
  returnBook,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderHistoryByUser,
} = require("../controllers/orderController");

const router = express.Router();

/**
 * @swagger
 * /api/orders/borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookCopyId
 *             properties:
 *               bookCopyId:
 *                 type: string
 *                 description: ID of the book copy to borrow
 *               bookId:
 *                 type: string
 *                 description: ID of the book (optional, derived from copy if not provided)
 *     responses:
 *       201:
 *         description: Book borrowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Borrow limit reached or copy not available
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/borrow",
  authenticate,
  [
    body("bookCopyId")
      .notEmpty()
      .withMessage("bookCopyId is required")
      .isString()
      .withMessage("bookCopyId must be a string"),
    body("bookId").optional().isString().withMessage("bookId must be a string"),
  ],
  validate,
  borrowBook,
);

/**
 * @swagger
 * /api/orders/{id}/return:
 *   post:
 *     summary: Return a borrowed book
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Book returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 fine:
 *                   $ref: '#/components/schemas/Fine'
 *       400:
 *         description: Book already returned
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.post(
  "/:id/return",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid order ID")],
  validate,
  returnBook,
);

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [borrowed, returned, overdue]
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
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
  "/my",
  authenticate,
  [
    query("status").optional().isIn(["borrowed", "returned", "overdue"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getMyOrders,
);

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Get order history for a specific user (staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [borrowed, returned, overdue]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: User's order history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 overdueCount:
 *                   type: integer
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: Staff access required
 */
router.get(
  "/user/:userId",
  authenticate,
  staffOnly,
  [
    param("userId").notEmpty().withMessage("userId is required"),
    query("status").optional().isIn(["borrowed", "returned", "overdue"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getOrderHistoryByUser,
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (staff only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [borrowed, returned, overdue]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: Staff access required
 */
router.get(
  "/",
  authenticate,
  staffOnly,
  [
    query("userId").optional().isString(),
    query("status").optional().isIn(["borrowed", "returned", "overdue"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAllOrders,
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a specific order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.get(
  "/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid order ID")],
  validate,
  getOrderById,
);

module.exports = router;
