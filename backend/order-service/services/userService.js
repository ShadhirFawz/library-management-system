const axios = require("axios");

const BASE_URL = () => process.env.USER_SERVICE_URL || "http://localhost:5001";

const getTokenUserId = (authToken) => {
  try {
    const payload = authToken?.split(".")?.[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = JSON.parse(
      Buffer.from(padded, "base64").toString("utf8"),
    );
    return decoded?.userId || decoded?.id || null;
  } catch {
    return null;
  }
};

// gets the user's profile and membership plan from the User Service
// we need borrowLimit, activeBorrowCount, finePerDay, and borrowDurationDays
const getUserById = async (userId, authToken) => {
  try {
    const requesterUserId = getTokenUserId(authToken);
    const endpoint =
      requesterUserId && String(requesterUserId) === String(userId)
        ? `${BASE_URL()}/api/users/profile`
        : `${BASE_URL()}/api/manage-users/${userId}`;

    const { data } = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: 5000,
    });
    return data;
  } catch (err) {
    const status = err.response?.status;
    const message =
      err.response?.data?.error || err.response?.data?.message || err.message;

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
