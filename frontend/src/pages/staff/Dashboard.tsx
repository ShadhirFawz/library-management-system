import { Users, BookOpen, ShoppingCart, AlertCircle, LifeBuoy, UserCheck } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import { mockUsers, mockBooks, mockBorrowOrders, getUserName, getBookByBookCopyId } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { useEffect, useState } from 'react';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const totalUsers = mockUsers.length;
  const activeMembers = mockUsers.filter(u => u.role === 'MEMBER' && u.status === 'ACTIVE').length;
  const totalBooks = mockBooks.length;
  const availableCopies = mockBooks.reduce((s, b) => s + b.availableCopies, 0);
  const overdueOrders = mockBorrowOrders.filter(o => o.status === 'OVERDUE').length;
  const recentBorrows = mockBorrowOrders.slice(0, 5);
  const api = useApi();
  const [openTickets, setOpenTickets] = useState(0);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.tickets.getAll();
        const tickets = res?.tickets || [];
        const pending = tickets.filter((t: any) => String(t.status || '').toLowerCase() === 'pending');
        setOpenTickets(pending.length);
        setRecentTickets(tickets.slice(0, 5));
      } catch (err) {
        setOpenTickets(0);
        setRecentTickets([]);
      }
    })();
  }, []);

  const borrowCols: ColumnDef<typeof recentBorrows[0]>[] = [
    { accessorKey: 'userId', header: 'User', cell: ({ row }) => getUserName(row.original.userId) },
    { accessorKey: 'bookCopyId', header: 'Book', cell: ({ row }) => getBookByBookCopyId(row.original.bookCopyId).title },
    { accessorKey: 'dueDate', header: 'Due Date' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  const ticketCols: ColumnDef<typeof recentTickets[0]>[] = [
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon={<Users className="h-6 w-6" />} />
        <StatCard title="Active Members" value={activeMembers} icon={<UserCheck className="h-6 w-6" />} color="text-success" />
        <StatCard title="Total Books" value={totalBooks} icon={<BookOpen className="h-6 w-6" />} />
        <StatCard title="Available Copies" value={availableCopies} icon={<BookOpen className="h-6 w-6" />} color="text-accent" />
        <StatCard title="Overdue Orders" value={overdueOrders} icon={<ShoppingCart className="h-6 w-6" />} color="text-destructive" />
        <StatCard title="Open Tickets" value={openTickets} icon={<LifeBuoy className="h-6 w-6" />} color="text-accent" />
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/staff/orders')} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">New Borrow Order</button>
        <button onClick={() => navigate('/staff/books')} className="px-4 py-2 bg-accent text-accent-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Add Book</button>
        <button onClick={() => navigate('/staff/users')} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Manage Users</button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable title="Recent Borrowings" data={recentBorrows} columns={borrowCols} />
        <DataTable title="Recent Tickets" data={recentTickets} columns={ticketCols} />
      </div>
    </div>
  );
};

export default StaffDashboard;
