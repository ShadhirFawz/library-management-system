import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { mockBorrowOrders, getBookByBookCopyId, BorrowOrder } from '@/data/mockData';

const MyBorrowings = () => {
  const { user } = useAuth();
  const data = mockBorrowOrders.filter(o => o.userId === (user?._id || 'usr3'));

  const columns: ColumnDef<BorrowOrder>[] = [
    { accessorKey: 'bookCopyId', header: 'Book', cell: ({ row }) => { const b = getBookByBookCopyId(row.original.bookCopyId); return `${b.title} (${b.barcode})`; } },
    { accessorKey: 'borrowDate', header: 'Borrow Date', cell: ({ row }) => <span className="tabular-nums">{row.original.borrowDate}</span> },
    { accessorKey: 'dueDate', header: 'Due Date', cell: ({ row }) => <span className="tabular-nums">{row.original.dueDate}</span> },
    { accessorKey: 'returnDate', header: 'Returned', cell: ({ row }) => <span className="tabular-nums">{row.original.returnDate || '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'fineAmount', header: 'Fine', cell: ({ row }) => <span className="tabular-nums">${row.original.fineAmount.toFixed(2)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Borrowings</h1><p className="text-muted-foreground text-sm">Track your borrowed books</p></div>
      <DataTable title="My Borrow Orders" data={data} columns={columns} />
    </div>
  );
};

export default MyBorrowings;
