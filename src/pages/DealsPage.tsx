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
            // If we expect an array but got something else, return initial (likely [])
            if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
                return initialValue;
            }
            return parsed;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}

export default function DealsPage() {
    const { user } = useAuth();
    console.log('DealsPage Rendered - Source: src/pages/DealsPage.tsx');
    const [activeTab, setActiveTab] = useState('Takip edilen işler');
    const [deals, setDeals] = useState<any[]>([]);

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
    }, []);

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleDataChange = ({ type, payload }: { type: string; payload: any }) => {
            if (type === 'deals') {
                if (payload.deleted) {
                    setDeals(prev => prev.filter(d => d.id !== payload.id));
                } else {
                    setDeals(prev => {
                        const exists = prev.find(d => d.id === payload.id);
                        if (exists) {
                            return prev.map(d => d.id === payload.id ? payload : d);
                        }
                        return [payload, ...prev];
                    });
                }
            } else if (type === 'tasks') {
                if (payload.deleted) {
                    setTasks(prev => prev.filter(t => t.id !== payload.id));
                } else {
                    setTasks(prev => {
                        const exists = prev.find(t => t.id === payload.id);
                        if (exists) {
                            return prev.map(t => t.id === payload.id ? payload : t);
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
    }, [socket]);

    const [tasks, setTasks] = useState<any[]>([]);
    const [quickAddTaskCol, setQuickAddTaskCol] = useState<string | null>(null);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [selectedActivityCol, setSelectedActivityCol] = useState<string | null>(null);
    const [activityForm, setActivityForm] = useState({
        title: '',
        preparedBy: '',
        relatedPersons: '',
        reason: '',
        description: '',
        dueDate: '',
        id: '',
        category: 'activity',
        status: 'pending',
        dealId: ''
    });
    const [isEditingTask, setIsEditingTask] = useState(false);

    useEffect(() => {
        taskService.getAll()
            .then(data => {
                if (Array.isArray(data)) {
                    setTasks(data);
                } else {
                    console.error('Fetched tasks is not an array:', data);
                    setTasks([]);
                }
            })
            .catch(err => {
                console.error('Failed to fetch tasks:', err);
                setTasks([]);
            });
    }, []);
    const [selectedDeal, setSelectedDeal] = useLocalStorage<any | null>('deals_selectedDeal', null);
    const [quickAddCol, setQuickAddCol] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [quickAddForm, setQuickAddForm] = useLocalStorage('deals_quickAddForm', { title: '', amount: '', currency: '₺', person: '', company: '' });

    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }, []);

    const checkNotifications = () => {
        const now = new Date();
        tasks.forEach(task => {
            if (task.dueDate && task.status !== 'completed' && !task.notified) {
                const dueDate = new Date(task.dueDate);
                // Simple logic: if due date is today and not already notified
                if (dueDate.toDateString() === now.toDateString()) {
                    new Notification("Etkinlik Hatırlatıcısı", {
                        body: `${task.title} etkinliğinin zamanı geldi.`,
                        icon: "/favicon.ico"
                    });
                    playNotificationSound();
                    // Mark as notified locally to avoid repeated notifications
                    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notified: true } : t));
                }
            }
        });
    };

    useEffect(() => {
        const interval = setInterval(checkNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [tasks]);

    const handleSaveDeal = async (newDeal: any) => {
        try {
            if (newDeal.id && !newDeal.isNew) {
                // Update
                const updated = await dealService.update(newDeal.id, newDeal);
                setDeals(prev => prev.map(d => d.id === newDeal.id ? updated : d));
            } else {
                // Create
                const created = await dealService.create({
                    ...newDeal,
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
            id: Date.now().toString(),
            isNew: true,
            title: quickAddForm.title,
            amount: quickAddForm.amount,
            currency: quickAddForm.currency,
            stage,
            customer: quickAddForm.person || quickAddForm.company,
            endDate: new Date().toLocaleDateString('tr-TR'),
            created_at: new Date().toISOString()
        });
    };

    const [quickAddActivity, setQuickAddActivity] = useState({ title: '', dueDate: '' });

    const handleQuickAddActivity = async (colId: string) => {
        if (!quickAddActivity.title) return;
        
        // Use local date for default
        let dueDate = quickAddActivity.dueDate;
        if (!dueDate) {
            const now = new Date();
            const tzOffset = now.getTimezoneOffset() * 60000;
            const localISODate = new Date(now.getTime() - tzOffset).toISOString().split('T')[0];
            
            if (colId === 'a2') dueDate = localISODate;
            else if (colId === 'a3') {
                const d = new Date();
                d.setDate(d.getDate() + 2);
                dueDate = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
            }
            else if (colId === 'a1') {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                dueDate = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
            }
        }

        const isInbox = colId.startsWith('g');
        const inboxStatusMap: Record<string, string> = {
            'g1': 'new',
            'g2': 'pending',
            'g3': 'processing',
            'g4': 'completed'
        };

        const category = activeTab === 'Gelen' ? 'inbox' : (activeTab === 'Planlandı' ? 'planned' : 'activity');

        try {
            const newTask = await taskService.create({
                title: quickAddActivity.title,
                dueDate: dueDate || null,
                status: isInbox ? (inboxStatusMap[colId] || 'new') : 'pending',
                priority: 'medium',
                preparedBy: user?.fullName || '',
                category: category
            });

            playNotificationSound();
            setTasks(prev => [...prev, newTask]);
            setQuickAddTaskCol(null);
            setQuickAddActivity({ title: '', dueDate: '' });
        } catch (error) {
            console.error('Failed to quick add activity:', error);
        }
    };

    const getCategorizedTasks = (colId: string) => {
        const now = new Date();
        now.setHours(0,0,0,0);
        
        const tzOffset = now.getTimezoneOffset() * 60000;
        const nowStr = new Date(now.getTime() - tzOffset).toISOString().split('T')[0];
        
        const endOfWeek = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() + (day === 0 ? 0 : 7 - day); 
        endOfWeek.setDate(diff);
        endOfWeek.setHours(23,59,59,999);
        
        const endOfNextWeek = new Date(endOfWeek);
        endOfNextWeek.setDate(endOfWeek.getDate() + 7);

        // Map column IDs to internal statuses for Gelen tab
        const statusMap: Record<string, string> = {
            'g1': 'new',
            'g2': 'pending',
            'g3': 'processing',
            'g4': 'completed'
        };

        return tasks.filter(t => {
            // Global search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const matchesSearch = (t.title?.toLowerCase().includes(searchLower)) || 
                                     (t.description?.toLowerCase().includes(searchLower)) ||
                                     (t.reason?.toLowerCase().includes(searchLower)) ||
                                     (t.preparedBy?.toLowerCase().includes(searchLower));
                if (!matchesSearch) return false;
            }

            if (activeTab === 'Gelen') {
                if (t.category !== 'inbox') return false;
                const targetStatus = statusMap[colId];
                return (t.status || 'new') === targetStatus;
            }

            if (activeTab === 'Planlandı') {
                if (t.category !== 'planned') return false;
            } else {
                // Etkinlikler tab or other views
                if (t.category !== 'activity' && t.category !== undefined) return false;
            }

            if (!t.dueDate) return colId === 'a5';
            const dStr = t.dueDate.split('T')[0];
            
            if (dStr < nowStr) return colId === 'a1';
            if (dStr === nowStr) return colId === 'a2';
            
            const d = new Date(dStr);
            d.setHours(12,0,0,0); // Avoid edge of day issues
            
            if (d > now && d <= endOfWeek) return colId === 'a3';
            if (d > endOfWeek && d <= endOfNextWeek) return colId === 'a4';
            
            if (d > endOfNextWeek) return colId === 'a4';
            
            return colId === 'a5';
        });
    };

    const handleSaveActivityModal = async () => {
        try {
            console.log('Attempting to save activity modal...', activityForm);
            if (!activityForm.title) {
                alert('Lütfen bir başlık giriniz.');
                return;
            }

            let dueDate = activityForm.dueDate;
            if (!dueDate && selectedActivityCol) {
                const now = new Date();
                const tzOffset = now.getTimezoneOffset() * 60000;
                const localISODate = new Date(now.getTime() - tzOffset).toISOString().split('T')[0];
                
                if (selectedActivityCol === 'a2') dueDate = localISODate;
                else if (selectedActivityCol === 'a3') {
                    const d = new Date();
                    d.setDate(d.getDate() + 2);
                    dueDate = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
                }
                else if (selectedActivityCol === 'a1') {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    dueDate = new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
                }
            }

            const newTask = await taskService.create({
                title: activityForm.title,
                preparedBy: activityForm.preparedBy,
                relatedPersons: activityForm.relatedPersons,
                reason: activityForm.reason,
                description: activityForm.description,
                dueDate: dueDate || null,
                status: activityForm.status || 'pending',
                priority: 'medium',
                dealId: selectedDeal?.id,
                category: activityForm.category
            });

            console.log('Task created successfully:', newTask);
            if (newTask) {
                playNotificationSound();
                setTasks(prev => [...prev, newTask]);
                setIsActivityModalOpen(false);
                setActivityForm({ title: '', preparedBy: '', relatedPersons: '', reason: '', description: '', dueDate: '', id: '', category: 'activity', status: 'pending', dealId: '' });
                setSelectedActivityCol(null);
                setIsEditingTask(false);
            }
        } catch (error: any) {
            console.error('Failed to save task:', error);
            alert('Kaydetme sırasında bir hata oluştu: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleUpdateActivityModal = async () => {
        try {
            if (!activityForm.title) {
                alert('Lütfen bir başlık giriniz.');
                return;
            }

            const updatedTask = await taskService.update(activityForm.id, {
                title: activityForm.title,
                preparedBy: activityForm.preparedBy,
                relatedPersons: activityForm.relatedPersons,
                reason: activityForm.reason,
                description: activityForm.description,
                dueDate: activityForm.dueDate || null,
                status: activityForm.status || 'pending',
                priority: 'medium',
                dealId: selectedDeal?.id,
                category: activityForm.category
            });

            if (updatedTask) {
                setTasks(prev => prev.map(t => t.id === activityForm.id ? updatedTask : t));
                setIsActivityModalOpen(false);
                setActivityForm({ title: '', preparedBy: '', relatedPersons: '', reason: '', description: '', dueDate: '', id: '', category: 'activity', status: 'pending', dealId: '' });
                setIsEditingTask(false);
            }
        } catch (error: any) {
            console.error('Failed to update task:', error);
            alert('Güncelleme sırasında bir hata oluştu: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteDeal = async (dealId: string) => {
        if (!confirm('Bu anlaşmayı silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await dealService.delete(dealId);
            setDeals(prev => prev.filter(d => d.id !== dealId));
        } catch (error: any) {
            console.error('Failed to delete deal:', error);
            alert('Silme işlemi sırasında bir hata oluştu: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteActivity = async () => {
        if (!activityForm.id) return;
        
        if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
            return;
        }

        try {
            await taskService.delete(activityForm.id);
            setTasks(prev => prev.filter(t => t.id !== activityForm.id));
            setIsActivityModalOpen(false);
            setActivityForm({ title: '', preparedBy: '', relatedPersons: '', reason: '', description: '', dueDate: '', id: '', category: 'activity', status: 'pending', dealId: '' });
            setIsEditingTask(false);
        } catch (error: any) {
            console.error('Failed to delete task:', error);
            alert('Silme işlemi sırasında bir hata oluştu: ' + (error.response?.data?.error || error.message));
        }
    };



    return (
        <div className="min-h-full bg-[#17202b] flex flex-col p-4">
            {/* Search Header */}
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-semibold text-white mr-4">İŞLER</h2>
                <button onClick={() => {
                    const newDeal: any = {
                        id: Date.now().toString(),
                        isNew: true,
                        title: 'Yeni Anlaşma',
                        amount: '',
                        currency: '₺',
                        stage: 'Müşteriye Teklif Atıldı',
                        customer: '',
                        startDate: new Date().toLocaleDateString('tr-TR'),
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')
                    };
                    setSelectedDeal(newDeal);
                }} className="flex items-center bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-sm text-sm font-medium transition-colors shadow-sm">
                    <Plus size={16} className="mr-1" /> oluştur <span className="ml-2 border-l border-green-600 pl-2"><ChevronDown size={14} /></span>
                </button>
                <div className="relative flex-1 max-w-xl mx-2">
                    <div className="flex items-center bg-white/10 border border-transparent focus-within:border-blue-400/50 focus-within:bg-white/15 rounded-md px-3 py-1.5 transition-all">
                        <input
                            type="text"
                            placeholder="+ Ara"
                            className="bg-transparent border-none outline-none text-white text-sm flex-1 placeholder-white/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={16} className="text-white/70" />
                        {searchQuery && (
                            <>
                                <Badge variant="neutral" className="bg-blue-500/20 text-blue-400 border-none text-[10px] ml-2 animate-in fade-in zoom-in duration-200">
                                    {deals.filter(d => 
                                        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        d.customer?.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).length} sonuç
                                </Badge>
                                <X 
                                    size={16} 
                                    className="text-white/70 ml-2 cursor-pointer hover:text-white" 
                                    onClick={() => setSearchQuery('')}
                                />
                            </>
                        )}
                    </div>
                </div>
                <button className="p-1.5 rounded-md bg-white/10 text-white/70 hover:bg-white/20 transition-colors ml-auto"><Settings size={18} /></button>
            </div>

            {/* Tabs / Filters Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex bg-white/5 rounded-md p-1 border border-white/5">
                    {['Takip edilen işler', 'Liste', 'Etkinlikler', 'Takvim'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm rounded ${activeTab === tab ? 'bg-white/20 text-white font-medium shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-white/20 my-auto mx-2" />
                    {['0 Gelen', '0 Planlandı'].map(status => {
                        const tabName = status.split(' ')[1].replace('_', ' ');
                        return (
                            <button
                                key={status}
                                onClick={() => setActiveTab(tabName)}
                                className={`px-3 py-1.5 text-sm rounded flex items-center ${activeTab === tabName ? 'bg-white/20 text-white font-medium shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                            >
                                <span className={`bg-white/10 px-1.5 py-0.5 rounded-full text-xs mr-1 opacity-70 ${activeTab === tabName ? 'opacity-100 bg-white/20' : ''}`}>{status.split(' ')[0]}</span>
                                {tabName}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Kanban Board */}
            {activeTab === 'Takip edilen işler' ? (
                <div className="flex-1 overflow-x-auto flex items-start pb-4">
                    {columns.map((col, index) => {
                        const colDeals = deals.filter(d => {
                            const isStage = d.stage === col.title;
                            if (!isStage) return false;
                            
                            if (searchQuery) {
                                const searchLower = searchQuery.toLowerCase();
                                return (d.title?.toLowerCase().includes(searchLower)) ||
                                       (d.customer?.toLowerCase().includes(searchLower)) ||
                                       (d.amount?.toString().includes(searchLower));
                            }
                            return true;
                        });
                        const count = colDeals.length;
                        const total = colDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

                        return (
                            <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col border-r border-white/10 last:border-r-0 h-full">
                                {/* Column Header */}
                                <div
                                    className={`py-2 ${col.color} text-slate-900 mb-3 flex items-center justify-between ${index === 0 ? 'pl-4 pr-5' : 'pl-8 pr-5'} z-10 relative shadow-sm`}
                                    style={{
                                        clipPath: index === 0
                                            ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
                                            : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
                                        marginLeft: index === 0 ? '0' : '-16px',
                                        width: index === 0 ? '100%' : 'calc(100% + 16px)'
                                    }}
                                >
                                    <span className="text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">{col.title} ({count})</span>
                                    {index === columns.length - 1 && (
                                        <button className="w-5 h-5 rounded-full flex items-center justify-center text-slate-800 bg-white/30 hover:bg-white/50 transition-colors shrink-0">
                                            <Plus size={14} />
                                        </button>
                                    )}
                                </div>
                                {/* Column Stats */}
                                <div className="text-center mb-4">
                                    <div className="text-3xl font-light text-white mt-2">{total} <span className="text-xl">₺</span></div>
                                    <button
                                        onClick={() => setQuickAddCol(col.title)}
                                        className="text-white/40 hover:text-white/80 transition-colors mt-2 w-full flex items-center justify-center font-light"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                {/* Quick Add Form */}
                                {quickAddCol === col.title && (
                                    <div className="bg-white rounded-lg shadow-xl mx-3 mb-4 p-4 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Ad</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="# numaralı Anlaşma"
                                                className="w-full border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 outline-none focus:border-blue-400"
                                                value={quickAddForm.title}
                                                onChange={e => setQuickAddForm({ ...quickAddForm, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Tutar ve para birimi</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 border border-slate-200 rounded px-3 py-2 text-[13px] text-slate-900 outline-none focus:border-blue-400"
                                                    value={quickAddForm.amount}
                                                    onChange={e => setQuickAddForm({ ...quickAddForm, amount: e.target.value })}
                                                />
                                                <select
                                                    className="w-16 border border-slate-200 rounded px-1 py-2 text-[13px] text-slate-900 bg-white outline-none focus:border-blue-400"
                                                    value={quickAddForm.currency}
                                                    onChange={e => setQuickAddForm({ ...quickAddForm, currency: e.target.value })}
                                                >
                                                    <option>₺</option>
                                                    <option>$</option>
                                                    <option>€</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Müşteri</label>
                                            <div className="border border-slate-100 rounded p-3 bg-slate-50/30 space-y-3">
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Kişiler</span>
                                                    <div className="relative">
                                                        <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        <input
                                                            type="text"
                                                            placeholder="Kişi adı, telefon veya e-posta"
                                                            className="w-full border border-slate-200 rounded pl-8 pr-8 py-1.5 text-[12px] text-slate-900 outline-none bg-white font-medium"
                                                            value={quickAddForm.person}
                                                            onChange={e => setQuickAddForm({ ...quickAddForm, person: e.target.value })}
                                                        />
                                                        <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-blue-500 font-bold cursor-pointer hover:underline">+ Katılımcı ekle</div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Şirket</span>
                                                    <div className="relative">
                                                        <Building2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                        <input
                                                            type="text"
                                                            placeholder="Şirket adı, telefon veya e-posta"
                                                            className="w-full border border-slate-200 rounded pl-8 pr-8 py-1.5 text-[12px] text-slate-900 outline-none bg-white font-medium"
                                                            value={quickAddForm.company}
                                                            onChange={e => setQuickAddForm({ ...quickAddForm, company: e.target.value })}
                                                        />
                                                        <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                            <div className="text-blue-500 text-[11px] font-bold cursor-pointer hover:underline">Alanı seç</div>
                                            <div className="flex items-center gap-1 opacity-40">
                                                <User size={14} className="text-slate-600" /> <User size={14} className="text-slate-600" />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2 pb-1">
                                            <button
                                                onClick={() => handleQuickAddSave(col.title)}
                                                className="bg-[#00d0f5] hover:bg-[#00c0e0] text-white px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-wider transition-colors shadow-sm"
                                            >
                                                KAYDET
                                            </button>
                                            <button
                                                onClick={() => setQuickAddCol(null)}
                                                className="text-slate-400 hover:text-slate-600 font-bold text-[11px] px-2 py-1.5 uppercase transition-colors"
                                            >
                                                İPTAL
                                            </button>
                                        </div>
                                    </div>
                                )}



                                {/* Deal Cards Container */}
                                <div className="flex-1 px-3 mt-0 flex flex-col gap-2 relative z-10">
                                    {colDeals.map((deal: any) => (
                                        <div onClick={() => setSelectedDeal(deal)} key={deal.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-2">
                                                <div
                                                    className="text-[13px] font-bold text-[#008cff] group-hover:underline truncate pr-6 cursor-pointer"
                                                >
                                                    <HighlightText text={deal.title} highlight={searchQuery} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDeal(deal.id);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-red-500 transition-all opacity-40 hover:opacity-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <div className="text-[10px] bg-slate-100 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                        {tasks.filter(t => t.dealId === deal.id).length}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-[16px] text-slate-900 font-bold tracking-tight mb-1">{deal.amount} {deal.currency}</div>

                                            {deal.customer && (
                                                <div className="text-[13px] text-blue-500 font-medium hover:underline mb-3 truncate">
                                                    <HighlightText text={deal.customer} highlight={searchQuery} />
                                                </div>
                                            )}

                                            <div className="text-[11px] text-slate-400 mb-4">şu anda</div>

                                            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
                                                <div className="flex items-center gap-1.5" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDeal(deal);
                                                    setSelectedActivityCol('a2');
                                                    setActivityForm({
                                                        title: '',
                                                        preparedBy: user?.fullName || '',
                                                        relatedPersons: '',
                                                        reason: '',
                                                        description: '',
                                                        dueDate: '',
                                                        id: '',
                                                        category: 'activity',
                                                        status: 'pending',
                                                        dealId: ''
                                                    });
                                                    setIsEditingTask(false);
                                                    setIsActivityModalOpen(true);
                                                }}>
                                                    <span className="text-slate-300 hover:text-blue-500 transition-colors cursor-pointer"><Plus size={14} /> <span className="text-[11px] font-bold ml-0.5">Etkinlik</span></span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
                                                    <Mail size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
                                                    <MessageSquare size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer transition-colors" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] text-slate-400">
                                                <span className="mr-1">şu anda</span>
                                                <div className="w-5 h-5 bg-slate-600 outline outline-2 outline-white rounded-full flex items-center justify-center text-white"><User size={10} /></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : activeTab === 'Liste' ? (
                <div className="flex-1 bg-white rounded-t-xl shadow-lg mt-4 overflow-hidden flex flex-col relative w-full border-x border-slate-200">
                    <div className="overflow-x-auto flex-1 bg-white rounded-t-xl">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-t border-slate-200 bg-[#fbfdfd] shadow-sm relative z-10">
                                    <th className="p-4 w-10 text-center"><input type="checkbox" className="w-3.5 h-3.5 cursor-pointer text-slate-300" /></th>
                                    <th className="p-4 w-10 text-center"><Settings size={14} className="text-slate-400 cursor-pointer hover:text-slate-600 inline-block" /></th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Anlaşma</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Aşama</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Etkinlik</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Müşteri</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Miktar/Para Birimi</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800">Sorumlu</th>
                                    <th className="p-4 text-[13px] font-medium text-slate-500 cursor-pointer hover:text-slate-800 flex items-center gap-1">Oluşturulma Tarihi <ChevronDown size={14} className="opacity-50" /></th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {deals.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center bg-white align-middle">
                                            <div className="flex flex-col items-center justify-center h-[55vh] min-h-[400px]">
                                                <svg className="w-24 h-28 mb-6 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                                                    <polyline points="14 2 14 8 20 8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                                                    <line x1="9.5" y1="14.5" x2="14.5" y2="9.5" stroke="#cbd5e1" strokeWidth="3" />
                                                    <line x1="14.5" y1="14.5" x2="9.5" y2="9.5" stroke="#cbd5e1" strokeWidth="3" />
                                                </svg>
                                                <span className="text-[22px] font-medium text-slate-300 tracking-wide">- Veri yok -</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    deals.filter(deal => {
                                        if (!searchQuery) return true;
                                        const searchLower = searchQuery.toLowerCase();
                                        return (deal.title?.toLowerCase().includes(searchLower)) ||
                                               (deal.customer?.toLowerCase().includes(searchLower)) ||
                                               (deal.amount?.toString().includes(searchLower));
                                    }).map((deal: any) => (
                                        <tr 
                                            key={deal.id} 
                                            onClick={() => setSelectedDeal(deal)}
                                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
                                        >
                                            <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer text-slate-300" />
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Calendar size={12} className="text-slate-400" />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[13px] font-bold text-[#008cff] hover:underline whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] block">
                                                    <HighlightText text={deal.title} highlight={searchQuery} />
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${columns.find(c => c.title === deal.stage)?.color || 'bg-slate-300'}`}></div>
                                                    <span className="text-[12px] text-slate-600 whitespace-nowrap">{deal.stage}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button className="text-slate-300 hover:text-blue-500 transition-colors flex items-center gap-1" onClick={e => {
                                                    e.stopPropagation();
                                                    setSelectedActivityCol('a2');
                                                    setActivityForm({
                                                        title: '',
                                                        preparedBy: user?.fullName || '',
                                                        relatedPersons: '',
                                                        reason: '',
                                                        description: '',
                                                        dueDate: '',
                                                        id: '',
                                                        category: 'activity',
                                                        status: 'pending',
                                                        dealId: ''
                                                    });
                                                    setIsEditingTask(false);
                                                    setIsActivityModalOpen(true);
                                                }}>
                                                    <Plus size={14} />
                                                    <span className="text-[11px] font-bold">Etkinlik</span>
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[13px] text-blue-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] block">
                                                    {deal.customer ? (
                                                        <HighlightText text={deal.customer} highlight={searchQuery} />
                                                    ) : (
                                                        '-'
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[13px] text-slate-900 font-bold whitespace-nowrap">
                                                    {deal.amount || '0'} {deal.currency || '₺'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center text-white text-[10px]">
                                                    <User size={14} />
                                                </div>
                                            </td>
                                            <td className="p-4 text-[12px] text-slate-500 whitespace-nowrap">
                                                {deal.endDate || '-'}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Phone size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer" />
                                                    <Mail size={14} className="text-slate-300 hover:text-blue-500 cursor-pointer" />
                                                    <Trash2 
                                                        size={14} 
                                                        className="text-slate-300 hover:text-red-500 cursor-pointer ml-1" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDeal(deal.id);
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Bottom Scrollbar Element */}
                    <div className="h-6 bg-white w-full border-t border-slate-200 flex items-center justify-between px-2">
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-r-[7px] border-r-slate-400 border-b-[5px] border-b-transparent cursor-pointer hover:border-r-slate-600 transition-colors"></div>
                        <div className="flex-1 mx-3 h-[10px] bg-slate-300 rounded-full cursor-pointer hover:bg-slate-400 transition-colors shadow-inner"></div>
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[7px] border-l-slate-400 border-b-[5px] border-b-transparent cursor-pointer hover:border-l-slate-600 transition-colors"></div>
                    </div>
                </div>
            ) : activeTab === 'Etkinlikler' ? (
                <div className="flex-1 overflow-x-auto flex items-start pb-4 mt-2">
                    {activityColumns.map((col, index) => {
                        const colTasks = getCategorizedTasks(col.id);
                        return (
                            <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col border-r border-white/10 last:border-r-0 h-full">
                                {/* Column Header */}
                                <div
                                    className={`py-2 ${col.color} ${col.id === 'a5' ? 'text-slate-800' : 'text-slate-900'} mb-5 flex items-center justify-between ${index === 0 ? 'pl-4 pr-5' : 'pl-8 pr-5'} z-10 relative shadow-sm`}
                                    style={{
                                        clipPath: index === 0
                                            ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
                                            : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
                                        marginLeft: index === 0 ? '0' : '-16px',
                                        width: index === 0 ? '100%' : 'calc(100% + 16px)'
                                    }}
                                >
                                    <span className="text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis mr-2">{col.title} ({colTasks.length})</span>
                                    <button 
                                        onClick={() => setQuickAddTaskCol(col.id)}
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-slate-800 bg-white/30 hover:bg-white/50 transition-colors shrink-0"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                {/* Quick Add Task Form */}
                                {quickAddTaskCol === col.id && (
                                    <div className="bg-white rounded-lg shadow-xl mx-3 mb-4 p-4 space-y-3 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Etkinlik Başlığı</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Ne yapılması gerekiyor?"
                                                className="w-full border border-slate-200 rounded px-3 py-2 text-[12px] text-slate-900 outline-none focus:border-blue-400"
                                                value={quickAddActivity.title}
                                                onChange={e => setQuickAddActivity({ ...quickAddActivity, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Teslim Tarihi</label>
                                            <input
                                                type="date"
                                                className="w-full border border-slate-200 rounded px-3 py-2 text-[12px] text-slate-900 outline-none focus:border-blue-400"
                                                value={quickAddActivity.dueDate}
                                                onChange={e => setQuickAddActivity({ ...quickAddActivity, dueDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => handleQuickAddActivity(col.id)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-[11px] font-bold transition-colors"
                                            >
                                                EKLE
                                            </button>
                                            <button
                                                onClick={() => setQuickAddTaskCol(null)}
                                                className="text-slate-400 hover:text-slate-600 text-[11px] font-bold px-2 py-1.5"
                                            >
                                                İPTAL
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Task Cards */}
                                <div className="flex-1 px-3 flex flex-col gap-2 relative z-10 overflow-y-auto">
                                    {colTasks.map((task: any) => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => {
                                                console.log('Opening activity modal for task:', task);
                                                setActivityForm({ 
                                                    ...task,
                                                    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                                                    category: task.category || 'activity',
                                                    status: task.status || 'pending',
                                                    dealId: task.dealId || ''
                                                });
                                                setIsEditingTask(true);
                                                setIsActivityModalOpen(true);
                                            }}
                                            className="bg-white rounded border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer relative"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-[13px] font-semibold text-slate-800 line-clamp-2">{task.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
                                                                taskService.delete(task.id).then(() => {
                                                                    taskService.getAll().then(setTasks);
                                                                });
                                                            }
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-red-500 transition-all opacity-70 hover:opacity-100"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <div 
                                                        className={`w-2.5 h-2.5 rounded-full cursor-pointer ${task.status === "completed" ? "bg-green-500" : "bg-amber-400 opacity-90"} shadow-sm hover:scale-125 transition-transform`}
                                                        title={task.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                                                    ></div>
                                                </div>
                                            </div>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                    <Calendar size={12} className="opacity-70" />
                                                    <span>{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {colTasks.length === 0 && !quickAddTaskCol && (
                                        <div 
                                            onClick={() => {
                                                setSelectedActivityCol(col.id);
                                                setActivityForm({
                                                    title: '',
                                                    preparedBy: user?.fullName || '',
                                                    relatedPersons: '',
                                                    reason: '',
                                                    description: '',
                                                    dueDate: '',
                                                    id: '',
                                                    category: 'activity',
                                                    status: 'pending',
                                                    dealId: ''
                                                });
                                                setIsEditingTask(false);
                                                setIsActivityModalOpen(true);
                                            }}
                                            className="h-20 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-white/20 text-[12px] cursor-pointer hover:border-white/10 hover:text-white/30 transition-all"
                                        >
                                            Etkinlik yok
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : activeTab === 'Takvim' ? (
                <div className="flex-1 bg-white rounded-t-xl shadow-lg mt-4 flex flex-col overflow-hidden border-x border-slate-200">
                    <div className="p-5 flex items-center justify-between border-b border-slate-100">
                        <div className="text-xl text-slate-400 font-light tracking-wide">
                            {currentDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-6 text-[13px] text-slate-400">
                            <button className="flex items-center hover:text-slate-800 transition-colors">Ay (Tamamlama) <ChevronDown size={14} className="ml-1" /></button>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="hover:text-slate-800 transition-colors">&lt;</button>
                                <button onClick={() => setCurrentDate(new Date())} className="hover:text-slate-800 transition-colors">Bugün</button>
                                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="hover:text-slate-800 transition-colors">&gt;</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left table-fixed min-w-[700px] border-collapse h-full min-h-[500px]">
                            <thead>
                                <tr>
                                    {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => (
                                        <th key={day} className="py-2.5 text-center text-[13px] font-normal text-slate-400 border-b border-r border-slate-100 last:border-r-0">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const year = currentDate.getFullYear();
                                    const month = currentDate.getMonth();
                                    const firstDayOfMonth = new Date(year, month, 1).getDay();
                                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                                    
                                    // Adjust for Monday start (0=Sun, 1=Mon, ..., 6=Sat)
                                    // We want Pt (Mon) = 0, Sa (Tue) = 1, ..., Pz (Sun) = 6
                                    let startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                                    
                                    const weeks = [];
                                    let days = [];
                                    
                                    // Empty cells for previous month
                                    const prevMonthDays = new Date(year, month, 0).getDate();
                                    for (let i = startingDay - 1; i >= 0; i--) {
                                        days.push({ day: prevMonthDays - i, currentMonth: false });
                                    }
                                    
                                    // Current month days
                                    for (let i = 1; i <= daysInMonth; i++) {
                                        days.push({ day: i, currentMonth: true });
                                    }
                                    
                                    // Empty cells for next month
                                    const totalCells = Math.ceil(days.length / 7) * 7;
                                    const remainingCells = totalCells - days.length;
                                    for (let i = 1; i <= remainingCells; i++) {
                                        days.push({ day: i, currentMonth: false });
                                    }
                                    
                                    for (let i = 0; i < days.length; i += 7) {
                                        weeks.push(days.slice(i, i + 7));
                                    }
                                    
                                    return weeks.map((week, weekIdx) => (
                                        <tr key={weekIdx} className="h-24">
                                            {week.map((d, dayIdx) => {
                                                const dateStr = d.currentMonth ? `${year}-${String(month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}` : '';
                                                const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === dateStr);
                                                const isToday = d.currentMonth && d.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                                                
                                                return (
                                                    <td 
                                                        key={dayIdx} 
                                                        className={`border-b border-r border-slate-100 relative p-2 align-top cursor-pointer hover:bg-slate-50 transition-colors ${d.currentMonth ? 'bg-white' : 'bg-slate-50/50'} ${isToday ? 'bg-blue-50/50' : ''}`}
                                                        onClick={() => {
                                                            if (d.currentMonth) {
                                                                setActivityForm({ 
                                                                    title: '', 
                                                                    preparedBy: user?.fullName || '', 
                                                                    relatedPersons: '', 
                                                                    reason: '', 
                                                                    description: '', 
                                                                    dueDate: dateStr, 
                                                                    id: '',
                                                                    category: 'activity',
                                                                    status: 'pending',
                                                                    dealId: ''
                                                                });
                                                                setIsEditingTask(false);
                                                                setIsActivityModalOpen(true);
                                                            }
                                                        }}
                                                    >
                                                        <span className={`absolute top-2 right-2 text-[13px] ${d.currentMonth ? (isToday ? 'w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold' : 'text-slate-600') : 'text-slate-300'}`}>
                                                            {d.day}
                                                        </span>
                                                        <div className="mt-6 space-y-1">
                                                            {dayTasks.map(task => (
                                                                <div 
                                                                    key={task.id} 
                                                                    className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded truncate font-medium hover:bg-blue-200 transition-colors"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActivityForm({
                                                                            title: task.title || '',
                                                                            preparedBy: task.preparedBy || '',
                                                                            relatedPersons: task.relatedPersons || '',
                                                                            reason: task.reason || '',
                                                                            description: task.description || '',
                                                                            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                                                                            id: task.id,
                                                                            category: task.category || 'activity',
                                                                            status: task.status || 'pending',
                                                                            dealId: task.dealId || ''
                                                                        });
                                                                        setIsEditingTask(true);
                                                                        setIsActivityModalOpen(true);
                                                                    }}
                                                                >
                                                                    {task.title}
                                                                    {task.relatedPersons && <User size={8} className="inline ml-1 opacity-70" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'Gelen' || activeTab === 'Planlandı' ? (
                <div className="flex-1 overflow-x-auto flex items-start pb-4 mt-2">
                    {(activeTab === 'Gelen' ? gelenColumns : activityColumns).map((col, index) => {
                        const colTasks = getCategorizedTasks(col.id);
                        const displayTitle = activeTab === 'Gelen' ? col.title : col.title;
                        
                        return (
                            <div key={col.id} className="w-[300px] min-w-[300px] flex flex-col border-r border-white/10 last:border-r-0 h-full">
                                {/* Column Header */}
                                <div
                                    className={`py-2 ${col.color} text-slate-900 mb-5 flex items-center justify-between ${index === 0 ? 'pl-4 pr-5' : 'pl-8 pr-5'} z-10 relative shadow-sm`}
                                    style={{
                                        clipPath: index === 0
                                            ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
                                            : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
                                        marginLeft: index === 0 ? '0' : '-16px',
                                        width: index === 0 ? '100%' : 'calc(100% + 16px)'
                                    }}
                                >
                                    <span className="text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis mr-2">{displayTitle} ({colTasks.length})</span>
                                    <button 
                                        onClick={() => setQuickAddTaskCol(col.id)}
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-slate-800 bg-white/30 hover:bg-white/50 transition-colors shrink-0"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                {/* Quick Add Task Form */}
                                {quickAddTaskCol === col.id && (
                                    <div className="bg-white rounded-lg shadow-xl mx-3 mb-4 p-4 space-y-3 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Başlık</label>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Ne eklemek istersiniz?"
                                                className="w-full border border-slate-200 rounded px-3 py-2 text-[12px] text-slate-900 outline-none focus:border-blue-400"
                                                value={quickAddActivity.title}
                                                onChange={e => setQuickAddActivity({ ...quickAddActivity, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Teslim Tarihi</label>
                                            <input
                                                type="date"
                                                className="w-full border border-slate-200 rounded px-3 py-2 text-[12px] text-slate-900 outline-none focus:border-blue-400"
                                                value={quickAddActivity.dueDate}
                                                onChange={e => setQuickAddActivity({ ...quickAddActivity, dueDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={() => handleQuickAddActivity(col.id)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-[11px] font-bold transition-colors"
                                            >
                                                EKLE
                                            </button>
                                            <button
                                                onClick={() => setQuickAddTaskCol(null)}
                                                className="text-slate-400 hover:text-slate-600 text-[11px] font-bold px-2 py-1.5"
                                            >
                                                İPTAL
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Task Cards */}
                                <div className="flex-1 px-3 flex flex-col gap-2 relative z-10 overflow-y-auto">
                                    {colTasks.map((task: any) => (
                                        <div 
                                            key={task.id} 
                                            onClick={() => {
                                                setActivityForm({ 
                                                    ...task,
                                                    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                                                    category: task.category || (activeTab === 'Gelen' ? 'inbox' : (activeTab === 'Planlandı' ? 'planned' : 'activity')),
                                                    status: task.status || 'pending',
                                                    dealId: task.dealId || ''
                                                });
                                                setIsEditingTask(true);
                                                setIsActivityModalOpen(true);
                                            }}
                                            className="bg-white rounded border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-[13px] font-semibold text-slate-800 line-clamp-2">{task.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Bu ögeyi silmek istediğinize emin misiniz?')) {
                                                                taskService.delete(task.id).then(() => {
                                                                    taskService.getAll().then(setTasks);
                                                                });
                                                            }
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-red-500 transition-all opacity-70 hover:opacity-100"
                                                        title="Sil"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <div 
                                                        className={`w-2.5 h-2.5 rounded-full cursor-pointer ${task.status === "completed" ? "bg-green-500" : "bg-amber-400 opacity-90"} shadow-sm hover:scale-125 transition-transform`}
                                                        title={task.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                                                    ></div>
                                                </div>
                                            </div>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                                    <Calendar size={12} className="opacity-70" />
                                                    <span>{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {colTasks.length === 0 && !quickAddTaskCol && (
                                        <div 
                                            onClick={() => setQuickAddTaskCol(col.id)}
                                            className="h-20 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-white/20 text-[12px] cursor-pointer hover:border-white/10 hover:text-white/30 transition-all"
                                        >
                                            Öge yok
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-white/50 text-base mt-10 italic">
                    Bu görünüm henüz hazır değil.
                </div>
            )}

            {selectedDeal && (
                <DealDetailView
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    onSave={handleSaveDeal}
                />
            )}

            {isActivityModalOpen && (
                <div className="fixed inset-0 bg-[#0a141e]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-slate-800 font-bold flex items-center gap-2">
                                <Plus size={18} className="text-blue-500" />
                                {isEditingTask ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Oluştur'}
                            </h3>
                            <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5 ml-1">Etkinlik Başlığı</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Başlık giriniz..."
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={activityForm.title}
                                    onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5 ml-1">Hazırlayan Kişi</label>
                                    <input
                                        type="text"
                                        placeholder="İsim giriniz..."
                                        className={`w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${user?.fullName ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                                        value={activityForm.preparedBy}
                                        readOnly={!!user?.fullName}
                                        onChange={e => setActivityForm({ ...activityForm, preparedBy: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5 ml-1">Teslim Tarihi</label>
                                    <input
                                        type="date"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={activityForm.dueDate}
                                        onChange={e => setActivityForm({ ...activityForm, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5 ml-1">İlgili Kişiler</label>
                                <input
                                    type="text"
                                    placeholder="Virgül ile ayırarak giriniz..."
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={activityForm.relatedPersons}
                                    onChange={e => setActivityForm({ ...activityForm, relatedPersons: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5 ml-1">Nedeni</label>
                                <input
                                    type="text"
                                    placeholder="Neden bu etkinlik yapılıyor?"
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={activityForm.reason}
                                    onChange={e => setActivityForm({ ...activityForm, reason: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1.5 ml-1">Açıklama</label>
                                <textarea
                                    placeholder="Detaylı açıklama..."
                                    rows={3}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                    value={activityForm.description}
                                    onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsActivityModalOpen(false)}
                                    className="px-4 py-2 text-[13px] font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    İptal
                                </button>
                                {isEditingTask && (
                                    <button
                                        onClick={handleDeleteActivity}
                                        className="flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} /> Sil
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={isEditingTask ? handleUpdateActivityModal : handleSaveActivityModal}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-[13px] font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                            >
                                {isEditingTask ? 'Güncelle' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
