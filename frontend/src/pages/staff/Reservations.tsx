import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

interface Reservation {
  _id: string;
  userId: string;
  bookId: string;
  reservationDate: string;
  status: 'pending' | 'notified' | 'fulfilled' | 'cancelled' | 'expired';
  notifiedAt?: string;
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const { toast } = useToast();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await api.reservations.getAll();
      setReservations(data.reservations || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reservations');
      toast({ title: 'Error loading reservations', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleApprove = async (id: string) => {
    try {
      const result = await api.reservations.approve(id);
      toast({ title: result.message || 'Reservation approved and book issued' });
      fetchReservations();
    } catch (err: any) {
      toast({ title: 'Approval failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.reservations.reject(id);
      toast({ title: 'Reservation rejected' });
      fetchReservations();
    } catch (err: any) {
      toast({ title: 'Rejection failed', description: err.message, variant: 'destructive' });
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ColumnDef<Reservation>[] = [
    { accessorKey: 'userId', header: 'User ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.userId}</span> },
    { accessorKey: 'bookId', header: 'Book ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.bookId}</span> },
    { accessorKey: 'reservationDate', header: 'Reserved', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.reservationDate)}</span> },
    { accessorKey: 'notifiedAt', header: 'Notified', cell: ({ row }) => <span className="tabular-nums">{row.original.notifiedAt ? formatDate(row.original.notifiedAt) : '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status.toUpperCase()} /> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => {
        const canAct = ['pending', 'notified'].includes(row.original.status);
        return canAct ? (
          <div className="flex gap-1">
            <button onClick={() => handleApprove(row.original._id)} className="p-1.5 text-success hover:bg-muted rounded transition-colors" title="Approve & Issue"><Check size={15} /></button>
            <button onClick={() => handleReject(row.original._id)} className="p-1.5 text-destructive hover:bg-muted rounded transition-colors" title="Reject"><X size={15} /></button>
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
      <DataTable title="All Reservations" data={reservations} columns={columns} />
    </div>
  );
};

export default Reservations;
