import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { NotificationPrompt } from './components/ui/NotificationPrompt';

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
  </div>
);

// Lazy load all page components for code-splitting
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const LogisticsPage = lazy(() => import('./features/logistics/LogisticsPage').then(m => ({ default: m.LogisticsPage })));
const LogisticsCompaniesPage = lazy(() => import('./features/logistics/LogisticsCompaniesPage').then(m => ({ default: m.LogisticsCompaniesPage })));
const ProductsPage = lazy(() => import('./features/products/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ShipmentsPage = lazy(() => import('./features/shipments/ShipmentsPage').then(m => ({ default: m.ShipmentsPage })));
const SuppliersPage = lazy(() => import('./features/suppliers/SuppliersPage').then(m => ({ default: m.SuppliersPage })));
const CustomersPage = lazy(() => import('./features/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const OffersPage = lazy(() => import('./features/offers/OffersPage').then(m => ({ default: m.OffersPage })));
const CreateOfferPage = lazy(() => import('./features/offers/CreateOfferPage').then(m => ({ default: m.CreateOfferPage })));
const DealsPage = lazy(() => import('./features/deals/DealsPage').then(m => ({ default: m.DealsPage })));
const MeetingsPage = lazy(() => import('./features/meetings/MeetingsPage').then(m => ({ default: m.MeetingsPage })));
const TasksPage = lazy(() => import('./features/tasks/TasksPage').then(m => ({ default: m.TasksPage })));
const ProformasPage = lazy(() => import('./features/proformas/ProformasPage').then(m => ({ default: m.ProformasPage })));
const ProformaViewPage = lazy(() => import('./features/proformas/ProformaViewPage').then(m => ({ default: m.ProformaViewPage })));
const ProfitLossPage = lazy(() => import('./features/finance/ProfitLossPage').then(m => ({ default: m.ProfitLossPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Main Routes */}
              <Route path="/" element={
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              } />
              <Route path="/customers" element={
                <DashboardLayout>
                  <CustomersPage />
                </DashboardLayout>
              } />
              <Route path="/products" element={
                <DashboardLayout>
                  <ProductsPage />
                </DashboardLayout>
              } />
              <Route path="/offers" element={
                <DashboardLayout>
                  <OffersPage />
                </DashboardLayout>
              } />
              <Route path="/offers/new" element={
                <DashboardLayout>
                  <CreateOfferPage />
                </DashboardLayout>
              } />
              <Route path="/offers/:id/edit" element={
                <DashboardLayout>
                  <CreateOfferPage />
                </DashboardLayout>
              } />
              <Route path="/deals" element={
                <DashboardLayout>
                  <DealsPage />
                </DashboardLayout>
              } />
              <Route path="/meetings" element={
                <DashboardLayout>
                  <MeetingsPage />
                </DashboardLayout>
              } />
              <Route path="/tasks" element={
                <DashboardLayout>
                  <TasksPage />
                </DashboardLayout>
              } />
              <Route path="/proformas" element={
                <DashboardLayout>
                  <ProformasPage />
                </DashboardLayout>
              } />
              <Route path="/proformas/:id" element={
                <DashboardLayout>
                  <ProformaViewPage />
                </DashboardLayout>
              } />
              <Route path="/shipments" element={
                <DashboardLayout>
                  <ShipmentsPage />
                </DashboardLayout>
              } />
              <Route path="/suppliers" element={
                <DashboardLayout>
                  <SuppliersPage />
                </DashboardLayout>
              } />
              <Route path="/logistics" element={
                <DashboardLayout>
                  <LogisticsPage />
                </DashboardLayout>
              } />
              <Route path="/logistics-companies" element={
                <DashboardLayout>
                  <LogisticsCompaniesPage />
                </DashboardLayout>
              } />
              <Route path="/profit-loss" element={
                <DashboardLayout>
                  <ProfitLossPage />
                </DashboardLayout>
              } />
              <Route path="/settings" element={
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <NotificationPrompt />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
