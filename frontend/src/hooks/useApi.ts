// ============================
// API Hook — Connect to backend services
// ============================

const HELP_SERVICE_URL = import.meta.env.VITE_HELP_SERVICE_URL || 'http://localhost:8000';
const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8001';
const BOOK_CATALOG_URL = import.meta.env.VITE_BOOK_CATALOG_URL || 'http://localhost:8002';
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:5001';

export const useApi = () => {
  const getToken = () => localStorage.getItem('token') || '';

  const callApi = async (baseUrl: string, endpoint: string, options: RequestInit = {}) => {
    const url = `${baseUrl}/api/${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    };
<<<<<<< Updated upstream
=======
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to read auth token:', error);
      }
    }
    return headers;
  };

  const callApi = async (
    service: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    let url: string;
    if (/^https?:\/\//.test(service)) {
      const base = service.replace(/\/+$/, '');
      url = `${base}/api/${cleanEndpoint}`;
    } else {
      url = `${USER_SERVICE_URL}/api/${service}/${cleanEndpoint}`;
    }
    const headers = getAuthHeaders();
    const finalOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    };

>>>>>>> Stashed changes
    try {
      const resp = await fetch(url, { ...options, headers });
      if (!resp.ok) throw new Error(`API Error: ${resp.status}`);
      return await resp.json();
    } catch (err) {
      console.error(`[API] Error calling ${url}:`, err);
      throw err;
    }
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
<<<<<<< Updated upstream
=======
    support: {
      getAll: () => callApi('customer-care', 'tickets'),
      create: (data: any) =>
        callApi('customer-care', 'tickets', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      reply: (id: string, data: any) =>
        callApi('customer-care', `tickets/${id}/reply`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      updateStatus: (id: string, status: string) =>
        callApi('customer-care', `tickets/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
    },
>>>>>>> Stashed changes
    tickets: {
      getAll: () => callApi(HELP_SERVICE_URL, 'tickets/all'),
      create: (data: any) => callApi(HELP_SERVICE_URL, 'tickets', { method: 'POST', body: JSON.stringify(data) }),
      respond: (id: string, response: string, status?: string) => callApi(HELP_SERVICE_URL, `tickets/${id}/respond`, { method: 'PUT', body: JSON.stringify({ response, status }) }),
    },
    articles: {
      getAll: () => callApi(HELP_SERVICE_URL, 'faq'),
      create: (data: any) => callApi(HELP_SERVICE_URL, 'faq', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => callApi(HELP_SERVICE_URL, `faq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => callApi(HELP_SERVICE_URL, `faq/${id}`, { method: 'DELETE' }),
    },
  };
};
