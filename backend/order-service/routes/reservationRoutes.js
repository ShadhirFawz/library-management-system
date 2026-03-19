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
} = require("../controllers/reservationController");

const router = express.Router();

// POST /api/reservations
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

// DELETE /api/reservations/:id
router.delete(
  "/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid reservation ID")],
  validate,
  cancelReservation,
);

// GET /api/reservations/my
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

// GET /api/reservations/book/:bookId — staff only, shows the waiting queue
router.get(
  "/book/:bookId",
  authenticate,
  staffOnly,
  [param("bookId").notEmpty().withMessage("bookId is required")],
  validate,
  getReservationsForBook,
);

// GET /api/reservations — staff only
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

module.exports = router;
