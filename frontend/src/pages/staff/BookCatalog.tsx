import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { mockBooks, mockAuthors, mockCategories, getAuthorName, getCategoryName, Book } from '@/data/mockData';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BookCatalog = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<Book | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<Book>[] = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'isbn', header: 'ISBN', cell: ({ row }) => <span className="tabular-nums">{row.original.isbn}</span> },
    { id: 'authors', header: 'Authors', cell: ({ row }) => row.original.authorIds.map(getAuthorName).join(', ') },
    { id: 'categories', header: 'Categories', cell: ({ row }) => row.original.categoryIds.map(getCategoryName).join(', ') },
    { accessorKey: 'publisher', header: 'Publisher' },
    { accessorKey: 'publishedYear', header: 'Year', cell: ({ row }) => <span className="tabular-nums">{row.original.publishedYear}</span> },
    { accessorKey: 'totalCopies', header: 'Total' },
    { accessorKey: 'availableCopies', header: 'Available', cell: ({ row }) => <span className={row.original.availableCopies > 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>{row.original.availableCopies}</span> },
    { id: 'location', header: 'Location', cell: ({ row }) => `${row.original.location.floor}F / ${row.original.location.shelf}-${row.original.location.rack}` },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button onClick={() => { setEdit(row.original); setModalOpen(true); }} className="p-1.5 text-accent hover:bg-muted rounded transition-colors"><Edit2 size={15} /></button>
          <button onClick={() => toast({ title: 'Book deleted', variant: 'destructive' })} className="p-1.5 text-destructive hover:bg-muted rounded transition-colors"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Book Catalog</h1><p className="text-muted-foreground text-sm">Manage your library's collection</p></div>
        <button onClick={() => { setEdit(null); setModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={18} />Add Book</button>
      </div>
      <DataTable title="All Books" data={mockBooks} columns={columns} />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={edit ? 'Edit Book' : 'Add New Book'}>
        <form onSubmit={e => { e.preventDefault(); toast({ title: 'Saved' }); setModalOpen(false); }} className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Title</label><input defaultValue={edit?.title} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">ISBN</label><input defaultValue={edit?.isbn} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Publisher</label><input defaultValue={edit?.publisher} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-sm font-medium mb-1">Published Year</label><input type="number" defaultValue={edit?.publishedYear} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-sm font-medium mb-1">Language</label><input defaultValue={edit?.language || 'English'} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-sm font-medium mb-1">Pages</label><input type="number" defaultValue={edit?.pages} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-sm font-medium mb-1">Total Copies</label><input type="number" defaultValue={edit?.totalCopies} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Authors</label>
            <select multiple defaultValue={edit?.authorIds} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent h-20">
              {mockAuthors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <select multiple defaultValue={edit?.categoryIds} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent h-20">
              {mockCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <fieldset className="col-span-2 border border-border rounded p-4">
            <legend className="text-sm font-semibold px-2">Location</legend>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-xs font-medium mb-1">Floor</label><input defaultValue={edit?.location.floor} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium mb-1">Shelf</label><input defaultValue={edit?.location.shelf} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium mb-1">Rack</label><input defaultValue={edit?.location.rack} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" /></div>
            </div>
          </fieldset>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea defaultValue={edit?.description} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" rows={3} /></div>
          <div className="col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Save</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default BookCatalog;
