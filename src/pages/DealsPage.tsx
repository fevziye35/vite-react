import { useState } from 'react';
import { Plus, Search, ChevronDown, List, Activity, Settings, Filter, MoreHorizontal, X, Send } from 'lucide-react';
import CreateDealModal from '../components/CreateDealModal';

const columns = [
    { id: '1', title: 'Geliştiriliyor', color: 'bg-blue-400', count: 0, total: 0 },
    { id: '2', title: 'Sayfa oluştur', color: 'bg-cyan-400', count: 0, total: 0 },
    { id: '3', title: 'Fatura', color: 'bg-teal-300', count: 0, total: 0 },
    { id: '4', title: 'Üzerinde çalışılıyor', color: 'bg-green-300', count: 0, total: 0 },
    { id: '5', title: 'Nihai fatura', color: 'bg-amber-400', count: 0, total: 0 },
];

export default function DealsPage() {
    const [activeTab, setActiveTab] = useState('Kanban');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
                    {['0 Gelen', '0 Planlandı', '0 Daha fazla'].map(status => (
                        <button key={status} className="px-3 py-1.5 text-sm text-white/70 hover:text-white rounded flex items-center">
                            <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-xs mr-1 opacity-70">{status.split(' ')[0]}</span>
                            {status.split(' ')[1]} {status.includes('Daha fazla') && <ChevronDown size={14} className="ml-1" />}
                        </button>
                    ))}
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
            <div className="flex-1 overflow-x-auto flex items-start gap-px pr-4 pb-4">
                {columns.map(col => (
                    <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col border-r border-white/10 last:border-r-0 h-full">
                        {/* Column Header */}
                        <div className={`px-4 py-2 ${col.color} text-slate-900 mx-1 mb-3 relative group`}>
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span>{col.title.toUpperCase()} ({col.count})</span>
                                {col.color === 'bg-amber-400' && (
                                    <button className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/50 transition-colors">
                                        <Plus size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Column Stats */}
                        <div className="text-center mb-6">
                            <div className="text-2xl font-light text-white">{col.total} ₺</div>
                            <button className="text-white/50 text-xl hover:text-white/80 transition-colors mt-2">+</button>
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

                        {/* Column Body Area (Empty for now) */}
                        <div className="flex-1 px-2"></div>
                    </div>
                ))}
            </div>

            {isCreateModalOpen && <CreateDealModal onClose={() => setIsCreateModalOpen(false)} />}
        </div>
    );
}
