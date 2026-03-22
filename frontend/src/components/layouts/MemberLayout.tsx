import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, User, CreditCard,
  ShoppingCart, Calendar, AlertCircle, LifeBuoy,
  LogOut, Search, Home, BookMarked, Clock,
  AlertTriangle, ChevronRight, Menu, X, UserCircle, HelpCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';

const MemberLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const { user, logout, updateCurrentUser } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

  useEffect(() => {
    setAvatarImageError(false);
  }, [user?.profileImage]);

  useEffect(() => {
    if (!user?._id) return;

    let mounted = true;

    const syncProfile = async () => {
      try {
        const profile = await api.users.getProfile();
        if (!mounted || !profile) return;

        updateCurrentUser({
          fullName: profile.fullName || user.fullName,
          email: profile.email || user.email,
          profileImage: profile.profileImage || '',
        });
      } catch {
        // Ignore profile sync errors in layout
      }
    };

    syncProfile();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Quick action cards for dashboard
  const quickActions = [
    { label: 'Browse Catalog', icon: BookOpen, path: '/member/catalog', color: 'bg-blue-500', description: 'Find your next read' },
    { label: 'My Borrowings', icon: ShoppingCart, path: '/member/borrowings', color: 'bg-green-500', description: 'View current loans' },
    { label: 'My Reservations', icon: Calendar, path: '/member/reservations', color: 'bg-purple-500', description: 'Check holds' },
    { label: 'My Fines', icon: AlertCircle, path: '/member/fines', color: 'bg-red-500', description: 'Pay outstanding fees' },
    { label: 'Help & Support', icon: LifeBuoy, path: '/member/articles', color: 'bg-orange-500', description: 'FAQs and assistance' },
  ];

  // Navigation items for mobile menu
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/member/dashboard' },
    { label: 'Browse Catalog', icon: BookOpen, path: '/member/catalog' },
    { label: 'My Profile', icon: User, path: '/member/profile' },
    { label: 'My Membership', icon: CreditCard, path: '/member/membership' },
    { label: 'My Borrowings', icon: ShoppingCart, path: '/member/borrowings' },
    { label: 'My Reservations', icon: Calendar, path: '/member/reservations' },
    { label: 'My Fines', icon: AlertCircle, path: '/member/fines' },
    { label: 'FAQs', icon: HelpCircle, path: '/member/articles' },
    { label: 'Support', icon: LifeBuoy, path: '/member/articles', isDuplicate: true },
  ];

  // Check if current path is dashboard to show quick actions
  const isDashboard = location.pathname === '/member/dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex-shrink-0 ml-2 lg:ml-0">
                <h1 
                  onClick={() => navigate('/member/dashboard')} 
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition"
                >
                  LibraManage
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Member Portal</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search for books, authors, or genres..."
                  className="w-full bg-gray-50 border border-gray-300 pl-10 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate('/member/catalog');
                    }
                  }}
                />
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
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
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/member/profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserCircle className="h-4 w-4 mr-3" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/member/articles');
                          setProfileDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <HelpCircle className="h-4 w-4 mr-3" />
                        FAQs & Support
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <nav className="p-4 space-y-1">
              {navItems.filter((item, index, self) => 
                index === self.findIndex((i) => i.path === item.path && i.label === item.label)
              ).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions - Only show on dashboard */}
        {isDashboard && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                >
                  <div className={`${action.color} p-5 text-white`}>
                    <action.icon className="h-8 w-8 mb-2" />
                    <p className="text-base font-semibold">{action.label}</p>
                    <p className="text-xs opacity-90 mt-1">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Page Content */}
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 lg:hidden z-30">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center px-3 py-1 rounded-lg transition ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.label.replace('My ', '').replace(' & Support', '')}</span>
          </NavLink>
        ))}
      </nav>

      {/* Floating Help Button for Quick Access to FAQs (Optional) */}
      {!isDashboard && (
        <button
          onClick={() => navigate('/member/articles')}
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-20 lg:hidden"
        >
          <HelpCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default MemberLayout;