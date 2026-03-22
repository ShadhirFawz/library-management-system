import { useState, useEffect } from 'react';
import { ColumnDef } from '@tantml:react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface Fine {
  _id: string;
  orderId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
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
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    fineId: string;
    userName: string;
    amount: number;
  }>({ open: false, fineId: '', userName: '', amount: 0 });
  const api = useApi();
  const { toast } = useToast();

  const fetchFines = async () => {
    try {
      setLoading(true);
      const data = await api.fines.getAll();
      const finesData = data.fines || [];

      // Enrich fines with user names
      const enrichedFines = await Promise.all(
        finesData.map(async (fine: any) => {
          let userName = 'Unknown User';
          let userEmail = '';

          try {
            const user = await api.users.getById(fine.userId);
            userName = user?.fullName || user?.email || 'Unknown User';
            userEmail = user?.email || '';
          } catch (err) {
            console.error('Failed to fetch user:', err);
          }

          return {
            ...fine,
            userName,
            userEmail,
          };
        })
      );

      setFines(enrichedFines);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch fines');
      toast({ title: 'Error loading fines', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFines(); }, []);

  const handlePayClick = (fine: Fine) => {
    setConfirmDialog({
      open: true,
      fineId: fine._id,
      userName: fine.userName || 'Unknown User',
      amount: fine.amount,
    });
  };

  const handlePay = async () => {
    try {
      await api.fines.pay(confirmDialog.fineId);
      toast({ title: 'Fine marked as paid' });
      fetchFines();
    } catch (err: any) {
      toast({ title: 'Payment failed', description: err.message, variant: 'destructive' });
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ColumnDef<Fine>[] = [
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
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="tabular-nums font-semibold">${row.original.amount.toFixed(2)}</span> },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'isPaid', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isPaid ? 'PAID' : 'UNPAID'} /> },
    { accessorKey: 'createdAt', header: 'Issued', cell: ({ row }) => <span className="tabular-nums">{formatDate(row.original.createdAt)}</span> },
    { accessorKey: 'paidAt', header: 'Paid', cell: ({ row }) => <span className="tabular-nums">{row.original.paidAt ? formatDate(row.original.paidAt) : '—'}</span> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => !row.original.isPaid ? (
        <button
          onClick={() => handlePayClick(row.original)}
          className="p-1.5 text-success hover:bg-muted rounded transition-colors"
          title="Mark Paid"
        >
          <CheckCircle size={15} />
        </button>
      ) : null,
    },
  ];

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;
  if (error) return <div className="text-center py-8 text-destructive">Error: {error}<button onClick={fetchFines} className="ml-4 text-accent underline">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Fines</h1><p className="text-muted-foreground text-sm">Track and manage overdue fines</p></div>
      <DataTable title="All Fines" data={fines} columns={columns} searchPlaceholder="Search by user or reason..." />
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="Mark Fine as Paid"
        description={`Are you sure you want to mark the fine of $${confirmDialog.amount.toFixed(2)} for ${confirmDialog.userName} as paid?`}
        confirmText="Mark Paid"
        confirmVariant="default"
        onConfirm={handlePay}
      />
    </div>
  );
};

export default Fines;
