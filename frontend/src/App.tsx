import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

// Layouts
import StaffLayout from "@/components/layouts/StaffLayout";
import MemberLayout from "@/components/layouts/MemberLayout";

// Public pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

// Staff pages
import StaffDashboard from "@/pages/staff/Dashboard";
import UserManagement from "@/pages/staff/UserManagement";
import MembershipPlans from "@/pages/staff/MembershipPlans";
import BookCatalog from "@/pages/staff/BookCatalog";
import Authors from "@/pages/staff/Authors";
import Categories from "@/pages/staff/Categories";
import BookInventory from "@/pages/staff/BookInventory";
import BorrowingOrders from "@/pages/staff/BorrowingOrders";
import StaffReservations from "@/pages/staff/Reservations";
import StaffFines from "@/pages/staff/Fines";
import SupportTickets from "@/pages/staff/SupportTickets";

// Member pages
import MemberDashboard from "@/pages/member/Dashboard";
import BrowseCatalog from "@/pages/member/BrowseCatalog";
import MyProfile from "@/pages/member/MyProfile";
import MyMembership from "@/pages/member/MyMembership";
import MyBorrowings from "@/pages/member/MyBorrowings";
import MyReservations from "@/pages/member/MyReservations";
import MyFines from "@/pages/member/MyFines";
import RaiseSupportTicket from "@/pages/member/RaiseSupportTicket";

const queryClient = new QueryClient();

// Route guards
const RequireAuth = ({ children, roles }: { children: ReactNode; roles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RedirectIfAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'MEMBER' ? '/member/dashboard' : '/staff/dashboard'} replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<RedirectIfAuth><Navigate to="/login" replace /></RedirectIfAuth>} />
    <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
    <Route path="/register" element={<RedirectIfAuth><Register /></RedirectIfAuth>} />

    {/* Staff (Admin + Librarian) */}
    <Route path="/staff" element={<RequireAuth roles={['ADMIN', 'LIBRARIAN']}><StaffLayout /></RequireAuth>}>
      <Route path="dashboard" element={<StaffDashboard />} />
      <Route path="users" element={<UserManagement />} />
      <Route path="memberships" element={<MembershipPlans />} />
      <Route path="books" element={<BookCatalog />} />
      <Route path="authors" element={<Authors />} />
      <Route path="categories" element={<Categories />} />
      <Route path="inventory" element={<BookInventory />} />
      <Route path="orders" element={<BorrowingOrders />} />
      <Route path="reservations" element={<StaffReservations />} />
      <Route path="fines" element={<StaffFines />} />
      <Route path="tickets" element={<SupportTickets />} />
    </Route>

    {/* Member */}
    <Route path="/member" element={<RequireAuth roles={['MEMBER']}><MemberLayout /></RequireAuth>}>
      <Route path="dashboard" element={<MemberDashboard />} />
      <Route path="catalog" element={<BrowseCatalog />} />
      <Route path="profile" element={<MyProfile />} />
      <Route path="membership" element={<MyMembership />} />
      <Route path="borrowings" element={<MyBorrowings />} />
      <Route path="reservations" element={<MyReservations />} />
      <Route path="fines" element={<MyFines />} />
      <Route path="support" element={<RaiseSupportTicket />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
