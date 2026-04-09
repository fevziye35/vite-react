import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    Briefcase,
    Calendar,
    LogOut,
    Truck,
    Ship,
    CheckSquare,
    ShieldCheck,
    MessageSquare,
    UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export default function Sidebar() {
    const { logout, user } = useAuth();
    
    // Sistem yöneticisi kontrolü - Rol tabanlı yapıldı
    const isSuperAdmin = user?.role === 'SuperAdmin' || user?.email === 'fevziye.mamak35@gmail.com';

    const menuItems = [
        { icon: LayoutDashboard, label: 'Gösterge Paneli', path: '/', badge: 0 },
        { icon: MessageSquare, label: 'Mesajlar', path: '/messages', badge: 0 },
        { icon: Users, label: 'Müşteriler', path: '/customers', badge: 0 },
        { icon: Package, label: 'Ürünler', path: '/products', badge: 0 },
        { icon: Truck, label: 'Tedarikçiler', path: '/suppliers', badge: 0 },
        { icon: FileText, label: 'Teklifler', path: '/offers', badge: 0 },
        { icon: Briefcase, label: 'Anlaşmalar', path: '/deals', badge: 0 },
        { icon: Calendar, label: 'Toplantılar', path: '/meetings', badge: 0 },
        { icon: CheckSquare, label: 'Görevler', path: '/tasks', badge: 0 },
        { icon: FileText, label: 'Proformalar', path: '/proformas', badge: 0 },
        { icon: Ship, label: 'Sevkiyatlar', path: '/shipments', badge: 0 },
        { icon: Truck, label: 'Lojistik', path: '/logistics', badge: 0 },
        { icon: UserCircle, label: 'Profil', path: '/profile', badge: 0 },
        // Only show Sistem to superadmin
        ...(isSuperAdmin ? [{ icon: ShieldCheck, label: 'Sistem', path: '/settings', badge: 0 }] : []),
    ];

    return (
        <aside className="w-full md:w-64 h-16 md:h-screen bg-sidebar flex md:flex-col fixed bottom-0 md:bottom-auto md:left-0 md:top-0 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-xl border-t md:border-t-0 md:border-r border-[#2a3c54]">
            <div className="hidden md:flex p-6 border-b border-white/5 bg-[#172436]/50 items-center justify-center shrink-0">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                </div>
            </div>

            <nav className="flex-1 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto py-2 md:py-4 px-2 md:px-3 flex flex-row md:flex-col gap-1 md:gap-0 md:space-y-0.5 scrollbar-hide md:scroll-smooth items-center md:items-stretch">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center justify-center md:justify-between px-3 md:px-3 py-2 md:py-2.5 rounded-xl md:rounded text-[13px] font-medium transition-all group min-w-[3.5rem] md:min-w-0 relative shrink-0",
                                isActive
                                    ? "bg-accent/20 md:bg-accent text-accent md:text-white"
                                    : "text-[#a0a9b6] hover:text-white hover:bg-white/5"
                            )
                        }
                        title={item.label}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={22} className={cn("md:w-[18px] md:h-[18px] opacity-70 group-hover:opacity-100 transition-opacity")} />
                            <span className="hidden md:inline">{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                            <span className="absolute md:static top-0 right-0 md:top-auto md:right-auto bg-[#af52de] text-white text-[9px] md:text-[10px] px-1 md:px-1.5 py-0.5 rounded-full font-bold min-w-[16px] md:min-w-[18px] text-center shadow-lg shadow-purple/20 translate-x-1 -translate-y-1 md:translate-x-0 md:translate-y-0">
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="hidden md:block p-4 border-t border-white/5 bg-[#172436] shrink-0">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent uppercase shrink-0">
                        {user?.email?.substring(0, 2)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-white truncate">{user?.email}</span>
                        <span className="text-[9px] text-muted font-bold uppercase tracking-wider">{user?.role || 'PERSONEL'}</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded text-[12px] font-medium text-[#a0a9b6] hover:text-white hover:bg-danger/20 transition-all group"
                >
                    <LogOut size={16} />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}