import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import { mockUserMemberships, mockMemberships } from '@/data/mockData';

const MyMembership = () => {
  const { user } = useAuth();
  const uid = user?._id || 'usr3';
  const myMembership = mockUserMemberships.find(m => m.userId === uid);
  const plan = myMembership ? mockMemberships.find(m => m._id === myMembership.membershipId) : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">My Membership</h1><p className="text-muted-foreground text-sm">View and manage your membership</p></div>

      {myMembership && plan ? (
        <div className="bg-card border border-border rounded p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{plan.name} Plan</h2>
            <StatusBadge status={myMembership.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Start Date:</span> <span className="tabular-nums">{myMembership.startDate}</span></div>
            <div><span className="text-muted-foreground">Expiry Date:</span> <span className="tabular-nums">{myMembership.expiryDate}</span></div>
            <div><span className="text-muted-foreground">Borrow Limit:</span> {plan.maxBorrowLimit} books</div>
            <div><span className="text-muted-foreground">Borrow Duration:</span> {plan.borrowDurationDays} days</div>
            <div><span className="text-muted-foreground">Fine Per Day:</span> ${plan.finePerDay.toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded p-6 text-center text-muted-foreground">No active membership found.</div>
      )}

      <h3 className="text-lg font-semibold">Available Plans</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {mockMemberships.map(m => (
          <div key={m._id} className={`bg-card border rounded p-5 space-y-3 ${m._id === myMembership?.membershipId ? 'border-accent' : 'border-border'}`}>
            <h4 className="font-bold">{m.name}</h4>
            <p className="text-xs text-muted-foreground">{m.description}</p>
            <ul className="text-sm space-y-1">
              <li>Borrow up to <strong>{m.maxBorrowLimit}</strong> books</li>
              <li><strong>{m.borrowDurationDays}</strong> day duration</li>
              <li>${m.finePerDay.toFixed(2)}/day fine</li>
              <li>{m.membershipDurationMonths} month validity</li>
            </ul>
            {m._id === myMembership?.membershipId ? (
              <span className="block text-xs text-accent font-semibold">Current Plan</span>
            ) : (
              <button className="w-full px-3 py-1.5 border border-border rounded text-sm font-medium hover:bg-muted transition-colors">Upgrade</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyMembership;
