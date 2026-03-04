import { useState } from 'react';
import { Plus, Search, ChevronDown, List, Activity, Settings, Filter, MoreHorizontal, X, Send, User } from 'lucide-react';
import CreateDealModal from '../components/CreateDealModal';

const columns = [
    { id: '0', title: 'Personel', color: 'bg-indigo-400', count: 0, total: 0 },
    { id: '1', title: 'Geliştiriliyor', color: 'bg-blue-400', count: 0, total: 0 },
    { id: '2', title: 'Sayfa oluştur', color: 'bg-cyan-400', count: 0, total: 0 },
    { id: '3', title: 'Fatura', color: 'bg-teal-300', count: 0, total: 0 },
    { id: '4', title: 'Üzerinde çalışılıyor', color: 'bg-green-300', count: 0, total: 0 },
    { id: '5', title: 'Nihai fatura', color: 'bg-amber-400', count: 0, total: 0 },
];

const activityColumns = [
    { id: 'a1', title: 'Geciken', color: 'bg-red-500', count: 0 },
    { id: 'a2', title: 'Son tarihi bugün', color: 'bg-[#98c93c]', count: 0 },
    { id: 'a3', title: 'Son tarihi bu hafta', color: 'bg-cyan-400', count: 0 },
    { id: 'a4', title: 'Gelecek hafta', color: 'bg-teal-300', count: 0 },
    { id: 'a5', title: 'Boş', color: 'bg-slate-200', count: 0 },
];

