import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, User, CreditCard,
  ShoppingCart, Calendar, AlertCircle, LifeBuoy,
  LogOut, Menu, X, Search, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const memberMenu = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/member/dashboard' },
  { label: 'Browse Catalog', icon: BookOpen, path: '/member/catalog' },
  { label: 'My Profile', icon: User, path: '/member/profile' },
  { label: 'My Membership', icon: CreditCard, path: '/member/membership' },
  { label: 'My Borrowings', icon: ShoppingCart, path: '/member/borrowings' },
  { label: 'My Reservations', icon: Calendar, path: '/member/reservations' },
  { label: 'My Fines', icon: AlertCircle, path: '/member/fines' },
  { label: 'Support', icon: LifeBuoy, path: '/member/support' },
  { label: 'FAQ', icon: LifeBuoy, path: '/member/articles' },
];

const MemberLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar - desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <span className="text-xl font-bold tracking-tight">LibraManage</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-4 px-3 space-y-1">
          {memberMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded transition-colors duration-150 ${isActive ? 'bg-accent text-accent-foreground' : 'text-primary-foreground/80 hover:bg-sidebar-accent'}`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex justify-around py-2 lg:hidden">
        {memberMenu.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex flex-col items-center text-xs ${isActive ? 'text-accent' : 'text-muted-foreground'}`}
          >
            <item.icon className="h-5 w-5 mb-0.5" />
            {item.label.replace('My ', '')}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2"><Menu className="h-6 w-6" /></button>
          <div className="flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="search" placeholder="Search..." className="w-full bg-background border border-border pl-10 pr-4 py-2 text-sm rounded focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Member</p>
              </div>
              <div className="h-10 w-10 bg-accent rounded flex items-center justify-center text-accent-foreground font-bold text-sm">
                {user?.fullName?.split(' ').map(n => n[0]).join('')}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-semibold">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-destructive hover:bg-muted transition-colors">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8" onClick={() => setDropdownOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
