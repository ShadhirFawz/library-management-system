const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Mock external services before importing routes
jest.mock("../services/userService", () => ({
  getUserById: jest.fn().mockResolvedValue({
    _id: "user123",
    name: "Test User",
    membership: {
      borrowLimit: 5,
      activeBorrowCount: 0,
      finePerDay: 0.5,
      borrowDurationDays: 14,
    },
  }),
  updateBorrowCount: jest.fn().mockResolvedValue(true),
}));

jest.mock("../services/bookService", () => ({
  getBookById: jest.fn().mockResolvedValue({ _id: "book123", title: "Test Book" }),
  getBookCopyById: jest.fn().mockResolvedValue({
    _id: "copy123",
    bookId: "book123",
    isAvailable: true,
  }),
  markCopyAsBorrowed: jest.fn().mockResolvedValue(true),
  markCopyAsReturned: jest.fn().mockResolvedValue(true),
  getAvailableCopiesForBook: jest.fn().mockResolvedValue([
    { _id: "copy123", bookId: "book123", isAvailable: true },
  ]),
}));

const orderRoutes = require("../routes/orderRoutes");
const reservationRoutes = require("../routes/reservationRoutes");
const fineRoutes = require("../routes/fineRoutes");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Fine = require("../models/Fine");

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/fines", fineRoutes);

// Generate test tokens
const JWT_SECRET = process.env.JWT_SECRET || "test-secret";
const memberToken = jwt.sign({ userId: "user123", role: "member" }, JWT_SECRET);
const staffToken = jwt.sign({ userId: "staff123", role: "librarian" }, JWT_SECRET);

describe("Order API", () => {
  describe("POST /api/orders/borrow", () => {
    it("should create a new borrow order", async () => {
      const res = await request(app)
        .post("/api/orders/borrow")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ bookCopyId: "copy123", bookId: "book123" });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain("borrowed");
      expect(res.body.order).toBeDefined();
      expect(res.body.order.status).toBe("borrowed");
    });

    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/orders/borrow")
        .send({ bookCopyId: "copy123" });

      expect(res.status).toBe(401);
    });

    it("should validate required fields", async () => {
      const res = await request(app)
        .post("/api/orders/borrow")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/orders/my", () => {
    beforeEach(async () => {
      await Order.create({
        userId: "user123",
        bookCopyId: "copy123",
        bookId: "book123",
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "borrowed",
      });
    });

    it("should return user's orders", async () => {
      const res = await request(app)
        .get("/api/orders/my")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });

    it("should filter by status", async () => {
      const res = await request(app)
        .get("/api/orders/my?status=borrowed")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.orders.every((o) => o.status === "borrowed")).toBe(true);
    });
  });

  describe("POST /api/orders/:id/return", () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        userId: "user123",
        bookCopyId: "copy123",
        bookId: "book123",
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "borrowed",
      });
      orderId = order._id.toString();
    });

    it("should return a borrowed book", async () => {
      const res = await request(app)
        .post(`/api/orders/${orderId}/return`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.order.returnDate).toBeDefined();
    });

    it("should reject returning already returned book", async () => {
      await Order.findByIdAndUpdate(orderId, { status: "returned" });

      const res = await request(app)
        .post(`/api/orders/${orderId}/return`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(400);
    });
  });
});

describe("Reservation API", () => {
  describe("POST /api/reservations", () => {
    it("should create a new reservation", async () => {
      const res = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ bookId: "book123" });

      expect(res.status).toBe(201);
      expect(res.body.reservation).toBeDefined();
      expect(res.body.queuePosition).toBeDefined();
    });

    it("should prevent duplicate pending reservations", async () => {
      await Reservation.create({
        userId: "user123",
        bookId: "book123",
        status: "pending",
      });

      const res = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ bookId: "book123" });

      expect(res.status).toBe(409);
    });
  });

  describe("DELETE /api/reservations/:id", () => {
    let reservationId;

    beforeEach(async () => {
      const reservation = await Reservation.create({
        userId: "user123",
        bookId: "book123",
        status: "pending",
      });
      reservationId = reservation._id.toString();
    });

    it("should cancel a pending reservation", async () => {
      const res = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.reservation.status).toBe("cancelled");
    });

    it("should prevent cancelling fulfilled reservation", async () => {
      await Reservation.findByIdAndUpdate(reservationId, { status: "fulfilled" });

      const res = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/reservations/:id/approve (staff)", () => {
    let reservationId;

    beforeEach(async () => {
      const reservation = await Reservation.create({
        userId: "user123",
        bookId: "book123",
        status: "pending",
      });
      reservationId = reservation._id.toString();
    });

    it("should approve reservation and create order", async () => {
      const res = await request(app)
        .put(`/api/reservations/${reservationId}/approve`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.reservation.status).toBe("fulfilled");
      expect(res.body.order).toBeDefined();
    });

    it("should require staff access", async () => {
      const res = await request(app)
        .put(`/api/reservations/${reservationId}/approve`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({});

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/reservations/:id/reject (staff)", () => {
    let reservationId;

    beforeEach(async () => {
      const reservation = await Reservation.create({
        userId: "user123",
        bookId: "book123",
        status: "pending",
      });
      reservationId = reservation._id.toString();
    });

    it("should reject reservation", async () => {
      const res = await request(app)
        .put(`/api/reservations/${reservationId}/reject`)
        .set("Authorization", `Bearer ${staffToken}`)
        .send({ reason: "Book damaged" });

      expect(res.status).toBe(200);
      expect(res.body.reservation.status).toBe("cancelled");
    });
  });
});

describe("Fine API", () => {
  let fineId;
  let orderId;

  beforeEach(async () => {
    const order = await Order.create({
      userId: "user123",
      bookCopyId: "copy123",
      bookId: "book123",
      borrowDate: new Date(),
      dueDate: new Date(),
      status: "returned",
    });
    orderId = order._id;

    const fine = await Fine.create({
      orderId,
      userId: "user123",
      amount: 5.0,
      reason: "3 days overdue",
    });
    fineId = fine._id.toString();
  });

  describe("GET /api/fines/my", () => {
    it("should return user's fines with unpaid total", async () => {
      const res = await request(app)
        .get("/api/fines/my")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.fines).toBeInstanceOf(Array);
      expect(res.body.unpaidTotal).toBeDefined();
    });
  });

  describe("POST /api/fines/:id/pay", () => {
    it("should mark fine as paid", async () => {
      const res = await request(app)
        .post(`/api/fines/${fineId}/pay`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.fine.isPaid).toBe(true);
      expect(res.body.fine.paidAt).toBeDefined();
    });

    it("should reject paying already paid fine", async () => {
      await Fine.findByIdAndUpdate(fineId, { isPaid: true, paidAt: new Date() });

      const res = await request(app)
        .post(`/api/fines/${fineId}/pay`)
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/fines (staff)", () => {
    it("should return all fines for staff", async () => {
      const res = await request(app)
        .get("/api/fines")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.fines).toBeInstanceOf(Array);
    });

    it("should require staff access", async () => {
      const res = await request(app)
        .get("/api/fines")
        .set("Authorization", `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });
});
