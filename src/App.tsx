import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DealsPage from './pages/DealsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DealsPage />} />
        <Route pathimport { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Sidebar bileşenini geri çağırıyoruz
import DealsPage from './pages/DealsPage';
// Buraya hata vermeyen diğer sayfalarını da ekleyebilirsin

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0f172a]">
        <Sidebar /> {/* Menü geri geldi! */}
        <main className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<DealsPage />} />
            <Route path="/deals" element={<DealsPage />} />
            {/* Diğer sayfalar hata vermediği sürece buraya eklenecek */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;="/deals" element={<DealsPage />} />
        <Route path="*" element={<DealsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;