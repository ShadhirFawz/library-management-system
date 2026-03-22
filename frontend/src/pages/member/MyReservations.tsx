import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { X } from 'lucide-react';

interface Reservation {
  _id: string;
  userId: string;
  bookId: string;
  bookTitle?: string;
  reservationDate: string;
  status: 'pending' | 'notified' | 'fulfilled' | 'cancelled' | 'expired';
  notifiedAt?: string;
}

const MyReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reservationId: string;
    bookTitle: string;
  }>({ open: false, reservationId: '', bookTitle: '' });
  const api = useApi();
  const { toast } = useToast();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await api.reservations.getMy();
      const reservationsData = data.reservations || [];

      // Enrich reservations with book titles
      const enrichedReservations = await Promise.all(
        reservationsData.map(async (reservation: any) => {
          let bookTitle = 'Unknown Book';

          try {
            const bookRes = await api.books.getById(reservation.bookId);
            bookTitle = bookRes?.book?.title || 'Unknown Book';
          } catch (err) {
            console.error('Failed to fetch book:', err);
          }

          return {
            ...reservation,
            bookTitle,
          };
        })
      );

      setReservations(enrichedReservations);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservations');
      toast({ title: 'Error loading reservations', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancelClick = (reservation: Reservation) => {
    setConfirmDialog({
      open: true,
      reservationId: reservation._id,
      bookTitle: reservation.bookTitle || 'Unknown Book',
    });
  };

  const handleCancel = async () => {
    try {
      await api.reservations.cancel(confirmDialog.reservationId);
      toast({ title: 'Reservation cancelled' });
      fetchReservations();
    } catch (err: any) {
      toast({ title: 'Failed to cancel', description: err.message, variant: 'destructive' });
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'bookTitle',
      header: 'Book',
      cell: ({ row }) => <span className="font-medium">{row.original.bookTitle}</span>
    },
    { accessorKey: 'reservationDate', header: 'Reserved', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.reservationDate)}</span> },
    { accessorKey: 'notifiedAt', header: 'Notified', cell: ({ row }) => <span className="tabular-nums">{row.original.notifiedAt ? formatDate(row.original.notifiedAt) : '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status.toUpperCase()} /> },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => ['pending', 'notified'].includes(row.original.status) ? (
        <button
          onClick={() => handleCancelClick(row.original)}
          className="p-1.5 text-destructive hover:bg-muted rounded transition-colors"
          title="Cancel"
        >
          <X size={15} />
        </button>
      ) : null
    },
  ];

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-8 text-destructive">Error: {error}<button onClick={fetchReservations} className="ml-4 text-accent underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Reservations</h1><p className="text-muted-foreground text-sm">Track your book reservations</p></div>
      <DataTable title="My Reservations" data={reservations} columns={columns} searchPlaceholder="Search by book title..." />
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Cancel Reservation"
        description={`Are you sure you want to cancel your reservation for "${confirmDialog.bookTitle}"?`}
        confirmText="Cancel Reservation"
        confirmVariant="destructive"
        onConfirm={handleCancel}
      />
    </div>
  );
};

export default MyReservations;
