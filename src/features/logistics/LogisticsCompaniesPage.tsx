import { useState, useEffect } from 'react';
import { Filter, Plus, Loader2 } from 'lucide-react';
import { logisticsCompanyService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { ColumnDef } from '../../components/ui/DynamicTable';
import { DynamicTable } from '../../components/ui/DynamicTable';
import { useToast } from '../../components/ui/Toast';
import type { LogisticsCompany } from '../../types';

const DEFAULT_COLUMNS: ColumnDef[] = [
    { id: 'c1', label: 'Şirket Adı', key: 'companyName', type: 'text', width: 200 },
    { id: 'c2', label: 'İlgili Kişi Adı', key: 'contactPerson', type: 'text', width: 150 },
    { id: 'c3', label: 'Telefon Numarası', key: 'phone', type: 'text', width: 140 },
    { id: 'c4', label: 'E-posta', key: 'email', type: 'text', width: 200 },
    { id: 'c5', label: 'Servis Yoğunluğu', key: 'serviceIntensity', type: 'text', width: 200 },
    { id: 'c6', label: 'Öz Mal', key: 'ownAssets', type: 'text', width: 120 },
    { id: 'c7', label: 'Ofis Adresi', key: 'officeAddress', type: 'text', width: 250 },
    { id: 'c8', label: 'Notlar', key: 'notes', type: 'text', width: 250 },
    { id: 'c9', label: 'Tanışma', key: 'meetingStatus', type: 'text', width: 120 },
];

export function LogisticsCompaniesPage() {
    const toast = useToast();
    const [filterText, setFilterText] = useState('');
    const [companies, setCompanies] = useState<LogisticsCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Company Form Data
    const [formData, setFormData] = useState<Partial<LogisticsCompany>>({});

    useEffect(() => {
        loadCompanies();
    }, []);

    async function loadCompanies() {
        try {
            const data = await logisticsCompanyService.getAll();
            setCompanies(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await logisticsCompanyService.create(formData);
            setIsModalOpen(false);
            setFormData({});
            toast.success('Company created');
            loadCompanies();
        } catch (error) {
            toast.error('Şirket oluşturulamadı');
        }
    }

    const handleDataChange = async (id: string, key: string, value: any) => {
        // Optimistic update
        setCompanies(prev => prev.map(item => {
            if (item.id !== id) return item;

            if (key.includes('.')) {
                const [root, child] = key.split('.');
                return {
                    ...item,
                    [root]: {
                        ...((item as any)[root]),
                        [child]: value
                    }
                };
            }
            return { ...item, [key]: value };
        }));

        // Autosave
        try {
            let updates: any = {};
            if (key.includes('.')) {
                const currentItem = companies.find(o => o.id === id);
                const [root, child] = key.split('.');
                if (currentItem) {
                    updates[root] = { ...((currentItem as any)[root]), [child]: value };
                }
            } else {
                updates[key] = value;
            }
            await logisticsCompanyService.update(id, updates);
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    const handleColumnAdd = (newCol: ColumnDef) => {
        setColumns(prev => [...prev, newCol]);
        toast.success(`Column "${newCol.label}" added`);
    };

    const handleRowDelete = async (id: string) => {
        // Direct execution - no blocking dialogs
        try {
            await logisticsCompanyService.delete(id);
            setCompanies(prev => prev.filter(c => c.id !== id));
            toast.success('Company deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const filteredCompanies = companies.filter(c =>
        (c.companyName || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (c.contactPerson || '').toLowerCase().includes(filterText.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">LOJİSTİK LİSTESİ</h1>
                    <p className="text-slate-500">Logistics Companies & Contacts</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2" />
                        Yeni Şirket
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Şirket veya Kişi Ara..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <DynamicTable
                    data={filteredCompanies}
                    columns={columns}
                    onDataChange={handleDataChange}
                    onColumnAdd={handleColumnAdd}
                    onRowDelete={handleRowDelete}
                />
            </div>

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Lojistik Şirketi">
                <form onSubmit={handleCreate} className="space-y-4 p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Şirket Adı</label>
                            <input required className="w-full border border-slate-200 rounded-lg p-2" value={formData.companyName || ''} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">İlgili Kişi</label>
                            <input className="w-full border border-slate-200 rounded-lg p-2" value={formData.contactPerson || ''} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                            <input className="w-full border border-slate-200 rounded-lg p-2" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                            <input className="w-full border border-slate-200 rounded-lg p-2" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Servis Yoğunluğu</label>
                        <input className="w-full border border-slate-200 rounded-lg p-2" value={formData.serviceIntensity || ''} onChange={e => setFormData({ ...formData, serviceIntensity: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ofis Adresi</label>
                        <input className="w-full border border-slate-200 rounded-lg p-2" value={formData.officeAddress || ''} onChange={e => setFormData({ ...formData, officeAddress: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                        <textarea className="w-full border border-slate-200 rounded-lg p-2" value={formData.notes || ''} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit">Kaydet</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
