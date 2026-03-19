import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { mockSupportTickets, getUserName, SupportTicket } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

const SupportTickets = () => {
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const { toast } = useToast();

  const columns: ColumnDef<SupportTicket>[] = [
    { accessorKey: 'userId', header: 'User', cell: ({ row }) => getUserName(row.original.userId) },
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <StatusBadge status={row.original.priority} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'assignedTo', header: 'Assigned To', cell: ({ row }) => row.original.assignedTo ? getUserName(row.original.assignedTo) : '—' },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Support Tickets</h1><p className="text-muted-foreground text-sm">Handle customer inquiries</p></div>
      <div onClick={(e) => {
        const row = (e.target as HTMLElement).closest('tr');
        if (row) {
          const idx = row.getAttribute('data-row-index');
        }
      }}>
        <DataTable
          title="All Tickets"
          data={mockSupportTickets}
          columns={[
            ...columns,
            {
              id: 'view', header: '',
              cell: ({ row }) => (
                <button onClick={() => setSelected(row.original)} className="text-accent text-sm hover:underline">View</button>
              ),
            },
          ]}
        />
      </div>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject || ''} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-3 text-sm">
              <StatusBadge status={selected.priority} />
              <StatusBadge status={selected.status} />
              <span className="text-muted-foreground">Category: {selected.category}</span>
            </div>
            <div className="border border-border rounded p-4 space-y-3 max-h-64 overflow-y-auto bg-muted/30">
              {selected.messages.map(msg => (
                <div key={msg._id} className={`p-3 rounded text-sm ${msg.senderId === selected.userId ? 'bg-muted' : 'bg-accent/10 border border-accent/20'}`}>
                  <p className="font-semibold text-xs mb-1">{msg.senderName} · {new Date(msg.timestamp).toLocaleString()}</p>
                  <p>{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
              />
              <button
                onClick={() => { if (reply.trim()) { toast({ title: 'Reply sent' }); setReply(''); } }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportTickets;
