import { useState, useRef } from 'react';
import { X, FileText, Package, Clock, Archive, Upload, Plus, CreditCard } from 'lucide-react';
import type { Customer } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface CustomerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer | null;
}

type TabType = 'history' | 'offers' | 'orders' | 'legacy' | 'payments';

export function CustomerDetailModal({ isOpen, onClose, customer }: CustomerDetailModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('history');
    const [legacyForm, setLegacyForm] = useState({
        proformaNo: '',
        oldOfferNo: '',
        freightInfo: '',
        extraNotes: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mutable state for the tab data
    const [tabData, setTabData] = useState({
        history: [] as any[],
        offers: [] as any[],
        orders: [] as any[],
        payments: [] as any[]
    });

    const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [entryForm, setEntryForm] = useState({
        date: '',
        author: '',
        price: '',
        loadingDate: '',
        amount: '',
        remaining: '',
        shipment: ''
    });

    const handleOpenForm = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setEntryForm({
                date: item.date || '',
                author: item.author || '',
                price: item.price || '',
                loadingDate: item.loadingDate || '',
                amount: item.amount || '',
                remaining: item.remaining || '',
                shipment: item.shipment || ''
            });
        } else {
            setEditingItem(null);
            setEntryForm({
                date: '',
                author: '',
                price: '',
                loadingDate: '',
                amount: '',
                remaining: '',
                shipment: ''
            });
        }
        setIsEntryFormOpen(true);
    };

    const handleSaveEntry = () => {
        const newData = { ...tabData };
        const currentTabData = [...newData[activeTab as keyof typeof tabData]];

        if (editingItem) {
            const index = currentTabData.findIndex(i => i.id === editingItem.id);
            if (index !== -1) {
                currentTabData[index] = { ...editingItem, ...entryForm };
            }
        } else {
            currentTabData.unshift({
                id: Math.random().toString(36).substr(2, 9),
                ...entryForm
            });
        }

        newData[activeTab as keyof typeof tabData] = currentTabData;
        setTabData(newData);
        setIsEntryFormOpen(false);
    };

    const handleDeleteEntry = (id: string) => {
        if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
            const newData = { ...tabData };
            newData[activeTab as keyof typeof tabData] = newData[activeTab as keyof typeof tabData].filter(i => i.id !== id);
            setTabData(newData);
        }
    };

    if (!isOpen || !customer) return null;

    const tabs: { id: TabType; label: string; icon: any }[] = [
        { id: 'history', label: 'History', icon: Clock },
        { id: 'offers', label: 'Offers', icon: FileText },
        { id: 'orders', label: 'Open Orders', icon: Package },
        { id: 'payments', label: 'Alınan Ödemeler', icon: CreditCard },
        { id: 'legacy', label: 'Legacy Orders', icon: Archive },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#1e293b] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/10">

                {/* Header */}
                <div className="bg-white/5 backdrop-blur-xl p-6 border-b border-white/10 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                            {customer.companyName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{customer.companyName}</h2>
                            <div className="flex items-center gap-2 mt-1 text-white/60 text-sm">
                                <span>{customer.contactPerson}</span>
                                <span>•</span>
                                <span>{customer.country}</span>
                                <span>•</span>
                                <span className="font-mono text-xs">{customer.email}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                {Array.isArray(customer.tags) ? (
                                    customer.tags.map(tag => (
                                        <Badge key={tag} variant="neutral" className="text-xs bg-white/5 border-white/10 text-white/70">
                                            {tag}
                                        </Badge>
                                    ))
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/40 hover:text-white hover:bg-white/10">
                        <X />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="bg-white/5 border-b border-white/10 px-6 flex gap-8 overflow-x-auto whitespace-nowrap shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab.id
                                ? 'border-blue-400 text-blue-400'
                                : 'border-transparent text-white/40 hover:text-white'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#17202b]">
                    {activeTab === 'legacy' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Legacy Order Archive</h3>
                                    <p className="text-sm text-white/60">Record details for non-digital or past orders</p>
                                </div>
                            </div>

                            <Card className="p-6 bg-white/5 border-white/10 flex-shrink-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <Input
                                        label="Proforma No"
                                        placeholder="e.g. OLD-2023-001"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                        value={legacyForm.proformaNo}
                                        onChange={(e) => setLegacyForm({ ...legacyForm, proformaNo: e.target.value })}
                                    />
                                    <Input
                                        label="Old Offer No"
                                        placeholder="e.g. OFF-LEGACY-99"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
                                        value={legacyForm.oldOfferNo}
                                        onChange={(e) => setLegacyForm({ ...legacyForm, oldOfferNo: e.target.value })}
                                    />
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-white/70 mb-1.5">Freight Info</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400/40 outline-none transition-all resize-none text-sm placeholder:text-white/20"
                                            rows={3}
                                            placeholder="Carrier details, container numbers..."
                                            value={legacyForm.freightInfo}
                                            onChange={(e) => setLegacyForm({ ...legacyForm, freightInfo: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-white/70 mb-1.5">Extra Notes</label>
                                        <textarea
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400/40 outline-none transition-all resize-none text-sm"
                                            rows={2}
                                            value={legacyForm.extraNotes}
                                            onChange={(e) => setLegacyForm({ ...legacyForm, extraNotes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* File Upload Simulation */}
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            alert(`File selected: ${e.target.files[0].name}`);
                                        }
                                    }}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-blue-400">
                                        <Upload size={24} />
                                    </div>
                                    <h4 className="font-medium text-white">Upload Customs Declaration</h4>
                                    <p className="text-xs text-white/40 mt-1">Gümrük Beyannamesi (PDF, JPG)</p>
                                    <Button size="sm" variant="secondary" className="mt-4 bg-white/10 text-white hover:bg-white/20 border-none" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>Select Files</Button>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none px-8">
                                        <Archive size={16} className="mr-2" />
                                        Archive Order
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-4 text-[11px] font-bold text-white/40 uppercase tracking-wider">Tarih</th>
                                            {activeTab === 'payments' ? (
                                                <>
                                                    <th className="p-4 text-[11px] font-bold text-white/40 uppercase tracking-wider">Alınan Ödemeler</th>
                                                    <th className="p-4 text-[11px] font-bold text-white/40 uppercase tracking-wider">Kalan</th>
                                                    <th className="p-4 text-[11px] font-bold text-white/40 uppercase tracking-wider">Hangi Sevkiyattan Olduğu</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="p-4 text-[11px] font-bold text-white/40 uppercase tracking-wider">Kimin Hazırladığı</th>
                                                    <th className="p-4 text-[11px] font-bold text-white/40 uppercase tracking-wider">Fiyat</th>
                                                    <th className="p-4 text-[11px] font-bold text-white/40 uppercase tracking-wider">Yükleme Tarihi</th>
                                                </>
                                            )}
                                            <th className="p-4 text-[11px] font-bold text-white/40 uppercase tracking-wider text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(tabData[activeTab as keyof typeof tabData] || []).map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 text-sm text-white font-medium">{item.date}</td>
                                                {activeTab === 'payments' ? (
                                                    <>
                                                        <td className="p-4 text-sm text-green-400 font-bold">{item.amount}</td>
                                                        <td className="p-4 text-sm text-red-400 font-bold">{item.remaining}</td>
                                                        <td className="p-4 text-sm text-white/60">{item.shipment}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="p-4 text-sm text-white/70">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold">
                                                                    {item.author.charAt(0)}
                                                                </div>
                                                                {item.author}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-sm text-blue-400 font-bold">{item.price}</td>
                                                        <td className="p-4 text-sm text-white/60">{item.loadingDate}</td>
                                                    </>
                                                )}
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            onClick={() => handleOpenForm(item)}
                                                            className="text-white/40 hover:text-blue-400 hover:bg-blue-400/10 h-8 text-xs px-2"
                                                        >
                                                            Detaylar
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            onClick={() => handleDeleteEntry(item.id)}
                                                            className="text-white/20 hover:text-red-400 hover:bg-red-400/10 h-8 p-2"
                                                        >
                                                            <Archive size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(tabData[activeTab as keyof typeof tabData] || []).length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center text-white/20 italic">
                                                    Bu sekmede henüz kayıt bulunmuyor.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="text-xs text-white/40 uppercase tracking-widest font-bold">
                                    Toplam {activeTab === 'history' ? 'Geçmiş' : activeTab === 'offers' ? 'Teklif' : activeTab === 'payments' ? 'Alınan Ödemeler' : 'Sipariş'}: {(tabData[activeTab as keyof typeof tabData] || []).length}
                                </div>
                                <Button 
                                    onClick={() => handleOpenForm()}
                                    className="bg-[#008cff] hover:bg-[#0070cc] text-white border-none shadow-lg shadow-blue-500/10"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Yeni Ekle
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Entry Form Modal (Create/Edit) */}
                {isEntryFormOpen && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-8">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsEntryFormOpen(false)} />
                        <Card className="relative bg-[#1e293b] w-full max-w-lg border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">
                                    {editingItem ? 'Kaydı Güncelle' : 'Yeni Kayıt Ekle'}
                                </h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsEntryFormOpen(false)} className="text-white/40 hover:text-white rounded-full">
                                    <X size={18} />
                                </Button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Tarih"
                                        placeholder="gg.aa.yyyy"
                                        className="bg-white/5 border-white/10 text-white"
                                        value={entryForm.date}
                                        onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                                    />
                                    {activeTab === 'payments' ? (
                                        <>
                                            <Input
                                                label="Alınan Ödemeler"
                                                placeholder="0.000 ₺ / $"
                                                className="bg-white/5 border-white/10 text-white"
                                                value={entryForm.amount}
                                                onChange={(e) => setEntryForm({ ...entryForm, amount: e.target.value })}
                                            />
                                            <Input
                                                label="Kalan"
                                                placeholder="0.000 ₺ / $"
                                                className="bg-white/5 border-white/10 text-white"
                                                value={entryForm.remaining}
                                                onChange={(e) => setEntryForm({ ...entryForm, remaining: e.target.value })}
                                            />
                                            <Input
                                                label="Hangi Sevkiyattan Olduğu"
                                                placeholder="Sevkiyat adı veya numarası"
                                                className="bg-white/5 border-white/10 text-white"
                                                value={entryForm.shipment}
                                                onChange={(e) => setEntryForm({ ...entryForm, shipment: e.target.value })}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Input
                                                label="Kimin Hazırladığı"
                                                placeholder="Ad Soyad"
                                                className="bg-white/5 border-white/10 text-white"
                                                value={entryForm.author}
                                                onChange={(e) => setEntryForm({ ...entryForm, author: e.target.value })}
                                            />
                                            <Input
                                                label="Fiyat"
                                                placeholder="0.000 ₺"
                                                className="bg-white/5 border-white/10 text-white"
                                                value={entryForm.price}
                                                onChange={(e) => setEntryForm({ ...entryForm, price: e.target.value })}
                                            />
                                            <Input
                                                label="Yükleme Tarihi"
                                                placeholder="gg.aa.yyyy"
                                                className="bg-white/5 border-white/10 text-white"
                                                value={entryForm.loadingDate}
                                                onChange={(e) => setEntryForm({ ...entryForm, loadingDate: e.target.value })}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setIsEntryFormOpen(false)} className="text-white/60 hover:text-white">
                                    İptal
                                </Button>
                                <Button onClick={handleSaveEntry} className="bg-blue-600 hover:bg-blue-700 text-white border-none px-8">
                                    Kaydet
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