export default function DealsPage() {
    const [activeTab, setActiveTab] = useState('Kanban');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deals, setDeals] = useState<any[]>([]);

    const handleSaveDeal = (newDeal: any) => {
        setDeals(prev => [...prev, newDeal]);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="min-h-full bg-[#17202b] flex flex-col p-4">
            {/* Search Header */}
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold text-white mr-4">Anlaşmalar</h2>
                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors shadow-sm">
                    <Plus size={16} className="mr-1" /> Oluştur <span className="ml-2 border-l border-green-600 pl-2"><ChevronDown size={14} /></span>
                </button>
                <button className="flex items-center bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md text-sm transition-colors border border-white/10">
                    <Filter size={14} className="mr-2 opacity-70" /> Varsayılan satış kanalı <ChevronDown size={14} className="ml-2 opacity-70" />
                </button>
                <div className="relative flex-1 max-w-xl mx-2">
                    <div className="flex items-center bg-white/10 border border-transparent focus-within:border-blue-400/50 focus-within:bg-white/15 rounded-md px-3 py-1.5 transition-all">
                        <span className="text-sm text-white bg-white/10 px-2 py-0.5 rounded mr-2 flex items-center">
                            Devam eden anlaşmalar <X size={12} className="ml-1 opacity-70 cursor-pointer" />
                        </span>
                        <input
                            type="text"
                            placeholder="+ Ara"
                            className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder-white/50"
                        />
                        <Search size={16} className="text-white/70" />
                        <X size={16} className="text-white/70 ml-2" />
                    </div>
                </div>
                <button className="p-1.5 rounded-md bg-white/10 text-white/70 hover:bg-white/20 transition-colors ml-auto"><Settings size={18} /></button>
            </div>

            {/* Tabs / Filters Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex bg-white/5 rounded-md p-1 border border-white/5">
                    {['Kanban', 'Liste', 'Etkinlikler', 'Takvim'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm rounded ${activeTab === tab ? 'bg-white/20 text-white font-medium shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-white/20 my-auto mx-2" />
                    {['0 Gelen', '0 Planlandı', '0 Daha_fazla'].map(status => {
                        const tabName = status.split(' ')[1].replace('_', ' ');
                        return (
                            <button
                                key={status}
                                onClick={() => setActiveTab(tabName)}
                                className={`px-3 py-1.5 text-sm rounded flex items-center ${activeTab === tabName ? 'bg-white/20 text-white font-medium shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            >
                                <span className={`bg-white/10 px-1.5 py-0.5 rounded-full text-xs mr-1 opacity-70 ${activeTab === tabName ? 'opacity-100 bg-white/20' : ''}`}>{status.split(' ')[0]}</span>
                                {tabName} {status.includes('Daha') && <ChevronDown size={14} className="ml-1" />}
                            </button>
                        )
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center text-sm text-white/70 hover:text-white bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                        <Settings size={14} className="mr-2" /> Otomasyon kuralları
                    </button>
                    <button className="flex items-center text-sm text-white/70 hover:text-white bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                        Uzantılar <ChevronDown size={14} className="ml-1" />
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            {activeTab === 'Kanban' ? (
                <div className="flex-1 overflow-x-auto flex items-start pb-4">
                    {columns.map((col, index) => {
                        const colDeals = deals.filter(d => d.stage === col.title);
                        const count = colDeals.length;
                        const total = colDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

                        return (
                            <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col border-r border-white/10 last:border-r-0 h-full">
                                {/* Column Header */}
                                <div
                                    className={`py-2 ${col.color} text-slate-900 mb-3 flex items-center justify-between ${index === 0 ? 'pl-4 pr-5' : 'pl-8 pr-5'} z-10 relative shadow-sm`}
                                    style={{
                                        clipPath: index === 0
                                            ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
                                            : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
                                        marginLeft: index === 0 ? '0' : '-16px',
                                        width: index === 0 ? '100%' : 'calc(100% + 16px)'
                                    }}
                                >
                                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">{col.title} ({count})</span>
                                    {index === columns.length - 1 && (
                                        <button className="w-5 h-5 rounded-full flex items-center justify-center text-slate-800 bg-white/30 hover:bg-white/50 transition-colors shrink-0">
                                            <Plus size={14} />
                                        </button>
                                    )}
                                </div>
                                {/* Column Stats */}
                                <div className="text-center mb-4">
                                    <div className="text-3xl font-light text-white mt-2">{total} <span className="text-xl">₺</span></div>
                                    <button className="text-white/40 hover:text-white/80 transition-colors mt-2 w-full flex items-center justify-center font-light"><Plus size={18} /></button>
                                </div>

                                {/* "Hızlı Anlaşma" in first column only */}
                                {col.id === '1' && (
                                    <div className="px-3 mb-3">
                                        <button onClick={() => alert("Hızlı Anlaşma formu açılıyor...")} className="w-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-50 text-sm py-2 rounded-md font-bold transition-colors flex items-center justify-center border border-blue-400/30">
                                            <Plus size={16} className="mr-2" /> Hızlı Anlaşma
                                        </button>

                                        {/* Integration Info Box */}
                                        <div className="mt-4 bg-blue-900/50 border border-blue-400/20 rounded-md p-3 relative">
                                            <button className="absolute top-2 right-2 text-white/50 hover:text-white"><X size={14} /></button>
                                            <h4 className="text-sm font-medium text-white text-center mb-3">
                                                İletişim Merkezi<br />Otomatik anlaşma kaynakları
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                                                <div className="flex items-center"><span className="w-4 h-4 mr-2 bg-blue-400/20 rounded inline-flex items-center justify-center"><MoreHorizontal size={10} /></span> Canlı Sohbet</div>
                                                <div className="flex items-center"><Activity size={12} className="mr-2" /> Aramalar</div>
                                                <div className="flex items-center"><List size={12} className="mr-2" /> CRM formları</div>
                                                <div className="flex items-center"><Activity size={12} className="mr-2" /> Posta</div>
                                                <div className="flex items-center"><Activity size={12} className="mr-2" /> Viber</div>
                                                <div className="flex items-center"><Send size={12} className="mr-2" /> Telegram</div>
                                            </div>
                                        </div>

                                        {/* CRM Import Box */}
                                        <div className="mt-3 bg-white/5 border border-white/10 rounded-md p-3 relative">
                                            <button className="absolute top-2 right-2 text-white/50 hover:text-white"><X size={14} /></button>
                                            <h4 className="text-sm font-medium text-white mb-2">CRM çözümü ön ayarları</h4>
                                            <ul className="text-xs text-white/70 space-y-2">
                                                <li className="flex items-start"><span className="text-blue-400 mr-2">➜</span> CRM çözümü ön ayarlarını dosyadan içe aktarın</li>
                                                <li className="flex items-start"><span className="text-blue-400 mr-2">➜</span> CRM çözümü ön ayarlarını dosyaya aktarın</li>
                                                <li className="flex items-start"><span className="text-blue-400 mr-2">↺</span> Diğer CRM'den taşıyın</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Deal Cards Container */}
                                <div className="flex-1 px-3 mt-4 flex flex-col gap-2 relative z-10">
                                    {colDeals.map((deal: any) => (
                                        <div key={deal.id} className="bg-white rounded shadow-sm border border-slate-200/60 p-3 pt-4 cursor-pointer hover:shadow transition-shadow group relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#008cff]"></div>
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="text-[14px] font-semibold text-[#008cff] group-hover:underline truncate">{deal.title}</div>
                                            </div>
                                            <div className="text-[15px] text-slate-700 font-bold tracking-tight mb-2">{deal.amount} {deal.currency}</div>
                                            {deal.customer && <div className="text-[12px] text-slate-500 mt-2 flex items-center gap-1.5"><div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center"><User size={10} /></div> <span className="truncate">{deal.customer}</span></div>}
                                            <div className="text-[11px] text-slate-400 mt-2 flex justify-between items-center border-t border-slate-100 pt-2">
                                                <span>Bugün {deal.endDate}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : activeTab === 'Liste' ? (
                <div className="flex-1 bg-white rounded-t-xl shadow-lg mt-4 overflow-hidden flex flex-col relative w-full border-x border-slate-200">
                    <div className="overflow-x-auto flex-1 bg-white rounded-t-xl">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-t border-slate-200 bg-[#fbfdfd] shadow-sm relative z-10">
                                    <th className="p-4 w-10 text-center"><input type="checkbox" className="w-3.5 h-3.5 cursor-pointer text-slate-300" /></th>
                                    <th className="p-4 w-10 text-center"><Settings size={14} className="text-slate-400 cursor-pointer hover:text-slate-600 inline-block" /></th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Anlaşma</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Aşama</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Etkinlik</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Müşteri</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Miktar/Para Birimi</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Sorumlu</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800 flex items-center gap-1">Oluşturulma Tarihi <ChevronDown size={14} className="opacity-50" /></th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={10} className="text-center bg-white align-middle">
                                        <div className="flex flex-col items-center justify-center h-[55vh] min-h-[400px]">
                                            <svg className="w-24 h-28 mb-6 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                                                <polyline points="14 2 14 8 20 8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                                                <line x1="9.5" y1="14.5" x2="14.5" y2="9.5" stroke="#cbd5e1" strokeWidth="3" />
                                                <line x1="14.5" y1="14.5" x2="9.5" y2="9.5" stroke="#cbd5e1" strokeWidth="3" />
                                            </svg>
                                            <span className="text-[22px] font-medium text-slate-300 tracking-wide">- Veri yok -</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Bottom Scrollbar Element */}
                    <div className="h-6 bg-white w-full border-t border-slate-200 flex items-center justify-between px-2">
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-r-[7px] border-r-slate-400 border-b-[5px] border-b-transparent cursor-pointer hover:border-r-slate-600 transition-colors"></div>
                        <div className="flex-1 mx-3 h-[10px] bg-slate-300 rounded-full cursor-pointer hover:bg-slate-400 transition-colors shadow-inner"></div>
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[7px] border-l-slate-400 border-b-[5px] border-b-transparent cursor-pointer hover:border-l-slate-600 transition-colors"></div>
                    </div>
                </div>
            ) : activeTab === 'Etkinlikler' ? (
                <div className="flex-1 overflow-x-auto flex items-start pb-4 mt-2">
                    {activityColumns.map((col, index) => (
                        <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col border-r border-white/10 last:border-r-0 h-full">
                            {/* Column Header */}
                            <div
                                className={`py-2 ${col.color} ${col.id === 'a5' ? 'text-slate-800' : 'text-slate-900'} mb-5 flex items-center justify-between ${index === 0 ? 'pl-4 pr-5' : 'pl-8 pr-5'} z-10 relative shadow-sm`}
                                style={{
                                    clipPath: index === 0
                                        ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
                                        : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
                                    marginLeft: index === 0 ? '0' : '-16px',
                                    width: index === 0 ? '100%' : 'calc(100% + 16px)'
                                }}
                            >
                                <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">{col.title} ({col.count})</span>
                                {index === activityColumns.length - 1 && (
                                    <button className="w-5 h-5 rounded-full flex items-center justify-center text-slate-800 bg-black/10 hover:bg-black/20 transition-colors shrink-0">
                                        <Plus size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="text-center mb-4">
                                <button className="text-white/40 hover:text-white/80 transition-colors w-full flex items-center justify-center"><Plus size={18} /></button>
                            </div>

                            {/* Info block for first column */}
                            {col.id === 'a1' && (
                                <div className="px-3 mb-3">
                                    <button onClick={() => alert("Hızlı Anlaşma formu açılıyor...")} className="w-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-50 text-sm py-2 rounded-md font-bold transition-colors flex items-center justify-center border border-blue-400/30">
                                        <Plus size={16} className="mr-2" /> Hızlı Anlaşma
                                    </button>

                                    {/* Integration Info Box */}
                                    <div className="mt-4 bg-blue-900/50 border border-blue-400/20 rounded-md p-3 relative">
                                        <button className="absolute top-2 right-2 text-white/50 hover:text-white"><X size={14} /></button>
                                        <h4 className="text-sm font-medium text-white text-center mb-3">
                                            İletişim Merkezi<br />Otomatik anlaşma kaynakları
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
                                            <div className="flex items-center"><span className="w-4 h-4 mr-2 bg-blue-400/20 rounded inline-flex items-center justify-center"><MoreHorizontal size={10} /></span> Canlı Sohbet</div>
                                            <div className="flex items-center"><Activity size={12} className="mr-2" /> Aramalar</div>
                                            <div className="flex items-center"><List size={12} className="mr-2" /> CRM formları</div>
                                            <div className="flex items-center"><Activity size={12} className="mr-2" /> Posta</div>
                                            <div className="flex items-center"><Activity size={12} className="mr-2" /> Viber</div>
                                            <div className="flex items-center"><Send size={12} className="mr-2" /> Telegram</div>
                                        </div>
                                    </div>

                                    {/* CRM Import Box */}
                                    <div className="mt-3 bg-white/5 border border-white/10 rounded-md p-3 relative">
                                        <button className="absolute top-2 right-2 text-white/50 hover:text-white"><X size={14} /></button>
                                        <h4 className="text-sm font-medium text-white mb-2">CRM çözümü ön ayarları</h4>
                                        <ul className="text-xs text-white/70 space-y-2">
                                            <li className="flex items-start"><span className="text-blue-400 mr-2">➜</span> CRM çözümü ön ayarlarını dosyadan içe aktarın</li>
                                            <li className="flex items-start"><span className="text-blue-400 mr-2">➜</span> CRM çözümü ön ayarlarını dosyaya aktarın</li>
                                            <li className="flex items-start"><span className="text-blue-400 mr-2">↺</span> Diğer CRM'den taşıyın</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Column Body Area */}
                            <div className="flex-1 px-2"></div>
                        </div>
                    ))}
                </div>
            ) : activeTab === 'Takvim' ? (
                <div className="flex-1 bg-white rounded-t-xl shadow-lg mt-4 flex flex-col overflow-hidden border-x border-slate-200">
                    <div className="p-5 flex items-center justify-between border-b border-slate-100">
                        <div className="text-xl text-slate-400 font-light tracking-wide">Mart, 2026</div>
                        <div className="flex items-center gap-6 text-[13px] text-slate-400">
                            <button className="flex items-center hover:text-slate-800 transition-colors">Ay (Tamamlama) <ChevronDown size={14} className="ml-1" /></button>
                            <div className="flex items-center gap-3">
                                <button className="hover:text-slate-800 transition-colors">&lt;</button>
                                <button className="hover:text-slate-800 transition-colors">Bugün</button>
                                <button className="hover:text-slate-800 transition-colors">&gt;</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left table-fixed border-collapse h-full min-h-[500px]">
                            <thead>
                                <tr>
                                    {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => (
                                        <th key={day} className="py-2.5 text-center text-[13px] font-normal text-slate-400 border-b border-r border-slate-100 last:border-r-0">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="h-1/5">
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-300">23</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-300">24</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-300">25</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-300">26</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-300">27</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-300">28</span></td>
                                    <td className="border-b border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600 font-medium">Mar <span className="text-slate-900">1</span></span></td>
                                </tr>
                                <tr className="h-1/5">
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">2</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">3</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top bg-[#f0f9ff]">
                                        <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-[#1ab3f6] text-white text-[11px] font-semibold">4</span>
                                    </td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">5</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">6</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">7</span></td>
                                    <td className="border-b border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">8</span></td>
                                </tr>
                                <tr className="h-1/5">
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">9</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">10</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">11</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">12</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">13</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">14</span></td>
                                    <td className="border-b border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">15</span></td>
                                </tr>
                                <tr className="h-1/5">
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">16</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">17</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">18</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">19</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">20</span></td>
                                    <td className="border-b border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">21</span></td>
                                    <td className="border-b border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">22</span></td>
                                </tr>
                                <tr className="h-1/5">
                                    <td className="border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">23</span></td>
                                    <td className="border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">24</span></td>
                                    <td className="border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">25</span></td>
                                    <td className="border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">26</span></td>
                                    <td className="border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">27</span></td>
                                    <td className="border-r border-slate-100 relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">28</span></td>
                                    <td className="relative p-2 align-top"><span className="absolute top-2 right-2 text-[13px] text-slate-600">29</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'Gelen' || activeTab === 'Planlandı' ? (
                <div className="flex-1 bg-white rounded-t-xl shadow-lg mt-4 flex flex-col overflow-hidden border-x border-slate-200">
                    <div className="p-5 flex items-center justify-between border-b border-slate-100">
                        <div className="text-xl text-slate-400 font-light tracking-wide">{activeTab}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] bg-[#fbfdfd]">
                        <span className="text-[22px] font-medium text-slate-300 tracking-wide">- Veri yok -</span>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-white/50 text-base mt-10 italic">
                    Bu görünüm henüz hazır değil.
                </div>
            )}

            {isCreateModalOpen && <CreateDealModal onClose={() => setIsCreateModalOpen(false)} onSave={handleSaveDeal} />}
        </div>
    );
}
