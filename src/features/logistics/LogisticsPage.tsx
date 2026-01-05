import { useState, useEffect } from 'react';
import { Plus, Loader2, GripVertical, Trash2, Search, Ship } from 'lucide-react';
import { logisticsService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { cn } from '../../utils/cn';

interface ColumnDef {
    id: string;
    label: string;
    key: string;
    width?: number;
    type?: 'text' | 'currency' | 'date' | 'select';
    options?: string[];
}

const DEFAULT_COLUMNS: ColumnDef[] = [
    { id: 'c1', label: 'Şirket', key: 'providerName', width: 180, type: 'text' },
    { id: 'c2', label: 'Açıklama', key: 'description', width: 200, type: 'text' },
    { id: 'c3', label: 'Konteyner', key: 'containerType', width: 140, type: 'select', options: ['Tenteli Tır', '40\' Konteyner', '20\' Konteyner'] },
    { id: 'c5', label: 'Kıyı Çıkış', key: 'originPort', width: 120, type: 'text' },
    { id: 'c6', label: 'Varış', key: 'destinationPort', width: 120, type: 'text' },
    { id: 'c7', label: 'Fiyat', key: 'price', width: 100, type: 'currency' },
    { id: 'c8', label: 'Para Br.', key: 'currency', width: 80, type: 'select', options: ['USD', 'EUR'] },
    { id: 'c9', label: 'Geçerlilik', key: 'validityDate', width: 120, type: 'date' },
    { id: 'c10', label: 'Taşıyıcı', key: 'carrier', width: 120, type: 'select', options: ['CMA', 'MAERSK', 'MSC', 'COSCO', 'ONE'] },
    { id: 'c12', label: 'Transit', key: 'transitTime', width: 100, type: 'text' },
];

export function LogisticsPage() {
    const toast = useToast();
    const [filterText, setFilterText] = useState('');
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // New Offer Form Data
    const [formData, setFormData] = useState<any>({});

    // Drag State
    const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null);

    useEffect(() => {
        loadOffers();
    }, []);

    async function loadOffers() {
        try {
            const data = await logisticsService.getAll();
            setOffers(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await logisticsService.create(formData);
            setIsModalOpen(false);
            setFormData({});
            toast.success('Lojistik teklifi oluşturuldu');
            loadOffers();
        } catch (error) {
            toast.error('Teklif oluşturulamadı');
        }
    }

    const handleDataChange = async (id: string, key: string, value: any) => {
        // Optimistic update
        setOffers(prev => prev.map(item => item.id === id ? { ...item, [key]: value } : item));

        try {
            await logisticsService.update(id, { [key]: value });
        } catch (error) {
            toast.error('Değişiklikler kaydedilemedi');
        }
    };

    const handleRowDelete = async (id: string) => {
        // Direct execution - no blocking dialogs
        try {
            await logisticsService.delete(id);
            setOffers(prev => prev.filter(o => o.id !== id));
            toast.success('Teklif silindi');
        } catch (error) {
            toast.error('Teklif silinemedi');
        }
    };

    // Column Drag Handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedColIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // e.dataTransfer.setDragImage(e.currentTarget as Element, 0, 0); // Optional custom image
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedColIndex === null || draggedColIndex === index) return;

        // Reorder columns
        const newCols = [...columns];
        const draggedCol = newCols[draggedColIndex];
        newCols.splice(draggedColIndex, 1);
        newCols.splice(index, 0, draggedCol);

        setColumns(newCols);
        setDraggedColIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedColIndex(null);
        toast.success("Sütunlar yeniden sıralandı");
    };

    const filteredOffers = offers.filter(offer =>
        (offer.providerName || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (offer.destinationPort || '').toLowerCase().includes(filterText.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-4rem)]"><Loader2 className="animate-spin text-accent" size={32} /></div>;

    return (
        <div className="space-y-6 pb-20 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Lojistik Yönetimi</h1>
                    <p className="text-secondary mt-1">Navlun fiyatlarını ve lojistik ortaklarını takip edin</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-accent/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Fiyat Teklifi
                </Button>
            </div>

            <Card noPadding className="flex flex-col flex-1 overflow-hidden bg-white/50 backdrop-blur-xl border-white/60 shadow-sm">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
                    <div className="w-80">
                        <Input
                            placeholder="Tedarikçi, liman ara..."
                            icon={<Search size={16} />}
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="bg-white"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-secondary italic">
                        <GripVertical size={14} />
                        <span>Sütunları yeniden sıralamak için başlıkları sürükleyin</span>
                    </div>
                </div>

                {/* Draggable Table */}
                <div className="overflow-auto flex-1 relative">
                    <table className="w-full text-sm text-left border-collapse min-w-max">
                        <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur shadow-sm text-secondary font-semibold uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center text-gray-300">#</th>
                                {columns.map((col, index) => (
                                    <th
                                        key={col.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={cn(
                                            "p-3 border-r border-gray-100 last:border-0 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors select-none group relative",
                                            draggedColIndex === index && "opacity-50 bg-gray-200"
                                        )}
                                        style={{ width: col.width }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <GripVertical size={14} className="text-gray-300 group-hover:text-accent transition-colors" />
                                            {col.label}
                                        </div>
                                    </th>
                                ))}
                                <th className="p-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOffers.map((offer, rowIndex) => (
                                <tr
                                    key={offer.id}
                                    className="hover:bg-blue-50/50 transition-colors group"
                                    onMouseEnter={() => setHoveredRow(offer.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td className="p-4 text-center text-gray-300 text-xs font-mono">{rowIndex + 1}</td>
                                    {columns.map(col => (
                                        <td key={`${offer.id}-${col.id}`} className="p-3 border-r border-transparent group-hover:border-gray-100">
                                            {/* Inline Editing Cells */}
                                            {col.type === 'select' ? (
                                                <select
                                                    className="w-full bg-transparent text-primary text-sm focus:bg-white focus:ring-2 focus:ring-accent/20 rounded-md p-1 outline-none cursor-pointer"
                                                    value={offer[col.key] || ''}
                                                    onChange={(e) => handleDataChange(offer.id, col.key, e.target.value)}
                                                >
                                                    {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type={col.type === 'date' ? 'date' : 'text'}
                                                    className="w-full bg-transparent text-primary text-sm focus:bg-white focus:ring-2 focus:ring-accent/20 rounded-md p-1 outline-none placeholder:text-gray-300"
                                                    value={offer[col.key] || ''}
                                                    onChange={(e) => handleDataChange(offer.id, col.key, e.target.value)}
                                                    placeholder="-"
                                                />
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => handleRowDelete(offer.id)}
                                            className={cn(
                                                "p-2 rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100",
                                                hoveredRow === offer.id && "opacity-100"
                                            )}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredOffers.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + 2} className="py-20 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <Ship size={32} className="opacity-50" />
                                            </div>
                                            <p className="font-medium">Lojistik teklifi bulunamadı</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Navlun Fiyatı">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Şirket Adı"
                            required
                            value={formData.providerName || ''}
                            onChange={e => setFormData({ ...formData, providerName: e.target.value })}
                        />
                        <Input
                            label="İlgili Kişi"
                            value={formData.contactPerson || ''}
                            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Çıkış Limanı"
                            value={formData.originPort || ''}
                            onChange={e => setFormData({ ...formData, originPort: e.target.value })}
                        />
                        <Input
                            label="Varış Limanı"
                            value={formData.destinationPort || ''}
                            onChange={e => setFormData({ ...formData, destinationPort: e.target.value })}
                        />
                    </div>
                    <div>
                        <Input
                            label="Açıklama"
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="örn. Mart ayına kadar geçerli özel fiyat"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1">Konteyner Tipi</label>
                            <select
                                className="w-full bg-gray-50/50 border border-gray-200 text-primary rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                value={formData.containerType || '40\' Konteyner'}
                                onChange={e => setFormData({ ...formData, containerType: e.target.value })}
                            >
                                <option value="Tenteli Tır">Tenteli Tır</option>
                                <option value="40' Konteyner">40' Konteyner</option>
                                <option value="20' Konteyner">20' Konteyner</option>
                            </select>
                        </div>
                        <Input
                            label="Fiyat"
                            type="number"
                            value={formData.price || ''}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                        <div>
                            <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1">Currency</label>
                            <select
                                className="w-full bg-gray-50/50 border border-gray-200 text-primary rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                value={formData.currency || 'USD'}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-secondary mb-1.5 ml-1">Taşıyıcı</label>
                            <select
                                className="w-full bg-gray-50/50 border border-gray-200 text-primary rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all"
                                value={formData.carrier || ''}
                                onChange={e => setFormData({ ...formData, carrier: e.target.value })}
                            >
                                <option value="">Seçiniz...</option>
                                <option value="CMA">CMA</option>
                                <option value="MAERSK">MAERSK</option>
                                <option value="MSC">MSC</option>
                                <option value="COSCO">COSCO</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit">Fiyatı Kaydet</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
