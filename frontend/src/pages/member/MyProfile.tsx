import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { mockUsers } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const MyProfile = () => {
  const { user } = useAuth();
  const mockUser = mockUsers.find(u => u._id === user?._id) || mockUsers[2];
  const [form, setForm] = useState({
    fullName: mockUser.fullName,
    email: mockUser.email,
    phone: mockUser.phone,
    street: mockUser.address.street,
    city: mockUser.address.city,
    district: mockUser.address.district,
    postalCode: mockUser.address.postalCode,
    country: mockUser.address.country,
    profileImage: mockUser.profileImage,
  });
  const { toast } = useToast();

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">My Profile</h1><p className="text-muted-foreground text-sm">Update your personal information</p></div>
      <form onSubmit={e => { e.preventDefault(); toast({ title: 'Profile updated' }); }} className="bg-card border border-border rounded p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Full Name</label><input value={form.fullName} onChange={e => update('fullName', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input value={form.email} onChange={e => update('email', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" disabled /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Profile Image URL</label><input value={form.profileImage} onChange={e => update('profileImage', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
        </div>
        <fieldset className="border border-border rounded p-4">
          <legend className="text-sm font-semibold px-2">Address</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><input value={form.street} onChange={e => update('street', e.target.value)} placeholder="Street" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
            <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="City" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            <input value={form.district} onChange={e => update('district', e.target.value)} placeholder="District" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            <input value={form.postalCode} onChange={e => update('postalCode', e.target.value)} placeholder="Postal Code" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            <input value={form.country} onChange={e => update('country', e.target.value)} placeholder="Country" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
          </div>
        </fieldset>
        <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Save Changes</button>
      </form>
    </div>
  );
};

export default MyProfile;
