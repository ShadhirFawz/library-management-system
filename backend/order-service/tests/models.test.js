const mongoose = require("mongoose");
const Order = require("../models/Order");
const Reservation = require("../models/Reservation");
const Fine = require("../models/Fine");

describe("Order Model", () => {
  it("should create an order with valid data", async () => {
    const orderData = {
      userId: "user123",
      bookCopyId: "copy123",
      bookId: "book123",
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "borrowed",
    };

    const order = await Order.create(orderData);

    expect(order._id).toBeDefined();
    expect(order.userId).toBe(orderData.userId);
    expect(order.bookCopyId).toBe(orderData.bookCopyId);
    expect(order.status).toBe("borrowed");
    expect(order.fineAmount).toBe(0);
  });

  it("should fail without required fields", async () => {
    const orderData = { userId: "user123" };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it("should only allow valid status values", async () => {
    const orderData = {
      userId: "user123",
      bookCopyId: "copy123",
      bookId: "book123",
      borrowDate: new Date(),
      dueDate: new Date(),
      status: "invalid_status",
    };

    await expect(Order.create(orderData)).rejects.toThrow();
  });

  it("should compute isOverdue virtual correctly", async () => {
    const pastDueDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const order = await Order.create({
      userId: "user123",
      bookCopyId: "copy123",
      bookId: "book123",
      borrowDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: pastDueDate,
      status: "borrowed",
    });

    expect(order.isOverdue).toBe(true);
  });
});

describe("Reservation Model", () => {
  it("should create a reservation with valid data", async () => {
    const reservationData = {
      userId: "user123",
      bookId: "book123",
    };

    const reservation = await Reservation.create(reservationData);

    expect(reservation._id).toBeDefined();
    expect(reservation.userId).toBe(reservationData.userId);
    expect(reservation.bookId).toBe(reservationData.bookId);
    expect(reservation.status).toBe("pending");
    expect(reservation.reservationDate).toBeDefined();
  });

  it("should fail without required fields", async () => {
    const reservationData = { userId: "user123" };

    await expect(Reservation.create(reservationData)).rejects.toThrow();
  });

  it("should enforce unique partial index on pending reservations", async () => {
    const reservationData = {
      userId: "user123",
      bookId: "book123",
      status: "pending",
    };

    await Reservation.create(reservationData);

    // Same user, same book, same pending status should fail
    await expect(Reservation.create(reservationData)).rejects.toThrow();
  });

  it("should allow multiple reservations if status is different", async () => {
    const userId = "user456";
    const bookId = "book456";

    await Reservation.create({ userId, bookId, status: "cancelled" });
    const pending = await Reservation.create({ userId, bookId, status: "pending" });

    expect(pending._id).toBeDefined();
    expect(pending.status).toBe("pending");
  });
});

describe("Fine Model", () => {
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
  });

  it("should create a fine with valid data", async () => {
    const fineData = {
      orderId,
      userId: "user123",
      amount: 5.0,
      reason: "3 days overdue",
    };

    const fine = await Fine.create(fineData);

    expect(fine._id).toBeDefined();
    expect(fine.amount).toBe(5.0);
    expect(fine.isPaid).toBe(false);
    expect(fine.paidAt).toBeNull();
  });

  it("should fail without required fields", async () => {
    const fineData = { userId: "user123" };

    await expect(Fine.create(fineData)).rejects.toThrow();
  });

  it("should not allow negative amounts", async () => {
    const fineData = {
      orderId,
      userId: "user123",
      amount: -5.0,
      reason: "test",
    };

    await expect(Fine.create(fineData)).rejects.toThrow();
  });
});
