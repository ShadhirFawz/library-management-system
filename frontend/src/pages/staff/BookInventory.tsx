import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { mockBookCopies, getBookTitle, BookCopy } from '@/data/mockData';

const BookInventory = () => {
  const columns: ColumnDef<BookCopy>[] = [
    { accessorKey: 'barcode', header: 'Barcode', cell: ({ row }) => <span className="tabular-nums font-medium">{row.original.barcode}</span> },
    { accessorKey: 'bookId', header: 'Book', cell: ({ row }) => getBookTitle(row.original.bookId) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'condition', header: 'Condition' },
    { accessorKey: 'purchasedDate', header: 'Purchased', cell: ({ row }) => <span className="tabular-nums">{row.original.purchasedDate}</span> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Book Inventory</h1><p className="text-muted-foreground text-sm">Track individual book copies</p></div>
      <DataTable title="All Copies" data={mockBookCopies} columns={columns} />
    </div>
  );
};

export default BookInventory;
