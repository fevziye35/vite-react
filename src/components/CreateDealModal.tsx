import { useState } from 'react';
import { X, Search, Calendar, ChevronDown, Check, Plus, Settings, Users, Edit2, Link as LinkIcon, User } from 'lucide-react';

interface CreateDealModalProps {
    onClose: () => void;
    onSave: (deal: any) => void;
}

const tabLinks = ['Genel', 'Ürünler', 'Tahminler', 'Faturalar', 'Otomasyon', 'Geçmiş', 'Market', 'Daha fazla v'];

export default function CreateDealModal({ onClose, onSave }: CreateDealModalProps) {
    const [title, setTitle] = useState('Anlaşma');
    const [stage, setStage] = useState('Geliştiriliyor');
    const [amount, setAmount] = useState('0');
    const [currency, setCurrency] = useState('₺');
    const [endDate, setEndDate] = useState(new Date().toLocaleDateString('tr-TR'));
    const [customer, setCustomer] = useState('');
    const [dealType, setDealType] = useState('Satış');
    const [startDate, setStartDate] = useState(new Date().toLocaleDateString('tr-TR'));

    // These base stages exactly match the ones in DealsPage
    const stagesList = ['Personel', 'Geliştiriliyor', 'Sayfa oluştur', 'Fatura', 'Üzerinde çalışılıyor', 'Nihai fatura'];

    // active index logic
    const activeStageIndex = stagesList.indexOf(stage);

    const handleSave = () => {
        onSave({
            id: Date.now().toString(),
            title,
            stage,
            amount: Number(amount) || 0,
            currency,
            endDate,
            customer,
            dealType,
            startDate
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-[100] transition-opacity backdrop-blur-[2px]" onClick={onClose} />

            {/* Modal Drawer */}
            <div className="fixed top-2 bottom-2 right-2 w-[98%] max-w-[1200px] bg-[#eef2f4] z-[101] shadow-2xl overflow-hidden flex flex-col rounded-2xl animate-in slide-in-from-right-8 duration-300">
                {/* Header */}
                <div className="bg-white/95 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/60 pt-6 px-10 flex flex-col gap-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-end gap-4">
                            <div className="flex items-center gap-2 group">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="text-[26px] font-semibold text-slate-800 leading-none tracking-tight bg-transparent outline-none hover:bg-slate-100 px-1 rounded transition-colors w-auto max-w-[400px]"
                                />
                                <Edit2 size={16} className="text-slate-300 group-hover:text-slate-500 cursor-pointer" />
                                <LinkIcon size={16} className="text-slate-300 hover:text-slate-500 cursor-pointer" />
                            </div>
                            <span className="text-slate-400 text-sm font-medium flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors ml-4 mb-1">
                                Varsayılan satış kanalı <ChevronDown size={14} />
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">📞</button>
                                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">✉️</button>
                                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">💬</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded text-sm hover:bg-slate-50">Uzantılar <ChevronDown size={14} className="inline ml-1" /></button>
                                <button className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-50"><Settings size={18} /></button>
                                <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded text-sm hover:bg-slate-50">Belge <ChevronDown size={14} className="inline ml-1" /></button>
                                <button className="px-4 py-1.5 bg-[#008cff] text-white font-medium rounded text-sm hover:bg-[#007ded]">Tahmin <ChevronDown size={14} className="inline ml-1" /></button>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors ml-2">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Stage Bar */}
                    <div className="flex w-full mb-1 h-8">
                        {stagesList.map((s, idx) => {
                            const isPast = idx < activeStageIndex;
                            const isActive = idx === activeStageIndex;
                            const bgColor = isActive ? 'bg-[#00d4e9] text-white shadow-md' : isPast ? 'bg-[#1ed499] text-white' : 'bg-[#e4ebf0] text-slate-500 hover:bg-slate-300';

                            return (
                                <div
                                    key={s}
                                    onClick={() => setStage(s)}
                                    className={`flex-1 relative flex items-center justify-center text-[12px] font-semibold cursor-pointer transition-all z-[${10 - idx}]
                                                ${idx === 0 ? 'rounded-l' : ''} ${bgColor}`}
                                    style={{
                                        clipPath: idx === 0
                                            ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
                                            : 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)',
                                        marginLeft: idx === 0 ? '0' : '-12px',
                                        width: idx === 0 ? '100%' : 'calc(100% + 12px)',
                                        zIndex: 20 - idx
                                    }}
                                >
                                    <span className={`truncate px-2 ${idx > 0 ? 'ml-3' : ''}`}>{s}</span>
                                </div>
                            );
                        })}
                        <div
                            className="flex-1 relative flex items-center justify-center text-[12px] font-semibold text-slate-500 bg-[#e4ebf0] cursor-pointer hover:bg-slate-300 rounded-r z-0"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 12px 50%)', marginLeft: '-12px', width: 'calc(100% + 12px)' }}
                        >
                            <span className="ml-3">Anlaşmayı kapat</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-[14px] font-medium border-b border-transparent mt-1 overflow-x-auto no-scrollbar">
                        {tabLinks.map((tab, idx) => (
                            <button key={tab} className={`pb-3 border-b-[3px] transition-colors whitespace-nowrap ${idx === 0 ? 'border-[#008cff] text-[#008cff] bg-[#008cff]/5 px-4 rounded-t-md font-bold block' : 'border-transparent text-slate-400 hover:text-slate-600 block'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#eef2f4]">
                    {/* Left Column */}
                    <div className="md:col-span-6 space-y-4">
                        <div className="bg-white rounded shadow-sm border border-slate-200/50 p-6 relative">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ANLAŞMA HAKKINDA</h3>
                                <button className="text-[12px] text-slate-400 hover:text-slate-600">düzenle</button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1">Aşama</label>
                                    <select value={stage} onChange={e => setStage(e.target.value)} className="w-full text-[14px] text-slate-700 outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-400 pb-1 cursor-pointer bg-transparent">
                                        {stagesList.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1">Tutar ve para birimi</label>
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-end gap-1">
                                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="text-[28px] font-light text-slate-800 outline-none w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400" />
                                            <span className="text-[20px] text-slate-500 mb-1">{currency}</span>
                                        </div>
                                        <button className="bg-[#00d4e9] text-white px-4 py-2 rounded text-[13px] font-bold tracking-wide hover:bg-[#00c5d9]">ÖDEME AL</button>
                                    </div>
                                </div>
                                <div className="border border-slate-200 rounded p-4 bg-[#fbfdfd]">
                                    <h4 className="text-[13px] text-slate-500 mb-2">Ödeme ve teslimat</h4>
                                    <p className="text-[12px] text-slate-400 italic mb-3">Bu kutuda ödemelerle ve teslimatlarla ilgili bilgiler gösterilecektir.</p>
                                    <button className="text-[13px] text-blue-500 mb-4 hover:underline">Ekle</button>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                        <span className="text-[13px] text-slate-400 flex items-center gap-1">Anlaşma toplamı <div className="w-3 h-3 rounded-full bg-slate-200 text-[9px] flex items-center justify-center text-slate-500 font-bold">?</div></span>
                                        <span className="text-[13px] font-medium text-slate-600">0 ₺</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1">Bitiş tarihi</label>
                                    <div className="flex items-center gap-2 group border-b border-transparent hover:border-slate-300 focus-within:border-blue-400 pb-1">
                                        <input type="text" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full text-[14px] text-slate-700 outline-none bg-transparent" />
                                        <Calendar size={14} className="text-slate-300 group-hover:text-slate-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1">Müşteri</label>
                                    <input type="text" value={customer} onChange={e => setCustomer(e.target.value)} placeholder="alan boş" className="w-full text-[14px] text-slate-700 outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-400 pb-1 placeholder-slate-300 bg-transparent" />
                                </div>

                                <div className="mt-2 text-[12px] text-slate-400 flex justify-between">
                                    <div className="flex gap-2">
                                        <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Alanı seç</span>
                                        <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Alan oluştur</span>
                                    </div>
                                    <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Bölümü sil</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Sections */}
                        <div className="bg-white rounded shadow-sm border border-slate-200/50 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">DAHA FAZLA</h3>
                                <button className="text-[12px] text-slate-400 hover:text-slate-600">düzenle</button>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1">Anlaşma türü</label>
                                    <select value={dealType} onChange={e => setDealType(e.target.value)} className="w-full text-[14px] text-slate-700 outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-400 pb-1 bg-transparent cursor-pointer">
                                        <option>Satış</option>
                                        <option>Hizmet</option>
                                        <option>Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1">Başlama tarihi</label>
                                    <div className="flex items-center gap-2 group border-b border-transparent hover:border-slate-300 focus-within:border-blue-400 pb-1">
                                        <input type="text" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full text-[14px] text-slate-700 outline-none bg-transparent" />
                                        <Calendar size={14} className="text-slate-300 group-hover:text-slate-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1">Herkese açık</label>
                                    <select className="w-full text-[14px] text-slate-700 outline-none border-b border-transparent hover:border-slate-300 focus:border-blue-400 pb-1 bg-transparent cursor-pointer">
                                        <option>Evet</option>
                                        <option>Hayır</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-2">Sorumlu</label>
                                    <div className="flex items-center gap-2 border border-slate-200 rounded-full py-1.5 px-3 bg-[#fdfdfd] w-max cursor-pointer hover:border-blue-300 shadow-sm">
                                        <div className="w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center shrink-0"><User size={14} /></div>
                                        <span className="text-[14px] text-[#008cff]">kullanici@makfacrm.com</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1">UTM parametreleri</label>
                                    <div className="text-[14px] text-slate-700 pb-1">Yok</div>
                                </div>

                                <div className="mt-2 text-[12px] text-slate-400 flex justify-between">
                                    <div className="flex gap-2">
                                        <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Alanı seç</span>
                                        <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Alan oluştur</span>
                                    </div>
                                    <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Bölümü sil</span>
                                </div>
                            </div>
                        </div>

                        {/* Ürünler Section */}
                        <div className="bg-white rounded shadow-sm border border-slate-200/50 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ÜRÜNLER</h3>
                                <button className="text-[12px] text-slate-400 hover:text-slate-600">düzenle</button>
                            </div>
                            <div>
                                <label className="block text-[13px] text-slate-400 mb-2">Ürünler</label>
                                <button className="w-full py-3 border border-dashed border-[#008cff] text-[#008cff] rounded text-[14px] font-medium bg-blue-50/20 hover:bg-blue-50 transition-colors flex items-center justify-center">
                                    + ekle
                                </button>
                            </div>

                            <div className="mt-4 text-[12px] text-slate-400 flex justify-between">
                                <div className="flex gap-2">
                                    <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Alanı seç</span>
                                    <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Alan oluştur</span>
                                </div>
                                <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Bölümü sil</span>
                            </div>
                        </div>

                        {/* Yinelenen Anlaşma */}
                        <div className="bg-white rounded shadow-sm border border-slate-200/50 p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">YİNELENEN ANLAŞMA</h3>
                                <button className="text-[12px] text-slate-400 hover:text-slate-600">düzenle</button>
                            </div>
                            <div>
                                <label className="block text-[13px] text-slate-400 mb-2">Tekrarla</label>
                                <div className="border border-slate-200 rounded py-2.5 px-3 text-[14px] text-slate-700 flex justify-between items-center cursor-not-allowed bg-[#fdfdfd]">
                                    Tekrarlama
                                    <LockIcon />
                                </div>
                            </div>

                            <div className="mt-4 text-[12px] text-slate-400 flex justify-between">
                                <div className="flex gap-2">
                                    <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Alanı seç</span>
                                    <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Alan oluştur</span>
                                </div>
                                <span className="hover:text-slate-600 cursor-pointer border-b border-dashed border-slate-300">Bölümü sil</span>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Activity Stream) */}
                    <div className="md:col-span-6 flex flex-col gap-4">
                        <div className="bg-white rounded-xl flex gap-1 p-1 shadow-sm border border-slate-200/60 overflow-x-auto no-scrollbar whitespace-nowrap">
                            <button className="px-6 py-2.5 text-[13px] font-medium text-[#008cff] bg-[#eef2f4] rounded transition-transform font-bold">Etkinlik</button>
                            <button className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors rounded">Yorum</button>
                            <button className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors rounded">Mesaj</button>
                            <button className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors rounded flex flex-col items-center justify-center relative">
                                Rezervasyon
                                <span className="text-[#008cff] text-[8px] font-bold absolute top-0.5 right-0">YENİ</span>
                            </button>
                            <button className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors rounded flex items-center justify-center gap-1"><Check size={14} /> Görev</button>
                            <button className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 transition-colors rounded flex items-center justify-center gap-1">Daha fazla <ChevronDown size={14} /></button>
                        </div>

                        <div className="bg-white rounded p-4 flex items-center border border-slate-200/60 shadow-sm relative ml-10 gap-3">
                            <div className="w-8 h-8 bg-[#008cff] text-white rounded-full flex justify-center items-center absolute -left-4 shadow-md border-[3px] border-[#eef2f4] z-10">
                                <span className="font-bold text-sm">💬</span>
                            </div>
                            <input type="text" placeholder="Yapılacaklar" className="flex-1 outline-none text-[14px] text-slate-700 bg-transparent font-medium" />
                            <button className="text-[12px] text-slate-400 font-semibold flex items-center gap-1">eylemler <ChevronDown size={12} /></button>
                        </div>

                        <div className="w-full flex items-center bg-white rounded-full border border-slate-200 shadow-sm py-2 px-4 justify-start gap-2 relative mt-2 ml-10 mb-4" style={{ width: 'calc(100% - 2.5rem)' }}>
                            <div className="w-8 h-8 rounded-full bg-[#008cff] text-white flex justify-center items-center absolute -left-4 shadow-md border-[3px] border-[#eef2f4]">
                                <span className="font-bold text-sm">💬</span>
                            </div>
                            <div className="w-5 h-5 bg-slate-200 rounded-full flex justify-center items-center ml-4 shrink-0 shadow-inner">
                                <User size={12} className="text-slate-500" />
                            </div>
                            <span className="text-slate-400 cursor-pointer hover:text-slate-700 font-medium text-[13px]">Sohbette tartış</span>
                        </div>

                        <div className="relative flex flex-col items-center mt-2 h-full px-6">
                            <div className="absolute left-[34px] top-0 bottom-8 w-[2px] bg-slate-300 z-0 opacity-50"></div>

                            <div className="w-full flex items-center relative z-10 mb-4 group justify-center mt-2">
                                <div className="bg-[#1ed499] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm">Yapılacaklar</div>
                            </div>

                            <div className="w-full relative flex items-start gap-4 mb-4 z-10 group">
                                <div className="w-5 h-5 mt-2 rounded-full bg-[#1ed499] text-white flex items-center justify-center shadow-md shrink-0 border-2 border-[#eef2f4] z-10 relative">
                                    <Plus size={12} className="font-bold" />
                                </div>
                                <div className="flex-1 bg-[#fffbe6] rounded p-4 border border-[#f5eed6] flex items-start gap-4 shadow-sm cursor-pointer hover:shadow transition-all group-hover:border-[#e8dcb8]">
                                    <div className="w-6 h-6 rounded-full bg-[#1ed499]/20 text-[#1ed499] flex items-center justify-center shrink-0">
                                        <Plus size={12} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-bold text-slate-700 mb-1">Yeni bir etkinlik ekleyin</h4>
                                        <p className="text-[12px] text-slate-500 leading-snug">Müşteriyi asla unutmamak için anlaşmadaki bir sonraki eyleminizi planlayın</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex items-center relative z-10 mb-4 group justify-center mt-4 border-t border-slate-300/50 pt-6">
                                <div className="bg-[#008cff] text-white text-[11px] font-bold px-5 py-1.5 rounded-full shadow-sm mt-[-14px]">Bugün</div>
                            </div>

                            <div className="w-full relative flex items-start gap-4 mb-4 z-10 group justify-end pr-2">
                                <div className="text-[11px] font-medium text-slate-400 mt-1 cursor-pointer hover:text-slate-600 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                                    <FilterIcon /> FİLTRE
                                </div>
                            </div>

                            {/* Timeline Items */}
                            {[
                                { time: '14:39', title: 'Aşama değiştirildi', from: 'Fatura', to: 'Üzerinde çalışılıyor' },
                                { time: '14:38', title: 'Aşama değiştirildi', from: 'Sayfa oluştur', to: 'Fatura' },
                                { time: '14:38', title: 'Anlaşma oluşturuldu', msg: 'ass' }
                            ].map((event, idx) => (
                                <div key={idx} className="w-full relative flex items-start gap-4 z-10 group mb-6">
                                    <div className="w-5 h-5 mt-1 rounded-full bg-[#fdfdfd] flex items-center justify-center shadow-sm shrink-0 border-[3px] border-[#eef2f4] z-10 relative">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 bg-white rounded p-4 border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)] opacity-80 hover:opacity-100 transition-opacity">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="text-[13px] font-bold text-slate-700">{event.title} <span className="font-normal text-slate-400 ml-1">{event.time}</span></h5>
                                            <User size={14} className="text-slate-300" />
                                        </div>
                                        {event.from && (
                                            <div className="flex items-center gap-2 text-[12px] text-slate-600 mt-3 border-t border-slate-100 pt-3">
                                                <span className="px-2 py-1 bg-[#f5f7f9] text-slate-600 border border-slate-200/60 rounded text-[11px] font-medium">{event.from}</span>
                                                <span className="text-slate-400">→</span>
                                                <span className="px-2 py-1 bg-[#f5f7f9] text-slate-600 border border-slate-200/60 rounded text-[11px] font-medium">{event.to}</span>
                                            </div>
                                        )}
                                        {event.msg && (
                                            <div className="text-[13px] text-slate-600 mt-3 border-t border-slate-100 pt-3 font-medium">{event.msg}</div>
                                        )}
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-slate-200/80 p-4 flex items-center justify-center gap-4 sticky bottom-0 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <button onClick={handleSave} className="bg-[#bced4a] hover:bg-[#a6d83a] text-[#40560a] text-[13px] font-extrabold px-10 py-3 rounded shadow-sm uppercase tracking-wider transition-colors">Kaydet</button>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-[13px] font-bold px-6 py-3 uppercase transition-all">İptal</button>
                </div>
            </div>
        </>
    );
}

function LockIcon() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#008cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
}

function FilterIcon() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
}
