import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Users, FileText, LayoutDashboard, MessageSquare, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuth, AuthProvider } from './context/AuthContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import { supabase } from './lib/supabaseClient';
import { playNotificationSound } from './utils/notificationSound';

// Sayfaların doğru yerlerde olduğundan emin olalım
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DealsPage from './pages/DealsPage';
import MessagesPage from './pages/MessagesPage';
import ProformalarPage from './pages/ProformalarPage';
import { CustomersPage } from './features/customers/CustomersPage';
import AdminPage from './pages/AdminPage';

import { NotificationBell } from './components/NotificationBell.tsx';
import { ToastProvider } from './components/ui/Toast';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold italic text-slate-400">Yükleniyor...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

export default function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <SocketProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/*" element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </BrowserRouter>
                </SocketProvider>
            </AuthProvider>
        </ToastProvider>
    );
}

function MainLayout() {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pageTitle = location.pathname.split('/').pop()?.toUpperCase() || 'DASHBOARD';

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('global:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const currentUserIdentifier = (user.fullName || user.email.split('@')[0] || '').toLowerCase();
                const msgSenderName = (payload.new.sender_name || '').toLowerCase();
                
                // Play sound if:
                // 1. Not from current user
                // 2. Either Team Chat OR Private message sent specifically to current user
                if (msgSenderName !== currentUserIdentifier) {
                    const content = payload.new.content || '';
                    const isTeamChat = !content.startsWith('@@PM:');
                    const myPrefix = user.fullName || user.email.split('@')[0];
                    const isPrivateForMe = content.startsWith(`@@PM:${myPrefix}@@`);

                    if (isTeamChat || isPrivateForMe) {
                        playNotificationSound();
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-72 bg-[#1E293B] p-8 flex flex-col shadow-2xl shrink-0 italic
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="flex justify-between items-center mb-12">
                    <Link to="/" className="flex items-center gap-4 text-white font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
                        <span>MAKFA <span className="text-blue-400">CRM</span></span>
                    </Link>
                    <button 
                        className="md:hidden text-white/50 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>
                <nav className="space-y-3 flex-1 font-bold">
                    {(user?.permissions?.deals !== false || user?.email === 'fevziye.mamak35@gmail.com') && (
                        <Link 
                            to="/deals" 
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all italic ${location.pathname === '/' || location.pathname === '/deals' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <LayoutDashboard size={22} /> <span>İŞLER</span>
                        </Link>
                    )}
                    {(user?.permissions?.customers !== false || user?.email === 'fevziye.mamak35@gmail.com') && (
                        <Link 
                            to="/customers" 
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all italic ${location.pathname === '/customers' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Users size={22} /> <span>Müşteriler</span>
                        </Link>
                    )}
                    {(user?.permissions?.offers !== false || user?.email === 'fevziye.mamak35@gmail.com') && (
                        <Link 
                            to="/offers" 
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all italic ${location.pathname === '/offers' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <FileText size={22} /> <span>Proformalar</span>
                        </Link>
                    )}
                    {(user?.permissions?.messages !== false || user?.email === 'fevziye.mamak35@gmail.com') && (
                        <Link 
                            to="/messages" 
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all italic ${location.pathname === '/messages' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <MessageSquare size={22} /> <span>Mesajlar</span>
                        </Link>
                    )}
                </nav>

                {/* Sidebar Bottom */}
                <div className="mt-auto pt-8 border-t border-slate-700/50 space-y-4">
                    {user && (
                        user.email === 'fevziye.mamak35@gmail.com' ? (
                            <Link to="/admin" className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-2xl border border-blue-500/30 hover:bg-slate-800 transition-all group no-underline" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 transition-all">
                                    <Shield size={20} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
                                    <p className="text-[10px] text-blue-400 font-black truncate uppercase mt-0.5 flex items-center gap-1">
                                        ADMIN PANELİ <Shield size={10} />
                                    </p>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-2xl border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Users size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{user.fullName}</p>
                                    <p className="text-[10px] text-slate-500 truncate uppercase mt-0.5">Kullanıcı</p>
                                </div>
                            </div>
                        )
                    )}
                    <button 
                        onClick={() => logout()}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all font-bold italic"
                    >
                        <LogOut size={22} /> <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* İçerik Alanı */}
            <main className="flex-1 h-screen flex flex-col overflow-hidden bg-slate-50 relative w-full md:w-auto">
                {/* Top Header */}
                <header className="h-16 bg-[#1E293B] border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            className="md:hidden text-white/70 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-white font-bold italic uppercase tracking-wider text-sm truncate max-w-[150px] md:max-w-xs">
                            {pageTitle}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Routes>
                        <Route path="/" element={<DealsPage />} />
                        <Route path="/deals" element={<DealsPage />} />
                        <Route path="/messages" element={<MessagesPage />} />
                        <Route path="/customers" element={<CustomersPage />} />
                        <Route path="/offers" element={<ProformalarPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}