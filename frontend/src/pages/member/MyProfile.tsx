import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { Loader } from 'lucide-react';

const MyProfile = () => {
  const { user, updateCurrentUser } = useAuth();
  const api = useApi();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    profileImage: '',
    street: '',
    city: '',
    district: '',
    postalCode: '',
    role: '',
    status: '',
    createdAt: '',
    updatedAt: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await api.users.getProfile();
        setForm({
          fullName: profile?.fullName || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
          profileImage: profile?.profileImage || '',
          street: profile?.address?.street || '',
          city: profile?.address?.city || '',
          district: profile?.address?.district || '',
          postalCode: profile?.address?.postalCode || '',
          role: profile?.role || '',
          status: profile?.status || '',
          createdAt: profile?.createdAt || '',
          updatedAt: profile?.updatedAt || '',
        });

        updateCurrentUser({
          fullName: profile?.fullName || user?.fullName || '',
          email: profile?.email || user?.email || '',
          profileImage: profile?.profileImage || '',
        });
      } catch (error) {
        toast({
          title: 'Failed to load profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        profileImage: form.profileImage.trim(),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          postalCode: form.postalCode.trim(),
        },
      };

      const updatedUser = await api.users.updateProfile(payload);

      setForm({
        fullName: updatedUser?.fullName || payload.fullName,
        email: updatedUser?.email || payload.email,
        phone: updatedUser?.phone || payload.phone,
        profileImage: updatedUser?.profileImage || payload.profileImage,
        street: updatedUser?.address?.street || payload.address.street,
        city: updatedUser?.address?.city || payload.address.city,
        district: updatedUser?.address?.district || payload.address.district,
        postalCode: updatedUser?.address?.postalCode || payload.address.postalCode,
        role: updatedUser?.role || form.role,
        status: updatedUser?.status || form.status,
        createdAt: updatedUser?.createdAt || form.createdAt,
        updatedAt: updatedUser?.updatedAt || form.updatedAt,
      });

      updateCurrentUser({
        fullName: updatedUser?.fullName || payload.fullName,
        email: updatedUser?.email || payload.email,
        profileImage: updatedUser?.profileImage || payload.profileImage,
      });

      toast({ title: 'Profile updated' });
    } catch (error) {
      toast({
        title: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm">Update your personal information</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader className="h-4 w-4 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">My Profile</h1><p className="text-muted-foreground text-sm">Update your personal information</p></div>
      <form onSubmit={onSubmit} className="bg-card border border-border rounded p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Full Name</label><input value={form.fullName} onChange={e => update('fullName', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input value={form.email} onChange={e => update('email', e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
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
          </div>
        </fieldset>

        <fieldset className="border border-border rounded p-4">
          <legend className="text-sm font-semibold px-2">Account Details</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Role</label>
              <input value={form.role} readOnly className="w-full border border-border px-3 py-2 rounded bg-muted/40" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Status</label>
              <input value={form.status} readOnly className="w-full border border-border px-3 py-2 rounded bg-muted/40" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Created At</label>
              <input value={form.createdAt ? new Date(form.createdAt).toLocaleString() : 'N/A'} readOnly className="w-full border border-border px-3 py-2 rounded bg-muted/40" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-muted-foreground mb-1">Updated At</label>
              <input value={form.updatedAt ? new Date(form.updatedAt).toLocaleString() : 'N/A'} readOnly className="w-full border border-border px-3 py-2 rounded bg-muted/40" />
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default MyProfile;
