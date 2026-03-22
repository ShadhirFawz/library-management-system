import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  _id: string;
  fullName: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  email: string;
  profileImage?: string;
  membershipId: string | null;
}

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  updateCurrentUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const USER_SERVICE_URL = `${API_BASE_URL}/api`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('libramanage_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (error) {
        console.error('Failed to restore auth:', error);
        localStorage.removeItem('libramanage_auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${USER_SERVICE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Login failed' };
      }

      const data = await response.json();
      const { user: backendUser, token: backendToken } = data;

      // Map backend user to our AuthUser interface
      const mappedUser: AuthUser = {
        _id: backendUser._id,
        fullName: backendUser.fullName,
        role: backendUser.role || 'MEMBER',
        email: backendUser.email,
        profileImage: backendUser.profileImage || '',
        membershipId: backendUser.membershipId || null,
      };

      const authData = { token: backendToken, user: mappedUser };
      localStorage.setItem('libramanage_auth', JSON.stringify(authData));
      setUser(mappedUser);
      setToken(backendToken);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error during login';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${USER_SERVICE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Registration failed' };
      }

      await response.json();

      // Do not create a session on successful registration.
      // User must explicitly log in after registering.
      localStorage.removeItem('libramanage_auth');
      setUser(null);
      setToken(null);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error during registration';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentUser = (updates: Partial<AuthUser>) => {
    if (!user) return;

    const mergedUser: AuthUser = {
      ...user,
      ...updates,
    };

    setUser(mergedUser);

    const stored = localStorage.getItem('libramanage_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        localStorage.setItem(
          'libramanage_auth',
          JSON.stringify({
            ...parsed,
            user: mergedUser,
          })
        );
      } catch (error) {
        console.error('Failed to update stored auth user:', error);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('libramanage_auth');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, updateCurrentUser, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
