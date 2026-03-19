// ============================
// API Hook — Real backend integration
// ============================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const useApi = () => {
  const getAuthHeaders = () => {
    const stored = localStorage.getItem('libramanage_auth');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
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
    const url = `${API_BASE_URL}/api/${service}/${endpoint}`;
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
        localStorage.removeItem('libramanage_auth');
        window.location.href = '/login';
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API Error: ${response.status}`);
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
        fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }).then((res) => {
          if (!res.ok) throw new Error('Login failed');
          return res.json();
        }),
      register: (data: any) =>
        fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).then((res) => {
          if (!res.ok) throw new Error('Registration failed');
          return res.json();
        }),
    },
    users: {
      getAll: () => callApi('user-service', 'users'),
      getById: (id: string) => callApi('user-service', `users/${id}`),
      create: (data: any) =>
        callApi('user-service', 'users', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi('user-service', `users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi('user-service', `users/${id}`, { method: 'DELETE' }),
      suspend: (id: string) =>
        callApi('user-service', `users/${id}/suspend`, { method: 'PATCH' }),
    },
    memberships: {
      getAll: () => callApi('user-service', 'memberships'),
      create: (data: any) =>
        callApi('user-service', 'memberships', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi('user-service', `memberships/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi('user-service', `memberships/${id}`, { method: 'DELETE' }),
    },
    userMemberships: {
      getByUser: (userId: string) =>
        callApi('user-service', `user-memberships/user/${userId}`),
      assign: (data: any) =>
        callApi('user-service', 'user-memberships', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
    },
    books: {
      getAll: () => callApi('book-catalog', 'books'),
      getById: (id: string) => callApi('book-catalog', `books/${id}`),
      create: (data: any) =>
        callApi('book-catalog', 'books', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi('book-catalog', `books/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi('book-catalog', `books/${id}`, { method: 'DELETE' }),
    },
    authors: {
      getAll: () => callApi('book-catalog', 'authors'),
      create: (data: any) =>
        callApi('book-catalog', 'authors', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi('book-catalog', `authors/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi('book-catalog', `authors/${id}`, { method: 'DELETE' }),
    },
    categories: {
      getAll: () => callApi('book-catalog', 'categories'),
      create: (data: any) =>
        callApi('book-catalog', 'categories', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi('book-catalog', `categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        callApi('book-catalog', `categories/${id}`, { method: 'DELETE' }),
    },
    inventory: {
      getAll: () => callApi('book-catalog', 'book-copies'),
      create: (data: any) =>
        callApi('book-catalog', 'book-copies', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: any) =>
        callApi('book-catalog', `book-copies/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
    },
    orders: {
      getAll: () => callApi('order-service', 'borrow-orders'),
      create: (data: any) =>
        callApi('order-service', 'borrow-orders', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      return: (id: string) =>
        callApi('order-service', `borrow-orders/${id}/return`, {
          method: 'PATCH',
        }),
      markOverdue: (id: string) =>
        callApi('order-service', `borrow-orders/${id}/overdue`, {
          method: 'PATCH',
        }),
    },
    reservations: {
      getAll: () => callApi('order-service', 'reservations'),
      create: (data: any) =>
        callApi('order-service', 'reservations', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      cancel: (id: string) =>
        callApi('order-service', `reservations/${id}/cancel`, {
          method: 'PATCH',
        }),
    },
    fines: {
      getAll: () => callApi('order-service', 'fines'),
      markPaid: (id: string) =>
        callApi('order-service', `fines/${id}/pay`, { method: 'PATCH' }),
    },
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
  };
};
