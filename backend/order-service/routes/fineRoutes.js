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

// GET /api/fines/my
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

// GET /api/fines/order/:orderId
router.get(
  "/order/:orderId",
  authenticate,
  [param("orderId").isMongoId().withMessage("Invalid order ID")],
  validate,
  getFineByOrderId,
);

// POST /api/fines/:id/pay
router.post(
  "/:id/pay",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid fine ID")],
  validate,
  payFine,
);

// GET /api/fines — staff only
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

// GET /api/fines/:id
router.get(
  "/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid fine ID")],
  validate,
  getFineById,
);

module.exports = router;
