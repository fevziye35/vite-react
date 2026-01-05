import { useState, useEffect } from 'react';
import { Filter, Plus, Loader2, MapPin, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { customerService } from '../../services/api';
import type { Customer } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CustomerDetailModal } from './CustomerDetailModal';

export function CustomersPage() {
    const toast = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<Partial<Customer>>({});

    useEffect(() => {
        loadCustomers();
    }, []);

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

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await customerService.create(formData as any);
            setIsCreateModalOpen(false);
            setFormData({});
            loadCustomers();
            toast.success('Müşteri oluşturuldu');
        } catch (error) {
            console.error(error);
            toast.error('Müşteri oluşturulamadı');
        }
    }

    // Transform customers data (tags)
    const displayCustomers = customers.map(c => ({
        ...c,
        tags: Array.isArray(c.tags) ? c.tags : (c.tags ? [c.tags] : [])
    }));

    const filteredCustomers = displayCustomers.filter(c =>
        c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-100px)]"><Loader2 className="animate-spin text-accent" /></div>;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Müşteriler</h1>
                    <p className="text-secondary mt-1">Müşteri ilişkilerinizi yönetin</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Müşterileri filtrele..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shadow-accent/20">
                        <Plus size={18} className="mr-2" />
                        Yeni Ekle
                    </Button>
                </div>
            </div>

            {/* Customer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCustomers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        Müşteri bulunamadı.
                    </div>
                ) : (
                    filteredCustomers.map(customer => (
                        <Card
                            key={customer.id}
                            className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative border-transparent hover:border-accent/20"
                            onClick={() => setSelectedCustomer(customer)}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white shadow-sm">
                                    <MoreHorizontal size={16} />
                                </Button>
                            </div>

                            <div className="p-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                    {customer.companyName.charAt(0)}
                                </div>

                                <h3 className="text-lg font-bold text-primary mb-1 line-clamp-1">{customer.companyName}</h3>
                                <p className="text-secondary text-sm mb-4">{customer.contactPerson || 'İlgili kişi yok'}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <MapPin size={14} className="text-accent" />
                                        <span className="truncate">{customer.city}, {customer.country}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Mail size={14} className="text-accent" />
                                        <span className="truncate">{customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Phone size={14} className="text-accent" />
                                        <span className="truncate">{customer.phone}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(customer.tags) && customer.tags.slice(0, 3).map((tag: string) => (
                                        <Badge key={tag} variant="neutral" className="text-[10px] px-2 py-0.5 bg-gray-50 border-gray-100">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {Array.isArray(customer.tags) && customer.tags.length > 3 && (
                                        <span className="text-[10px] text-gray-400 self-center">+{customer.tags.length - 3}</span>
                                    )}
                                </div>
                            </div>

                            <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs font-medium text-secondary group-hover:bg-accent/5 transition-colors">
                                <span>Detayları Gör</span>
                                <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">Aç →</span>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Detailed View Modal */}
            <CustomerDetailModal
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                customer={selectedCustomer}
            />

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Yeni Müşteri Ekle">
                <form onSubmit={handleCreate} className="space-y-4 p-6">
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1.5">Şirket Adı</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                            value={formData.companyName || ''}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>
                    {/* Simplified form for brevity, same fields as before but styled */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">İlgili Kişi</label>
                            <input type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" value={formData.contactPerson || ''} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">E-posta</label>
                            <input type="email" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                    {/* ... rest of fields ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">Telefon</label>
                            <input type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1.5">Ülke</label>
                            <input type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" value={formData.country || ''} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1.5">Şehir</label>
                        <input type="text" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>İptal</Button>
                        <Button type="submit">Müşteriyi Kaydet</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

