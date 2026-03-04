import { X, Search, Calendar, ChevronDown, Check, Plus, Settings, Users } from 'lucide-react';

interface CreateDealModalProps {
    onClose: () => void;
}

const stages = [
    { id: 0, name: 'Personel', color: 'bg-slate-200 text-slate-600 border-slate-300' },
    { id: 1, name: 'Geliştiriliyor', color: 'bg-slate-200 text-slate-600 border-slate-300' },
    { id: 2, name: 'Sayfa oluştur', color: 'bg-slate-200 text-slate-600 border-slate-300' },
    { id: 3, name: 'Fatura', color: 'bg-slate-200 text-slate-600 border-slate-300' },
    { id: 4, name: 'Üzerinde çalışılıyor', color: 'bg-slate-200 text-slate-600 border-slate-300' },
    { id: 5, name: 'Nihai fatura', color: 'bg-slate-200 text-slate-600 border-slate-300' },
    { id: 6, name: 'Anlaşmayı kapat', color: 'bg-slate-200 text-slate-600 border-slate-300' },
];

const tabs = ['Genel', 'Ürünler', 'Tahminler', 'Faturalar', 'Otomasyon', 'Geçmiş', 'Market', 'Daha fazla v'];

export default function CreateDealModal({ onClose }: CreateDealModalProps) {
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-[100] transition-opacity backdrop-blur-[2px]" onClick={onClose} />

            {/* Modal Drawer */}
            <div className="fixed top-2 bottom-2 right-2 w-[98%] max-w-[1100px] bg-[#eef2f4] z-[101] shadow-2xl overflow-hidden flex flex-col rounded-2xl animate-in slide-in-from-right-8 duration-300">
                {/* Header Area */}
                <div className="bg-white/95 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/60 pt-6 px-10 flex flex-col gap-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-end gap-3">
                            <h2 className="text-[26px] font-semibold text-slate-700 leading-none tracking-tight">Yeni anlaşma</h2>
                            <span className="text-slate-400 text-sm font-medium flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors">
                                🔗 Varsayılan satış kanalı
                            </span>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-slate-100 rounded-full hover:bg-slate-200">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Stages (chevron styled) */}
                    <div className="flex w-full mb-1 drop-shadow-sm">
                        {stages.map((stage, idx) => (
                            <div
                                key={stage.id}
                                className={`flex-1 h-9 bg-[#e6ecef] relative flex items-center justify-center text-[13px] text-slate-500 font-semibold cursor-pointer hover:bg-slate-200 transition-colors
                  ${idx === 0 ? 'rounded-l-md' : 'border-l-[2px] border-white'}
                  ${idx === stages.length - 1 ? 'rounded-r-md' : ''}
                `}
                                style={idx !== stages.length - 1 ? { clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)' } : {}}
                            >
                                <div className={`absolute left-0 w-[10px] h-full ${idx > 0 ? 'bg-[#e6ecef]' : 'hidden'}`} style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>
                                <span className={`${idx > 0 && idx < stages.length - 1 ? 'ml-3' : ''} truncate px-2 z-10 hover:text-slate-700`}>{stage.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-8 text-[14px] font-medium border-b border-transparent mt-1">
                        {tabs.map((tab, idx) => (
                            <button
                                key={tab}
                                className={`pb-3 border-b-[3px] transition-colors ${idx === 0 ? 'border-blue-500 text-slate-700 bg-blue-50/50 px-3 rounded-t-md font-bold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#eef2f4]">
                    {/* Left Column (Fields) */}
                    <div className="md:col-span-6 lg:col-span-7 space-y-4">
                        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/50 p-6">
                            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    ANLAŞMA HAKKINDA <button className="text-slate-300 hover:text-slate-500">✎</button>
                                </h3>
                                <button className="text-[12px] text-slate-400 hover:text-slate-600">iptal</button>
                            </div>

                            <div className="space-y-6">
                                {/* Ad */}
                                <div>
                                    <label className="block text-[13px] text-slate-500 mb-1">Ad</label>
                                    <div className="relative flex items-center">
                                        <input type="text" placeholder="# numaralı Anlaşma" className="w-full border border-slate-200 rounded p-2.5 text-[14px] text-slate-700 outline-none focus:border-blue-400 transition-colors shadow-inner bg-[#fdfdfd]" />
                                        <Settings size={14} className="absolute -right-6 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>

                                {/* Aşama */}
                                <div>
                                    <label className="block text-[13px] text-slate-500 mb-1">Aşama</label>
                                    <div className="relative flex items-center">
                                        <select className="w-full border border-slate-200 rounded p-2.5 text-[14px] text-slate-700 outline-none focus:border-blue-400 appearance-none bg-[#fdfdfd] cursor-pointer transition-colors">
                                            <option>Personel</option>
                                            <option>Geliştiriliyor</option>
                                            <option>Sayfa oluştur</option>
                                            <option>Fatura</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
                                        <Settings size={14} className="absolute -right-6 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>

                                {/* Tutar ve Para Birimi */}
                                <div>
                                    <label className="block text-[13px] text-slate-500 mb-1">Tutar ve para birimi</label>
                                    <div className="flex items-center gap-3 relative">
                                        <input type="text" className="flex-[2] border border-slate-200 rounded p-2.5 text-[14px] text-slate-700 outline-none focus:border-blue-400 transition-colors bg-[#fdfdfd]" />
                                        <div className="relative flex-1">
                                            <select className="w-full border border-slate-200 rounded p-2.5 text-[14px] text-slate-700 outline-none focus:border-blue-400 appearance-none bg-[#fdfdfd] cursor-pointer">
                                                <option>Turkish Lira</option>
                                                <option>USD</option>
                                                <option>EUR</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                                        </div>
                                        <Settings size={14} className="absolute -right-6 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>

                                {/* Bitiş Tarihi */}
                                <div>
                                    <label className="block text-[13px] text-slate-500 mb-1">Bitiş tarihi</label>
                                    <div className="relative w-1/2 flex items-center">
                                        <input type="text" defaultValue="11.03.2026" className="w-full border border-slate-200 rounded p-2.5 pl-3 text-[14px] text-slate-700 outline-none focus:border-blue-400 transition-colors cursor-pointer bg-[#fdfdfd]" />
                                        <Calendar size={14} className="absolute right-3 text-slate-400 pointer-events-none" />
                                        <Settings size={14} className="absolute -right-6 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>

                                {/* Müşteri */}
                                <div>
                                    <label className="block text-[13px] text-slate-500 mb-1">Müşteri</label>
                                    <div className="relative border border-slate-200 rounded p-4 bg-[#fbfcfd]">
                                        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kişiler</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded p-2 mb-3 shadow-inner">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 shrink-0"><Users size={12} /></div>
                                            <input type="text" placeholder="Kişi adı, telefon veya e-posta" className="flex-1 text-[13px] outline-none bg-transparent placeholder-slate-400" />
                                            <Search size={14} className="text-slate-400 shrink-0 mr-1" />
                                        </div>
                                        <button className="text-blue-500 text-[13px] font-medium hover:underline transition-all">+ Katılımcı ekle</button>
                                        <Settings size={14} className="absolute -right-6 top-8 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Activity Stream) */}
                    <div className="md:col-span-6 lg:col-span-5 flex flex-col gap-4">
                        {/* Activity Header Tabs */}
                        <div className="bg-[#e4ebef] rounded-xl flex gap-1 p-1 shadow-sm border border-slate-200/50">
                            <button className="flex-1 py-3 text-[13px] font-medium text-[#419af9] bg-white shadow-sm rounded-lg transition-transform">Etkinlik</button>
                            <button className="flex-1 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-lg">Yorum</button>
                            <button className="flex-1 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-lg flex flex-col items-center justify-center leading-tight">Mesaj <span className="text-blue-500 text-[8px] font-bold">YENİ</span></button>
                            <button className="flex-1 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-lg">Rezervasyon</button>
                            <button className="flex-1 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-lg flex items-center justify-center gap-1"><Check size={14} /> Görev</button>
                            <button className="px-2 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-lg flex items-center justify-center gap-1">Daha fazla <ChevronDown size={14} /></button>
                        </div>

                        {/* Input Box */}
                        <div className="bg-white rounded-xl shadow border border-slate-200/50 p-4 min-h-[120px] flex flex-col justify-between">
                            <input type="text" placeholder="Yapılacaklar" className="w-full outline-none text-[14px] text-slate-700 placeholder-slate-400 bg-transparent font-medium" />
                            <div className="flex justify-end pt-4 mt-2">
                                <button className="text-[12px] font-semibold text-slate-400 flex items-center gap-1 hover:text-slate-600 transition-colors">eylemler <ChevronDown size={12} /></button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative flex flex-col items-center mt-6 h-full px-6">
                            {/* Central Line */}
                            <div className="absolute left-[34px] top-0 bottom-8 w-[2px] bg-slate-300 z-0"></div>

                            <div className="w-full flex items-center relative z-10 mb-6 group">
                                <div className="bg-emerald-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md tracking-wider">
                                    Yapılacaklar
                                </div>
                            </div>

                            <div className="w-full relative flex items-start gap-4 mb-4 z-10 group">
                                <div className="w-7 h-7 mt-2 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0 border-[3px] border-[#eef2f4] z-10 relative">
                                    <Plus size={14} className="opacity-90 font-bold" />
                                </div>

                                <div className="flex-1 bg-[#fbf2dd] rounded-lg p-5 shadow-sm border border-[#f0e3c5] flex items-start gap-4 hover:shadow transition-all cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Plus size={16} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-medium text-slate-800">Yeni bir etkinlik ekleyin</h4>
                                        <p className="text-[12px] text-slate-500 mt-1 leading-snug">Müşteriyi asla unutmamak için anlaşmadaki bir sonraki eyleminizi planlayın</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex items-center relative z-10 mb-6 mt-4 group">
                                <div className="bg-[#419af9] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md tracking-wider">
                                    Bugün
                                </div>
                            </div>

                            <div className="w-full relative flex items-start gap-4 z-10 group">
                                <div className="w-7 h-7 mt-1 rounded-full bg-[#419af9] text-white flex items-center justify-center shadow-md shrink-0 border-[3px] border-[#eef2f4] z-10 relative">
                                    <i className="font-serif italic text-[12px] leading-none shrink-0" style={{ marginLeft: "1px" }}>i</i>
                                </div>

                                <div className="flex-1 bg-[#e4ebef]/40 rounded-lg p-3 shadow-inner border border-slate-200/60 transition-all opacity-80">
                                    <p className="text-[13px] text-slate-500 font-medium">Şu anda bir anlaşma ekliyorsunuz...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="bg-[#f8f9fa] border-t border-slate-200/80 p-5 flex items-center justify-center gap-3 sticky bottom-0 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <button onClick={onClose} className="bg-[#bced4a] hover:bg-[#a6d83a] text-[#334b07] text-[13px] tracking-wide font-extrabold px-10 py-3 rounded shadow-sm transition-all uppercase">Kaydet</button>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-[13px] font-bold px-6 py-3 uppercase transition-all">İptal</button>
                </div>
            </div>
        </>
    );
}
