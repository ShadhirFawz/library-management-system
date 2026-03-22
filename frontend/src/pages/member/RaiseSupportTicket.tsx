import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { SupportTicket } from '@/data/mockData';
import { useApi } from '@/hooks/useApi';
import { Plus, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RaiseSupportTicket = () => {
  const { user } = useAuth();
  const uid = user?._id || 'usr3';
  const api = useApi();
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const data = await api.tickets.getMy();
        const tickets = data?.tickets || [];
        const sorted = tickets.sort((a: any, b: any) => {
          const sa = String(a.status || '').toLowerCase();
          const sb = String(b.status || '').toLowerCase();
          const order = (s: string) => (s === 'pending' ? 0 : 1);
          if (order(sa) !== order(sb)) return order(sa) - order(sb);
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setMyTickets(sorted);
      } catch (err) {
        console.error('Failed to load tickets', err);
      }
    })();
  }, []);
  const [createModal, setCreateModal] = useState(false);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<SupportTicket>[] = [
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'category', header: 'Category' },
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

      <DataTable title="My Tickets" data={myTickets} columns={columns} />

      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Raise Support Ticket">
        <form onSubmit={async (e) => {
          e.preventDefault();
          const target = e.target as any;
          const subject = target.subject?.value || '';
          const category = target.category?.value || 'General';
          const message = target.message?.value || '';
          try {
            await api.tickets.create({ subject, description: message, category });
            toast({ title: 'Ticket created' });
            setCreateModal(false);
            const data = await api.tickets.getMy();
            const tickets = data?.tickets || [];
            const sorted = tickets.sort((a: any, b: any) => {
              const sa = String(a.status || '').toLowerCase();
              const sb = String(b.status || '').toLowerCase();
              const order = (s: string) => (s === 'pending' ? 0 : 1);
              if (order(sa) !== order(sb)) return order(sa) - order(sb);
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setMyTickets(sorted);
          } catch (err) {
            console.error(err);
            toast({ title: 'Failed to create ticket', variant: 'destructive' });
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="category" defaultValue="General" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent">
              <option>General</option>
              <option>Technical</option>
              <option>Billing</option>
              <option>Other</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Subject</label><input name="subject" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div><label className="block text-sm font-medium mb-1">Message</label><textarea name="message" className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" rows={4} required /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Submit</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject || ''} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-4">
              <div className="flex gap-3"><StatusBadge status={selected.status} /></div>
            <div className="border border-border rounded p-4 space-y-3 max-h-64 overflow-y-auto bg-muted/30">
              {(selected.messages || []).map(msg => (
                <div key={msg._id} className={`p-3 rounded text-sm ${msg.senderId === uid ? 'bg-accent/10 border border-accent/20' : 'bg-muted'}`}>
                  <p className="font-semibold text-xs mb-1">{msg.senderName} · {new Date(msg.timestamp).toLocaleString()}</p>
                  <p>{msg.message}</p>
                </div>
              ))}
              {!selected.messages && selected.description && (
                <div className="p-3 rounded text-sm bg-muted">
                  <p>{selected.description}</p>
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
