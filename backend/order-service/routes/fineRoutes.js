const express = require("express");
const { param, query } = require("express-validator");

const { authenticate, staffOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  getMyFines,
  getAllFines,
  getFineByOrderId,
  getFineById,
  payFine,
} = require("../controllers/fineController");

const router = express.Router();

/**
 * @swagger
 * /api/fines/my:
 *   get:
 *     summary: Get current user's fines
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isPaid
 *         schema:
 *           type: boolean
 *         description: Filter by payment status
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
 *         description: List of user's fines
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fines:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fine'
 *                 unpaidTotal:
 *                   type: number
 *                   description: Total amount of unpaid fines
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
  "/my",
  authenticate,
  [
    query("isPaid")
      .optional()
      .isBoolean()
      .withMessage("isPaid must be true or false"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getMyFines,
);

/**
 * @swagger
 * /api/fines/order/{orderId}:
 *   get:
 *     summary: Get fine by order ID
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Fine details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fine:
 *                   $ref: '#/components/schemas/Fine'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Fine not found
 */
router.get(
  "/order/:orderId",
  authenticate,
  [param("orderId").isMongoId().withMessage("Invalid order ID")],
  validate,
  getFineByOrderId,
);

/**
 * @swagger
 * /api/fines/{id}/pay:
 *   post:
 *     summary: Mark a fine as paid
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fine ID
 *     responses:
 *       200:
 *         description: Fine marked as paid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fine:
 *                   $ref: '#/components/schemas/Fine'
 *       400:
 *         description: Fine already paid
 *       403:
 *         description: Access denied
 *       404:
 *         description: Fine not found
 */
router.post(
  "/:id/pay",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid fine ID")],
  validate,
  payFine,
);

/**
 * @swagger
 * /api/fines:
 *   get:
 *     summary: Get all fines (staff only)
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isPaid
 *         schema:
 *           type: boolean
 *         description: Filter by payment status
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
 *         description: List of all fines
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fines:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fine'
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
    query("isPaid")
      .optional()
      .isBoolean()
      .withMessage("isPaid must be true or false"),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAllFines,
);

/**
 * @swagger
 * /api/fines/{id}:
 *   get:
 *     summary: Get a specific fine
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Fine ID
 *     responses:
 *       200:
 *         description: Fine details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fine:
 *                   $ref: '#/components/schemas/Fine'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Fine not found
 */
router.get(
  "/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid fine ID")],
  validate,
  getFineById,
);

module.exports = router;
