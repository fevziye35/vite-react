import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DealsPage from './pages/DealsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Diğer tüm sorunlu sayfaları devre dışı bıraktık, sadece Deals çalışacak */}
        <Route path="/" element={<DealsPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="*" element={<DealsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;