import { useState, useEffect } from 'react';
import { Anchor, Loader2, Plus, ExternalLink, Calendar, MapPin, Package, Edit } from 'lucide-react';
import { shipmentService, customerService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import type { Shipment, Customer } from '../../types';

export function ShipmentsPage() {
    const toast = useToast();
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Shipment>>({
        status: 'Booked',
        containerCount: 1,
        containerType: '40HC'
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        // Fetch customers and shipments independently so one failure doesn't block the other
        try {
            const custData = await customerService.getAll();
            console.log('Loaded customers:', custData);
            setCustomers(custData);
        } catch (error) {
            console.error('Error loading customers:', error);
        }

        try {
            const shipData = await shipmentService.getAll();
            setShipments(shipData);
        } catch (error) {
            console.error('Error loading shipments:', error);
            // Don't show error toast as the table might not exist yet
        }

        setLoading(false);
    }

    function openNew() {
        setFormData({
            status: 'Booked',
            containerCount: 1,
            containerType: '40HC',
            trackingUrl: 'https://www.vesselfinder.com/'
        });
        setIsEditing(false);
        setIsModalOpen(true);
    }

    function openEdit(shipment: Shipment) {
        setFormData({
            ...shipment,
            customerId: shipment.customerId || (shipment as any).customer_id
        });
        setIsEditing(true);
        setIsModalOpen(true);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (isEditing && formData.id) {
                await shipmentService.update(formData.id, formData);
                toast.success('Sevkiyat başarıyla güncellendi');
            } else {
                await shipmentService.create(formData);
                toast.success('Sevkiyat başarıyla oluşturuldu');
            }
            setIsModalOpen(false);
            setFormData({ status: 'Booked', containerCount: 1, containerType: '40HC' });
            setIsEditing(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error('Sevkiyat kaydedilemedi');
        }
    }

    const getCustomerName = (id: string) => customers.find(c => c.id === id)?.companyName || id;

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-100px)]"><Loader2 className="animate-spin text-accent" /></div>;

    const activeShipments = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled');
    const deliveredShipments = shipments.filter(s => s.status === 'Delivered');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'success';
            case 'Cancelled': return 'danger';
            case 'On Water': return 'blue';
            default: return 'warning';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Sevkiyatı Düzenle" : "Yeni Sevkiyat Oluştur"}>
                <form onSubmit={handleSave} className="space-y-6">
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

                    <Input
                        label="Rezervasyon Referansı"
                        required
                        placeholder="e.g. MSC12345678"
                        value={formData.bookingReference || ''}
                        onChange={e => setFormData({ ...formData, bookingReference: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Gemi Adı"
                            required
                            value={formData.vesselName || ''}
                            onChange={e => setFormData({ ...formData, vesselName: e.target.value })}
                        />
                        <Input
                            label="Nakliyeci"
                            value={formData.forwarderName || ''}
                            onChange={e => setFormData({ ...formData, forwarderName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="ETD (Kalkış)"
                            type="date"
                            value={formData.etd || ''}
                            onChange={e => setFormData({ ...formData, etd: e.target.value })}
                        />
                        <Input
                            label="ETA (Varış)"
                            type="date"
                            value={formData.eta || ''}
                            onChange={e => setFormData({ ...formData, eta: e.target.value })}
                        />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Konteyner Sayısı"
                                type="number"
                                min="1"
                                value={formData.containerCount || 1}
                                onChange={e => setFormData({ ...formData, containerCount: Number(e.target.value) })}
                            />
                            <div>
                                <label className="text-sm font-medium text-primary ml-1 mb-1 block">Tip</label>
                                <select
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none bg-white text-sm transition-all"
                                    value={formData.containerType || '40HC'}
                                    onChange={e => setFormData({ ...formData, containerType: e.target.value as any })}
                                >
                                    <option value="20GP">20' GP</option>
                                    <option value="40GP">40' GP</option>
                                    <option value="40HC">40' HC</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Status Dropdown - always visible but more useful when editing */}
                    <div>
                        <label className="text-sm font-medium text-primary ml-1 mb-1 block">Durum</label>
                        <select
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none bg-white text-sm transition-all"
                            value={formData.status || 'Booked'}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="Booked">Booked</option>
                            <option value="Loading">Loading</option>
                            <option value="On Water">On Water</option>
                            <option value="At Port">At Port</option>
                            <option value="Customs">Customs</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <Input
                        label="Takip URL'si"
                        placeholder="https://..."
                        value={formData.trackingUrl || ''}
                        onChange={e => setFormData({ ...formData, trackingUrl: e.target.value })}
                    />

                    <Input
                        label="Notlar"
                        placeholder="Additional notes..."
                        value={formData.notes || ''}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit">{isEditing ? 'Değişiklikleri Kaydet' : 'Sevkiyat Oluştur'}</Button>
                    </div>
                </form>
            </Modal>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Sevkiyatlar</h1>
                    <p className="text-secondary mt-1">Aktif lojistik ve konteyner hareketlerini takip edin</p>
                </div>
                <Button onClick={openNew} className="shadow-lg shadow-accent/20">
                    <Plus size={18} className="mr-2" /> Yeni Sevkiyat
                </Button>
            </div>

            {/* Active Shipments Cards */}
            <div>
                <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                    <Anchor size={20} className="text-accent" />
                    Denizde / Aktif
                </h3>
                {activeShipments.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center py-12 text-center shadow-none">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <Package size={32} />
                        </div>
                        <p className="text-secondary font-medium">Aktif sevkiyat yok.</p>
                        <p className="text-xs text-gray-400 mt-1">Takip için bir tane oluşturun.</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeShipments.map(shipment => (
                            <Card
                                key={shipment.id}
                                className="relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                onClick={() => openEdit(shipment)}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -mr-16 -mt-16 z-0 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant={getStatusColor(shipment.status) === 'danger' ? 'error' : getStatusColor(shipment.status) as any}>{shipment.status}</Badge>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono font-medium text-secondary bg-gray-50 px-2 py-1 rounded-md">{shipment.bookingReference}</span>
                                            <button className="text-gray-300 hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                <Edit size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-lg text-primary mb-1">{shipment.vesselName}</h3>
                                    <div className="flex items-center text-sm text-secondary mb-5">
                                        <MapPin size={14} className="mr-1 text-gray-400" />
                                        {getCustomerName(shipment.customerId)}
                                    </div>

                                    <div className="flex justify-between text-sm py-3 border-t border-gray-100">
                                        <div>
                                            <div className="flex items-center gap-1 text-gray-400 text-xs mb-1 font-medium uppercase tracking-wide">
                                                <Calendar size={10} /> ETD
                                            </div>
                                            <div className="font-semibold text-primary">{shipment.etd ? new Date(shipment.etd).toLocaleDateString() : 'TBD'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1 text-gray-400 text-xs mb-1 font-medium uppercase tracking-wide">
                                                <Calendar size={10} /> ETA
                                            </div>
                                            <div className="font-semibold text-primary">{shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'TBD'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-gray-100">
                                        <div className="text-xs font-medium text-secondary flex items-center gap-1">
                                            <Package size={12} />
                                            {shipment.containerCount} x {shipment.containerType}
                                        </div>
                                        {shipment.trackingUrl && shipment.trackingUrl.startsWith('http') && (
                                            <a
                                                href={shipment.trackingUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-accent hover:text-accent-hover text-xs font-bold flex items-center gap-1 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Takip <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Delivered History */}
            {deliveredShipments.length > 0 && (
                <div>
                    <h3 className="font-bold text-lg text-primary mb-4 mt-8 px-1">Teslim Edilenler Geçmişi</h3>
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-secondary font-bold text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 pl-6">Rezervasyon Ref</th>
                                    <th className="p-4">Müşteri</th>
                                    <th className="p-4">Gemi</th>
                                    <th className="p-4">Varış Tarihi</th>
                                    <th className="p-4">Konteynerler</th>
                                    <th className="p-4">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {deliveredShipments.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => openEdit(s)}>
                                        <td className="p-4 pl-6 font-mono text-secondary font-medium">{s.bookingReference}</td>
                                        <td className="p-4 font-bold text-primary">{getCustomerName(s.customerId)}</td>
                                        <td className="p-4 text-secondary">{s.vesselName}</td>
                                        <td className="p-4 text-secondary">{s.eta}</td>
                                        <td className="p-4 text-secondary">{s.containerCount} x {s.containerType}</td>
                                        <td className="p-4">
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(s); }}>
                                                <Edit size={14} className="mr-1" /> Düzenle
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
