import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, FileText, FileSignature, Package, User, Plus } from 'lucide-react';
import ProformaEditModal from '../components/proforma/ProformaEditModal';
import InvoiceEditModal from '../components/proforma/InvoiceEditModal';
import PackingListEditModal from '../components/proforma/PackingListEditModal';
import FCOEditModal from '../components/proforma/FCOEditModal';
import { Badge } from '../components/ui/Badge';
import { HighlightText } from '../components/ui/HighlightText';
import { proformaService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../components/ui/Toast';

type DocType = 'proforma' | 'invoice' | 'packingList' | 'fco';


// INITIAL_DATA removed - now using server-side data

export default function ProformalarPage() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState<DocType>('proforma');
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const data = await proformaService.getAll(activeTab);
            setDocuments(data);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocuments();
    }, [activeTab]);

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleDataChange = ({ type, payload }: { type: string; payload: any }) => {
            if (type === 'proformas') {
                if (payload.deleted) {
                    setDocuments(prev => prev.filter(d => d.id !== payload.id));
                } else if (payload.documentType === activeTab) {
                    setDocuments(prev => {
                        const exists = prev.find(d => d.id === payload.id);
                        if (exists) {
                            return prev.map(d => d.id === payload.id ? payload : d);
                        }
                        return [payload, ...prev];
                    });
                }
            }
        };

        socket.on('data_change', handleDataChange);
        return () => {
            socket.off('data_change', handleDataChange);
        };
    }, [socket, activeTab]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isPackingListModalOpen, setIsPackingListModalOpen] = useState(false);
    const [isFCOModalOpen, setIsFCOModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const currentData = documents.filter((item: any) => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (item.customerName?.toLowerCase().includes(lowerSearch)) ||
               (item.product?.toLowerCase().includes(lowerSearch)) ||
               (item.editor?.toLowerCase().includes(lowerSearch));
    });

    const handleDelete = async (id: string) => {
        if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
            try {
                await proformaService.delete(id);
                toast.success('Belge silindi');
            } catch (error) {
                toast.error('Belge silinemedi');
            }
        }
    };

    const handleSaveNew = async (data: any, type: DocType) => {
        try {
            await proformaService.create({
                ...data,
                documentType: type,
                customerName: data.recipient || 'Belirtilmedi',
                product: data.product || 'Yeni Belge'
            });
            toast.success('Belge kaydedildi');
        } catch (error) {
            toast.error('Belge kaydedilemedi');
        }
    };



    const TabButton = ({ type, label, icon: Icon }: { type: DocType, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(type)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === type 
                ? 'text-blue-400 bg-white/5 border-b-2 border-blue-400' 
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="min-h-full bg-[#17202b] flex flex-col p-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-semibold text-white">Proformalar</h2>
                
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center bg-[#008cff] hover:bg-[#0070cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                        <Plus size={16} className="mr-2" /> Yeni Proforma
                    </button>
                    <button onClick={() => setIsFCOModalOpen(true)} className="flex items-center bg-[#008cff] hover:bg-[#0070cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                        <Plus size={16} className="mr-2" /> Yeni FCO
                    </button>
                    <button onClick={() => setIsInvoiceModalOpen(true)} className="flex items-center bg-[#008cff] hover:bg-[#0070cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                        <Plus size={16} className="mr-2" /> Yeni Invoice
                    </button>
                    <button onClick={() => setIsPackingListModalOpen(true)} className="flex items-center bg-[#008cff] hover:bg-[#0070cc] text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                        <Plus size={16} className="mr-2" /> Yeni Packing List
                    </button>
                </div>
            </div>

            {/* List Tabs & Search */}
            <div className="bg-[#1e2733] rounded-t-xl border-x border-t border-white/10 flex items-center justify-between px-2">
                <div className="flex overflow-x-auto no-scrollbar">
                    <TabButton type="proforma" label="Proforma Listem" icon={FileText} />
                    <TabButton type="invoice" label="Invoice Listem" icon={FileSignature} />
                    <TabButton type="packingList" label="Packing List Listem" icon={Package} />
                    <TabButton type="fco" label="FCO Listem" icon={FileText} />
                </div>

                <div className="relative mr-4">
                    <div className="flex items-center bg-white/5 border border-white/10 focus-within:border-blue-400/50 rounded-md px-3 py-1.5 transition-all w-48">
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="bg-transparent border-none outline-none text-white text-xs flex-1 placeholder-white/30"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <Badge variant="neutral" className="bg-blue-500/10 text-blue-400 border-none text-[9px] mr-1 animate-in fade-in zoom-in duration-200">
                                {currentData.length}
                            </Badge>
                        )}
                        <Search size={14} className="text-white/30" />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 bg-white shadow-lg overflow-hidden flex flex-col relative w-full border-x border-b border-slate-200">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center bg-white italic font-bold text-slate-300 animate-pulse uppercase tracking-widest">
                        Veriler Senkronize Ediliyor...
                    </div>
                ) : (
                    <div className="overflow-x-auto flex-1 bg-white">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-[#fbfdfd]">
                                <th className="p-4 w-10 text-center"><input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" /></th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tarih</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Düzenleyen</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Kestiğim Kişi</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Ürün</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Fiyat</th>
                                <th className="p-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right pr-6">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item: any) => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 text-center"><input type="checkbox" className="w-3.5 h-3.5 cursor-pointer" /></td>
                                    <td className="p-4 text-[13px] text-slate-800 font-medium">{item.date}</td>
                                    <td className="p-4 text-[13px] text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={14} />
                                            </div>
                                            <HighlightText text={item.editor} highlight={searchTerm} />
                                        </div>
                                    </td>
                                    <td className="p-4 text-[13px] text-slate-600 font-medium">
                                        <HighlightText text={item.recipient} highlight={searchTerm} />
                                    </td>
                                    <td className="p-4 text-[13px] text-slate-600">
                                        <HighlightText text={item.product} highlight={searchTerm} />
                                    </td>
                                    <td className="p-4 text-[13px] text-slate-800 font-bold">{item.price}</td>
                                    <td className="p-4 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    if (activeTab === 'proforma') setIsEditModalOpen(true);
                                                    if (activeTab === 'invoice') setIsInvoiceModalOpen(true);
                                                    if (activeTab === 'fco') setIsFCOModalOpen(true);
                                                    if (activeTab === 'packingList') setIsPackingListModalOpen(true);
                                                }}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md border border-blue-100 shadow-sm" 
                                                title="Düzenle"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md border border-red-100 shadow-sm" 
                                                title="Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}

                {/* Status Bar / UI Scrollbar */}
                <div className="h-6 bg-slate-50 w-full border-t border-slate-200 flex items-center px-4">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                        {activeTab} listesinde {currentData.length} kayıt gösteriliyor
                    </span>
                </div>
            </div>

            {/* Editor Statistics Section */}
            <div className="mt-4 bg-[#1e2733] rounded-xl border border-white/10 p-4">
                <h3 className="text-white/70 text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User size={14} className="text-blue-400" />
                    Düzenleyen İstatistikleri
                </h3>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(
                        currentData.reduce((acc: any, curr: any) => {
                            acc[curr.editor] = (acc[curr.editor] || 0) + 1;
                            return acc;
                        }, {})
                    ).map(([editor, count]: [string, any]) => (
                        <div key={editor} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-3 group hover:border-blue-400/30 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs">
                                {editor.charAt(0)}
                            </div>
                            <div>
                                <div className="text-white/80 text-[13px] font-medium">{editor}</div>
                                <div className="text-white/40 text-[11px]">{count} Belge Hazırladı</div>
                            </div>
                        </div>
                    ))}
                    {currentData.length === 0 && (
                        <div className="text-white/30 text-[12px] italic">Bu listede henüz kayıt bulunmuyor.</div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isEditModalOpen && <ProformaEditModal onClose={() => setIsEditModalOpen(false)} onSave={(data) => handleSaveNew(data, 'proforma')} />}
            {isFCOModalOpen && <FCOEditModal onClose={() => setIsFCOModalOpen(false)} onSave={(data) => handleSaveNew(data, 'fco')} />}
            {isInvoiceModalOpen && <InvoiceEditModal onClose={() => setIsInvoiceModalOpen(false)} onSave={(data) => handleSaveNew(data, 'invoice')} />}
            {isPackingListModalOpen && <PackingListEditModal onClose={() => setIsPackingListModalOpen(false)} onSave={(data) => handleSaveNew(data, 'packingList')} />}
        </div>
    );
}
