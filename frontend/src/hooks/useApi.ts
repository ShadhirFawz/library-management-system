// ============================
// API Hook — All endpoints are placeholders
// Replace API_BASE_URL after export
// ============================

const API_BASE_URL = "";

export const useApi = () => {
  const callApi = async (service: string, endpoint: string, options: RequestInit = {}) => {
    // TODO: replace with real endpoint after export
    const url = `${API_BASE_URL}/api/${service}/${endpoint}`;
    console.log(`[API] Calling: ${url}`, options);
    // Simulated network delay
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  return {
    users: {
      getAll: () => callApi('user-management', 'users'),
      getById: (id: string) => callApi('user-management', `users/${id}`),
      create: (data: any) => callApi('user-management', 'users', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => callApi('user-management', `users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => callApi('user-management', `users/${id}`, { method: 'DELETE' }),
      suspend: (id: string) => callApi('user-management', `users/${id}/suspend`, { method: 'PATCH' }),
    },
    memberships: {
      getAll: () => callApi('user-management', 'memberships'),
      create: (data: any) => callApi('user-management', 'memberships', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => callApi('user-management', `memberships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => callApi('user-management', `memberships/${id}`, { method: 'DELETE' }),
    },
    userMemberships: {
      getByUser: (userId: string) => callApi('user-management', `user-memberships/user/${userId}`),
      assign: (data: any) => callApi('user-management', 'user-memberships', { method: 'POST', body: JSON.stringify(data) }),
    },
    books: {
      getAll: () => callApi('book-catalog', 'books'),
      getById: (id: string) => callApi('book-catalog', `books/${id}`),
      create: (data: any) => callApi('book-catalog', 'books', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => callApi('book-catalog', `books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => callApi('book-catalog', `books/${id}`, { method: 'DELETE' }),
    },
    authors: {
      getAll: () => callApi('book-catalog', 'authors'),
      create: (data: any) => callApi('book-catalog', 'authors', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => callApi('book-catalog', `authors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => callApi('book-catalog', `authors/${id}`, { method: 'DELETE' }),
    },
    categories: {
      getAll: () => callApi('book-catalog', 'categories'),
      create: (data: any) => callApi('book-catalog', 'categories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => callApi('book-catalog', `categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => callApi('book-catalog', `categories/${id}`, { method: 'DELETE' }),
    },
    inventory: {
      getAll: () => callApi('book-catalog', 'book-copies'),
      create: (data: any) => callApi('book-catalog', 'book-copies', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => callApi('book-catalog', `book-copies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    },
    orders: {
      getAll: () => callApi('order-service', 'borrow-orders'),
      create: (data: any) => callApi('order-service', 'borrow-orders', { method: 'POST', body: JSON.stringify(data) }),
      return: (id: string) => callApi('order-service', `borrow-orders/${id}/return`, { method: 'PATCH' }),
      markOverdue: (id: string) => callApi('order-service', `borrow-orders/${id}/overdue`, { method: 'PATCH' }),
    },
    reservations: {
      getAll: () => callApi('order-service', 'reservations'),
      create: (data: any) => callApi('order-service', 'reservations', { method: 'POST', body: JSON.stringify(data) }),
      cancel: (id: string) => callApi('order-service', `reservations/${id}/cancel`, { method: 'PATCH' }),
    },
    fines: {
      getAll: () => callApi('order-service', 'fines'),
      markPaid: (id: string) => callApi('order-service', `fines/${id}/pay`, { method: 'PATCH' }),
    },
    support: {
      getAll: () => callApi('customer-care', 'tickets'),
      create: (data: any) => callApi('customer-care', 'tickets', { method: 'POST', body: JSON.stringify(data) }),
      reply: (id: string, data: any) => callApi('customer-care', `tickets/${id}/reply`, { method: 'POST', body: JSON.stringify(data) }),
      updateStatus: (id: string, status: string) => callApi('customer-care', `tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    },
  };
};
