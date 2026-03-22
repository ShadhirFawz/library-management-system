import { BookOpen, ShoppingCart, Calendar, AlertCircle, LifeBuoy } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { DataTable } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { mockBorrowOrders, mockReservations, mockFines, mockSupportTickets, mockUserMemberships, mockMemberships, getBookByBookCopyId } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { BorrowOrder } from '@/data/mockData';

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?._id || 'usr3';

  const myMembership = mockUserMemberships.find(m => m.userId === uid);
  const membershipName = myMembership ? mockMemberships.find(m => m._id === myMembership.membershipId)?.name : 'None';
  const myBorrows = mockBorrowOrders.filter(o => o.userId === uid);
  const myReservations = mockReservations.filter(r => r.userId === uid);
  const myFines = mockFines.filter(f => f.userId === uid && f.status === 'UNPAID');
  const myTickets = mockSupportTickets.filter(t => t.userId === uid && String(t.status || '').toLowerCase() === 'pending');

  const borrowCols: ColumnDef<BorrowOrder>[] = [
    { accessorKey: 'bookCopyId', header: 'Book', cell: ({ row }) => getBookByBookCopyId(row.original.bookCopyId).title },
    { accessorKey: 'dueDate', header: 'Due Date' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-card border border-border rounded p-6">
        <h1 className="text-2xl font-bold mb-1">Welcome, {user?.fullName || 'Member'}!</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Membership: <strong className="text-foreground">{membershipName}</strong></span>
          {myMembership && (
            <>
              <span>Status: <StatusBadge status={myMembership.status} /></span>
              <span>Expires: <strong className="text-foreground tabular-nums">{myMembership.expiryDate}</strong></span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Books Borrowed" value={myBorrows.filter(b => b.status === 'BORROWED').length} icon={<ShoppingCart className="h-6 w-6" />} />
        <StatCard title="Reservations" value={myReservations.filter(r => r.status === 'PENDING').length} icon={<Calendar className="h-6 w-6" />} color="text-accent" />
        <StatCard title="Pending Fines" value={`$${myFines.reduce((s, f) => s + f.amount, 0).toFixed(2)}`} icon={<AlertCircle className="h-6 w-6" />} color="text-destructive" />
        <StatCard title="Open Tickets" value={myTickets.length} icon={<LifeBuoy className="h-6 w-6" />} color="text-accent" />
      </div>

      <button onClick={() => navigate('/member/catalog')} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
        <BookOpen size={18} /> Browse Catalog
      </button>

      <DataTable title="My Recent Borrowings" data={myBorrows.slice(0, 5)} columns={borrowCols} />
    </div>
  );
};

export default MemberDashboard;
