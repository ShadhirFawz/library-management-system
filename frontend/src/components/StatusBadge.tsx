interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'role' | 'priority';
}

const colorMap: Record<string, string> = {
  // Status
  ACTIVE: 'bg-success/10 text-success border-success/20',
  AVAILABLE: 'bg-success/10 text-success border-success/20',
  RETURNED: 'bg-success/10 text-success border-success/20',
  FULFILLED: 'bg-success/10 text-success border-success/20',
  PAID: 'bg-success/10 text-success border-success/20',
  RESOLVED: 'bg-success/10 text-success border-success/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',

  SUSPENDED: 'bg-destructive/10 text-destructive border-destructive/20',
  OVERDUE: 'bg-destructive/10 text-destructive border-destructive/20',
  LOST: 'bg-destructive/10 text-destructive border-destructive/20',
  DAMAGED: 'bg-destructive/10 text-destructive border-destructive/20',
  UNPAID: 'bg-destructive/10 text-destructive border-destructive/20',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  EXPIRED: 'bg-destructive/10 text-destructive border-destructive/20',

  BORROWED: 'bg-accent/10 text-accent border-accent/20',
  PENDING: 'bg-destructive/10 text-destructive border-destructive/20',
  IN_PROGRESS: 'bg-accent/10 text-accent border-accent/20',
  OPEN: 'bg-accent/10 text-accent border-accent/20',

  // Roles
  ADMIN: 'bg-primary/10 text-primary border-primary/20',
  LIBRARIAN: 'bg-success/10 text-success border-success/20',
  MEMBER: 'bg-muted text-muted-foreground border-border',

  // Priority
  LOW: 'bg-muted text-muted-foreground border-border',
  MEDIUM: 'bg-accent/10 text-accent border-accent/20',
  HIGH: 'bg-destructive/10 text-destructive border-destructive/20',
  URGENT: 'bg-destructive text-destructive-foreground border-destructive',
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const key = String(status || '').toUpperCase();
  const classes = colorMap[key] ?? 'bg-muted text-muted-foreground border-border';
  const label = String(status || '').replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded border ${classes}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
