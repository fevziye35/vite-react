import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DealsPage from './pages/DealsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vercel build alsın diye diğer yolları DealsPage'e yönlendiriyoruz */}
        <Route path="/" element={<DealsPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;