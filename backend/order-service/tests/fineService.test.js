const {
  calculateOverdueDays,
  calculateFineAmount,
  buildFineReason,
  calculateDueDate,
} = require("../services/fineService");

describe("fineService", () => {
  describe("calculateOverdueDays", () => {
    it("should return 0 when book is returned on time", () => {
      const dueDate = new Date("2024-01-15");
      const returnDate = new Date("2024-01-15");
      expect(calculateOverdueDays(dueDate, returnDate)).toBe(0);
    });

    it("should return 0 when book is returned early", () => {
      const dueDate = new Date("2024-01-15");
      const returnDate = new Date("2024-01-10");
      expect(calculateOverdueDays(dueDate, returnDate)).toBe(0);
    });

    it("should return correct days when book is returned late", () => {
      const dueDate = new Date("2024-01-15");
      const returnDate = new Date("2024-01-18");
      expect(calculateOverdueDays(dueDate, returnDate)).toBe(3);
    });

    it("should ceil partial days to full days", () => {
      const dueDate = new Date("2024-01-15T00:00:00");
      const returnDate = new Date("2024-01-16T12:00:00"); // 1.5 days late
      expect(calculateOverdueDays(dueDate, returnDate)).toBe(2);
    });
  });

  describe("calculateFineAmount", () => {
    it("should return 0 when no overdue days", () => {
      expect(calculateFineAmount(0, 0.5)).toBe(0);
    });

    it("should calculate fine correctly", () => {
      expect(calculateFineAmount(3, 0.5)).toBe(1.5);
    });

    it("should round to 2 decimal places", () => {
      expect(calculateFineAmount(3, 0.33)).toBe(0.99);
    });

    it("should handle large fines", () => {
      expect(calculateFineAmount(30, 1.0)).toBe(30.0);
    });
  });

  describe("buildFineReason", () => {
    it("should build a descriptive reason string", () => {
      const dueDate = new Date("2024-01-15");
      const returnDate = new Date("2024-01-18");
      const reason = buildFineReason(3, dueDate, returnDate);

      expect(reason).toContain("3");
      expect(reason.toLowerCase()).toContain("late");
    });
  });

  describe("calculateDueDate", () => {
    it("should add default days to borrow date", () => {
      const borrowDate = new Date("2024-01-01");
      const dueDate = calculateDueDate(borrowDate, 14);

      expect(dueDate.getDate()).toBe(15);
      expect(dueDate.getMonth()).toBe(0); // January
    });

    it("should handle month rollover", () => {
      const borrowDate = new Date("2024-01-25");
      const dueDate = calculateDueDate(borrowDate, 14);

      expect(dueDate.getDate()).toBe(8);
      expect(dueDate.getMonth()).toBe(1); // February
    });
  });
});
