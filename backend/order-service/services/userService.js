const axios = require("axios");

const BASE_URL = () => process.env.USER_SERVICE_URL || "http://localhost:5001";

// gets the user's profile and membership plan from the User Service
// we need borrowLimit, activeBorrowCount, finePerDay, and borrowDurationDays
const getUserById = async (userId, authToken) => {
  try {
    const { data } = await axios.get(`${BASE_URL()}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: 5000,
    });
    return data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.error || err.message;

    if (status === 404) {
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    if (status === 403) {
      throw Object.assign(new Error("Access denied by User Service"), {
        statusCode: 403,
      });
    }
    throw Object.assign(new Error(`User Service unavailable: ${message}`), {
      statusCode: 503,
    });
  }
};

// tells the User Service to bump the active borrow count up (+1) or down (-1)
// this is best-effort — if it fails we log it and move on, the order still goes through
const updateBorrowCount = async (userId, delta, authToken) => {
  try {
    await axios.patch(
      `${BASE_URL()}/api/users/${userId}/borrow-count`,
      { increment: delta },
      {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 5000,
      },
    );
  } catch (err) {
    console.error(
      `[order-service] Failed to update borrow count for user ${userId}:`,
      err.response?.data || err.message,
    );
  }
};

module.exports = { getUserById, updateBorrowCount };
