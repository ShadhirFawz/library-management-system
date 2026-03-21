import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

interface Order {
  _id: string;
  userId: string;
  bookCopyId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fineAmount: number;
}

const BorrowingOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issueModal, setIssueModal] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ bookCopyId: '', bookId: '' });
  const { toast } = useToast();
  const api = useApi();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getAll();
      setOrders(data.orders || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      toast({ title: 'Error loading orders', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleReturn = async (id: string) => {
    try {
      const result = await api.orders.return(id);
      toast({ title: result.message || 'Book returned successfully' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Return failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.orders.borrow({ bookCopyId: borrowForm.bookCopyId, bookId: borrowForm.bookId || undefined });
      toast({ title: 'Book issued successfully' });
      setIssueModal(false);
      setBorrowForm({ bookCopyId: '', bookId: '' });
      fetchOrders();
    } catch (err: any) {
      toast({ title: 'Issue failed', description: err.message, variant: 'destructive' });
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ColumnDef<Order>[] = [
    { accessorKey: 'userId', header: 'User ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.userId}</span> },
    { accessorKey: 'bookId', header: 'Book ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.bookId}</span> },
    { accessorKey: 'bookCopyId', header: 'Copy ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.bookCopyId}</span> },
    { accessorKey: 'borrowDate', header: 'Borrow Date', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.borrowDate)}</span> },
    { accessorKey: 'dueDate', header: 'Due Date', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.dueDate)}</span> },
    { accessorKey: 'returnDate', header: 'Return Date', cell: ({ row }) => <span className="tabular-nums">{row.original.returnDate ? formatDate(row.original.returnDate) : '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status.toUpperCase()} /> },
    { accessorKey: 'fineAmount', header: 'Fine', cell: ({ row }) => <span className="tabular-nums">${row.original.fineAmount.toFixed(2)}</span> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.status === 'borrowed' && (
            <button onClick={() => handleReturn(row.original._id)} className="p-1.5 text-success hover:bg-muted rounded transition-colors" title="Return"><RotateCcw size={15} /></button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-8 text-destructive">Error: {error}<button onClick={fetchOrders} className="ml-4 text-accent underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Borrowing Orders</h1><p className="text-muted-foreground text-sm">Manage book borrowings</p></div>
        <button onClick={() => setIssueModal(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={18} />Issue Borrow</button>
      </div>
      <DataTable title="All Orders" data={orders} columns={columns} />
      <Modal isOpen={issueModal} onClose={() => setIssueModal(false)} title="Issue New Borrow">
        <form onSubmit={handleBorrow} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Book Copy ID</label><input value={borrowForm.bookCopyId} onChange={e => setBorrowForm(f => ({ ...f, bookCopyId: e.target.value }))} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required placeholder="Enter book copy ID" /></div>
          <div><label className="block text-sm font-medium mb-1">Book ID (optional)</label><input value={borrowForm.bookId} onChange={e => setBorrowForm(f => ({ ...f, bookId: e.target.value }))} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" placeholder="Enter book ID" /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setIssueModal(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Issue</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default BorrowingOrders;
