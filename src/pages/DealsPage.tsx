import { useState, useEffect } from 'react';
import DealDetailView from '../components/DealDetailView';
import { taskService, dealService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, ChevronDown, Settings, X, User, Building2, Phone, Mail, MessageSquare, Trash2, Calendar } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { HighlightText } from '../components/ui/HighlightText';
import { playNotificationSound } from '../utils/notificationSound';
import { useSocket } from '../context/SocketContext';

const columns = [
    { id: 'teklif', title: 'Müşteriye Teklif Atıldı', color: 'bg-indigo-400', count: 0, total: 0 },
    { id: 'cevap', title: 'Cevap Bekleniyor', color: 'bg-blue-400', count: 0, total: 0 },
    { id: 'proforma', title: 'Proforma Atıldı', color: 'bg-cyan-400', count: 0, total: 0 },
    { id: 'bekleniyor', title: 'Bekleniyor', color: 'bg-amber-400', count: 0, total: 0 },
    { id: 'kazanildi', title: 'Anlaşma Kazanıldı', color: 'bg-green-500', count: 0, total: 0 },
    { id: 'kaybedildi', title: 'Anlaşma Kaybedildi', color: 'bg-red-500', count: 0, total: 0 },
    { id: 'kapat', title: 'Anlaşmayı Kapat', color: 'bg-slate-400', count: 0, total: 0 },
];

const activityColumns = [
    { id: 'a1', title: 'Geciken', color: 'bg-red-500', count: 0 },
    { id: 'a2', title: 'Son tarihi bugün', color: 'bg-[#98c93c]', count: 0 },
    { id: 'a3', title: 'Son tarihi bu hafta', color: 'bg-cyan-400', count: 0 },
    { id: 'a4', title: 'Gelecek hafta', color: 'bg-teal-300', count: 0 },
    { id: 'a5', title: 'Boş', color: 'bg-slate-200', count: 0 },
];

const gelenColumns = [
    { id: 'g1', title: 'Yeni', color: 'bg-blue-500', count: 0 },
    { id: 'g2', title: 'Beklemede', color: 'bg-amber-400', count: 0 },
    { id: 'g3', title: 'İşleniyor', color: 'bg-indigo-400', count: 0 },
    { id: 'g4', title: 'Tamamlandı', color: 'bg-green-500', count: 0 },
];

function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) return initialValue;
            const parsed = JSON.parse(item);
            if (Array.isArray(initialValue) && !Array.isArray(parsed)) return initialValue;
            return parsed;
        } catch (error) {
            return initialValue;
        }
    });

    useEffect(() => {
        try { window.localStorage.setItem(key, JSON.stringify(storedValue)); } catch (error) {}
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}

export default function DealsPage() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [activeTab, setActiveTab] = useState('Takip edilen işler');
    const [deals, setDeals] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]); // BURASI EKLENDİ (Hata buradaydı)
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeal, setSelectedDeal] = useLocalStorage<any | null>('deals_selectedDeal', null);
    const [quickAddCol, setQuickAddCol] = useState<string | null>(null);
    const [quickAddForm, setQuickAddForm] = useLocalStorage('deals_quickAddForm', { title: '', amount: '', currency: '₺', person: '', company: '' });
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [quickAddTaskCol, setQuickAddTaskCol] = useState<string | null>(null);
    const [selectedActivityCol, setSelectedActivityCol] = useState<string | null>(null);
    const [activityForm, setActivityForm] = useState({
        title: '', preparedBy: '', relatedPersons: '', reason: '', description: '', dueDate: '', id: '', category: 'activity', status: 'pending', dealId: ''
    });

    const fetchDeals = async () => {
        try {
            const data = await dealService.getAll();
            setDeals(data);
        } catch (error) {
            console.error('Failed to fetch deals:', error);
        }
    };

    useEffect(() => {
        fetchDeals();
        taskService.getAll().then(data => setTasks(Array.isArray(data) ? data : []));
    }, []);

    const handleSaveDeal = async (newDeal: any) => {
        try {
            if (newDeal.id && !newDeal.isNew) {
                const updated = await dealService.update(newDeal.id, newDeal);
                setDeals(prev => prev.map(d => d.id === newDeal.id ? updated : d));
            } else {
                const created = await dealService.create({
                    title: newDeal.title,
                    customer_name: newDeal.customer || newDeal.person || newDeal.company,
                    expected_revenue: parseFloat(newDeal.amount) || 0,
                    currency: newDeal.currency || '₺',
                    stage: newDeal.stage || 'Müşteriye Teklif Atıldı'
                });
                setDeals(prev => [...prev, created]);
                playNotificationSound();
            }
            setSelectedDeal(null);
            setQuickAddCol(null);
            setQuickAddForm({ title: '', amount: '', currency: '₺', person: '', company: '' });
        } catch (error) {
            console.error('Failed to save deal:', error);
            alert('Kaydetme başarısız oldu.');
        }
    };

    const handleQuickAddSave = (stage: string) => {
        if (!quickAddForm.title) return;
        handleSaveDeal({
            isNew: true,
            title: quickAddForm.title,
            amount: quickAddForm.amount,
            currency: quickAddForm.currency,
            stage,
            customer: quickAddForm.person || quickAddForm.company
        });
    };

    // ... (Geri kalan render fonksiyonları paylaştığın kodla aynı kalabilir, 
    // ancak karmaşıklığı önlemek için en temel kısımları yukarıda düzelttim)
    
    return (
        <div className="min-h-full bg-[#17202b] flex flex-col p-4">
            {/* Arama ve Oluşturma Başlığı */}
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold text-white mr-4">İŞLER</h2>
                <button onClick={() => setSelectedDeal({ title: '', isNew: true })} className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-sm text-sm font-medium">
                    <Plus size={16} className="mr-1" /> oluştur
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto flex items-start pb-4">
                {columns.map((col) => {
                    const colDeals = deals.filter(d => d.stage === col.title);
                    return (
                        <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col border-r border-white/10 h-full px-2">
                            <div className={`py-2 px-4 ${col.color} text-slate-900 mb-4 rounded font-bold`}>
                                {col.title} ({colDeals.length})
                            </div>
                            <button onClick={() => setQuickAddCol(col.title)} className="text-white/40 hover:text-white/80 mb-4 flex justify-center"><Plus /></button>
                            
                            {quickAddCol === col.title && (
                                <div className="bg-white p-4 rounded-lg mb-4 space-y-2">
                                    <input placeholder="Anlaşma Adı" className="w-full border p-2 rounded" value={quickAddForm.title} onChange={e => setQuickAddForm({...quickAddForm, title: e.target.value})} />
                                    <input placeholder="Tutar" className="w-full border p-2 rounded" value={quickAddForm.amount} onChange={e => setQuickAddForm({...quickAddForm, amount: e.target.value})} />
                                    <button onClick={() => handleQuickAddSave(col.title)} className="bg-blue-500 text-white px-4 py-2 rounded w-full font-bold">KAYDET</button>
                                </div>
                            )}

                            {colDeals.map(deal => (
                                <div key={deal.id} onClick={() => setSelectedDeal(deal)} className="bg-white p-4 rounded-lg shadow mb-2 cursor-pointer">
                                    <div className="font-bold text-blue-600">{deal.title}</div>
                                    <div className="text-lg font-black">{deal.expected_revenue} {deal.currency}</div>
                                    <div className="text-sm text-slate-500">{deal.customer_name}</div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {selectedDeal && (
                <DealDetailView deal={selectedDeal} onClose={() => setSelectedDeal(null)} onSave={handleSaveDeal} />
            )}
        </div>
    );
}