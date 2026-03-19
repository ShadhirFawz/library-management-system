import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { mockFines, Fine } from '@/data/mockData';

const MyFines = () => {
  const { user } = useAuth();
  const data = mockFines.filter(f => f.userId === (user?._id || 'usr3'));

  const columns: ColumnDef<Fine>[] = [
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => <span className="tabular-nums font-semibold">${row.original.amount.toFixed(2)}</span> },
    { accessorKey: 'reason', header: 'Reason' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'issuedDate', header: 'Issued', cell: ({ row }) => <span className="tabular-nums">{row.original.issuedDate}</span> },
    { accessorKey: 'paidDate', header: 'Paid', cell: ({ row }) => <span className="tabular-nums">{row.original.paidDate || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Fines</h1><p className="text-muted-foreground text-sm">View outstanding and past fines</p></div>
      <DataTable title="My Fines" data={data} columns={columns} />
    </div>
  );
};

export default MyFines;
