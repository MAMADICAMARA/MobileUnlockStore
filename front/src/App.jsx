import { Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLayout from "./components/layout/AdminLayout";
import ClientLayout from "./components/layout/ClientLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminRechargeUserPage from "./pages/admin/AdminRechargeUserPage";
import DashboardPage from "./pages/client/DashboardPage";

// Importation des pages de l'espace employé
import EmployeeWorksPage from './pages/employee/EmployeeWorksPage';
import EmployeeDashboardPage from './pages/employee/EmployeeDashboardPage';

// Importation des pages de l'espace client
import OrdersPage from './pages/client/OrdersPage';
import LicensesPage from './pages/client/LicensesPage';
import SupportPage from './pages/client/SupportPage';
import AddFundsPage from './pages/client/AddFundsPage';
import ProfilePage from './pages/client/ProfilePage';
import TicketsPage from './pages/client/TicketsPage';
import OrdersHistoryPage from './pages/client/OrdersHistoryPage';

// Importation des pages de l'espace admin
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminLicensesPage from './pages/admin/AdminLicensesPage';
import AdminRemotePage from './pages/admin/AdminRemotePage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminContentPage from './pages/admin/AdminContentPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminAdminsPage from './pages/admin/AdminAdminsPage';
import AdminChangeRolePage from './pages/admin/AdminChangeRolePage';
import AdminSearchOrderPage from './pages/admin/AdminSearchOrderPage';
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  // Redirection basée sur le rôle
  if (role && user.role !== role) {
    if (user.role === 'utilisateur-employer') {
      return <Navigate to="/employee/dashboard" replace />;
    } else if (user.role === 'client') {
      return <Navigate to="/client/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <NotificationProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes protégées pour l'espace employé */}
        <Route path="/employee" element={
          <ProtectedRoute role="utilisateur-employer">
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<EmployeeDashboardPage />} />
          <Route path="dashboard" element={<EmployeeDashboardPage />} />
          <Route path="works" element={<EmployeeWorksPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders-history" element={<OrdersHistoryPage />} />
          <Route path="licenses" element={<LicensesPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="add-funds" element={<AddFundsPage />} />
        </Route>

        {/* Routes protégées pour l'espace client */}
        <Route path="/client" element={
          <ProtectedRoute role="client">
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders-history" element={<OrdersHistoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="licenses" element={<LicensesPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="add-funds" element={<AddFundsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tickets" element={<TicketsPage />} />
        </Route>

        {/* Routes protégées pour l'espace admin */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="search-order" element={<AdminSearchOrderPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="licenses" element={<AdminLicensesPage />} />
          <Route path="remote" element={<AdminRemotePage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route path="admins" element={<AdminAdminsPage />} />
          <Route path="recharge" element={<AdminRechargeUserPage />} />
          <Route path="change-role" element={<AdminChangeRolePage />} />
          <Route path="employees" element={<AdminEmployeesPage />} />
        </Route>
      </Routes>
    </NotificationProvider>
  );
}

export default App;
