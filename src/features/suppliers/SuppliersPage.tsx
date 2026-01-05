import { useState, useEffect } from 'react';
import { Plus, MapPin, Phone, Edit, Trash2, Loader2, User as UserIcon } from 'lucide-react';
import { supplierService, productService } from '../../services/api';
import type { Supplier, Product } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export function SuppliersPage() {
    const toast = useToast();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Supplier>>({});
    const [supplierProducts, setSupplierProducts] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        // Fetch products and suppliers independently so one failure doesn't block the other
        try {
            const prodData = await productService.getAll();
            console.log('Loaded products:', prodData);
            setProducts(prodData);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Ürünler yüklenemedi');
        }

        try {
            const supData = await supplierService.getAll();
            setSuppliers(supData);
        } catch (error) {
            console.error('Error loading suppliers:', error);
            // Don't show error toast for suppliers as the table might not exist yet
        }
    }

    const handleOpenModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData(supplier);
            setSupplierProducts([...(supplier.products || [])]);
        } else {
            setEditingSupplier(null);
            setFormData({});
            setSupplierProducts([]);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            products: supplierProducts
        };

        setIsSaving(true);
        try {
            if (editingSupplier) {
                await supplierService.update(editingSupplier.id, dataToSave);
            } else {
                await supplierService.create(dataToSave as any);
            }
            setIsModalOpen(false);
            loadData();
            toast.success('Tedarikçi başarıyla kaydedildi');
        } catch (error) {
            toast.error('Tedarikçi kaydedilemedi');
        } finally {
            setIsSaving(false);
        }
    };

    const addProductRow = () => {
        setSupplierProducts([...supplierProducts, { productId: '', price: 0, currency: 'USD' }]);
    };

    const updateProductRow = (index: number, field: string, value: any) => {
        const updated = [...supplierProducts];
        updated[index] = { ...updated[index], [field]: value };

        // Auto-fill details if product selected
        if (field === 'productId') {
            const p = products.find(prod => prod.id === value);
            if (p) {
                updated[index].productName = p.productName;
                updated[index].unitType = p.unitType;
            }
        }
        setSupplierProducts(updated);
    };

    const removeProductRow = (index: number) => {
        setSupplierProducts(supplierProducts.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Tedarikçilerimiz</h1>
                    <p className="text-secondary mt-1">Tedarikçi ilişkilerini ve fiyatlamayı yönetin</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-accent/20">
                    <Plus size={18} className="mr-2" /> Tedarikçi Ekle
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map(supplier => (
                    <Card key={supplier.id} className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent font-bold text-lg">
                                    {supplier.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-primary text-lg">{supplier.name}</h3>
                                    <div className="flex items-center text-xs text-secondary mt-0.5">
                                        <MapPin size={12} className="mr-1" /> {supplier.country}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(supplier)} className="text-gray-400 hover:text-accent">
                                <Edit size={16} />
                            </Button>
                        </div>

                        <div className="space-y-3 text-sm text-secondary mb-6 pl-1">
                            <div className="flex items-center gap-3">
                                <UserIcon size={16} className="text-gray-400" />
                                <span className="font-medium">{supplier.contactPerson || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-gray-400" />
                                <span>{supplier.phone || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ürün Portföyü</span>
                                <Badge variant="neutral" className="bg-gray-100 text-gray-600 border-transparent">{supplier.products?.length || 0} ürün</Badge>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                                {supplier.products?.map((p, idx) => (
                                    <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg border border-gray-100/50">
                                        <span className="truncate flex-1 font-medium text-primary">{p.productName}</span>
                                        <span className="font-mono text-secondary min-w-max ml-3 font-semibold">
                                            {p.currency === 'USD' ? '$' : '€'}{p.price}/{p.unitType}
                                        </span>
                                    </div>
                                ))}
                                {(!supplier.products || supplier.products.length === 0) && (
                                    <div className="text-xs text-gray-400 italic text-center py-2">Kayıtlı ürün yok</div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSupplier ? "Tedarikçiyi Düzenle" : "Tedarikçi Ekle"}
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Şirket Adı"
                            required
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Input
                            label="Ülke"
                            required
                            value={formData.country || ''}
                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                        />
                        <Input
                            label="İlgili Kişi"
                            value={formData.contactPerson || ''}
                            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                        <Input
                            label="Telefon"
                            value={formData.phone || ''}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-primary">Ürünler ve Fiyatlandırma</h3>
                            <Button type="button" size="sm" variant="outline" onClick={addProductRow}>
                                <Plus size={16} className="mr-1" /> Ürün Ekle
                            </Button>
                        </div>

                        <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 max-h-60 overflow-y-auto">
                            {supplierProducts.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <select
                                        className="flex-1 text-sm border border-gray-200 bg-white text-primary rounded-xl p-2.5 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-sm"
                                        value={item.productId}
                                        onChange={e => updateProductRow(idx, 'productId', e.target.value)}
                                    >
                                        <option value="">Ürün Seçiniz...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                                    </select>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-24 text-sm border border-gray-200 bg-white text-primary rounded-xl p-2.5 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-sm"
                                        placeholder="Fiyat"
                                        value={item.price}
                                        onChange={e => updateProductRow(idx, 'price', Number(e.target.value))}
                                    />
                                    <select
                                        className="w-20 text-sm border border-gray-200 bg-white text-primary rounded-xl p-2.5 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-sm"
                                        value={item.currency}
                                        onChange={e => updateProductRow(idx, 'currency', e.target.value)}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                    <select
                                        className="w-24 text-sm border border-gray-200 bg-white text-primary rounded-xl p-2.5 focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all shadow-sm"
                                        value={item.unitType || 'kg'}
                                        onChange={e => updateProductRow(idx, 'unitType', e.target.value)}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="liter">Liter</option>
                                        <option value="ton">Ton</option>
                                        <option value="piece">Piece</option>
                                        <option value="box">Box</option>
                                        <option value="carton">Carton</option>
                                        <option value="drum">Drum</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => removeProductRow(idx)}
                                        className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            {supplierProducts.length === 0 && (
                                <div className="text-center py-8 text-sm text-gray-400">
                                    Ürün eklenmedi. Başlamak için &quot;Ürün Ekle&quot;'ye tıklayın.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tedarikçiyi Kaydet
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
