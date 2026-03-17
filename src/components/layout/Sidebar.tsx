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
    MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export default function Sidebar() {
    const { logout, user } = useAuth();
    
    // Only fevziye.mamak35@gmail.com is considered SuperAdmin
    const isSuperAdmin = user?.email === 'fevziye.mamak35@gmail.com';

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
        // Only show Sistem to superadmin
        ...(isSuperAdmin ? [{ icon: ShieldCheck, label: 'Sistem', path: '/settings', badge: 0 }] : []),
    ];

    return (
        <aside className="w-64 h-screen bg-sidebar flex flex-col fixed left-0 top-0 z-30 shadow-xl border-r border-[#2a3c54]">
            <div className="p-6 border-b border-white/5 bg-[#172436]/50 flex items-center justify-center">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-hide">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center justify-between px-3 py-2.5 rounded text-[13px] font-medium transition-all group",
                                isActive
                                    ? "bg-accent text-white"
                                    : "text-[#a0a9b6] hover:text-white hover:bg-white/5"
                            )
                        }
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={18} className={cn("opacity-70 group-hover:opacity-100 transition-opacity")} />
                            <span>{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                            <span className="bg-[#af52de] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center shadow-lg shadow-purple/20">
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5 bg-[#172436]">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent uppercase">
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