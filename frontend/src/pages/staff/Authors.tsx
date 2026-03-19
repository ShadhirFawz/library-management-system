import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import { mockAuthors, Author } from '@/data/mockData';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Authors = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Author | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<Author>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'nationality', header: 'Nationality' },
    { accessorKey: 'birthDate', header: 'Birth Date' },
    { accessorKey: 'biography', header: 'Biography', cell: ({ row }) => <span className="max-w-[200px] truncate block">{row.original.biography}</span> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button onClick={() => { setEdit(row.original); setModalOpen(true); }} className="p-1.5 text-accent hover:bg-muted rounded transition-colors"><Edit2 size={15} /></button>
          <button onClick={() => toast({ title: 'Deleted', variant: 'destructive' })} className="p-1.5 text-destructive hover:bg-muted rounded transition-colors"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Authors</h1><p className="text-muted-foreground text-sm">Manage book authors</p></div>
        <button onClick={() => { setEdit(null); setModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={18} />Add Author</button>
      </div>
      <DataTable title="All Authors" data={mockAuthors} columns={columns} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={edit ? 'Edit Author' : 'Add Author'}>
        <form onSubmit={e => { e.preventDefault(); toast({ title: 'Saved' }); setModalOpen(false); }} className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Name</label><input defaultValue={edit?.name} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Nationality</label><input defaultValue={edit?.nationality} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-sm font-medium mb-1">Birth Date</label><input type="date" defaultValue={edit?.birthDate} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Biography</label><textarea defaultValue={edit?.biography} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" rows={3} /></div>
          <div className="col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Save</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Authors;
