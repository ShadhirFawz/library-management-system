import { BookOpen, ShoppingCart, Calendar, AlertCircle, LifeBuoy } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import LoadingSpinner from '@/components/LoadingSpinner';

interface BorrowStat {
  _id: string;
  bookCopyId: string;
  bookId: string;
  bookTitle?: string;
  dueDate: string;
  status: string;
}

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const api = useApi();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    booksBorrowed: 0,
    reservations: 0,
    pendingFines: 0,
    openTickets: 0,
  });
  const [recentBorrows, setRecentBorrows] = useState<BorrowStat[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [ordersRes, reservationsRes, finesRes, ticketsRes] = await Promise.all([
          api.orders.getMy().catch(() => ({ orders: [] })),
          api.reservations.getMy().catch(() => ({ reservations: [] })),
          api.fines.getMy().catch(() => ({ fines: [] })),
          api.tickets.getMy().catch(() => ({ tickets: [] })),
        ]);

        const orders = ordersRes?.orders || [];
        const reservations = reservationsRes?.reservations || [];
        const fines = finesRes?.fines || [];
        const tickets = ticketsRes?.tickets || [];

        // Calculate stats
        const booksBorrowed = orders.filter((o: any) =>
          o.status?.toLowerCase() === 'borrowed'
        ).length;

        const activeReservations = reservations.filter((r: any) =>
          r.status?.toLowerCase() === 'pending'
        ).length;

        const unpaidFines = fines.filter((f: any) => !f.isPaid);
        const pendingFinesAmount = unpaidFines.reduce((sum: number, f: any) =>
          sum + (f.amount || 0), 0
        );

        const openTicketsCount = tickets.filter((t: any) =>
          String(t.status || '').toLowerCase() === 'pending'
        ).length;

        setStats({
          booksBorrowed,
          reservations: activeReservations,
          pendingFines: pendingFinesAmount,
          openTickets: openTicketsCount,
        });

        // Get recent borrowings with enriched data
        const recentOrders = orders.slice(0, 5);
        const enrichedBorrows = await Promise.all(
          recentOrders.map(async (order: any) => {
            let bookTitle = 'Unknown Book';

            try {
              const bookRes = await api.books.getById(order.bookId);
              bookTitle = bookRes?.book?.title || 'Unknown Book';
            } catch (err) {
              console.error('Failed to fetch book:', err);
            }

            return {
              ...order,
              bookTitle,
            };
          })
        );

        setRecentBorrows(enrichedBorrows);

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
      accessorKey: 'bookTitle',
      header: 'Book',
      cell: ({ row }) => <span className="font-medium">{row.original.bookTitle || 'Unknown Book'}</span>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-card border border-border rounded p-6">
        <h1 className="text-2xl font-bold mb-1">Welcome, {user?.fullName || 'Member'}!</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Membership: <strong className="text-foreground">Student</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Books Borrowed" value={stats.booksBorrowed} icon={<ShoppingCart className="h-6 w-6" />} />
        <StatCard title="Reservations" value={stats.reservations} icon={<Calendar className="h-6 w-6" />} color="text-accent" />
        <StatCard title="Pending Fines" value={`$${stats.pendingFines.toFixed(2)}`} icon={<AlertCircle className="h-6 w-6" />} color="text-destructive" />
        <StatCard title="Open Tickets" value={stats.openTickets} icon={<LifeBuoy className="h-6 w-6" />} color="text-accent" />
      </div>

      <button onClick={() => navigate('/member/catalog')} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
        <BookOpen size={18} /> Browse Catalog
      </button>

      <DataTable title="My Recent Borrowings" data={recentBorrows} columns={borrowCols} showExport={false} />
    </div>
  );
};

export default MemberDashboard;
