const axios = require("axios");

const BASE_URL = () => process.env.BOOK_SERVICE_URL || "http://localhost:5002";

// fetches a specific physical copy — we mainly care about isAvailable and bookId
const getBookCopyById = async (bookCopyId, authToken) => {
  try {
    const { data } = await axios.get(
      `${BASE_URL()}/api/books/copies/${bookCopyId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 5000,
      },
    );
    return data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.error || err.message;

    if (status === 404) {
      throw Object.assign(new Error("Book copy not found"), {
        statusCode: 404,
      });
    }
    throw Object.assign(new Error(`Book Service unavailable: ${message}`), {
      statusCode: 503,
    });
  }
};

// used when creating a reservation to confirm the book actually exists
const getBookById = async (bookId, authToken) => {
  try {
    const { data } = await axios.get(`${BASE_URL()}/api/books/${bookId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: 5000,
    });
    return data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.error || err.message;

    if (status === 404) {
      throw Object.assign(new Error("Book not found"), { statusCode: 404 });
    }
    throw Object.assign(new Error(`Book Service unavailable: ${message}`), {
      statusCode: 503,
    });
  }
};

// locks the copy so no one else can borrow it — this is critical, we abort if it fails
const markCopyAsBorrowed = async (bookCopyId, authToken) => {
  try {
    await axios.patch(
      `${BASE_URL()}/api/books/copies/${bookCopyId}/borrow`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 5000,
      },
    );
  } catch (err) {
    console.error(
      `[order-service] Failed to mark copy ${bookCopyId} as borrowed:`,
      err.response?.data || err.message,
    );
    throw Object.assign(
      new Error("Failed to update book availability in Book Service"),
      { statusCode: 503 },
    );
  }
};

// marks the copy as available again — best-effort, we log and continue if it fails
const markCopyAsReturned = async (bookCopyId, authToken) => {
  try {
    await axios.patch(
      `${BASE_URL()}/api/books/copies/${bookCopyId}/return`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 5000,
      },
    );
  } catch (err) {
    console.error(
      `[order-service] Failed to mark copy ${bookCopyId} as returned:`,
      err.response?.data || err.message,
    );
  }
};

// fetches available copies for a book — used when approving reservations
const getAvailableCopiesForBook = async (bookId, authToken) => {
  try {
    const { data } = await axios.get(
      `${BASE_URL()}/api/books/${bookId}/copies`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { status: "available" },
        timeout: 5000,
      },
    );
    // data may be { copies: [...] } or an array directly
    return Array.isArray(data) ? data : data.copies || [];
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.error || err.message;

    if (status === 404) {
      throw Object.assign(new Error("Book not found"), { statusCode: 404 });
    }
    throw Object.assign(new Error(`Book Service unavailable: ${message}`), {
      statusCode: 503,
    });
  }
};

module.exports = {
  getBookCopyById,
  getBookById,
  markCopyAsBorrowed,
  markCopyAsReturned,
  getAvailableCopiesForBook,
};
