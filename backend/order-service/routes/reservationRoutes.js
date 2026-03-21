const express = require("express");
const { body, param, query } = require("express-validator");

const { authenticate, staffOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createReservation,
  cancelReservation,
  getMyReservations,
  getAllReservations,
  getReservationsForBook,
  approveReservation,
  rejectReservation,
} = require("../controllers/reservationController");

const router = express.Router();

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Create a new reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *             properties:
 *               bookId:
 *                 type: string
 *                 description: ID of the book to reserve
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reservation:
 *                   $ref: '#/components/schemas/Reservation'
 *                 queuePosition:
 *                   type: integer
 *                   description: Position in the waiting queue
 *       409:
 *         description: Duplicate reservation
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  [
    body("bookId")
      .notEmpty()
      .withMessage("bookId is required")
      .isString()
      .withMessage("bookId must be a string"),
  ],
  validate,
  createReservation,
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reservation:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Cannot cancel reservation with this status
 *       403:
 *         description: Access denied
 *       404:
 *         description: Reservation not found
 */
router.delete(
  "/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid reservation ID")],
  validate,
  cancelReservation,
);

/**
 * @swagger
 * /api/reservations/my:
 *   get:
 *     summary: Get current user's reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, notified, fulfilled, cancelled, expired]
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
 *         description: List of reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get(
  "/my",
  authenticate,
  [
    query("status")
      .optional()
      .isIn(["pending", "notified", "fulfilled", "cancelled", "expired"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getMyReservations,
);

/**
 * @swagger
 * /api/reservations/book/{bookId}:
 *   get:
 *     summary: Get waiting queue for a book (staff only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Reservation queue for book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookId:
 *                   type: string
 *                 queueLength:
 *                   type: integer
 *                 reservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       403:
 *         description: Staff access required
 */
router.get(
  "/book/:bookId",
  authenticate,
  staffOnly,
  [param("bookId").notEmpty().withMessage("bookId is required")],
  validate,
  getReservationsForBook,
);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Get all reservations (staff only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, notified, fulfilled, cancelled, expired]
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
 *         description: List of all reservations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
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
    query("bookId").optional().isString(),
    query("status")
      .optional()
      .isIn(["pending", "notified", "fulfilled", "cancelled", "expired"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  getAllReservations,
);

/**
 * @swagger
 * /api/reservations/{id}/approve:
 *   put:
 *     summary: Approve a reservation and issue the book (staff only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookCopyId:
 *                 type: string
 *                 description: Specific copy to issue (optional, auto-selected if not provided)
 *     responses:
 *       200:
 *         description: Reservation approved and book issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reservation:
 *                   $ref: '#/components/schemas/Reservation'
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot approve (no copies, borrow limit reached, invalid status)
 *       403:
 *         description: Staff access required
 *       404:
 *         description: Reservation not found
 */
router.put(
  "/:id/approve",
  authenticate,
  staffOnly,
  [
    param("id").isMongoId().withMessage("Invalid reservation ID"),
    body("bookCopyId")
      .optional()
      .isMongoId()
      .withMessage("Invalid book copy ID"),
  ],
  validate,
  approveReservation,
);

/**
 * @swagger
 * /api/reservations/{id}/reject:
 *   put:
 *     summary: Reject a reservation (staff only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reservation ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Reservation rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reservation:
 *                   $ref: '#/components/schemas/Reservation'
 *                 reason:
 *                   type: string
 *       400:
 *         description: Cannot reject reservation with this status
 *       403:
 *         description: Staff access required
 *       404:
 *         description: Reservation not found
 */
router.put(
  "/:id/reject",
  authenticate,
  staffOnly,
  [
    param("id").isMongoId().withMessage("Invalid reservation ID"),
    body("reason").optional().isString().trim(),
  ],
  validate,
  rejectReservation,
);

module.exports = router;
