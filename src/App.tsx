import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CallProvider } from './context/CallContext';
import { ToastProvider } from './components/ui/Toast';

// Pages
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MessagesPage from './pages/MessagesPage';

// Features - Premium components
import { DashboardPage } from './features/dashboard/DashboardPage';
import { DealsPage } from './features/deals/DealsPage';
import { OffersPage } from './features/offers/OffersPage';
import { CreateOfferPage } from './features/offers/CreateOfferPage';
import { ProformasPage } from './features/proformas/ProformasPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { ProductsPage } from './features/products/ProductsPage';
import { SuppliersPage } from './features/suppliers/SuppliersPage';
import { MeetingsPage } from './features/meetings/MeetingsPage';
import { TasksPage } from './features/tasks/TasksPage';
import { ShipmentsPage } from './features/shipments/ShipmentsPage';
import { LogisticsPage } from './features/logistics/LogisticsPage';
import { LogisticsCompaniesPage } from './features/logistics/LogisticsCompaniesPage';


import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1b2735]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-primary selection:bg-accent/30 font-sans">
      <Sidebar /> 
      <main className="flex-1 md:ml-64 p-2 sm:p-4 md:p-8 min-h-screen relative overflow-x-hidden">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/offers/new" element={<CreateOfferPage />} />
          <Route path="/offers/:id/edit" element={<CreateOfferPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/proformas" element={<ProformasPage />} />
          <Route path="/shipments" element={<ShipmentsPage />} />
          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/logistics-companies" element={<LogisticsCompaniesPage />} />
          <Route path="/settings" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sifre-kur" element={<ProfilePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin" element={<Navigate to="/settings" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <CallProvider>
              <AppContent />
            </CallProvider>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;