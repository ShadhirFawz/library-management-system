import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { mockSupportTickets, SupportTicket } from '@/data/mockData';
import { Plus, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RaiseSupportTicket = () => {
  const { user } = useAuth();
  const uid = user?._id || 'usr3';
  const myTickets = mockSupportTickets.filter(t => t.userId === uid);
  const [createModal, setCreateModal] = useState(false);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<SupportTicket>[] = [
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <StatusBadge status={row.original.priority} /> },
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
        <form onSubmit={e => { e.preventDefault(); toast({ title: 'Ticket created' }); setCreateModal(false); }} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Subject</label><input className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" required /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent">
              <option>Technical</option><option>General</option><option>Billing</option><option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent">
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Message</label><textarea className="w-full border border-border px-3 py-2 rounded text-sm focus:outline-none focus:border-accent" rows={4} required /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Submit</button></div>
        </form>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject || ''} maxWidth="max-w-xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-3"><StatusBadge status={selected.priority} /><StatusBadge status={selected.status} /></div>
            <div className="border border-border rounded p-4 space-y-3 max-h-64 overflow-y-auto bg-muted/30">
              {selected.messages.map(msg => (
                <div key={msg._id} className={`p-3 rounded text-sm ${msg.senderId === uid ? 'bg-accent/10 border border-accent/20' : 'bg-muted'}`}>
                  <p className="font-semibold text-xs mb-1">{msg.senderName} · {new Date(msg.timestamp).toLocaleString()}</p>
                  <p>{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RaiseSupportTicket;
