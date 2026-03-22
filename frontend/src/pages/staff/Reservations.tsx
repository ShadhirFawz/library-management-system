import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

interface Reservation {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  bookId: string;
  bookTitle?: string;
  reservationDate: string;
  status: 'pending' | 'notified' | 'fulfilled' | 'cancelled' | 'expired';
  notifiedAt?: string;
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reservationId: string;
    type: 'approve' | 'reject';
    title: string;
    description: string;
  }>({ open: false, reservationId: '', type: 'approve', title: '', description: '' });
  const api = useApi();
  const { toast } = useToast();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await api.reservations.getAll();
      const reservationsData = data.reservations || [];

      // Enrich reservations with user and book names
      const enrichedReservations = await Promise.all(
        reservationsData.map(async (reservation: any) => {
          let userName = 'Unknown User';
          let userEmail = '';
          let bookTitle = 'Unknown Book';

          try {
            const user = await api.users.getById(reservation.userId);
            userName = user?.fullName || user?.email || 'Unknown User';
            userEmail = user?.email || '';
          } catch (err) {
            console.error('Failed to fetch user:', err);
          }

          try {
            const bookRes = await api.books.getById(reservation.bookId);
            bookTitle = bookRes?.book?.title || 'Unknown Book';
          } catch (err) {
            console.error('Failed to fetch book:', err);
          }

          return {
            ...reservation,
            userName,
            userEmail,
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

  const handleApproveClick = (reservation: Reservation) => {
    setConfirmDialog({
      open: true,
      reservationId: reservation._id,
      type: 'approve',
      title: 'Approve Reservation',
      description: `Are you sure you want to approve and issue "${reservation.bookTitle}" to ${reservation.userName}?`,
    });
  };

  const handleRejectClick = (reservation: Reservation) => {
    setConfirmDialog({
      open: true,
      reservationId: reservation._id,
      type: 'reject',
      title: 'Reject Reservation',
      description: `Are you sure you want to reject the reservation for "${reservation.bookTitle}" by ${reservation.userName}?`,
    });
  };

  const handleConfirm = async () => {
    try {
      if (confirmDialog.type === 'approve') {
        const result = await api.reservations.approve(confirmDialog.reservationId);
        toast({ title: result.message || 'Reservation approved and book issued' });
      } else {
        await api.reservations.reject(confirmDialog.reservationId);
        toast({ title: 'Reservation rejected' });
      }
      fetchReservations();
    } catch (err: any) {
      toast({
        title: confirmDialog.type === 'approve' ? 'Approval failed' : 'Rejection failed',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.userName}</span>
          {row.original.userEmail && <span className="text-xs text-muted-foreground">{row.original.userEmail}</span>}
        </div>
      )
    },
    {
      accessorKey: 'bookTitle',
      header: 'Book',
      cell: ({ row }) => <span className="font-medium">{row.original.bookTitle}</span>
    },
    { accessorKey: 'reservationDate', header: 'Reserved', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.reservationDate)}</span> },
    { accessorKey: 'notifiedAt', header: 'Notified', cell: ({ row }) => <span className="tabular-nums">{row.original.notifiedAt ? formatDate(row.original.notifiedAt) : '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status.toUpperCase()} /> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => {
        const canAct = ['pending', 'notified'].includes(row.original.status);
        return canAct ? (
          <div className="flex gap-1">
            <button
              onClick={() => handleApproveClick(row.original)}
              className="p-1.5 text-success hover:bg-muted rounded transition-colors"
              title="Approve & Issue"
            >
              <Check size={15} />
            </button>
            <button
              onClick={() => handleRejectClick(row.original)}
              className="p-1.5 text-destructive hover:bg-muted rounded transition-colors"
              title="Reject"
            >
              <X size={15} />
            </button>
          </div>
        ) : null;
      },
    },
  ];

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-8 text-destructive">Error: {error}<button onClick={fetchReservations} className="ml-4 text-accent underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Reservations</h1><p className="text-muted-foreground text-sm">Manage book reservations</p></div>
      <DataTable title="All Reservations" data={reservations} columns={columns} searchPlaceholder="Search by user or book..." />
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
        confirmVariant={confirmDialog.type === 'reject' ? 'destructive' : 'default'}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default Reservations;
