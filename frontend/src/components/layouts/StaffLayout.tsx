import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, UserCheck,
  Tags, Package, ShoppingCart, Calendar,
  AlertCircle, LifeBuoy, LogOut, Menu, X, Search, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'User Management', icon: Users, path: '/staff/users', roles: ['ADMIN'] },
  { label: 'Membership Plans', icon: UserCheck, path: '/staff/memberships', roles: ['ADMIN'] },
  { label: 'Book Catalog', icon: BookOpen, path: '/staff/books', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'Authors', icon: Users, path: '/staff/authors', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'Categories', icon: Tags, path: '/staff/categories', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'Book Inventory', icon: Package, path: '/staff/inventory', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'Borrowing Orders', icon: ShoppingCart, path: '/staff/orders', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'Reservations', icon: Calendar, path: '/staff/reservations', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'Fines', icon: AlertCircle, path: '/staff/fines', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'Support Tickets', icon: LifeBuoy, path: '/staff/tickets', roles: ['ADMIN', 'LIBRARIAN'] },
  { label: 'FAQ', icon: LifeBuoy, path: '/staff/articles', roles: ['ADMIN', 'LIBRARIAN'] },
];

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <span className="text-xl font-bold tracking-tight">LibraManage</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-4 px-3 space-y-1">
          {filteredItems.map((item) => (
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Global search..."
                className="w-full bg-background border border-border pl-10 pr-4 py-2 text-sm rounded focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="h-10 w-10 bg-accent rounded flex items-center justify-center text-accent-foreground font-bold text-sm overflow-hidden">
                {user?.profileImage && !avatarImageError ? (
                  <img
                    src={user.profileImage}
                    alt={user?.fullName || 'Profile'}
                    className="h-full w-full object-cover"
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-semibold">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8" onClick={() => setDropdownOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
