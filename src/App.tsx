import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';

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
const ProformasPage = lazy(() => import('./features/proformas/ProformasPage').then(m => ({ default: m.ProformasPage })));
const ProformaViewPage = lazy(() => import('./features/proformas/ProformaViewPage').then(m => ({ default: m.ProformaViewPage })));
const ProfitLossPage = lazy(() => import('./features/finance/ProfitLossPage').then(m => ({ default: m.ProfitLossPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LoginPage = lazy(() => import('./features/auth/LoginPage').then(m => ({ default: m.LoginPage })));

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/customers" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CustomersPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProductsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/offers" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <OffersPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/offers/new" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CreateOfferPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/offers/:id/edit" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CreateOfferPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/deals" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DealsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/meetings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MeetingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/proformas" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProformasPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/proformas/:id" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProformaViewPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/shipments" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ShipmentsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/suppliers" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SuppliersPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/logistics" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <LogisticsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/logistics-companies" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <LogisticsCompaniesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/profit-loss" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProfitLossPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
