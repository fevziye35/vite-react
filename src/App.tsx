import { ChatWindow } from './components/chat/ChatWindow';
import { useEffect, useState } from 'react';
// Eski satırı sil ve bunu yapıştır:
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, Globe, Building2, Save, ArrowLeft, Printer, LayoutDashboard, LogOut, Trash2, Edit, X, MessageSquare } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

// Sayfaların doğru yerlerde olduğundan emin olalım
import LoginPage from './pages/LoginPage';
import DealsPage from './pages/DealsPage';
import MessagesPage from './pages/MessagesPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<MainLayout />} />
            </Routes>
        </BrowserRouter>
    );
}

function MainLayout() {
    const subdomain = "ali";
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside className="w-72 bg-[#1E293B] p-8 flex flex-col shadow-2xl shrink-0 italic">
                <div className="flex items-center gap-4 text-white font-black text-2xl mb-12 tracking-tighter">
                    <div className="bg-blue-500 p-2 rounded-xl"><Globe size={28} /></div>
                    <span>MAKFA <span className="text-blue-400">CRM</span></span>
                </div>
                <nav className="space-y-3 flex-1 font-bold">
                    <Link to="/deals" className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-white transition-all italic">
                        <LayoutDashboard size={22} /> <span>Anlaşmalar</span>
                    </Link>
                    <Link to="/customers" className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-white transition-all italic">
                        <Users size={22} /> <span>Müşteriler</span>
                    </Link>
                    <Link to="/offers" className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-white transition-all italic">
                        <FileText size={22} /> <span>Proformalar</span>
                    </Link>
                    <Link to="/messages" className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-white transition-all italic">
                        <MessageSquare size={22} /> <span>Mesajlar</span>
                    </Link>
                </nav>
            </aside>

            {/* İçerik Alanı */}
            <main className="flex-1 overflow-y-auto bg-slate-50 relative p-8">
                <Routes>
                    <Route path="/" element={<DealsPage />} />
                    <Route path="/deals" element={<DealsPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    {/* Diğer sayfalar için yedek (Hata vermemesi için) */}
                    <Route path="/customers" element={<div className="p-10 font-bold italic">Müşteri Listesi Yükleniyor...</div>} />
                    <Route path="/offers" element={<div className="p-10 font-bold italic">Proformalar Yükleniyor...</div>} />
                </Routes>
                {/* Sohbet kutusunu buraya ekledik */}
                <ChatWindow />
            </main>
        </div>
    );
}