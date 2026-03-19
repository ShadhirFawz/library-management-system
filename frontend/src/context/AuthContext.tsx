import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthUser {
  _id: string;
  fullName: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  email: string;
  membershipId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => boolean;
  register: (data: any) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock credentials
const MOCK_CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  'admin@libramanage.com': { password: 'admin123', user: { _id: 'usr1', fullName: 'John Admin', role: 'ADMIN', email: 'admin@libramanage.com', membershipId: null } },
  'librarian@libramanage.com': { password: 'lib123', user: { _id: 'usr2', fullName: 'Sarah Librarian', role: 'LIBRARIAN', email: 'librarian@libramanage.com', membershipId: null } },
  'alice@example.com': { password: 'member123', user: { _id: 'usr3', fullName: 'Alice Member', role: 'MEMBER', email: 'alice@example.com', membershipId: 'mem1' } },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('libramanage_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch { /* ignore */ }
    }
  }, []);

  const login = (email: string, _password: string): boolean => {
    const cred = MOCK_CREDENTIALS[email];
    if (cred) {
      const authData = { token: 'mock-jwt-token-' + cred.user._id, user: cred.user };
      localStorage.setItem('libramanage_auth', JSON.stringify(authData));
      setUser(authData.user);
      setToken(authData.token);
      return true;
    }
    return false;
  };

  const register = (_data: any): boolean => {
    const newUser: AuthUser = { _id: 'usr-new', fullName: _data.fullName || 'New Member', role: 'MEMBER', email: _data.email, membershipId: null };
    const authData = { token: 'mock-jwt-token-new', user: newUser };
    localStorage.setItem('libramanage_auth', JSON.stringify(authData));
    setUser(newUser);
    setToken(authData.token);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('libramanage_auth');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
