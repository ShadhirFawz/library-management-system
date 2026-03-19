import { useState } from 'react';
import Modal from '@/components/Modal';
import { mockBooks, getAuthorName, getCategoryName, Book } from '@/data/mockData';
import { Search, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BrowseCatalog = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Book | null>(null);
  const { toast } = useToast();

  const filtered = mockBooks.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.authorIds.some(id => getAuthorName(id).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Browse Catalog</h1><p className="text-muted-foreground text-sm">Discover and reserve books</p></div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or author..." className="w-full bg-card border border-border pl-10 pr-4 py-2.5 text-sm rounded focus:outline-none focus:border-accent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(book => (
          <button key={book._id} onClick={() => setSelected(book)} className="bg-card border border-border rounded p-4 text-left hover:border-accent transition-colors">
            <div className="h-32 bg-muted rounded flex items-center justify-center mb-3">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm truncate">{book.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{book.authorIds.map(getAuthorName).join(', ')}</p>
            <p className={`text-xs font-semibold mt-2 ${book.availableCopies > 0 ? 'text-success' : 'text-destructive'}`}>
              {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Unavailable'}
            </p>
          </button>
        ))}
      </div>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">ISBN:</span> <span className="tabular-nums">{selected.isbn}</span></div>
              <div><span className="text-muted-foreground">Publisher:</span> {selected.publisher}</div>
              <div><span className="text-muted-foreground">Year:</span> <span className="tabular-nums">{selected.publishedYear}</span></div>
              <div><span className="text-muted-foreground">Pages:</span> <span className="tabular-nums">{selected.pages}</span></div>
              <div><span className="text-muted-foreground">Language:</span> {selected.language}</div>
              <div><span className="text-muted-foreground">Location:</span> {selected.location.floor}F / {selected.location.shelf}-{selected.location.rack}</div>
              <div><span className="text-muted-foreground">Authors:</span> {selected.authorIds.map(getAuthorName).join(', ')}</div>
              <div><span className="text-muted-foreground">Categories:</span> {selected.categoryIds.map(getCategoryName).join(', ')}</div>
            </div>
            <p className="text-sm text-muted-foreground">{selected.description}</p>
            <p className={`text-sm font-semibold ${selected.availableCopies > 0 ? 'text-success' : 'text-destructive'}`}>
              {selected.availableCopies} of {selected.totalCopies} copies available
            </p>
            <div className="flex gap-3">
              <button onClick={() => { toast({ title: 'Reservation requested' }); setSelected(null); }} className="px-4 py-2 bg-accent text-accent-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Reserve</button>
              <button onClick={() => { toast({ title: 'Borrow request submitted' }); setSelected(null); }} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Request Borrow</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BrowseCatalog;
