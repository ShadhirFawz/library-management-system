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

// POST /api/orders/borrow
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

// POST /api/orders/:id/return
router.post(
  "/:id/return",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid order ID")],
  validate,
  returnBook,
);

// GET /api/orders/my
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

// GET /api/orders/user/:userId — used by Customer Care and admin
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

// GET /api/orders — staff only
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

// GET /api/orders/:id
router.get(
  "/:id",
  authenticate,
  [param("id").isMongoId().withMessage("Invalid order ID")],
  validate,
  getOrderById,
);

module.exports = router;
