import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { mockUsers, getMembershipName, User } from '@/data/mockData';
import { Plus, Edit2, Trash2, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const { toast } = useToast();

  const openAdd = () => { setEditUser(null); setModalOpen(true); };
  const openEdit = (u: User) => { setEditUser(u); setModalOpen(true); };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'fullName', header: 'Full Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <StatusBadge status={row.original.role} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'membershipId', header: 'Membership', cell: ({ row }) => getMembershipName(row.original.membershipId) },
    { accessorKey: 'lastLogin', header: 'Last Login', cell: ({ row }) => new Date(row.original.lastLogin).toLocaleDateString() },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row.original)} className="p-1.5 text-accent hover:bg-muted rounded transition-colors"><Edit2 size={15} /></button>
          <button onClick={() => toast({ title: 'User suspended', description: row.original.fullName })} className="p-1.5 text-muted-foreground hover:bg-muted rounded transition-colors"><Ban size={15} /></button>
          <button onClick={() => toast({ title: 'User deleted', variant: 'destructive' })} className="p-1.5 text-destructive hover:bg-muted rounded transition-colors"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">User Management</h1><p className="text-muted-foreground text-sm">Manage all system users</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={18} />Add User</button>
      </div>
      <DataTable title="All Users" data={mockUsers} columns={columns} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={(e) => { e.preventDefault(); toast({ title: editUser ? 'User updated' : 'User created' }); setModalOpen(false); }} className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" defaultValue={editUser?.fullName} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" defaultValue={editUser?.email} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" defaultValue={editUser?.phone} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select defaultValue={editUser?.role || 'MEMBER'} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent">
              <option value="ADMIN">Admin</option><option value="LIBRARIAN">Librarian</option><option value="MEMBER">Member</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select defaultValue={editUser?.status || 'ACTIVE'} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent">
              <option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <fieldset className="col-span-2 border border-border rounded p-4">
            <legend className="text-sm font-semibold px-2">Address</legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><input type="text" placeholder="Street" defaultValue={editUser?.address.street} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
              <input type="text" placeholder="City" defaultValue={editUser?.address.city} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
              <input type="text" placeholder="District" defaultValue={editUser?.address.district} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
              <input type="text" placeholder="Postal Code" defaultValue={editUser?.address.postalCode} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
              <input type="text" placeholder="Country" defaultValue={editUser?.address.country} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" />
            </div>
          </fieldset>
          <div className="col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
