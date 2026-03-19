import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
}

const StatCard = ({ title, value, icon, color = 'text-accent' }: StatCardProps) => (
  <div className="bg-card border border-border rounded p-5 flex items-center gap-4">
    <div className={`h-12 w-12 rounded flex items-center justify-center bg-muted ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  </div>
);

export default StatCard;
