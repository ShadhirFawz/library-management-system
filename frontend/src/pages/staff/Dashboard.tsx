import { useState, useEffect } from 'react';
import { Users, BookOpen, ShoppingCart, AlertCircle, LifeBuoy, UserCheck } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';

interface BorrowStat {
  _id: string;
  userId: string;
  userName?: string;
  bookCopyId: string;
  bookId: string;
  bookTitle?: string;
  dueDate: string;
  status: string;
}

const StaffDashboard = () => {
  const navigate = useNavigate();
  const api = useApi();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMembers: 0,
    totalBooks: 0,
    availableCopies: 0,
    overdueOrders: 0,
    openTickets: 0,
  });
  const [recentBorrows, setRecentBorrows] = useState<BorrowStat[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [usersRes, booksRes, ordersRes, ticketsRes, inventoryRes] = await Promise.all([
          api.users.getAll().catch(() => []),
          api.books.getAll().catch(() => ({ books: [] })),
          api.orders.getAll().catch(() => ({ orders: [] })),
          api.tickets.getAll().catch(() => ({ tickets: [] })),
          api.inventory.getAll().catch(() => ({ copies: [] })),
        ]);

        // User service returns array directly, others return wrapped objects
        const users = Array.isArray(usersRes) ? usersRes : [];
        const books = booksRes?.books || [];
        const orders = ordersRes?.orders || [];
        const tickets = ticketsRes?.tickets || [];
        const copies = inventoryRes?.copies || [];

        // Calculate stats
        const activeMembers = users.filter((u: any) =>
          u.role === 'MEMBER' && u.status?.toLowerCase() === 'active'
        ).length;

        const overdueOrders = orders.filter((o: any) =>
          o.status?.toLowerCase() === 'overdue'
        ).length;

        const openTickets = tickets.filter((t: any) =>
          String(t.status || '').toLowerCase() === 'pending'
        ).length;

        const availableCopies = copies.filter((c: any) =>
          c.status?.toLowerCase() === 'available'
        ).length;

        setStats({
          totalUsers: users.length,
          activeMembers,
          totalBooks: books.length,
          availableCopies,
          overdueOrders,
          openTickets,
        });

        // Get recent borrowings with enriched data
        const recentOrders = orders.slice(0, 5);
        const enrichedBorrows = await Promise.all(
          recentOrders.map(async (order: any) => {
            let userName = 'Unknown User';
            let bookTitle = 'Unknown Book';

            try {
              const user = await api.users.getById(order.userId);
              userName = user?.fullName || user?.email || 'Unknown User';
            } catch (err) {
              console.error('Failed to fetch user:', err);
            }

            try {
              const bookRes = await api.books.getById(order.bookId);
              bookTitle = bookRes?.book?.title || 'Unknown Book';
            } catch (err) {
              console.error('Failed to fetch book:', err);
            }

            return {
              ...order,
              userName,
              bookTitle,
            };
          })
        );

        setRecentBorrows(enrichedBorrows);
        setRecentTickets(tickets.slice(0, 5));

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const borrowCols: ColumnDef<BorrowStat>[] = [
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => <span className="font-medium">{row.original.userName || 'Unknown User'}</span>
    },
    {
      accessorKey: 'bookTitle',
      header: 'Book',
      cell: ({ row }) => <span>{row.original.bookTitle || 'Unknown Book'}</span>
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = new Date(row.original.dueDate);
        return <span className="tabular-nums">{date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status?.toUpperCase() || 'UNKNOWN'} />
    },
  ];

  const ticketCols: ColumnDef<typeof recentTickets[0]>[] = [
    { accessorKey: 'subject', header: 'Subject' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status?.toUpperCase() || 'UNKNOWN'} /> },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-6 w-6" />} />
        <StatCard title="Active Members" value={stats.activeMembers} icon={<UserCheck className="h-6 w-6" />} color="text-success" />
        <StatCard title="Total Books" value={stats.totalBooks} icon={<BookOpen className="h-6 w-6" />} />
        <StatCard title="Available Copies" value={stats.availableCopies} icon={<BookOpen className="h-6 w-6" />} color="text-accent" />
        <StatCard title="Overdue Orders" value={stats.overdueOrders} icon={<ShoppingCart className="h-6 w-6" />} color="text-destructive" />
        <StatCard title="Open Tickets" value={stats.openTickets} icon={<LifeBuoy className="h-6 w-6" />} color="text-accent" />
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/staff/orders')} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">New Borrow Order</button>
        <button onClick={() => navigate('/staff/books')} className="px-4 py-2 bg-accent text-accent-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity">Add Book</button>
        <button onClick={() => navigate('/staff/users')} className="px-4 py-2 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Manage Users</button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DataTable title="Recent Borrowings" data={recentBorrows} columns={borrowCols} showExport={false} />
        <DataTable title="Recent Tickets" data={recentTickets} columns={ticketCols} showExport={false} />
      </div>
    </div>
  );
};

export default StaffDashboard;
