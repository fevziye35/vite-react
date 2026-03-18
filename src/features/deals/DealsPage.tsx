import { useState, useEffect } from 'react';
import { Kanban, List, Plus, Calendar, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { dealService, proformaService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

export function DealsPage() {
    const toast = useToast();
    const navigate = useNavigate();
    const [view, setView] = useState<'kanban' | 'list'>('kanban');
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({ stage: 'Qualified', probability: 50 });

    useEffect(() => {
        loadDeals();
    }, []);

    async function loadDeals() {
        try {
            const data = await dealService.getAll();
            setDeals(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (isEditing) {
                await dealService.update(formData.id, { ...formData, customerId: formData.customerId });
                toast.success('Anlaşma başarıyla güncellendi');
            } else {
                await dealService.create({ ...formData, customerId: formData.customerId });
                toast.success('Anlaşma başarıyla oluşturuldu');
            }
            setIsModalOpen(false);
            setFormData({ stage: 'Qualified', probability: 50 });
            setIsEditing(false);
            loadDeals();
        } catch (error) {
            console.error(error);
            toast.error('Anlaşma kaydedilemedi.');
        }
    }

    async function handleCreateProforma() {
        // Direct execution - no blocking dialogs
        try {
            console.log('Creating Proforma from Deal:', formData);

            // Logic to get items: 
            // 1. Check if deal has stored items (from strict transfer)
            // 2. Fallback to parsing/fetching if needed (mock simplifiction: assume stored or empty)
            const dealItems = formData.items || [];

            const proforma = {
                number: `PI-${Date.now()}`,
                customerId: formData.customerId,
                offerId: formData.offerId || formData.id, // Prefer explicit link
                amount: formData.expectedRevenue || formData.amount,
                status: 'Draft',
                issueDate: new Date().toISOString(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                items: JSON.stringify(dealItems) // Store items in proforma
            };
            await proformaService.create(proforma);

            // Update Deal Status
            await dealService.update(formData.id, { ...formData, stage: 'Proforma Sent', probability: 90 });

            toast.success('Proforma başarıyla oluşturuldu');
            setIsModalOpen(false);
            navigate('/proformas');
        } catch (error) {
            console.error(error);
            toast.error('Proforma oluşturulamadı');
        }
    }

    async function handleCancelDeal() {
        // Direct execution - no blocking dialogs
        try {
            console.log('Cancelling Deal:', formData.id);

            // 1. Optimistic / Direct update (Instant Feedback)
            setDeals(prevDeals => {
                // Use distinct string conversion for robust comparison (number vs string IDs)
                const target = prevDeals.find(d => String(d.id) === String(formData.id));
                console.log('Target found via loose compare check:', target);

                return prevDeals.map(d => String(d.id) === String(formData.id) ? { ...d, stage: 'Closed Lost', probability: 0 } : d);
            });
            setIsModalOpen(false);
            toast.info('Anlaşma Kayıp olarak işaretlendi');

            // 2. Persist to Backend (Background)
            await dealService.update(formData.id, { ...formData, stage: 'Closed Lost', probability: 0 });

        } catch (error) {
            console.error(error);
            toast.error('Anlaşma iptal edilemedi');
        }
    }

    async function handleDeleteDeal() {
        if (!window.confirm('Bu anlaşmayı kalıcı olarak silmek istediğinize emin misiniz?')) return;
        
        try {
            await dealService.delete(formData.id);
            setDeals(prevDeals => prevDeals.filter(d => String(d.id) !== String(formData.id)));
            setIsModalOpen(false);
            toast.success('Anlaşma başarıyla silindi');
        } catch (error) {
            console.error(error);
            toast.error('Anlaşma silinemedi');
        }
    }

    function openEdit(deal: any) {
        setFormData({
            ...deal,
            customerId: deal.customer_id || deal.customerId // Handle varied casing
        });
        setIsEditing(true);
        setIsModalOpen(true);
    }

    function openNew() {
        setFormData({ stage: 'Qualified', probability: 50 });
        setIsEditing(false);
        setIsModalOpen(true);
    }

    // Load customers for dropdown
    const [customers, setCustomers] = useState<any[]>([]);
    useEffect(() => {
        import('../../services/api').then(mod => mod.customerService.getAll().then(setCustomers));
    }, []);


    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-100px)]"><Loader2 className="animate-spin text-accent" /></div>;

    const stages = [
        { key: 'New', label: 'YENİ', color: 'bg-[#90e1f9]' },
        { key: 'Qualified', label: 'HAZIRLIK', color: 'bg-[#5cd4f3]' },
        { key: 'Offer Sent', label: 'TEKLİF GÖNDERİLDİ', color: 'bg-[#b8aae5]' },
        { key: 'Negotiation', label: 'MÜZAKERE', color: 'bg-[#ffc600]' },
        { key: 'Proforma Sent', label: 'PROFORMA GÖNDERİLDİ', color: 'bg-[#ff8a00]' },
        { key: 'Closed Lost', label: 'ANLAŞMA YOK', color: 'bg-[#ff5752]' },
        { key: 'Closed Won', label: 'KAZANILDI', color: 'bg-[#7bd500]' }
    ];

    return (
        <div className="space-y-6 pb-10">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Anlaşma Bilgileri" : "Yeni Anlaşma Fırsatı"}>
                <form onSubmit={handleSave} className="space-y-4">
                    {/* Header Controls for Edit Mode */}
                    {isEditing && (
                        <div className="flex gap-2 mb-6 justify-end border-b border-gray-100 pb-4">
                            <Button type="button" variant="outline" size="sm" onClick={handleCreateProforma} className="text-accent border-accent/20 hover:bg-accent/5">
                                Proformaya Dönüştür
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={handleCancelDeal} className="text-danger border-danger/20 hover:bg-danger/5">
                                İptal Et (Kayıp)
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={handleDeleteDeal} className="text-red-500 border-red-500/20 hover:bg-red-500/10" title="Kalıcı Olarak Sil">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    )}

                    <Input
                        label="Anlaşma Başlığı"
                        required
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Anlaşma adını girin..."
                    />

                    <div>
                        <label className="text-xs font-bold text-secondary mb-1 block">Müşteri</label>
                        <select
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-accent outline-none bg-white text-sm"
                            value={formData.customerId || ''}
                            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                        >
                            <option value="">Müşteri Seçiniz...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tutar ($)"
                            type="number"
                            value={formData.expectedRevenue || ''}
                            onChange={e => setFormData({ ...formData, expectedRevenue: Number(e.target.value) })}
                        />
                        <div>
                            <label className="text-xs font-bold text-secondary mb-1 block">Aşama</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-accent outline-none bg-white text-sm"
                                value={formData.stage}
                                onChange={e => setFormData({ ...formData, stage: e.target.value })}
                            >
                                {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Vazgeç</Button>
                        <Button type="submit" size="sm">
                            {isEditing ? 'Değişiklikleri Kaydet' : 'Oluştur'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Anlaşmalar (Kanban)</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted">Tüm anlaşmalar</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-gray-200/50 p-0.5 rounded flex items-center">
                        <button
                            onClick={() => setView('kanban')}
                            className={cn("p-1.5 rounded transition-all", view === 'kanban' ? "bg-white shadow-sm text-accent" : "text-muted hover:text-primary")}
                        >
                            <Kanban size={16} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={cn("p-1.5 rounded transition-all", view === 'list' ? "bg-white shadow-sm text-accent" : "text-muted hover:text-primary")}
                        >
                            <List size={16} />
                        </button>
                    </div>
                    <Button onClick={openNew} size="sm" className="bg-[#7bd500] hover:bg-[#6fc000] text-white font-bold border-none shadow-sm">
                        <Plus size={16} className="mr-1" /> OLUŞTUR
                    </Button>
                </div>
            </div>

            {view === 'kanban' ? (
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                    {stages.map(stage => (
                        <div key={stage.key} className="w-72 flex-shrink-0">
                            <div className={cn("kanban-column-header", stage.color)}>
                                <span>{stage.label}</span>
                                <span className="bg-white/20 px-2 rounded-full text-[10px]">
                                    {deals.filter(d => d.stage === stage.key).length}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 min-h-[400px] p-1 bg-gray-100/30 rounded-b-lg">
                                {deals.filter(d => d.stage === stage.key).map(deal => (
                                    <div
                                        key={deal.id}
                                        className="bg-white p-3 rounded shadow-card border border-[#eef2f4] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                        onClick={() => openEdit(deal)}
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="text-[11px] font-bold text-accent mb-1 truncate">{deal.customer || 'Adsız Müşteri'}</div>
                                        <h4 className="text-[13px] font-semibold text-primary mb-2 line-clamp-2 leading-tight">{deal.title}</h4>
                                        
                                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-50">
                                            <div className="text-[13px] font-bold text-[#2067b0]">
                                                ${(deal.expectedRevenue || deal.amount || 0).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
                                                <Calendar size={10} />
                                                {deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString() : 'Tarih yok'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {deals.filter(d => d.stage === stage.key).length === 0 && (
                                    <div className="h-20 rounded border-2 border-dashed border-gray-200/50 flex items-center justify-center text-muted/40 text-[10px] font-bold uppercase tracking-wider">
                                        BU AŞAMADA KAYIT YOK
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card noPadding className="overflow-hidden border border-[#eef2f4] rounded shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#f9fafb] text-muted font-bold text-[11px] uppercase border-b border-[#eef2f4]">
                            <tr>
                                <th className="p-3 pl-6">Anlaşma Adı</th>
                                <th className="p-3">Müşteri</th>
                                <th className="p-3">Tutar</th>
                                <th className="p-3">Aşama</th>
                                <th className="p-3">Beklenen Kapanış</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eef2f4]">
                            {deals.map(deal => (
                                <tr key={deal.id} className="hover:bg-accent/5 transition cursor-pointer" onClick={() => openEdit(deal)}>
                                    <td className="p-3 pl-6 font-semibold text-primary">{deal.title}</td>
                                    <td className="p-3 text-secondary">{deal.customer}</td>
                                    <td className="p-3 font-bold text-accent">${(deal.expectedRevenue || deal.amount || 0).toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-accent text-[10px] font-bold border border-accent/20">
                                            {stages.find(s => s.key === deal.stage)?.label || deal.stage}
                                        </span>
                                    </td>
                                    <td className="p-3 text-muted text-xs">
                                        {deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
}
