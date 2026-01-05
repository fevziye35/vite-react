import { useState, useEffect } from 'react';
import { Kanban, List, Plus, DollarSign, Calendar, Loader2, ArrowRight, FileText, Ban } from 'lucide-react';
import { cn } from '../../utils/cn';
import { dealService, proformaService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
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
            await dealService.create({ ...formData, customerId: formData.customerId });
            setIsModalOpen(false);
            setFormData({ stage: 'Qualified', probability: 50 });
            setIsEditing(false);
            loadDeals();
            toast.success('Anlaşma başarıyla kaydedildi');
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

    const stages = ['Qualified', 'Offer Sent', 'Negotiation', 'Proforma Sent', 'Closed Won'];

    return (
        <div className="space-y-8 pb-10">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Anlaşmayı Yönet" : "Yeni Anlaşma Fırsatı"}>
                <form onSubmit={handleSave} className="space-y-6">

                    {/* Header Controls for Edit Mode */}
                    {isEditing && (
                        <div className="flex gap-2 mb-6 justify-end">
                            <Button type="button" variant="secondary" size="sm" onClick={handleCreateProforma}>
                                <FileText size={14} className="mr-2" /> Proformaya Dönüştür
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={handleCancelDeal} className="text-danger border-danger/20 hover:bg-danger/5">
                                <Ban size={14} className="mr-2" /> Anlaşmayı İptal Et
                            </Button>
                        </div>
                    )}

                    <Input
                        label="Anlaşma Başlığı"
                        required
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="örn. Ayçiçek Yağı Sözleşmesi - 1000 Konteyner"
                    />

                    <div>
                        <label className="text-sm font-medium text-primary ml-1 mb-1 block">Müşteri</label>
                        <select
                            required
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none bg-white text-sm transition-all"
                            value={formData.customerId || ''}
                            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                        >
                            <option value="">Müşteri Seçiniz...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Beklenen Gelir ($)"
                            type="number"
                            value={formData.expectedRevenue || ''}
                            onChange={e => setFormData({ ...formData, expectedRevenue: Number(e.target.value) })}
                        />
                        <Input
                            label="Kapanış Tarihi"
                            type="date"
                            value={formData.expectedClosingDate || ''}
                            onChange={e => setFormData({ ...formData, expectedClosingDate: e.target.value })}
                        />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-sm font-medium text-primary mb-2">
                            <span>Aşama</span>
                            <span>{formData.stage} ({formData.probability}%)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent"
                            value={formData.probability}
                            onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })}
                        />
                        <div className="flex justify-between text-xs text-secondary mt-2">
                            {stages.map((s, i) => (
                                <span key={s} className="cursor-pointer hover:text-accent" onClick={() => setFormData({ ...formData, stage: s, probability: 20 * (i + 1) })}>{i + 1}</span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit">
                            {isEditing ? 'Anlaşmayı Güncelle' : 'Anlaşma Oluştur'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Anlaşma Hattı</h1>
                    <p className="text-secondary mt-1">Satış fırsatlarınızı takip edin</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gray-100 p-1 rounded-xl flex border border-gray-200">
                        <button
                            onClick={() => setView('kanban')}
                            className={cn("p-2 rounded-lg transition-all", view === 'kanban' ? "bg-white shadow-sm text-primary" : "text-gray-400 hover:text-primary")}
                        >
                            <Kanban size={18} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white shadow-sm text-primary" : "text-gray-400 hover:text-primary")}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <Button onClick={openNew} className="shadow-lg shadow-accent/20">
                        <Plus size={18} className="mr-2" /> Yeni Anlaşma
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card noPadding className="p-5">
                    <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Toplam Boru Hattı</div>
                    <div className="text-2xl font-bold text-primary tracking-tight">$1.68M</div>
                </Card>
                <Card noPadding className="p-5">
                    <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Ağırlıklı Değer</div>
                    <div className="text-2xl font-bold text-primary tracking-tight">$920K</div>
                </Card>
                <Card noPadding className="p-5">
                    <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Açık Anlaşmalar</div>
                    <div className="text-2xl font-bold text-primary tracking-tight">3</div>
                </Card>
                <Card noPadding className="p-5">
                    <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Kazanma Oranı</div>
                    <div className="text-2xl font-bold text-success tracking-tight">45%</div>
                </Card>
            </div>

            {view === 'kanban' ? (
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
                    {stages.map(stage => (
                        <div key={stage} className="w-80 flex-shrink-0">
                            <div className="flex justify-between items-center mb-4 px-1 sticky top-0">
                                <h3 className="font-bold text-primary text-sm uppercase tracking-wide">{stage}</h3>
                                <Badge variant="neutral" className="bg-gray-200 text-gray-600">
                                    {deals.filter(d => d.stage === stage).length}
                                </Badge>
                            </div>
                            <div className="flex flex-col gap-3 min-h-[200px]">
                                {deals.filter(d => d.stage === stage).map(deal => (
                                    <div
                                        key={deal.id}
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-accent/30 transition-all cursor-pointer group"
                                        onClick={() => openEdit(deal)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-secondary uppercase tracking-wider truncate max-w-[150px]">{deal.customer}</span>
                                            <button className="text-gray-300 hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight size={16} /></button>
                                        </div>
                                        <h4 className="font-bold text-primary mb-3 leading-snug">{deal.title}</h4>
                                        <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                                            <div className="flex items-center gap-1 text-sm font-bold text-primary">
                                                <DollarSign size={14} className="text-gray-400" />
                                                {(deal.expectedRevenue || deal.amount || 0).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-secondary font-medium">
                                                <Calendar size={12} />
                                                {new Date(deal.expectedClose).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {deals.filter(d => d.stage === stage).length === 0 && (
                                    <div className="h-24 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 text-sm">
                                        Boş
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <Card noPadding className="overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-secondary font-bold text-xs uppercase border-b border-gray-100">
                            <tr>
                                <th className="p-4 pl-6">Deal Name</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Stage</th>
                                <th className="p-4">Expected Close</th>
                                <th className="p-4">Probability</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {deals.map(deal => (
                                <tr key={deal.id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => openEdit(deal)}>
                                    <td className="p-4 pl-6 font-bold text-primary">{deal.title}</td>
                                    <td className="p-4 text-secondary">{deal.customer}</td>
                                    <td className="p-4 font-bold text-primary">${(deal.expectedRevenue || deal.amount || 0).toLocaleString()}</td>
                                    <td className="p-4"><Badge variant="blue">{deal.stage}</Badge></td>
                                    <td className="p-4 text-secondary font-medium">{new Date(deal.expectedClose).toLocaleDateString()}</td>
                                    <td className="p-4 text-secondary">{deal.probability}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    );
}
