import { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { getUserName, SupportTicket } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { Send, Loader } from 'lucide-react';

const SupportTickets = () => {
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const api = useApi();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.tickets.getAll();
      setTickets(data.tickets || []);
    } catch (err) {
      toast({ title: 'Failed to load tickets', variant: 'destructive' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<SupportTicket>[] = [
    { accessorKey: 'subject', header: 'Subject' },
    { id: 'raisedBy', header: 'Raised By', cell: ({ row }) => row.original.raisedByName || 'Unknown' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
  ];

  const visibleTickets = useMemo(() => {
    // Show all tickets to staff (ADMIN and LIBRARIAN)
    // Sort: pending first, in-progress/open next, resolved last. Newer first within same status.
    const order = (status?: string) => {
      const s = String(status || '').toLowerCase();
      if (s === 'pending') return 0;
      if (s === 'in_progress' || s === 'in-progress' || s === 'inprogress' || s === 'open') return 1;
      if (s === 'resolved') return 2;
      return 1;
    };

    const sorted = [...tickets].sort((a, b) => {
      const oa = order(a.status);
      const ob = order(b.status);
      if (oa !== ob) return oa - ob;
      // same group: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sorted;
  }, [tickets, user]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Support Tickets</h1><p className="text-muted-foreground text-sm">Handle customer inquiries</p></div>
      {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader className="h-4 w-4 animate-spin" /> Loading tickets...</div>}
      {!loading && (
      <div onClick={(e) => {
        const row = (e.target as HTMLElement).closest('tr');
        if (row) {
          const idx = row.getAttribute('data-row-index');
        }
      }}>
        <DataTable
          title={user?.role === 'LIBRARIAN' ? 'Awaiting Tickets' : 'All Tickets'}
          data={visibleTickets}
          rowClass={(row) => {
            const s = String(row.status || '').toLowerCase();
            if (s === 'pending') return 'bg-destructive/5';
            if (s === 'resolved') return 'bg-success/5';
            return '';
          }}
          columns={[
            ...columns,
            {
              id: 'view', header: '',
              cell: ({ row }) => (
                <button onClick={() => setSelected(tickets.find(t => t._id === row.original._id) ?? row.original)} className="text-accent text-sm hover:underline">View</button>
              ),
            },
          ]}
        />
      </div>
      )}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject || ''} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm"><strong>From:</strong> {selected.raisedByName || 'Unknown'}</p>
              <p className="text-sm"><strong>Status:</strong> <StatusBadge status={selected.status} /></p>
              <p className="text-sm text-muted-foreground">Created: {new Date(selected.createdAt).toLocaleString()}</p>
            </div>
            <div className="border-t border-border pt-4">
              <p><strong>Description:</strong></p>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{selected.description}</p>
            </div>
            {selected.adminResponse && (
              <div className="border-t border-border pt-4 bg-accent/5 p-3 rounded">
                <p><strong>Response:</strong> {selected.respondedByName || 'Staff'}</p>
                <p className="text-sm mt-2 whitespace-pre-wrap">{selected.adminResponse}</p>
              </div>
            )}
            {(!selected.adminResponse || selected.status !== 'resolved') && (
              <div className="flex gap-2 border-t border-border pt-4">
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder={user?.role === 'LIBRARIAN' ? 'Type your response...' : 'Add a message...'}
                  className="flex-1 border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent"
                />
                <button
                  onClick={async () => {
                    if (!reply.trim() || !selected) return;
                    setSending(true);
                      try {
                      await api.tickets.respond(selected._id, reply.trim(), 'resolved');
                      toast({ title: 'Response sent' });
                      setReply('');
                      await loadTickets();
                      setSelected(null);
                    } catch (err) {
                      toast({ title: 'Failed to send reply', variant: 'destructive' });
                      console.error(err);
                    } finally {
                      setSending(false);
                    }
                  }}
                  disabled={sending || !reply.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportTickets;
