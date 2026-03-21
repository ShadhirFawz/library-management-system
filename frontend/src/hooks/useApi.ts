// ============================
// API Hook — Real backend integration
// ============================

const HELP_SERVICE_URL =
  import.meta.env.VITE_HELP_SERVICE_URL || "http://localhost:5004";
const ORDER_SERVICE_URL =
  import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:5003";
const BOOK_CATALOG_URL =
  import.meta.env.VITE_BOOK_CATALOG_URL || "http://localhost:5002";
const USER_SERVICE_URL =
  import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:5001";

export const useApi = () => {
  const getAuthHeaders = () => {
    const stored = localStorage.getItem("libramanage_auth");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to read auth token:", error);
      }
    }
    return headers;
  };

  const callApi = async (
    service: string,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> => {
    // Route to the correct service based on service name
    let baseUrl = USER_SERVICE_URL;
    if (service === "book-catalog") baseUrl = BOOK_CATALOG_URL;
    else if (service === "order-service") baseUrl = ORDER_SERVICE_URL;
    else if (service === "help-service") baseUrl = HELP_SERVICE_URL;

    const cleanEndpoint = endpoint.replace(/^\/+/, "");
    const url = `${baseUrl}/api/${cleanEndpoint}`;
    const headers = getAuthHeaders();
    const finalOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, finalOptions);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem("libramanage_auth");
        window.location.href = "/login";
        return null;
      }

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.message || errorBody?.error || errorMessage;
        } catch {
          // keep fallback for non-JSON error responses
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`[API Error] ${url}:`, error);
      throw error;
    }
  };

  return {
    auth: {
      login: (email: string, password: string) =>
        fetch(`${USER_SERVICE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }).then((res) => {
          if (!res.ok) throw new Error("Login failed");
          return res.json();
        }),
      register: (data: any) =>
        fetch(`${USER_SERVICE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then((res) => {
          if (!res.ok) throw new Error("Registration failed");
          return res.json();
        }),
    },
    users: {
      getProfile: () => callApi("user-service", "users/profile"),
      updateProfile: (data: Record<string, unknown>) =>
        callApi("user-service", "users/profile", {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      getAll: () => callApi("user-service", "users"),
      getById: (id: string) => callApi("user-service", `users/${id}`),
      create: (data: any) =>
        callApi("user-service", "users", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi("user-service", `users/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi("user-service", `users/${id}`, { method: "DELETE" }),
      suspend: (id: string) =>
        callApi("user-service", `users/${id}/suspend`, { method: "PATCH" }),
    },
    memberships: {
      getAll: () => callApi("user-service", "memberships"),
      create: (data: any) =>
        callApi("user-service", "memberships", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi("user-service", `memberships/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi("user-service", `memberships/${id}`, { method: "DELETE" }),
    },
    userMemberships: {
      getByUser: (userId: string) =>
        callApi("user-service", `user-memberships/user/${userId}`),
      assign: (data: any) =>
        callApi("user-service", "user-memberships", {
          method: "POST",
          body: JSON.stringify(data),
        }),
    },
    manageUsers: {
      getAll: () => callApi("manage-users", ""),
      getById: (id: string) => callApi("manage-users", id),
      create: (data: any) =>
        callApi("manage-users", "", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi("manage-users", id, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      delete: (id: string) => callApi("manage-users", id, { method: "DELETE" }),
      promote: (id: string) =>
        callApi("manage-users", `${id}/promote`, { method: "PUT" }),
    },
    books: {
      getAll: () => callApi("book-catalog", "books"),
      getById: (id: string) => callApi("book-catalog", `books/${id}`),
      create: (data: any) =>
        callApi("book-catalog", "books", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi("book-catalog", `books/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi("book-catalog", `books/${id}`, { method: "DELETE" }),
    },
    authors: {
      getAll: () => callApi("book-catalog", "authors"),
      create: (data: any) =>
        callApi("book-catalog", "authors", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi("book-catalog", `authors/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi("book-catalog", `authors/${id}`, { method: "DELETE" }),
    },
    categories: {
      getAll: () => callApi("book-catalog", "categories"),
      create: (data: any) =>
        callApi("book-catalog", "categories", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi("book-catalog", `categories/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi("book-catalog", `categories/${id}`, { method: "DELETE" }),
    },
    inventory: {
      getAll: () => callApi("book-catalog", "books/copies"),
      create: (data: any) =>
        callApi("book-catalog", `books/${data.bookId}/copies`, {
          method: "POST",
          body: JSON.stringify({
            barcode: data.barcode,
            location: data.location,
            condition: data.condition,
          }),
        }),
      update: (id: string, data: any) =>
        callApi("book-catalog", `books/copies/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi("book-catalog", `books/copies/${id}`, {
          method: "DELETE",
        }),
    },
    orders: {
      getAll: () => callApi("order-service", "orders"),
      getMy: () => callApi("order-service", "orders/my"),
      getById: (id: string) => callApi("order-service", `orders/${id}`),
      borrow: (data: { bookCopyId: string; bookId?: string }) =>
        callApi("order-service", "orders/borrow", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      return: (id: string) =>
        callApi("order-service", `orders/${id}/return`, {
          method: "POST",
        }),
    },
    reservations: {
      getAll: () => callApi("order-service", "reservations"),
      getMy: () => callApi("order-service", "reservations/my"),
      getPending: () => callApi("order-service", "reservations?status=pending"),
      getForBook: (bookId: string) =>
        callApi("order-service", `reservations/book/${bookId}`),
      create: (data: { bookId: string }) =>
        callApi("order-service", "reservations", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      cancel: (id: string) =>
        callApi("order-service", `reservations/${id}`, {
          method: "DELETE",
        }),
      approve: (id: string, bookCopyId?: string) =>
        callApi("order-service", `reservations/${id}/approve`, {
          method: "PUT",
          body: JSON.stringify({ bookCopyId }),
        }),
      reject: (id: string, reason?: string) =>
        callApi("order-service", `reservations/${id}/reject`, {
          method: "PUT",
          body: JSON.stringify({ reason }),
        }),
    },
    fines: {
      getAll: () => callApi("order-service", "fines"),
      getMy: () => callApi("order-service", "fines/my"),
      getById: (id: string) => callApi("order-service", `fines/${id}`),
      getByOrder: (orderId: string) =>
        callApi("order-service", `fines/order/${orderId}`),
      pay: (id: string) =>
        callApi("order-service", `fines/${id}/pay`, { method: "POST" }),
    },
    support: {
      getAll: () => callApi("help-service", "tickets"),
      create: (data: any) =>
        callApi("help-service", "tickets", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      reply: (id: string, data: any) =>
        callApi("help-service", `tickets/${id}/reply`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      updateStatus: (id: string, status: string) =>
        callApi("help-service", `tickets/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }),
    },
    tickets: {
      getAll: () => callApi("help-service", "tickets"),
      create: (data: any) =>
        callApi("help-service", "tickets", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      respond: (id: string, response: string, status?: string) =>
        callApi("help-service", `tickets/${id}/respond`, {
          method: "PUT",
          body: JSON.stringify({ response, status }),
        }),
    },
    articles: {
      getAll: () => callApi("help-service", "faq"),
      create: (data: any) =>
        callApi("help-service", "faq", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi("help-service", `faq/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi("help-service", `faq/${id}`, { method: "DELETE" }),
    },
  };
};
