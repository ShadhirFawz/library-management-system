import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { mockReservations, getUserName, getBookTitle, Reservation } from '@/data/mockData';

const Reservations = () => {
  const columns: ColumnDef<Reservation>[] = [
    { accessorKey: 'userId', header: 'User', cell: ({ row }) => getUserName(row.original.userId) },
    { accessorKey: 'bookId', header: 'Book', cell: ({ row }) => getBookTitle(row.original.bookId) },
    { accessorKey: 'reservationDate', header: 'Reserved', cell: ({ row }) => <span className="tabular-nums">{row.original.reservationDate}</span> },
    { accessorKey: 'expiryDate', header: 'Expires', cell: ({ row }) => <span className="tabular-nums">{row.original.expiryDate}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Reservations</h1><p className="text-muted-foreground text-sm">Manage book reservations</p></div>
      <DataTable title="All Reservations" data={mockReservations} columns={columns} />
    </div>
  );
};

export default Reservations;
