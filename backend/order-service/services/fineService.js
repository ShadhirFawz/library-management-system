// pure calculation logic — no DB, no HTTP calls
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// returns 0 if the book was returned on time, otherwise the number of days late
const calculateOverdueDays = (dueDate, returnDate) => {
  const diff = returnDate.getTime() - dueDate.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / MS_PER_DAY);
};

// rate comes from the membership plan; falls back to the env default ($0.50/day)
const calculateFineAmount = (overdueDays, finePerDay) => {
  if (overdueDays <= 0) return 0;
  const rate =
    finePerDay ?? parseFloat(process.env.DEFAULT_FINE_PER_DAY) ?? 0.5;
  return Math.round(overdueDays * rate * 100) / 100;
};

// builds the reason string saved on the Fine document
const buildFineReason = (overdueDays, dueDate, returnDate) => {
  const due = dueDate.toISOString().split("T")[0];
  const returned = returnDate.toISOString().split("T")[0];
  return `Book returned ${overdueDays} day(s) late. Due: ${due}, Returned: ${returned}.`;
};

// calculates when the book must be back — duration comes from the membership plan, falls back to env default (14 days)
const calculateDueDate = (borrowDate, borrowDurationDays) => {
  const days =
    borrowDurationDays ?? parseInt(process.env.DEFAULT_BORROW_DAYS, 10) ?? 14;
  return new Date(borrowDate.getTime() + days * MS_PER_DAY);
};

module.exports = {
  calculateOverdueDays,
  calculateFineAmount,
  buildFineReason,
  calculateDueDate,
};
