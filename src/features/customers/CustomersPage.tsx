import { useState, useEffect } from 'react';
import { Filter, Plus, Loader2, MapPin, Mail, Phone, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { customerService } from '../../services/api';
import type { Customer } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { HighlightText } from '../../components/ui/HighlightText';
import { CustomerDetailModal } from './CustomerDetailModal';
import { useSocket } from '../../context/SocketContext';
import { sendActivityMail } from '../../emailNotification';

export function CustomersPage() {
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const { socket } = useSocket();

    // Merkezi Veri Değişim ve Bildirim Fonksiyonu
    const handleDataChange = ({ type, payload }: { type: string; payload: any }) => {
        if (type === 'customers') {
            if (payload.deleted) {
                setCustomers(prev => prev.filter(c => c.id !== payload.id));
                sendActivityMail('Müşteri Silindi', payload);
            } else {
                setCustomers(prev => {
                    const exists = prev.find(c => c.id === payload.id);
                    if (exists) {
                        sendActivityMail('Müşteri Bilgisi Güncellendi', payload);
                        return prev.map(c => c.id === payload.id ? payload : c);
                    }
                    sendActivityMail('Yeni Müşteri Eklendi', payload);
                    return [payload, ...prev];
                });
            }
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Socket üzerinden gelen her değişikliği bildirim fonksiyonuna bağlıyoruz
        socket.on('data_change', handleDataChange);
        return () => {
            socket.off('data_change', handleDataChange);
        };
    }, [socket]);

    async function loadCustomers() {
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (formData.id) {
                await customerService.update(formData.id, formData);
                toast.success('Müşteri güncellendi');
            } else {
                await customerService.create(formData as any);
                toast.success('Müşteri oluşturuldu');
            }
            setIsCreateModalOpen(false);
            setFormData({});
            // loadCustomers(); // Socket zaten listeyi güncelleyip mail atacak
        } catch (error) {
            console.error(error);
            toast.error(formData.id ? 'Müşteri güncellenemedi' : 'Müşteri oluşturulamadı');
        }
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setOpenMenuId(null);
        if (window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
            try {
                await customerService.delete(id);
                toast.success('Müşteri silindi');
            } catch (error) {
                console.error(error);
                toast.error('Müşteri silinemedi');
            }
        }
    }

    const displayCustomers = customers.map(c => ({
        ...c,
        tags: Array.isArray(c.tags) ? c.tags : (c.tags ? [c.tags] : [])
    }));

    const filteredCustomers = displayCustomers.filter(c =>
        c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-100px)] bg-[#17202b]"><Loader2 className="animate-spin text-blue-400" /></div>;

    return (
        <div className="min-h-full bg-[#17202b] text-white p-6 space-y-6 pb-10" onClick={() => setOpenMenuId(null)}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Müşteriler</h1>
                    <p className="text-white/60 mt-1">Müşteri ilişkilerinizi yönetin</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Müşterileri filtrele..."
                            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all text-sm text-white placeholder-white/40"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => { setFormData({}); setIsCreateModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 border-none">
                        <Plus size={18} className="mr-2" />
                        Yeni Ekle
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCustomers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        Müşteri bulunamadı.
                    </div>
                ) : (
                    filteredCustomers.map(customer => (
                        <Card
                            key={customer.id}
                            className="group hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative bg-white/5 border-white/10 hover:border-blue-400/40"
                            onClick={() => { setOpenMenuId(null); setSelectedCustomer(customer); }}
                        >
                            <div className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(openMenuId === customer.id ? null : customer.id);
                                    }}
                                >
                                    <MoreHorizontal size={16} />
                                </Button>
                                {openMenuId === customer.id && (
                                    <div className="absolute top-full right-0 mt-2 w-36 bg-[#1e293b] rounded-xl shadow-xl border border-white/10 overflow-hidden z-20">
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData(customer);
                                                setIsCreateModalOpen(true);
                                                setOpenMenuId(null);
                                            }}
                                        >
                                            <Edit2 size={14} /> Düzenle
                                        </button>
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                                            onClick={(e) => handleDelete(customer.id!, e)}
                                        >
                                            <Trash2 size={14} /> Sil
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-400 mb-4 shadow-lg">
                                    {customer.companyName.charAt(0)}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                                    <HighlightText text={customer.companyName} highlight={searchTerm} />
                                </h3>
                                <p className="text-white/60 text-sm mb-4 truncate">
                                    {customer.contactPerson || 'İlgili kişi yok'}
                                </p>
                                <div className="space-y-2 mb-6 text-xs text-white/50">
                                    <div className="flex items-center gap-2"><MapPin size={14} className="text-blue-400" /><span className="truncate">{customer.city}, {customer.country}</span></div>
                                    <div className="flex items-center gap-2"><Mail size={14} className="text-blue-400" /><span className="truncate">{customer.email}</span></div>
                                    <div className="flex items-center gap-2"><Phone size={14} className="text-blue-400" /><span className="truncate">{customer.phone}</span></div>
                                </div>
                            </div>
                            <div className="px-6 py-3 bg-white/5 border-t border-white/5 flex justify-between items-center text-xs font-medium text-white/40">
                                <span>Detayları Gör</span>
                                <span className="text-blue-400 opacity-0 group-hover:opacity-100">Aç →</span>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <CustomerDetailModal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} customer={selectedCustomer} />

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={formData.id ? "Müşteriyi Düzenle" : "Yeni Müşteri Ekle"} className="bg-[#1e293b] text-white">
                <form onSubmit={handleSave} className="space-y-4 p-6 bg-[#1e293b]">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">Şirket Adı</label>
                        <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" value={formData.companyName || ''} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-white/70 mb-1.5">İlgili Kişi</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" value={formData.contactPerson || ''} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium text-white/70 mb-1.5">E-posta</label><input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-white/70 mb-1.5">Telefon</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                        <div><label className="block text-sm font-medium text-white/70 mb-1.5">Ülke</label><input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white" value={formData.country || ''} onChange={e => setFormData({ ...formData, country: e.target.value })} /></div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>İptal</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">Kaydet</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}