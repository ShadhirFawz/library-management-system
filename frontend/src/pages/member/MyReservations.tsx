import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { mockReservations, getBookTitle, Reservation } from '@/data/mockData';

const MyReservations = () => {
  const { user } = useAuth();
  const data = mockReservations.filter(r => r.userId === (user?._id || 'usr3'));

  const columns: ColumnDef<Reservation>[] = [
    { accessorKey: 'bookId', header: 'Book', cell: ({ row }) => getBookTitle(row.original.bookId) },
    { accessorKey: 'reservationDate', header: 'Reserved', cell: ({ row }) => <span className="tabular-nums">{row.original.reservationDate}</span> },
    { accessorKey: 'expiryDate', header: 'Expires', cell: ({ row }) => <span className="tabular-nums">{row.original.expiryDate}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Reservations</h1><p className="text-muted-foreground text-sm">Track your book reservations</p></div>
      <DataTable title="My Reservations" data={data} columns={columns} />
    </div>
  );
};

export default MyReservations;
