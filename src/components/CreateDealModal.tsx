import { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, Check, Plus, Settings, Edit2, Link as LinkIcon, User, Building, List, ListOrdered, AtSign, Search, Lock, Image as ImageIcon } from 'lucide-react';

function GearIcon() {
    return <Settings size={14} className="text-slate-300 hover:text-slate-500 cursor-pointer ml-3 shrink-0" />;
}

function FilterIcon() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
}

interface CreateDealModalProps {
    onClose: () => void;
    onSave: (deal: any) => void;
}

const tabLinks = ['Genel', 'Ürünler', 'Tahminler', 'Faturalar', 'İlgili öğeler'];

function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}

export default function CreateDealModal({ onClose, onSave }: CreateDealModalProps) {
    const [title, setTitle] = useLocalStorage('createDeal_title', 'Anlaşma');
    const [stage, setStage] = useLocalStorage('createDeal_stage', 'Müşteriye Teklif Atıldı');
    const [amount, setAmount] = useLocalStorage('createDeal_amount', '0');
    const [currency, setCurrency] = useLocalStorage('createDeal_currency', '₺');
    const [endDate, setEndDate] = useLocalStorage('createDeal_endDate', new Date().toLocaleDateString('tr-TR'));
    const [customer, setCustomer] = useLocalStorage('createDeal_customer', '');
    const [dealType, setDealType] = useLocalStorage('createDeal_dealType', 'Satış');
    const [startDate, setStartDate] = useLocalStorage('createDeal_startDate', new Date().toLocaleDateString('tr-TR'));
    const [isSelectFieldModalOpen, setIsSelectFieldModalOpen] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState('Genel');

    const [dealProducts, setDealProducts] = useLocalStorage<any[]>('createDeal_products', [
        { id: '1', name: '', price: 0, quantity: 1, unit: 'adet' }
    ]);

    const addProductRow = () => {
        setDealProducts([...dealProducts, { id: Date.now().toString(), name: '', price: 0, quantity: 1, unit: 'adet' }]);
    };

    const removeProductRow = (id: string) => {
        setDealProducts(dealProducts.filter(p => p.id !== id));
    };

    const updateProduct = (id: string, field: string, value: any) => {
        setDealProducts(dealProducts.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const subtotal = dealProducts.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);
    const taxRate = 0;
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount;

    const stagesList = ['Müşteriye Teklif Atıldı', 'Cevap Bekleniyor', 'Proforma Atıldı', 'Bekleniyor', 'Anlaşma Kazanıldı', 'Anlaşma Kaybedildi'];
    const activeStageIndex = stagesList.indexOf(stage);

    const handleSave = () => {
        onSave({
            id: Date.now().toString(),
            title,
            stage,
            amount: Number(grandTotal) || Number(amount) || 0,
            currency,
            endDate,
            customer,
            dealType,
            startDate,
            products: dealProducts
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
                    </div>

                    <div className="flex items-center gap-6 text-[14px] font-medium border-b border-transparent mt-1 overflow-x-auto no-scrollbar">
                        {tabLinks.map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => setActiveModalTab(tab)}
                                className={`pb-3 border-b-[3px] transition-colors whitespace-nowrap ${activeModalTab === tab ? 'border-[#008cff] text-[#008cff] bg-[#008cff]/5 px-4 rounded-t-md font-bold block' : 'border-transparent text-slate-400 hover:text-slate-600 block'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Switcher */}
                {activeModalTab === 'Ürünler' ? (
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                        {/* Product Table Container */}
                        <div className="w-full">
                            <table className="w-full text-left border-collapse">
                                <thead className="border-b border-slate-100">
                                    <tr className="text-slate-400 text-[13px] font-normal">
                                        <th className="w-10 px-2 py-4 text-center"><Settings size={16} className="mx-auto" /></th>
                                        <th className="px-4 py-4 font-normal">Ürün</th>
                                        <th className="px-4 py-4 text-center w-[120px] font-normal">Fiyat</th>
                                        <th className="px-4 py-4 text-center w-[120px] font-normal">Adet</th>
                                        <th className="px-4 py-4 text-right w-[140px] font-normal pr-8">Tutar</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {dealProducts.map((p, idx) => (
                                        <tr key={p.id} className="group border-b border-slate-50">
                                            <td className="px-2 py-6 align-top">
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <button onClick={() => removeProductRow(p.id)} className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
                                                        <X size={14} />
                                                    </button>
                                                    <List size={18} className="cursor-move" />
                                                    <span className="text-[14px] text-slate-500">{idx + 1}.</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 relative group/search">
                                                        <input 
                                                            type="text" 
                                                            value={p.name}
                                                            onChange={(e) => updateProduct(p.id, 'name', e.target.value)}
                                                            placeholder="Yeni bir ürün bulun veya oluşturun" 
                                                            className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded outline-none focus:border-blue-400 text-[14px] text-slate-600 placeholder:text-slate-300 transition-colors"
                                                        />
                                                        <Search size={18} className="absolute right-3 top-2.5 text-slate-300" />
                                                    </div>
                                                    <div className="w-10 h-10 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-300 hover:border-blue-300 hover:text-blue-300 cursor-pointer transition-colors bg-slate-50/30">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 align-top">
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        value={p.price}
                                                        onChange={(e) => updateProduct(p.id, 'price', e.target.value)}
                                                        className="w-full text-right px-4 py-2 border border-slate-200 rounded outline-none focus:border-blue-400 text-[14px] text-slate-600" 
                                                    />
                                                    <span className="absolute right-3 top-2.5 text-slate-400 text-[14px]">₺</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 align-top">
                                                <div className="flex items-center gap-2 border border-slate-200 rounded px-1 group-focus-within:border-blue-400">
                                                    <input 
                                                        type="number" 
                                                        value={p.quantity}
                                                        onChange={(e) => updateProduct(p.id, 'quantity', e.target.value)}
                                                        className="w-full text-right py-2 outline-none text-[14px] text-slate-600 font-medium" 
                                                    />
                                                    <span className="text-slate-400 text-[13px] border-b border-dashed border-slate-300 pr-2">adet.</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 align-top text-right pr-8">
                                                <div className="relative">
                                                    <div className="w-full text-right px-4 py-2 border border-slate-100 bg-slate-50/30 rounded text-[14px] text-slate-600">
                                                        {(Number(p.price) * Number(p.quantity)).toLocaleString('tr-TR')}
                                                    </div>
                                                    <span className="absolute right-3 top-2.5 text-slate-400">₺</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-4">
                                <button onClick={addProductRow} className="text-[#008cff] text-[13px] font-medium flex items-center gap-1 hover:text-[#007ded] transition-colors border-b border-dashed border-[#008cff]/30 pb-0.5 ml-14">
                                    <Plus size={14} /> Yeni bir ürün ekle
                                </button>
                            </div>

                            <div className="flex justify-end pr-8 pt-10">
                                <div className="w-[350px] space-y-4">
                                    <div className="flex justify-between items-center text-[14px] text-slate-600">
                                        <span className="font-light">İskontosuz toplam ve vergiler:</span>
                                        <span className="font-medium">{subtotal.toLocaleString('tr-TR')}₺</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[14px] text-slate-600">
                                        <span className="font-light">Teslimat ücreti:</span>
                                        <span className="font-medium">0₺</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[14px]">
                                        <span className="text-[#98a41c] font-light">İndirim tutarı:</span>
                                        <span className="text-[#98a41c] font-medium">0₺</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[14px] text-slate-600">
                                        <span className="font-light">Vergi öncesi toplam:</span>
                                        <span className="font-medium">{subtotal.toLocaleString('tr-TR')}₺</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[14px] text-slate-600">
                                        <span className="font-light">Vergi toplamı:</span>
                                        <span className="font-medium">0₺</span>
                                    </div>
                                    <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[20px] font-semibold text-slate-700">Toplam Tutar:</span>
                                        <span className="text-[22px] font-bold text-slate-800">{grandTotal.toLocaleString('tr-TR')}₺</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#eef2f4]">
                        {/* Left Column */}
                        <div className="md:col-span-6 space-y-4">
                            {/* Section 1 */}
                            <div className="bg-white rounded shadow-sm border border-slate-200/50 p-6 relative">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">ANLAŞMA HAKKINDA <Edit2 size={12} className="text-slate-300 cursor-pointer hover:text-slate-500" /></h3>
                                    <button className="text-[12px] text-slate-400 hover:text-slate-600">iptal</button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Ad</label>
                                        <div className="flex items-center w-full">
                                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="# numaralı Anlaşma" className="flex-1 w-full text-[14px] text-slate-700 border border-slate-300 rounded p-2.5 outline-none focus:border-blue-400" />
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Aşama</label>
                                        <div className="flex items-center w-full">
                                            <select value={stage} onChange={e => setStage(e.target.value)} className="flex-1 w-full text-[14px] text-slate-700 border border-slate-300 rounded p-2.5 outline-none focus:border-blue-400 cursor-pointer bg-white">
                                                {stagesList.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Tutar ve para birimi</label>
                                        <div className="flex items-center w-full gap-3">
                                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 min-w-0 text-[14px] text-slate-700 border border-slate-300 rounded p-2.5 outline-none focus:border-blue-400" />
                                            <select
                                                value={currency}
                                                onChange={e => setCurrency(e.target.value)}
                                                className="w-[140px] text-[14px] text-slate-700 border border-slate-300 rounded p-2.5 outline-none focus:border-blue-400 bg-white cursor-pointer"
                                            >
                                                <option value="₺">Turkish Lira (₺)</option>
                                                <option value="$">US Dollar ($)</option>
                                                <option value="€">Euro (€)</option>
                                            </select>
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Bitiş tarihi</label>
                                        <div className="flex items-center w-full">
                                            <div className="flex-1 flex items-center border border-slate-300 rounded p-2.5 bg-white focus-within:border-blue-400">
                                                <input type="text" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 text-[14px] text-slate-700 outline-none w-full" />
                                                <Calendar size={16} className="text-slate-300" />
                                            </div>
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Müşteri</label>
                                        <div className="flex items-start w-full">
                                            <div className="flex-1 border border-slate-200 rounded p-4 bg-white shadow-sm">
                                                <div className="mb-4">
                                                    <label className="block text-[13px] text-slate-400 mb-1">Kişiler</label>
                                                    <div className="flex items-center border border-slate-300 rounded p-2 bg-white focus-within:border-blue-400">
                                                        <div className="w-5 h-5 bg-slate-400 text-white rounded-full flex items-center justify-center mr-2 shrink-0"><User size={12} /></div>
                                                        <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Kişi adı, telefon veya e-posta" className="flex-1 outline-none text-[14px] text-slate-700" />
                                                        <Search size={14} className="text-slate-400" />
                                                    </div>
                                                    <div className="mt-2 text-[13px] text-slate-500 cursor-pointer border-b border-dashed border-slate-300 w-max hover:text-slate-800">+ Katılımcı ekle</div>
                                                </div>
                                                <div>
                                                    <label className="block text-[13px] text-slate-400 mb-1">Şirket</label>
                                                    <div className="flex items-center border border-slate-300 rounded p-2 bg-white focus-within:border-blue-400">
                                                        <div className="w-5 h-5 bg-slate-400 text-white rounded-full flex items-center justify-center mr-2 shrink-0"><Building size={12} /></div>
                                                        <input type="text" placeholder="Şirket adı, telefon veya e-posta" className="flex-1 outline-none text-[14px] text-slate-700" />
                                                        <Search size={14} className="text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-2 text-[13px] flex justify-between">
                                        <div className="flex gap-4">
                                            <span onClick={() => setIsSelectFieldModalOpen(true)} className="text-slate-500 hover:text-slate-700 cursor-pointer border-b border-dashed border-slate-300 pb-0.5">Alanı seç</span>
                                            <span className="text-slate-500 hover:text-slate-700 cursor-pointer border-b border-dashed border-slate-300 pb-0.5">Alan oluştur</span>
                                        </div>
                                        <span className="text-red-500 hover:text-red-600 cursor-pointer border-b border-dashed border-red-300 pb-0.5">Bölümü sil</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Daha Fazla */}
                            <div className="bg-white rounded shadow-sm border border-slate-200/50 p-6 relative">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">DAHA FAZLA <Edit2 size={12} className="text-slate-300 cursor-pointer hover:text-slate-500" /></h3>
                                    <button className="text-[12px] text-slate-400 hover:text-slate-600">iptal</button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Anlaşma türü</label>
                                        <div className="flex items-center w-full">
                                            <select value={dealType} onChange={e => setDealType(e.target.value)} className="flex-1 w-full text-[14px] text-slate-700 border border-slate-300 rounded p-2.5 outline-none focus:border-blue-400 cursor-pointer bg-white">
                                                <option>Satış</option>
                                                <option>Hizmet</option>
                                                <option>Diğer</option>
                                            </select>
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Kaynak</label>
                                        <div className="flex items-center w-full">
                                            <select className="flex-1 w-full text-[14px] text-slate-700 border border-slate-300 rounded p-2.5 outline-none focus:border-blue-400 cursor-pointer bg-white">
                                                <option>Seçilmedi</option>
                                            </select>
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Kaynak bilgileri</label>
                                        <div className="flex items-start w-full">
                                            <textarea className="flex-1 w-full text-[14px] text-slate-700 border border-slate-300 rounded p-2 outline-none focus:border-blue-400 h-24 resize-none"></textarea>
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[13px] text-slate-400 mb-1">Başlama tarihi</label>
                                        <div className="flex items-center w-full">
                                            <div className="flex-1 flex items-center border border-slate-300 rounded p-2.5 bg-white focus-within:border-blue-400">
                                                <input type="text" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 text-[14px] text-slate-700 outline-none w-full" />
                                                <Calendar size={16} className="text-slate-300" />
                                            </div>
                                            <GearIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center w-full mt-6">
                                            <div className="flex-1 flex items-center gap-2">
                                                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-500 cursor-pointer" />
                                                <label className="text-[14px] text-slate-700 cursor-pointer">Herkese açık</label>
                                            </div>
                                            <GearIcon />
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-5 mt-5">
                                        <label className="block text-[13px] text-slate-400 mb-1">Sorumlu</label>
                                        <div className="flex items-start w-full">
                                            <div className="flex-1 border border-slate-300 rounded p-3 flex items-center justify-between bg-white relative">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center shrink-0"><User size={20} /></div>
                                                    <span className="text-[14px] text-[#008cff]">fevziye.mamak35@gmail.com</span>
                                                </div>
                                                <button className="text-[10px] text-slate-500 hover:text-slate-700 font-bold tracking-wider absolute right-3 -top-2.5 bg-white px-1">DEĞİŞTİR</button>
                                            </div>
                                            <GearIcon />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-[13px] text-slate-400 mb-1">Gözlemciler</label>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="text-[13px] text-slate-500 cursor-pointer border-b border-dashed border-slate-300 w-max hover:text-slate-800">+ Gözlemci ekle</div>
                                            <GearIcon />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-[13px] text-slate-400 mb-1">Yorum</label>
                                        <div className="flex items-start w-full">
                                            <div className="flex-1 border border-slate-300 rounded overflow-hidden bg-white shadow-sm">
                                                <div className="flex items-center gap-4 border-b border-slate-200 p-2 bg-[#fdfdfd] text-slate-500">
                                                    <span className="font-bold text-[14px] cursor-pointer hover:text-slate-800">B</span>
                                                    <span className="italic font-serif text-[15px] cursor-pointer hover:text-slate-800">I</span>
                                                    <span className="underline text-[14px] cursor-pointer hover:text-slate-800">U</span>
                                                    <span className="line-through text-[14px] cursor-pointer hover:text-slate-800">S</span>
                                                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                                    <ListOrdered size={16} className="cursor-pointer hover:text-slate-800" />
                                                    <List size={16} className="cursor-pointer hover:text-slate-800" />
                                                    <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                                    <LinkIcon size={16} className="cursor-pointer hover:text-slate-800" />
                                                    <AtSign size={16} className="cursor-pointer text-purple-500 hover:text-purple-700" />
                                                </div>
                                                <textarea className="w-full h-24 p-3 outline-none resize-none text-[14px] text-slate-700 bg-white"></textarea>
                                            </div>
                                            <GearIcon />
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-2 text-[13px] flex justify-between">
                                        <div className="flex gap-4">
                                            <span onClick={() => setIsSelectFieldModalOpen(true)} className="text-slate-500 hover:text-slate-700 cursor-pointer border-b border-dashed border-slate-300 pb-0.5">Alanı seç</span>
                                            <span className="text-slate-500 hover:text-slate-700 cursor-pointer border-b border-dashed border-slate-300 pb-0.5">Alan oluştur</span>
                                        </div>
                                        <span className="text-red-500 hover:text-red-600 cursor-pointer border-b border-dashed border-red-300 pb-0.5">Bölümü sil</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Ürünler */}
                            <div className="bg-white rounded shadow-sm border border-slate-200/50 p-6 relative">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 
                                        onClick={() => setActiveModalTab('Ürünler')}
                                        className="text-[11px] font-bold text-[#008cff] uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
                                    >
                                        ÜRÜNLER <Edit2 size={12} className="text-slate-300" />
                                    </h3>
                                    <button className="text-[12px] text-slate-400 hover:text-slate-600">iptal</button>
                                </div>
                                <div className="flex items-start w-full">
                                    <div className="flex-1">
                                        <label className="block text-[13px] text-slate-400 mb-2">Ürünler</label>
                                        <button 
                                            onClick={() => setActiveModalTab('Ürünler')}
                                            className="w-full py-3 border border-dashed border-[#008cff] text-[#008cff] rounded text-[14px] font-medium bg-blue-50/20 hover:bg-blue-50 transition-colors flex items-center justify-center"
                                        >
                                            + ekle
                                        </button>
                                    </div>
                                    <div className="mt-7">
                                        <GearIcon />
                                    </div>
                                </div>
                                <div className="mt-6 pt-2 text-[13px] flex justify-between">
                                    <div className="flex gap-4">
                                        <span onClick={() => setIsSelectFieldModalOpen(true)} className="text-slate-500 hover:text-slate-700 cursor-pointer border-b border-dashed border-slate-300 pb-0.5">Alanı seç</span>
                                        <span className="text-slate-500 hover:text-slate-700 cursor-pointer border-b border-dashed border-slate-300 pb-0.5">Alan oluştur</span>
                                    </div>
                                    <span className="text-red-500 hover:text-red-600 cursor-pointer border-b border-dashed border-red-300 pb-0.5">Bölümü sil</span>
                                </div>
                            </div>

                            {/* Section 4: Yinelenen Anlaşma */}
                            <div className="bg-white rounded shadow-sm border border-slate-200/50 p-6 relative">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">YİNELENEN ANLAŞMA <Edit2 size={12} className="text-slate-300 cursor-pointer hover:text-slate-500" /></h3>
                                    <button className="text-[12px] text-slate-400 hover:text-slate-600">iptal</button>
                                </div>
                                <div className="flex items-start w-full">
                                    <div className="flex-1">
                                        <label className="block text-[13px] text-slate-400 mb-2">Tekrarla</label>
                                        <div className="border border-slate-300 rounded p-2.5 text-[14px] text-slate-700 flex justify-between items-center bg-[#fdfdfd]">
                                            Tekrarlama
                                            <Lock size={14} className="text-[#008cff]" />
                                        </div>
                                    </div>
                                    <div className="mt-7">
                                        <GearIcon />
                                    </div>
                                </div>
                                <div className="mt-6 pt-2 text-[13px] flex justify-between">
                                    <div className="flex gap-4">
                                        <span onClick={() => setIsSelectFieldModalOpen(true)} className="text-slate-500 hover:text-slate-700 cursor-pointer border-b border-dashed border-slate-300 pb-0.5">Alanı seç</span>
                                        <span className="text-slate-500 hover:text-slate-700 cursor-pointer border-b border-dashed border-slate-300 pb-0.5">Alan oluştur</span>
                                    </div>
                                    <span className="text-red-500 hover:text-red-600 cursor-pointer border-b border-dashed border-red-300 pb-0.5">Bölümü sil</span>
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
                )}

                {/* Footer */}
                <div className="bg-white border-t border-slate-200/80 p-4 flex items-center justify-center gap-4 sticky bottom-0 z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <button onClick={handleSave} className="bg-[#bced4a] hover:bg-[#a6d83a] text-[#40560a] text-[13px] font-extrabold px-10 py-3 rounded shadow-sm uppercase tracking-wider transition-colors">Kaydet</button>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-[13px] font-bold px-6 py-3 uppercase transition-all">İptal</button>
                </div>
            </div>

            {/* Select Fields Modal */}
            {isSelectFieldModalOpen && (
                <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-[16px] text-slate-600">Alanları seçin</h2>
                            <button onClick={() => setIsSelectFieldModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 flex items-center border border-slate-300 rounded p-2 focus-within:border-blue-400">
                                    <input type="text" placeholder="Alan bul" className="flex-1 outline-none text-[14px] text-slate-700 font-light" />
                                    <Search size={16} className="text-slate-400" />
                                </div>
                                <div className="border border-[#00d4e9] rounded px-4 py-2 text-[14px] text-slate-700 relative flex items-center justify-center min-w-[100px] cursor-pointer">
                                    Anlaşma
                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#00d4e9] rounded-full flex items-center justify-center text-white"><Check size={10} strokeWidth={4} /></div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-[15px] text-slate-600 mb-4 border-b border-slate-100 pb-2">Daha fazla</h3>
                                <div className="grid grid-cols-3 gap-y-4">
                                    {['Anlaşma türü', 'Başlama tarihi', 'Gözlemciler', 'Kaynak', 'Herkese açık', 'Yorum', 'Kaynak bilgileri', 'Sorumlu', 'UTM parametreleri'].map(field => (
                                        <label key={field} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="w-3.5 h-3.5 border-slate-300 rounded text-blue-500 cursor-pointer" />
                                            <span className="text-[13px] text-slate-600">{field}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[15px] text-slate-600 mb-4 border-b border-slate-100 pb-2">Gizli alanlar</h3>
                                <div className="grid grid-cols-3 gap-y-4">
                                    {['ID', 'Olasılık', 'Satış Zekası', 'Oluşturulma Tarihi', 'Aşamayı değiştiren', 'Son iletişim', 'Değiştirme Tarihi', 'Aşama değişimi tarihi'].map(field => (
                                        <label key={field} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="w-3.5 h-3.5 border-slate-300 rounded text-blue-500 cursor-pointer" />
                                            <span className="text-[13px] text-slate-600">{field}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-[#fbfbfb]">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 border-slate-300 rounded text-blue-500 cursor-pointer" />
                                <span className="text-[13px] text-slate-600">tümünü seç</span>
                            </label>
                            <div className="flex gap-2">
                                <button className="bg-[#b0edf4] hover:bg-[#a1e8f0] text-white px-6 py-2 rounded text-[12px] font-bold tracking-wider transition">SEÇ</button>
                                <button onClick={() => setIsSelectFieldModalOpen(false)} className="px-4 py-2 rounded text-[12px] font-bold tracking-wider text-slate-500 hover:bg-slate-200 transition">İPTAL</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
