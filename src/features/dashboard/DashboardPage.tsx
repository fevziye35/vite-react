import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { BadgeDollarSign, Briefcase, FileText, Container, Loader2, Users, Package, Settings, User } from 'lucide-react';
import { MetricCard } from '../../components/ui/MetricCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getStats } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

// Bitrix24 Style Colors
const PIE_COLORS = ['#2fc6f6', '#7bd500', '#ffc600', '#ff5752', '#b8aae5'];
const CHART_COLOR = '#2fc6f6';

export function DashboardPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const data = await getStats();
                if (data) {
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-4rem)]"><Loader2 className="animate-spin text-accent" size={32} /></div>;
    if (!stats) return <div className="p-8 text-center text-secondary">Veriler yüklenemedi.</div>;

    const quickActions = [
        { label: 'Yeni Müşteri', icon: Users, path: '/customers', color: 'text-blue-500' },
        { label: 'Yeni Ürün', icon: Package, path: '/products', color: 'text-orange-500' },
        { label: 'Yeni Teklif', icon: FileText, path: '/offers/new', color: 'text-accent' },
        { label: 'Profil', icon: User, path: '/profile', color: 'text-purple-500' },
        { label: 'Sistem', icon: Settings, path: '/settings', color: 'text-slate-500' },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Gösterge Paneli</h1>
                    <p className="text-secondary mt-1">Hoş geldiniz</p>
                </div>
                <div className="flex gap-3">
                    {quickActions.map((action) => (
                        <Button
                            key={action.label}
                            variant="outline"
                            size="sm"
                            className="bg-white border-slate-200 text-slate-600 hover:text-primary hover:border-slate-300 shadow-sm"
                            onClick={() => navigate(action.path)}
                        >
                            <action.icon size={16} className={cn("mr-2", action.color)} />
                            {action.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Toplam Aktif Anlaşmalar"
                    value={stats.activeDealsCount.toString()}
                    change="Tüm Anlaşmalar"
                    trend="up"
                    icon={BadgeDollarSign}
                    color="text-warning bg-warning/10"
                    onClick={() => navigate('/deals')}
                />
                <MetricCard
                    title="Teklifler (Bu Ay)"
                    value={stats.offersSentMonth.toString()}
                    change="Bu Ay"
                    trend="up"
                    icon={FileText}
                    color="text-accent bg-accent/10"
                    onClick={() => navigate('/offers')}
                />
                <MetricCard
                    title="Boru Hattı Değeri"
                    value={`$${(stats.totalPipeline / 1000).toFixed(stats.totalPipeline >= 1000 ? 1 : 2)}k`}
                    change="Beklenen"
                    trend="up"
                    icon={Briefcase}
                    color="text-purple-500 bg-purple-500/10"
                    onClick={() => navigate('/deals')}
                />
                <MetricCard
                    title="Planlanan Konteynerler"
                    value={stats.plannedContainers.toString()}
                    change="Sevkiyatlar"
                    trend="up"
                    icon={Container}
                    color="text-success bg-success/10"
                    onClick={() => navigate('/shipments')}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <Card>
                    <h3 className="font-bold text-lg mb-6 text-primary">Gelir Trendi <span className="text-secondary text-sm font-normal ml-2">(Proformalar)</span></h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueTrend || []}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868B', fontSize: 12 }} unit="$" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', color: '#1D1D1F', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Gelir']}
                                    cursor={{ stroke: '#E5E5E5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={CHART_COLOR}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Stage Distribution */}
                <Card>
                    <h3 className="font-bold text-lg mb-6 text-primary">Aşamalara Göre Boru Hattı</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.categoryData || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E5E5" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#86868B', fontSize: 13 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Değer']}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', color: '#1D1D1F', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#AF52DE" 
                                    radius={[0, 6, 6, 0]} 
                                    barSize={32} 
                                    onClick={() => navigate('/deals')}
                                    style={{ cursor: 'pointer' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Row 2: Countries & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Country Pie */}
                <Card>
                    <h3 className="font-bold text-lg mb-4 text-primary">Aktif Müşteri Ülkeleri</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.countryData || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onClick={() => navigate('/customers')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {(stats.countryData || []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center flex-wrap gap-4 mt-6">
                        {(stats.countryData || []).map((entry: any, index: number) => (
                                <div key={entry.name} className="flex items-center gap-2 text-sm text-secondary cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/customers')}>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                    <div className="text-xs font-semibold">{entry.name} ({entry.value})</div>
                                </div>
                            ))}
                    </div>
                </Card>

                {/* Recent Offers List */}
                <div className="lg:col-span-2">
                    <Card noPadding className="h-full">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-primary">Son Teklifler</h3>
                            <Button variant="ghost" size="sm" className="text-accent hover:underline" onClick={() => navigate('/offers')}>Tümünü Gör</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-secondary font-semibold">
                                    <tr>
                                        <th className="p-4 pl-6">Müşteri / Şirket</th>
                                        <th className="p-4">Referans</th>
                                        <th className="p-4">Tutar</th>
                                        <th className="p-4">Durum</th>
                                        <th className="p-4">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(stats.recentOffers || []).map((offer: any) => (
                                        <tr key={offer.id} className="hover:bg-gray-50/50 transition cursor-pointer group" onClick={() => navigate('/offers')}>
                                            <td className="p-4 pl-6">
                                                <div className="font-bold text-primary group-hover:text-accent transition-colors">{offer.contactPerson || 'Bilinmiyor'}</div>
                                                <div className="text-[10px] text-secondary">Hızlı Erişim</div>
                                            </td>
                                            <td className="p-4 text-secondary font-mono text-xs">{offer.offerNumber}</td>
                                            <td className="p-4 font-black text-primary">${(offer.totalAmount || 0).toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                    offer.status === 'Accepted' || offer.status === 'Kabul Edildi' ? "bg-success/10 text-success" :
                                                    offer.status === 'Sent' || offer.status === 'Gönderildi' ? "bg-accent/10 text-accent" :
                                                    offer.status === 'Lost' || offer.status === 'Kayıp' ? "bg-purple/10 text-purple" :
                                                    "bg-gray-100 text-secondary"
                                                )}>
                                                    {offer.status || 'Taslak'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-secondary text-xs">{new Date(offer.createdAt).toLocaleDateString('tr-TR')}</td>
                                        </tr>
                                    ))}
                                    {(stats.recentOffers || []).length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-secondary">Teklif bulunamadı. Başlamak için bir tane oluşturun!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
