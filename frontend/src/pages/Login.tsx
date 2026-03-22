import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({ title: 'Login successful', description: 'Welcome back!' });
        const role = result.user?.role;
        if (role === 'MEMBER') navigate('/member/dashboard');
        else navigate('/staff/dashboard');
      } else {
        toast({ 
          title: 'Login failed', 
          description: result.error || 'Invalid credentials', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 bg-primary rounded flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">LibraManage</h1>
        </div>
        <h2 className="text-lg font-semibold text-center mb-6">Sign in to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              disabled={isLoading}
              required 
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent disabled:opacity-50" 
              placeholder="your@email.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              disabled={isLoading}
              required 
              className="w-full border border-border px-3 py-2 pr-10 rounded text-sm focus:outline-none focus:border-accent disabled:opacity-50" 
              placeholder="••••••••" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              disabled={isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center space-y-2">
          <button className="text-sm text-accent hover:underline">Forgot password?</button>
          <p className="text-sm text-muted-foreground">
            New member? <Link to="/register" className="text-accent hover:underline font-medium">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
