import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import { mockMemberships, Membership } from '@/data/mockData';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MembershipPlans = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Membership | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<Membership>[] = [
    { accessorKey: 'name', header: 'Plan Name' },
    { accessorKey: 'maxBorrowLimit', header: 'Borrow Limit' },
    { accessorKey: 'borrowDurationDays', header: 'Duration (days)' },
    { accessorKey: 'finePerDay', header: 'Fine/Day ($)', cell: ({ row }) => `$${row.original.finePerDay.toFixed(2)}` },
    { accessorKey: 'membershipDurationMonths', header: 'Validity (months)' },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button onClick={() => { setEdit(row.original); setModalOpen(true); }} className="p-1.5 text-accent hover:bg-muted rounded transition-colors"><Edit2 size={15} /></button>
          <button onClick={() => toast({ title: 'Plan deleted', variant: 'destructive' })} className="p-1.5 text-destructive hover:bg-muted rounded transition-colors"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Membership Plans</h1><p className="text-muted-foreground text-sm">Configure borrowing tiers</p></div>
        <button onClick={() => { setEdit(null); setModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={18} />Add Plan</button>
      </div>
      <DataTable title="All Plans" data={mockMemberships} columns={columns} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={edit ? 'Edit Plan' : 'Add Plan'}>
        <form onSubmit={e => { e.preventDefault(); toast({ title: 'Saved' }); setModalOpen(false); }} className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Plan Name</label><input defaultValue={edit?.name} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Max Borrow Limit</label><input type="number" defaultValue={edit?.maxBorrowLimit} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Borrow Duration (days)</label><input type="number" defaultValue={edit?.borrowDurationDays} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Fine Per Day ($)</label><input type="number" step="0.01" defaultValue={edit?.finePerDay} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Duration (months)</label><input type="number" defaultValue={edit?.membershipDurationMonths} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea defaultValue={edit?.description} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" rows={3} /></div>
          <div className="col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Save</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default MembershipPlans;
