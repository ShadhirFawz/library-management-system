import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [form, setForm] = useState({ 
    fullName: '', 
    email: '', 
    password: '',
    confirmPassword: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string, value: string) => 
    setForm(f => ({ ...f, [field]: value }));

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) {
      toast({ title: 'Validation Error', description: 'Full name is required', variant: 'destructive' });
      return false;
    }
    if (!form.email.trim()) {
      toast({ title: 'Validation Error', description: 'Email is required', variant: 'destructive' });
      return false;
    }
    if (!form.password) {
      toast({ title: 'Validation Error', description: 'Password is required', variant: 'destructive' });
      return false;
    }
    if (form.password.length < 6) {
      toast({ title: 'Validation Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return false;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Validation Error', description: 'Passwords do not match', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      if (result.success) {
        toast({ title: 'Registration successful', description: 'Welcome to LibraManage!' });
        navigate('/member/dashboard');
      } else {
        toast({ 
          title: 'Registration failed', 
          description: result.error || 'Please try again', 
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
      <div className="w-full max-w-lg bg-card border border-border rounded p-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-12 w-12 bg-primary rounded flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">LibraManage</h1>
        </div>
        <h2 className="text-lg font-semibold text-center mb-6">Create Member Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input 
              type="text" 
              required 
              disabled={isLoading}
              value={form.fullName} 
              onChange={e => update('fullName', e.target.value)} 
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent disabled:opacity-50" 
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input 
              type="email" 
              required 
              disabled={isLoading}
              value={form.email} 
              onChange={e => update('email', e.target.value)} 
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent disabled:opacity-50" 
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <input 
              type="password" 
              required 
              disabled={isLoading}
              value={form.password} 
              onChange={e => update('password', e.target.value)} 
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent disabled:opacity-50" 
              placeholder="••••••••"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password *</label>
            <input 
              type="password" 
              required 
              disabled={isLoading}
              value={form.confirmPassword} 
              onChange={e => update('confirmPassword', e.target.value)} 
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent disabled:opacity-50" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
