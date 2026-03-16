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

export default function Sidebar() {
    // Şimdilik hata vermemesi için logout fonksiyonunu pasif yaptık
    const logout = () => { console.log("Çıkış yapıldı"); };

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
        <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-30 shadow-lg">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-primary">MAKFA CRM</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`
                        }
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                    <LogOut size={18} />
                    Çıkış Yap
                </button>
            </div>
        </aside>
    );
}