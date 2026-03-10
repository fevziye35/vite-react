import { ChatWindow } from './components/chat/ChatWindow';
import { supabase } from './lib/supabaseClient';

// Eğer bu dosyalar src/pages klasörü içindeyse yollar böyle olmalı:
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

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path || (path === '/deals' && location.pathname === '/');
        return isActive
            ? "flex items-center gap-4 p-4 rounded-2xl bg-blue-600 text-white shadow-xl transition-all font-bold"
            : "flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all font-bold";
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-left font-sans leading-relaxed">
            <aside className="w-72 bg-[#1E293B] p-8 flex flex-col shadow-2xl shrink-0 italic text-left">
                <div className="flex items-center gap-4 text-white font-black text-2xl mb-12 tracking-tighter">
                    <div className="bg-blue-500 p-2 rounded-xl shadow-lg"><Globe size={28} /></div>
                    <span>MAKFA <span className="text-blue-400">CRM</span></span>
                </div>
                <nav className="space-y-3 flex-1 font-bold">
                    <Link to="/deals" className={getLinkClass("/deals")}><LayoutDashboard size={22} /> <span>Anlaşmalar</span></Link>
                    <Link to="/customers" className={getLinkClass("/customers")}><Users size={22} /> <span>Müşteriler</span></Link>
                    <Link to="/offers" className={getLinkClass("/offers")}><FileText size={22} /> <span>Proformalar</span></Link>
                    <Link to="/messages" className={getLinkClass("/messages")}><MessageSquare size={22} /> <span>Mesajlar</span></Link>
                </nav>
                <div className="mt-auto pt-8 border-t border-white/10">
                    <Link to="/login" className="flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold">
                        <LogOut size={22} /> <span>Çıkış Yap</span>
                    </Link>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto bg-slate-50 relative">
                <Routes>
                    <Route path="/" element={<DealsPage />} />
                    <Route path="/deals" element={<DealsPage />} />
                    <Route path="/customers" element={<CustomersPage subdomain={subdomain} />} />
                    <Route path="/offers" element={<OffersPage subdomain={subdomain} />} />
                    <Route path="/messages" element={<MessagesPage />} />
                </Routes>
                <ChatWindow />
            </main>
        </div>
    );
}

// Buradan sonrası senin sildiğin ama sistemin çalışması için gereken sayfa bileşenleri:
function CustomersPage({ subdomain }: { subdomain: string }) {
    return <div className="p-10"><h2>Müşteriler Sayfası (Aktif)</h2></div>;
}

function OffersPage({ subdomain }: { subdomain: string }) {
    return <div className="p-10"><h2>Proformalar Sayfası (Aktif)</h2></div>;
}