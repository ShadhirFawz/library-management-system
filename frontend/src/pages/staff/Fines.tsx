import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { mockFines, getUserName, Fine } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

const Fines = () => {
  const { toast } = useToast();

  const columns: ColumnDef<Fine>[] = [
    { accessorKey: 'userId', header: 'User', cell: ({ row }) => getUserName(row.original.userId) },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="tabular-nums font-semibold">${row.original.amount.toFixed(2)}</span> },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'issuedDate', header: 'Issued', cell: ({ row }) => <span className="tabular-nums">{row.original.issuedDate}</span> },
    { accessorKey: 'paidDate', header: 'Paid', cell: ({ row }) => <span className="tabular-nums">{row.original.paidDate || '—'}</span> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => row.original.status === 'UNPAID' ? (
        <button onClick={() => toast({ title: 'Fine marked as paid' })} className="p-1.5 text-success hover:bg-muted rounded transition-colors" title="Mark Paid"><CheckCircle size={15} /></button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Fines</h1><p className="text-muted-foreground text-sm">Track and manage overdue fines</p></div>
      <DataTable title="All Fines" data={mockFines} columns={columns} />
    </div>
  );
};

export default Fines;
