import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { mockBorrowOrders, getUserName, getBookByBookCopyId, BorrowOrder } from '@/data/mockData';
import { Plus, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BorrowingOrders = () => {
  const [issueModal, setIssueModal] = useState(false);
  const { toast } = useToast();

  const columns: ColumnDef<BorrowOrder>[] = [
    { accessorKey: 'userId', header: 'User', cell: ({ row }) => getUserName(row.original.userId) },
    { accessorKey: 'bookCopyId', header: 'Book', cell: ({ row }) => { const b = getBookByBookCopyId(row.original.bookCopyId); return `${b.title} (${b.barcode})`; } },
    { accessorKey: 'borrowDate', header: 'Borrow Date', cell: ({ row }) => <span className="tabular-nums">{row.original.borrowDate}</span> },
    { accessorKey: 'dueDate', header: 'Due Date', cell: ({ row }) => <span className="tabular-nums">{row.original.dueDate}</span> },
    { accessorKey: 'returnDate', header: 'Return Date', cell: ({ row }) => <span className="tabular-nums">{row.original.returnDate || '—'}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'fineAmount', header: 'Fine', cell: ({ row }) => <span className="tabular-nums">${row.original.fineAmount.toFixed(2)}</span> },
    {
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.status === 'BORROWED' && (
            <>
              <button onClick={() => toast({ title: 'Book returned' })} className="p-1.5 text-success hover:bg-muted rounded transition-colors" title="Return"><RotateCcw size={15} /></button>
              <button onClick={() => toast({ title: 'Marked overdue', variant: 'destructive' })} className="p-1.5 text-destructive hover:bg-muted rounded transition-colors" title="Mark Overdue"><AlertTriangle size={15} /></button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Borrowing Orders</h1><p className="text-muted-foreground text-sm">Manage book borrowings</p></div>
        <button onClick={() => setIssueModal(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={18} />Issue Borrow</button>
      </div>
      <DataTable title="All Orders" data={mockBorrowOrders} columns={columns} />
      <Modal isOpen={issueModal} onClose={() => setIssueModal(false)} title="Issue New Borrow">
        <form onSubmit={e => { e.preventDefault(); toast({ title: 'Borrow issued' }); setIssueModal(false); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">User ID</label><input className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required placeholder="usr3" /></div>
          <div><label className="block text-sm font-medium mb-1">Book Copy Barcode</label><input className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required placeholder="LIB-001-001" /></div>
          <div><label className="block text-sm font-medium mb-1">Due Date</label><input type="date" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setIssueModal(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Issue</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default BorrowingOrders;
