import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar'; // Eğer klasörün adı layout ise böyle kalmalı
import DealsPage from './pages/DealsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0f172a]">
        {/* Sidebar burada menüyü geri getirecek */}
        <Sidebar /> 
        
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/deals" replace />} />
            <Route path="/deals" element={<DealsPage />} />
            {/* Diğer sayfaları hata vermedikçe buraya ekleyeceğiz */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;