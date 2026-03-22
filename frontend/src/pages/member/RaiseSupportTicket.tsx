import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';

const RaiseSupportTicket = () => {
  const { user } = useAuth();
  const uid = user?._id || 'usr3';
  const api = useApi();
  const [tickets, setTickets] = useState<any[]>([]);
  const [createModal, setCreateModal] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadMyTickets();
  }, []);

  const loadMyTickets = async () => {
    try {
      const data = await api.tickets.getMy();
      setTickets(data.tickets || []);
    } catch (err) {
      toast({ title: 'Failed to load tickets', variant: 'destructive' });
      console.error(err);
    }
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString() },
    { id: 'view', header: '', cell: ({ row }) => <button onClick={() => setSelected(row.original)} className="text-accent text-sm hover:underline">View</button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Support</h1><p className="text-muted-foreground text-sm">Get help from our team</p></div>
        <button onClick={() => setCreateModal(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={18} />New Ticket</button>
      </div>

      <DataTable title="My Tickets" data={tickets} columns={columns} />

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Raise Support Ticket">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.tickets.create({ subject, description: message });
              toast({ title: 'Ticket created' });
              setSubject('');
              setMessage('');
              setCreateModal(false);
              await loadMyTickets();
            } catch (err) {
              toast({ title: 'Failed to create ticket', variant: 'destructive' });
              console.error(err);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" rows={4} required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Submit</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject || ''} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-3"><StatusBadge status={selected.status} /></div>
            <div className="border border-border rounded p-4 space-y-3 max-h-64 overflow-y-auto bg-muted/30">
              <p className="text-sm text-muted-foreground">{selected.description}</p>
              {selected.adminResponse && (
                <div className="mt-3 p-3 bg-accent/5 rounded">
                  <p className="font-semibold text-sm">Response</p>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{selected.adminResponse}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RaiseSupportTicket;
