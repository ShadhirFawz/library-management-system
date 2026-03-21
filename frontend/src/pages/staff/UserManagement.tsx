import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Edit2, Trash2, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
  status: 'ACTIVE' | 'SUSPENDED';
  membershipId?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    country?: string;
  };
  profileImage?: string;
  createdAt?: string;
}

type ConfirmAction =
  | { type: 'delete'; userId: string; userName: string }
  | { type: 'promote'; userId: string; userName: string }
  | null;

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { manageUsers } = useApi();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await manageUsers.getAll();
      setUsers(response || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load users';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    // Intentionally run once on mount to avoid infinite re-fetch from unstable hook references.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditUser(null);
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      setSubmitting(true);
      await manageUsers.delete(userId);
      toast({ title: 'Success', description: 'User deleted successfully' });
      await fetchUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePromote = async (userId: string, userName: string) => {
    try {
      setSubmitting(true);
      await manageUsers.promote(userId);
      toast({ title: 'Success', description: `${userName} promoted to Librarian` });
      await fetchUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to promote user';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'delete') {
      await handleDelete(confirmAction.userId);
      setConfirmAction(null);
      return;
    }

    await handlePromote(confirmAction.userId, confirmAction.userName);
    setConfirmAction(null);
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const userData: Record<string, unknown> = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      status: formData.get('status'),
      address: {
        street: formData.get('street'),
        city: formData.get('city'),
        district: formData.get('district'),
        postalCode: formData.get('postalCode'),
        country: formData.get('country'),
      },
    };

    if (currentUser?.role === 'ADMIN') {
      userData.role = formData.get('role');
    }

    try {
      setSubmitting(true);
      if (editUser) {
        await manageUsers.update(editUser._id, userData);
        toast({ title: 'Success', description: 'User updated successfully' });
      } else {
        await manageUsers.create({
          ...userData,
          password: formData.get('password'),
        });
        toast({ title: 'Success', description: 'User created successfully' });
      }
      setModalOpen(false);
      await fetchUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save user';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const canDelete = currentUser?.role === 'ADMIN';
  const canPromote = currentUser?.role === 'ADMIN';
  const canEdit = currentUser?.role === 'ADMIN' || currentUser?.role === 'LIBRARIAN';
  const canCreate = currentUser?.role === 'ADMIN' || currentUser?.role === 'LIBRARIAN';

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'fullName', header: 'Full Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <StatusBadge status={row.original.role} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'phone', header: 'Phone' },
    {
      accessorKey: 'createdAt',
      header: 'Joined Date',
      cell: ({ row }) =>
        row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {canEdit && (
            <button
              onClick={() => openEdit(row.original)}
              disabled={submitting}
              className="p-1.5 text-accent hover:bg-muted rounded transition-colors disabled:opacity-50"
              title="Edit user"
            >
              <Edit2 size={15} />
            </button>
          )}
          {canPromote && row.original.role === 'MEMBER' && (
            <button
              onClick={() =>
                setConfirmAction({
                  type: 'promote',
                  userId: row.original._id,
                  userName: row.original.fullName,
                })
              }
              disabled={submitting}
              className="p-1.5 text-yellow-600 hover:bg-muted rounded transition-colors disabled:opacity-50"
              title="Promote to Librarian"
            >
              <Crown size={15} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() =>
                setConfirmAction({
                  type: 'delete',
                  userId: row.original._id,
                  userName: row.original.fullName,
                })
              }
              disabled={submitting}
              className="p-1.5 text-destructive hover:bg-muted rounded transition-colors disabled:opacity-50"
              title="Delete user"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage all system users</p>
        </div>
        {canCreate && (
          <button
            onClick={openAdd}
            disabled={submitting}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus size={18} />
            Add User
          </button>
        )}
      </div>
      <DataTable title={`All Users (${users.length})`} data={users} columns={columns} />

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'delete' ? 'Delete user?' : 'Promote user?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete'
                ? `This will permanently delete ${confirmAction.userName}. This action cannot be undone.`
                : `This will promote ${confirmAction?.userName} to Librarian.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={submitting}
              className={confirmAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {submitting
                ? 'Processing...'
                : confirmAction?.type === 'delete'
                  ? 'Delete'
                  : 'Promote'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSaveUser} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              defaultValue={editUser?.fullName || ''}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              defaultValue={editUser?.email || ''}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              defaultValue={editUser?.phone || ''}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            />
          </div>

          {!editUser && (
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role"
              defaultValue={editUser?.role || 'MEMBER'}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            >
              <option value="ADMIN">Admin</option>
              <option value="LIBRARIAN">Librarian</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              defaultValue={editUser?.status || 'ACTIVE'}
              className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
            >
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <fieldset className="col-span-2 border border-border rounded p-4">
            <legend className="text-sm font-semibold px-2">Address</legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <input
                  type="text"
                  name="street"
                  placeholder="Street"
                  defaultValue={editUser?.address?.street || ''}
                  className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <input
                type="text"
                name="city"
                placeholder="City"
                defaultValue={editUser?.address?.city || ''}
                className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                name="district"
                placeholder="District"
                defaultValue={editUser?.address?.district || ''}
                className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                defaultValue={editUser?.address?.postalCode || ''}
                className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                defaultValue={editUser?.address?.country || ''}
                className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </fieldset>

          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
