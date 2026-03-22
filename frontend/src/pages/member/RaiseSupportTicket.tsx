import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { SupportTicket } from '@/data/mockData';
import { useApi } from '@/hooks/useApi';
import { Plus, Send, Tag, Clock, MessageSquare, FileText } from 'lucide-react';
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
        const msg = String((err as any)?.message || '');
        if (/not found|404/i.test(msg)) {
          setMyTickets([]);
        } else {
          console.error('Failed to load tickets', err);
        }
      }
    })();
  }, []);

  const [createModal, setCreateModal] = useState(false);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const { toast } = useToast();

  const columns: ColumnDef<SupportTicket>[] = [
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'category', header: 'Category' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'view',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => setSelected(row.original)}
          className="text-accent text-sm font-medium hover:underline underline-offset-2 transition-colors"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Support</h1>
          <p className="text-muted-foreground text-sm">Get help from our team</p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 shadow-sm transition-all active:scale-95"
          aria-label="Create a new support ticket"
        >
          <Plus size={15} strokeWidth={2.5} />
          New Ticket
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border shadow-sm overflow-hidden">
        <DataTable title="My Tickets" data={myTickets} columns={columns} showExport={false} />
      </div>

      {/* Create Ticket Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Raise Support Ticket">
        <form
          onSubmit={async (e) => {
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
          }}
          className="space-y-5 pt-1"
        >
          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Category</label>
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                name="category"
                defaultValue="General"
                className="w-full border border-border pl-8 pr-3 py-2 rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors appearance-none cursor-pointer"
              >
                <option>General</option>
                <option>Technical</option>
                <option>Billing</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Subject</label>
            <input
              name="subject"
              placeholder="Brief summary of your issue"
              className="w-full border border-border px-3 py-2 rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors placeholder:text-muted-foreground/60"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Message</label>
            <textarea
              name="message"
              placeholder="Describe your issue in detail…"
              className="w-full border border-border px-3 py-2 rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-none placeholder:text-muted-foreground/60"
              rows={4}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1 border-t border-border">
            <button
              type="button"
              onClick={() => setCreateModal(false)}
              className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
            >
              <Send size={13} strokeWidth={2.5} />
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* View Ticket Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.subject || ''}
        maxWidth="max-w-xl"
      >
        {selected && (
          <div className="space-y-5 pt-1">
            {/* Meta Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={selected.status} />
              <span className="text-border">·</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Tag size={12} />
                <span>{selected.category || 'General'}</span>
              </div>
              <span className="text-border">·</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={12} />
                <span>{new Date(selected.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Description */}
            <section className="rounded-lg border border-border bg-muted/30 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
                <FileText size={13} className="text-muted-foreground" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</h4>
              </div>
              <div className="px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
                {selected.description}
              </div>
            </section>

            {/* Conversation Thread */}
            {selected.messages && selected.messages.length > 0 && (
              <section className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
                  <MessageSquare size={13} className="text-muted-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Conversation
                  </h4>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {selected.messages.length}
                  </span>
                </div>
                <div className="divide-y divide-border max-h-56 overflow-y-auto">
                  {selected.messages.map((msg) => {
                    const isOwn = msg.senderId === uid;
                    return (
                      <div
                        key={msg._id}
                        className={`px-4 py-3 text-sm ${isOwn ? 'bg-accent/5' : 'bg-background'}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-semibold ${isOwn ? 'text-accent' : 'text-foreground'}`}>
                            {msg.senderName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="leading-relaxed">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Admin Response */}
            {selected.adminResponse && (
              <section className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
                  <MessageSquare size={13} className="text-muted-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Response</h4>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">
                      {selected.respondedByName || selected.respondedBy}
                    </span>
                    {selected.updatedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(selected.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selected.adminResponse}</p>
                </div>
              </section>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RaiseSupportTicket;