import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface Fine {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  reason: string;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
}

const Fines = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const { toast } = useToast();

  const fetchFines = async () => {
    try {
      setLoading(true);
      const data = await api.fines.getAll();
      setFines(data.fines || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch fines');
      toast({ title: 'Error loading fines', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFines(); }, []);

  const handlePay = async (id: string) => {
    try {
      await api.fines.pay(id);
      toast({ title: 'Fine marked as paid' });
      fetchFines();
    } catch (err: any) {
      toast({ title: 'Payment failed', description: err.message, variant: 'destructive' });
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ColumnDef<Fine>[] = [
    { accessorKey: 'userId', header: 'User ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.userId}</span> },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="tabular-nums font-semibold">${row.original.amount.toFixed(2)}</span> },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'isPaid', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isPaid ? 'PAID' : 'UNPAID'} /> },
    { accessorKey: 'createdAt', header: 'Issued', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.createdAt)}</span> },
    { accessorKey: 'paidAt', header: 'Paid', cell: ({ row }) => <span className="tabular-nums">{row.original.paidAt ? formatDate(row.original.paidAt) : '—'}</span> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => !row.original.isPaid ? (
        <button onClick={() => handlePay(row.original._id)} className="p-1.5 text-success hover:bg-muted rounded transition-colors" title="Mark Paid"><CheckCircle size={15} /></button>
      ) : null,
    },
  ];

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-8 text-destructive">Error: {error}<button onClick={fetchFines} className="ml-4 text-accent underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Fines</h1><p className="text-muted-foreground text-sm">Track and manage overdue fines</p></div>
      <DataTable title="All Fines" data={fines} columns={columns} />
    </div>
  );
};

export default Fines;
