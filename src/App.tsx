import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar'; 
import DealsPage from './pages/DealsPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import MessagesPage from './pages/MessagesPage';
import ProformalarPage from './pages/ProformalarPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        {/* Yan Menü (Sidebar) Artık Burada Görünecek */}
        <Sidebar /> 
        
        {/* Sağ Taraftaki Ana İçerik */}
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/deals" replace />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/proformas" element={<ProformalarPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* Eğer başka sayfaların varsa buraya eklemeye devam edeceğiz */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;