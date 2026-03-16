import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar'; 
import DealsPage from './pages/DealsPage';
import MessagesPage from './pages/MessagesPage';
import ProformalarPage from './pages/ProformalarPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar /> 
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/deals" replace />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/proformas" element={<ProformalarPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/deals" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;  