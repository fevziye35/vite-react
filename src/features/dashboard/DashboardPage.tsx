import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { BadgeDollarSign, Briefcase, FileText, Container, Loader2, Plus } from 'lucide-react';
import { MetricCard } from '../../components/ui/MetricCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { offerService, dealService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

const SALES_DATA = [
    { month: 'Jun', value: 35000 },
    { month: 'Jul', value: 42000 },
    { month: 'Aug', value: 38000 },
    { month: 'Sep', value: 55000 },
    { month: 'Oct', value: 48000 },
    { month: 'Nov', value: 65000 },
];

const CATEGORY_DATA = [
    { name: 'Oil', value: 120000 },
    { name: 'Food', value: 85000 },
    { name: 'Beverage', value: 30000 },
    { name: 'Poultry', value: 45000 },
];

const COUNTRY_DATA = [
    { name: 'UK', value: 35 },
    { name: 'UAE', value: 25 },
    { name: 'Nigeria', value: 20 },
    { name: 'Turkey', value: 20 },
];

// Apple Style Colors
const PIE_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30'];
const CHART_COLOR = '#007AFF';

export function DashboardPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeDealsValue: 0,
        activeDealsCount: 0,
        offersSentMonth: 0,
        totalPipeline: 0,
        containersPlanned: 42 // Mocked for now as we don't track containers explicitly yet
    });
    const [recentOffers, setRecentOffers] = useState<any[]>([]);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const [deals, offers] = await Promise.all([
                    dealService.getAll(),
                    offerService.getAll()
                ]);

                // Calculate metrics
                const activeDeals = deals.filter((d: any) => d.stage !== 'Closed Lost' && d.stage !== 'Closed Won');
                const totalPipeline = activeDeals.reduce((sum: number, d: any) => sum + (d.expectedRevenue || 0), 0);

                // Count offers sent this month (simple check for now, just count all 'Sent' or similar)
                const offersThisMonth = offers.filter((o: any) => new Date(o.createdAt).getMonth() === new Date().getMonth()).length;

                setStats({
                    activeDealsValue: totalPipeline,
                    activeDealsCount: activeDeals.length,
                    offersSentMonth: offersThisMonth,
                    totalPipeline: totalPipeline, // same as active deals value in this logic
                    containersPlanned: 42
                });

                setRecentOffers(offers.slice(0, 5));
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-4rem)]"><Loader2 className="animate-spin text-accent" size={32} /></div>;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Gösterge Paneli</h1>
                    <p className="text-secondary mt-1">Hoş geldiniz, Ali Mamak Ekibi</p>
                </div>
                <Button
                    onClick={() => navigate('/offers/new')}
                    className="shadow-lg shadow-accent/20"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Teklif
                </Button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Toplam Aktif Anlaşmalar"
                    value={stats.activeDealsCount.toString()}
                    change="Aktif"
                    trend="up"
                    icon={BadgeDollarSign}
                    color="text-warning bg-warning/10"
                />
                <MetricCard
                    title="Teklifler (Bu Ay)"
                    value={stats.offersSentMonth.toString()}
                    change="+2"
                    trend="up"
                    icon={FileText}
                    color="text-accent bg-accent/10"
                />
                <MetricCard
                    title="Boru Hattı Değeri"
                    value={`$${(stats.totalPipeline / 1000).toFixed(1)}k`}
                    change="+5%"
                    trend="up"
                    icon={Briefcase}
                    color="text-purple-500 bg-purple-500/10"
                />
                <MetricCard
                    title="Planlanan Konteynerler"
                    value={stats.containersPlanned.toString()}
                    change="-2"
                    trend="down"
                    icon={Container}
                    color="text-success bg-success/10"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <Card>
                    <h3 className="font-bold text-lg mb-6 text-primary">Gelir Trendi <span className="text-secondary text-sm font-normal ml-2">(6 Ay)</span></h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={SALES_DATA}>
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

                {/* Category Distribution */}
                <Card>
                    <h3 className="font-bold text-lg mb-6 text-primary">Kategoriye Göre Boru Hattı</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CATEGORY_DATA} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E5E5" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#86868B', fontSize: 13 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: '12px', color: '#1D1D1F', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#AF52DE" radius={[0, 6, 6, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Row 2: Countries & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Country Pie */}
                <Card>
                    <h3 className="font-bold text-lg mb-4 text-primary">Aktif Ülkeler</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={COUNTRY_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {COUNTRY_DATA.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center flex-wrap gap-4 mt-6">
                        {COUNTRY_DATA.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2 text-sm text-secondary">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                                <div className="text-xs font-semibold">{entry.name}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Offers List */}
                <div className="lg:col-span-2">
                    <Card noPadding className="h-full">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-primary">Son Teklifler</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-secondary font-semibold">
                                    <tr>
                                        <th className="p-4 pl-6">İlgili Kişi</th>
                                        <th className="p-4">Referans</th>
                                        <th className="p-4">Tutar</th>
                                        <th className="p-4">Durum</th>
                                        <th className="p-4">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentOffers.map((offer) => (
                                        <tr key={offer.id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => navigate('/offers')}>
                                            <td className="p-4 pl-6 font-medium text-primary">{offer.contactPerson || 'Bilinmiyor'}</td>
                                            <td className="p-4 text-secondary">{offer.offerNumber}</td>
                                            <td className="p-4 font-bold text-primary">${offer.totalAmount?.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-bold",
                                                    offer.status === 'Accepted' ? "bg-success/10 text-success" :
                                                        offer.status === 'Sent' ? "bg-accent/10 text-accent" :
                                                            "bg-gray-100 text-secondary"
                                                )}>
                                                    {offer.status === 'Draft' ? 'Taslak' : offer.status === 'Sent' ? 'Gönderildi' : offer.status === 'Negotiation' ? 'Müzakere' : offer.status === 'Accepted' ? 'Kabul Edildi' : offer.status === 'Lost' ? 'Kayıp' : offer.status || 'Taslak'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-secondary">{new Date(offer.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {recentOffers.length === 0 && (
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
