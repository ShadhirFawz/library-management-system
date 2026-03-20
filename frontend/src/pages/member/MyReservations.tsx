import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { X } from 'lucide-react';

interface Reservation {
  _id: string;
  userId: string;
  bookId: string;
  reservationDate: string;
  status: 'pending' | 'notified' | 'fulfilled' | 'cancelled' | 'expired';
  notifiedAt?: string;
}

const MyReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const { toast } = useToast();

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await api.reservations.getMy();
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

  const handleCancel = async (id: string) => {
    try {
      await api.reservations.cancel(id);
      toast({ title: 'Reservation cancelled' });
      fetchReservations();
    } catch (err: any) {
      toast({ title: 'Failed to cancel', description: err.message, variant: 'destructive' });
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ColumnDef<Reservation>[] = [
    { accessorKey: 'bookId', header: 'Book ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.bookId}</span> },
    { accessorKey: 'reservationDate', header: 'Reserved', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.reservationDate)}</span> },
    { accessorKey: 'notifiedAt', header: 'Notified', cell: ({ row }) => <span className="tabular-nums">{row.original.notifiedAt ? formatDate(row.original.notifiedAt) : '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status.toUpperCase()} /> },
    { id: 'actions', header: 'Actions', cell: ({ row }) => ['pending', 'notified'].includes(row.original.status) ? <button onClick={() => handleCancel(row.original._id)} className="p-1.5 text-destructive hover:bg-muted rounded transition-colors" title="Cancel"><X size={15} /></button> : null },
  ];

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-8 text-destructive">Error: {error}<button onClick={fetchReservations} className="ml-4 text-accent underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Reservations</h1><p className="text-muted-foreground text-sm">Track your book reservations</p></div>
      <DataTable title="My Reservations" data={reservations} columns={columns} />
    </div>
  );
};

export default MyReservations;
