import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import { mockCategories, Category } from '@/data/mockData';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Categories = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const { toast } = useToast();

  const getParentName = (id: string | null) => id ? mockCategories.find(c => c._id === id)?.name || 'N/A' : '—';

  const columns: ColumnDef<Category>[] = [
    { accessorKey: 'name', header: 'Category Name' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'parentCategoryId', header: 'Parent', cell: ({ row }) => getParentName(row.original.parentCategoryId) },
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
        <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-muted-foreground text-sm">Organize books by category</p></div>
        <button onClick={() => { setEdit(null); setModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={18} />Add Category</button>
      </div>
      <DataTable title="All Categories" data={mockCategories} columns={columns} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={edit ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={e => { e.preventDefault(); toast({ title: 'Saved' }); setModalOpen(false); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input defaultValue={edit?.name} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea defaultValue={edit?.description} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" rows={3} /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select defaultValue={edit?.parentCategoryId || ''} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent">
              <option value="">None (Top Level)</option>
              {mockCategories.filter(c => c._id !== edit?._id).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Save</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
