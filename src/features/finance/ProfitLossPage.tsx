import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { Card } from '../../components/ui/Card';


export function ProfitLossPage() {
    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">Kar/Zarar Analizi</h1>
                <p className="text-secondary mt-1">Finansal performans özeti</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-success/10 text-success rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-sm font-bold text-secondary uppercase tracking-wider">Toplam Gelir</span>
                        </div>
                        <div className="text-3xl font-bold text-primary tracking-tight">$2,450,000</div>
                        <div className="text-xs text-success mt-2 flex items-center gap-1 font-bold bg-success/5 w-fit px-2 py-1 rounded-lg">
                            +12% <span className="text-secondary font-normal">geçen aya göre</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-danger/10 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-danger/10 text-danger rounded-xl">
                                <TrendingDown size={24} />
                            </div>
                            <span className="text-sm font-bold text-secondary uppercase tracking-wider">Toplam Giderler</span>
                        </div>
                        <div className="text-3xl font-bold text-primary tracking-tight">$1,850,000</div>
                        <div className="text-xs text-danger mt-2 flex items-center gap-1 font-bold bg-danger/5 w-fit px-2 py-1 rounded-lg">
                            +5% <span className="text-secondary font-normal">geçen aya göre</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group bg-gradient-to-br from-primary to-primary-900 text-white border-none shadow-xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-white/10 text-white rounded-xl">
                                <DollarSign size={24} />
                            </div>
                            <span className="text-sm font-bold text-white/70 uppercase tracking-wider">Net Kar</span>
                        </div>
                        <div className="text-3xl font-bold text-white tracking-tight">$600,000</div>
                        <div className="text-xs text-white/90 mt-2 flex items-center gap-1 font-bold bg-white/10 w-fit px-2 py-1 rounded-lg">
                            %24.5 Marj
                        </div>
                    </div>
                </Card>
            </div>

            {/* Placeholder Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96 flex flex-col items-center justify-center border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-400">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-1">Gelir Trendleri</h3>
                    <p className="text-secondary text-sm">Detaylı döküm grafikleri yakında</p>
                </Card>

                <Card className="h-96 flex flex-col items-center justify-center border-dashed border-2 border-gray-200 bg-gray-50/50 shadow-none">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-gray-400">
                        <PieChartIcon size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-1">Gider Dağılımı</h3>
                    <p className="text-secondary text-sm">Kategori analizi yakında</p>
                </Card>
            </div>
        </div>
    );
}
