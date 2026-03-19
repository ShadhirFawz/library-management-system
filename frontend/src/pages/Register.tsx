import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', street: '', city: '', district: '', postalCode: '', country: '', profileImage: '' });
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(form);
    toast({ title: 'Registration successful', description: 'Welcome to LibraManage!' });
    navigate('/member/dashboard');
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input type="text" required value={form.fullName} onChange={e => update('fullName', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input type="password" required value={form.password} onChange={e => update('password', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Image URL</label>
              <input type="url" value={form.profileImage} onChange={e => update('profileImage', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <fieldset className="border border-border rounded p-4">
            <legend className="text-sm font-semibold px-2">Address</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Street</label><input type="text" value={form.street} onChange={e => update('street', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium mb-1">City</label><input type="text" value={form.city} onChange={e => update('city', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium mb-1">District</label><input type="text" value={form.district} onChange={e => update('district', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium mb-1">Postal Code</label><input type="text" value={form.postalCode} onChange={e => update('postalCode', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium mb-1">Country</label><input type="text" value={form.country} onChange={e => update('country', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
            </div>
          </fieldset>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded font-medium text-sm hover:opacity-90 transition-opacity">Register</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-accent hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
