import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    FileText,
    Briefcase,
    Calendar,
    TrendingUp,
    Settings,
    LogOut,
    Truck,
    Ship,
    CheckSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
    const { logout } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Gösterge Paneli', path: '/' },
        { icon: Users, label: 'Müşteriler', path: '/customers' },
        { icon: Package, label: 'Ürünler', path: '/products' },
        { icon: Truck, label: 'Tedarikçiler', path: '/suppliers' },
        { icon: FileText, label: 'Teklifler', path: '/offers' },
        { icon: Briefcase, label: 'Anlaşmalar', path: '/deals' },
        { icon: Calendar, label: 'Toplantılar', path: '/meetings' },
        { icon: CheckSquare, label: 'Görevler', path: '/tasks' },
        { icon: FileText, label: 'Proforma Faturalar', path: '/proformas' },
        { icon: Ship, label: 'Sevkiyatlar', path: '/shipments' },
        { icon: Truck, label: 'Lojistik Teklifleri', path: '/logistics' },
        { icon: Truck, label: 'Lojistik Listesi', path: '/logistics-companies' },
        { icon: TrendingUp, label: 'Kar/Zarar Analizi', path: '/profit-loss' },
        { icon: Settings, label: 'Ayarlar', path: '/settings' },
    ];

    return (
        <aside className="w-64 h-screen bg-surface/80 backdrop-blur-xl border-r border-gray-200 flex flex-col fixed left-0 top-0 z-30 transition-all duration-300">
            <div className="p-6 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="MAKFA Logo"
                        className="h-14 object-contain"
                    />
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20 translate-x-1'
                                : 'text-secondary hover:bg-gray-50 hover:text-primary hover:translate-x-1'
                            }`
                        }
                    >
                        <item.icon size={18} strokeWidth={2} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-secondary hover:text-danger hover:bg-red-50 transition-all duration-200 group"
                >
                    <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}
