import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Order {
  _id: string;
  userId: string;
  bookCopyId: string;
  bookId: string;
  bookTitle?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  fineAmount: number;
}

const MyBorrowings = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getMy();
      const ordersData = data.orders || [];

      // Enrich orders with book titles
      const enrichedOrders = await Promise.all(
        ordersData.map(async (order: any) => {
          let bookTitle = 'Unknown Book';

          try {
            const bookRes = await api.books.getById(order.bookId);
            bookTitle = bookRes?.book?.title || 'Unknown Book';
          } catch (err) {
            console.error('Failed to fetch book:', err);
          }

          return {
            ...order,
            bookTitle,
          };
        })
      );

      setOrders(enrichedOrders);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      toast({ title: 'Error loading borrowings', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'bookTitle',
      header: 'Book',
      cell: ({ row }) => <span className="font-medium">{row.original.bookTitle}</span>
    },
    { accessorKey: 'bookCopyId', header: 'Copy ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.bookCopyId}</span> },
    { accessorKey: 'borrowDate', header: 'Borrow Date', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.borrowDate)}</span> },
    { accessorKey: 'dueDate', header: 'Due Date', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.dueDate)}</span> },
    { accessorKey: 'returnDate', header: 'Returned', cell: ({ row }) => <span className="tabular-nums">{row.original.returnDate ? formatDate(row.original.returnDate) : '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status.toUpperCase()} /> },
    { accessorKey: 'fineAmount', header: 'Fine', cell: ({ row }) => <span className="tabular-nums">${row.original.fineAmount.toFixed(2)}</span> },
  ];

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-8 text-destructive">Error: {error}<button onClick={fetchOrders} className="ml-4 text-accent underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Borrowings</h1><p className="text-muted-foreground text-sm">Track your borrowed books</p></div>
      <DataTable title="My Borrow Orders" data={orders} columns={columns} searchPlaceholder="Search by book title or copy ID..." />
    </div>
  );
};

export default MyBorrowings;
