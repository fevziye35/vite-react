import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X, ChevronDown, ChevronLeft, ChevronRight,
    Settings, Globe, Plus, Edit3, User,
    Info, Lock, Search, LayoutGrid, Trash2, MessageSquare, List, MoreHorizontal,
    Smile, AtSign, ArrowRight, ArrowLeft,
    ThumbsUp, Gift, Trophy, DollarSign, Crown, Martini, Cake, Flag, Star, Heart, Beer, Flower2
} from 'lucide-react';

interface DealDetailViewProps {
    deal: any;
    onClose: () => void;
    onSave?: (dealData: any) => void;
}

const DealDetailView: React.FC<DealDetailViewProps> = ({ deal, onClose, onSave }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Genel');
    const [isEditingTitle, setIsEditingTitle] = useState(deal.isNew || false);
    const [chatInput, setChatInput] = useState('');
    const [mainTaskInput, setMainTaskInput] = useState('');
    const [savedTaskInput, setSavedTaskInput] = useState('');
    const [isTaskInputActive, setIsTaskInputActive] = useState(false);

    // Yorum State
    const [activeBarTab, setActiveBarTab] = useState('Etkinlik');
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>(['Herkes']);
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [sendTaskAsMessage, setSendTaskAsMessage] = useState(false);
    const [taskInput, setTaskInput] = useState('');
    const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
    const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);
    const [showTaskActionDropdown, setShowTaskActionDropdown] = useState(false);
    const [currentDueDateCalendar, setCurrentDueDateCalendar] = useState(new Date(2026, 2, 1));
    const teamMembers = [
        { id: 'everyone', name: 'Herkes', icon: <Globe size={14} className="text-blue-500" /> },
        { id: 'nobody', name: 'Hiç kimse', icon: <User size={14} className="text-slate-400" /> },
        { id: '1', name: 'Fevziye', icon: <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-[10px] text-white">F</div> },
        { id: '2', name: 'Ali', icon: <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">A</div> },
        { id: '3', name: 'Ayşe', icon: <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white">AY</div> },
        { id: '4', name: 'Mehmet Yılmaz', icon: <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white">M</div> },
        { id: '5', name: 'Canan Demir', icon: <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white">C</div> }
    ];
    const [commentInput, setCommentInput] = useState('');
    const [savedCommentInput, setSavedCommentInput] = useState('');
    const [isCommentActive, setIsCommentActive] = useState(false);

    // Mesaj State
    const [messageInput, setMessageInput] = useState('');

    // Rezervasyon State
    const [reservationSearch, setReservationSearch] = useState('');
    const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2026, 2, 1)); // March 2026
    const [selectedReservationDate, setSelectedReservationDate] = useState(new Date(2026, 2, 6)); // March 6, 2026
    const [reservations, setReservations] = useState<{ id: string; dateString: string; time: string; note: string }[]>([]);
    const [bookingInput, setBookingInput] = useState<{ time: string; note: string } | null>(null);

    // Helpers for Calendar
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Make Monday 0, Sunday 6
    };

    const handlePrevMonth = () => {
        setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
    };

    const generateCalendarGrid = () => {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const prevMonthDays = getDaysInMonth(year, month - 1);

        const grid = [];
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            grid.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }
        // Next month days to complete 6 weeks (42 days)
        const remaining = 42 - grid.length;
        for (let i = 1; i <= remaining; i++) {
            grid.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
        }
        return grid;
    };

    const calendarGrid = generateCalendarGrid();
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    // Check if a date is selected
    const isDateSelected = (date: Date) => {
        return date.getDate() === selectedReservationDate.getDate() &&
            date.getMonth() === selectedReservationDate.getMonth() &&
            date.getFullYear() === selectedReservationDate.getFullYear();
    };

    const isToday = (date: Date) => {
        // Mock current date as March 6, 2026 11:40
        return date.getDate() === 6 && date.getMonth() === 2 && date.getFullYear() === 2026;
    };

    const [timelineEvents, setTimelineEvents] = useState<any[]>([
        { id: 6, title: 'Aşama değiştirildi', time: '14:27', before: 'Uzberinde çalışılıyor', after: 'Nihai fatura', icon: <Edit3 size={14} /> },
        { id: 5, title: 'Aşama değiştirildi', time: '14:23', before: 'Fatura', after: 'Üzerinde çalışılıyor', icon: <Edit3 size={14} /> },
        { id: 4, title: 'Aşama değiştirildi', time: '14:23', before: 'Sayfa oluştur', after: 'Fatura', icon: <Edit3 size={14} /> },
        { id: 3, title: 'Aşama değiştirildi', time: '14:23', before: 'Ad', after: 'Sayfa oluştur', icon: <Edit3 size={14} /> },
        { id: 2, title: 'Aşama değiştirildi', time: '14:23', before: 'Geliştiriliyor', after: 'Ad', icon: <Edit3 size={14} /> },
        { id: 1, title: 'Anlaşma oluşturuldu', time: '13:27', content: '22', icon: <Info size={14} /> },
    ]);

    const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
    const [editData, setEditData] = useState({ ...deal });
    const [activeCreateMenu, setActiveCreateMenu] = useState<string | null>(null);
    const [customFields, setCustomFields] = useState<Record<string, any[]>>({});

    const [showStageDropdown, setShowStageDropdown] = useState(false);

    const [showCloseModal, setShowCloseModal] = useState(false);
    const [deletedSections, setDeletedSections] = useState<string[]>([]);
    const [showFieldSelectorModal, setShowFieldSelectorModal] = useState(false);
    const [fieldSelectorSection, setFieldSelectorSection] = useState<string>('');
    const [fieldSearch, setFieldSearch] = useState('');
    const [selectedFieldKeys, setSelectedFieldKeys] = useState<string[]>([]);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [activeProfileTab, setActiveProfileTab] = useState('Genel');
    const [profileData, setProfileData] = useState({
        ad: '',
        soyad: '',
        email: 'fevziye.mamak35@gmail.com',
        departman: 'Bitrix24',
        ikinciAd: '',
        bildirimDili: 'Türkçe'
    });
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [selectedBadges, setSelectedBadges] = useState<number[]>([]);
    const [showBadgeNotification, setShowBadgeNotification] = useState(false);
    const [badgeNotificationText, setBadgeNotificationText] = useState('Teşekkür mesajı iletildi!');
    const [isEditingKisiselDetaylar, setIsEditingKisiselDetaylar] = useState(false);
    const [kisiselDetaylarText, setKisiselDetaylarText] = useState('Bu alan İK ile ilgili bilgileri ve diğer belgeleri içerir. Yalnızca yeterli izinlere sahip kullanıcılar tarafından görülebilir.');
    const [isEditingContactInfo, setIsEditingContactInfo] = useState(false);
    const [activeGorevlerSubTab, setActiveGorevlerSubTab] = useState('Takvim');
    const [showAddTaskTooltip, setShowAddTaskTooltip] = useState<number | null>(null);
    const [calendarTasks, setCalendarTasks] = useState<Record<number, { text: string; assignee: string }[]>>({});
    const [dayInput, setDayInput] = useState<{ idx: number; text: string } | null>(null);
    // Görevlerim toolbar state
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [taskStatusFilter, setTaskStatusFilter] = useState<string>('Devam eden');
    const [taskSearch, setTaskSearch] = useState('');


    const availableFieldGroups = [
        {
            groupName: 'Daha fazla',
            fields: [
                'Anlaşma türü', 'Başlama tarihi', 'Gözlemciler',
                'Kaynak', 'Herkese açık', 'Yorum',
                'Kaynak bilgileri', 'Sorumlu', 'UTM parametreleri',
            ],
        },
        {
            groupName: 'Gizli alanlar',
            fields: [
                'ID', 'Olasılık', 'Satış Zekası',
                'Oluşturma Tarihi', 'Aşamayı değiştiren', 'Son iletişim',
                'Değiştirme Tarihi', 'Aşama değişimi tarihi',
            ],
        },
    ];

    const openFieldSelectorModal = (section: string) => {
        setFieldSelectorSection(section);
        setFieldSearch('');
        setSelectedFieldKeys([]);
        setShowFieldSelectorModal(true);
    };

    const toggleFieldKey = (key: string) => {
        setSelectedFieldKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const allFieldKeys = availableFieldGroups.flatMap(g => g.fields);
    const allSelected = allFieldKeys.every(k => selectedFieldKeys.includes(k));

    const handleSelectFields = () => {
        selectedFieldKeys.forEach(key => {
            const newField = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'Metin',
                label: key,
                value: '',
            };
            setCustomFields(prev => ({
                ...prev,
                [fieldSelectorSection]: [...(prev[fieldSelectorSection] || []), newField],
            }));
        });
        setShowFieldSelectorModal(false);
        setEditingSections(prev => ({ ...prev, [fieldSelectorSection]: true }));
    };

    const toggleEdit = (section: string) => {
        setEditingSections((prev: Record<string, boolean>) => ({ ...prev, [section]: !prev[section] }));
    };

    const deleteSection = (section: string) => {
        setDeletedSections(prev => [...prev, section]);
    };

    const handleStageUpdate = (label: string) => {
        if (label === 'Anlaşmayı kapat') {
            setShowCloseModal(true);
            return;
        }
        setEditData((prev: any) => ({ ...prev, stage: label }));
        setShowStageDropdown(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData((prev: any) => ({ ...prev, [name]: value }));
    };

    const addField = (section: string, type: string) => {
        const newField = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            label: 'Yeni Alan',
            value: ''
        };
        setCustomFields(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), newField]
        }));
        setActiveCreateMenu(null);
        setEditingSections(prev => ({ ...prev, [section]: true }));
    };

    const fieldTypes = [
        { name: 'Metin', desc: 'Metin alanları, herhangi bir bilgi içerebilir: metin, sayı, özel karakter vb.' },
        { name: 'Liste', desc: 'Bir kullanıcının bir veya daha fazla liste öğesi seçmesine izin verir. Alan değerleri, analitik raporlar için kullanılabilir.' },
        { name: 'Tarih/Saat', desc: 'Bir kullanıcının dahili takvimi kullanarak tarihi ve saati belirtmesini sağlar.' },
        { name: 'Tarih', desc: 'Dahili takvim kullanarak bir tarih seçin.' },
        { name: 'Kaynak Ayır', desc: 'İstenilen süre için kaynak ayırma imkanı sağlar.' },
        { name: 'Adres', desc: 'Mağaza adresi bilgileri.' },
        { name: 'Bağlantı', desc: 'Web bağlantılarını belirtir.' },
        { name: 'Dosya', desc: 'Dosya yükleme alanı.' },
    ];

    const FieldSelector = ({ section }: { section: string }) => (
        <div className="absolute bottom-full left-0 mb-2 w-[400px] bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-[200]">
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {fieldTypes.map((type) => (
                    <div
                        key={type.name}
                        onClick={() => addField(section, type.name)}
                        className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors"
                    >
                        <div className="text-[14px] font-bold text-slate-800 mb-1">{type.name}</div>
                        <div className="text-[12px] text-slate-500 leading-tight">{type.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const stages = [
        { id: 'ad', label: 'Ad', color: 'bg-indigo-400' },
        { id: 'gelistiriliyor', label: 'Geliştiriliyor', color: 'bg-blue-400' },
        { id: 'ad2', label: 'Ad', color: 'bg-blue-400' },
        { id: 'sayfa-olustur', label: 'Sayfa oluşturma', color: 'bg-cyan-400' },
        { id: 'fatura', label: 'Fatura', color: 'bg-teal-300' },
        { id: 'uzerinde-calisiliyor', label: 'Üzerinde çalışılıyor', color: 'bg-emerald-300' },
        { id: 'nihai-fatura', label: 'Nihai fatura', color: 'bg-amber-400' },
        { id: 'anlasma-kazanildi', label: 'Anlaşma kazanıldı', color: 'bg-green-500' },
        { id: 'anlasma-kaybedildi', label: 'Anlaşma kaybedildi', color: 'bg-red-400' },
        { id: 'anlasmayi-kapat', label: 'Anlaşmayı kapat', color: 'bg-slate-400' },
    ];

    const currentStageIndex = stages.findIndex(s => s.label === (editData.stage || deal.stage));

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 overflow-hidden">
            <div className="w-full h-full sm:h-[95vh] sm:w-[95vw] bg-[#f0f3f5] sm:rounded-tl-xl sm:rounded-tr-xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                {isEditingTitle ? (
                                    <input
                                        type="text"
                                        autoFocus
                                        className="border-b-2 border-slate-300 outline-none bg-transparent px-1 min-w-[200px]"
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                        onBlur={() => setIsEditingTitle(false)}
                                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                                    />
                                ) : (
                                    <>
                                        {editData.title}
                                        <span onClick={() => setIsEditingTitle(true)} className="opacity-30 cursor-pointer hover:opacity-100 transition-opacity"><Edit3 size={16} /></span>
                                    </>
                                )}
                            </h1>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[11px] text-slate-500 font-medium border border-slate-200">
                                <Globe size={12} /> Varsayılan satış kanalı <ChevronDown size={12} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-600"><Settings size={18} /></button>
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded text-[13px] text-slate-600 hover:bg-slate-50 font-medium">
                                Belge <ChevronDown size={14} />
                            </button>
                            <button onClick={onClose} className="ml-2 p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="flex h-11">
                        {stages.map((stage, idx) => {
                            const isActive = idx <= currentStageIndex;
                            const isCurrent = idx === currentStageIndex;
                            return (
                                <div
                                    key={stage.id}
                                    onClick={() => handleStageUpdate(stage.label)}
                                    className={`relative flex-1 flex items-center justify-center text-[12px] font-bold px-4 cursor-pointer transition-all
                                        ${isActive ? stage.color + ' text-white' : 'bg-slate-100 text-slate-400'}
                                        ${isCurrent ? '!text-indigo-800 bg-white/40' : ''}
                                        ${idx !== stages.length - 1 ? 'mr-1' : ''}
group
                                    `}
                                    style={{
                                        clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)',
                                        marginLeft: idx === 0 ? '0' : '-1%'
                                    }}
                                >
                                    {stage.label}
                                    {isCurrent && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white px-6 border-b border-slate-200 flex items-center justify-between overflow-x-auto no-scrollbar">
                    <div className="flex gap-6">
                        {['Genel', 'Ürünler', 'Tahminler', 'Faturalar', 'İlgili öğeler', 'Geçmiş', 'Daha fazla'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 text-[13px] font-bold border-b-2 transition-all block whitespace-nowrap
                                    ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-700'}
`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 ml-4">
                        <Lock size={14} /> <ChevronDown size={14} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex gap-6">
                    {/* Left Column */}
                    <div className="w-[420px] flex flex-col gap-4 shrink-0 font-medium">
                        {/* Section: Anlaşma Hakkında */}
                        {!deletedSections.includes('about') && (
                            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
                                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Anlaşma Hakkında</span>
                                    <div className="flex items-center gap-3">
                                        <span onClick={() => toggleEdit('about')} className="text-blue-500 normal-case cursor-pointer hover:underline">
                                            {editingSections['about'] ? 'kaydet' : 'düzenle'}
                                        </span>
                                        <Trash2 onClick={() => deleteSection('about')} size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] text-slate-400 mb-1">Aşama</label>
                                        <div className="relative">
                                            <div
                                                onClick={() => setShowStageDropdown(!showStageDropdown)}
                                                className="text-[14px] text-white flex items-center justify-between cursor-pointer hover:bg-indigo-700 p-2 border border-indigo-500 rounded transition-colors bg-indigo-600 min-h-[34px] font-bold shadow-sm"
                                            >
                                                {editData.stage || 'Sayfa oluşturma'}
                                                <ChevronDown size={14} className="text-white/70" />
                                            </div>

                                            {showStageDropdown && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-[210] max-h-[300px] overflow-y-auto no-scrollbar">
                                                    {stages.map((stage) => (
                                                        <div
                                                            key={stage.id}
                                                            onClick={() => handleStageUpdate(stage.label)}
                                                            className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-slate-50 last:border-none"
                                                        >
                                                            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                                                            <span className="text-[13px] text-slate-700 font-bold">{stage.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] text-slate-400 mb-1">Tutar ve para birimi</label>
                                        {editingSections['about'] ? (
                                            <div className="flex items-center gap-2">
                                                <input name="amount" value={editData.amount || ''} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-2 py-1 text-[14px] outline-blue-500" />
                                                <span className="text-slate-400 text-[18px]">â‚º</span>
                                            </div>
                                        ) : (
                                            <div className="text-[32px] font-light text-slate-800 leading-none">
                                                {editData.amount || '1.000'} <span className="text-[24px]">â‚º</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 space-y-3">
                                        <div className="text-[12px] text-slate-400 font-bold uppercase tracking-tight">Ödeme ve teslimat</div>
                                        <p className="text-[12px] text-slate-500 italic">Bu kutuda ödemelerle ve teslimatlarla ilgili bilgiler gösterilecektir.</p>
                                        <button className="text-blue-500 text-[12px] hover:underline">Ekle</button>
                                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">Anlaşma toplamı <Info size={14} className="opacity-30" /></div>
                                            <div className="text-[13px] font-bold text-slate-500">{deal.amount || '1.000'}â‚º</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] text-slate-400 mb-1">Bitiş tarihi</label>
                                        <div className="text-[14px] text-slate-800 font-bold">12 Mart 2026</div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 space-y-4">
                                        <div className="text-[12px] text-slate-400 font-bold uppercase mb-4">Müşteri</div>
                                        <div>
                                            <label className="block text-[12px] text-slate-400 mb-1">Telefon</label>
                                            <div className="flex items-center gap-2 border border-slate-200 rounded px-2 py-1.5 bg-white">
                                                <div className="flex items-center gap-1 border-r border-slate-100 pr-2">
                                                    <span className="w-4 h-3 bg-red-600 border border-slate-200" />
                                                    <span className="text-[13px] text-slate-600">+90</span>
                                                </div>
                                                <input type="text" className="flex-1 border-none outline-none text-[13px] text-slate-800" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] text-slate-400 mb-1">E-Posta</label>
                                            <input type="text" className="w-full border border-slate-200 rounded px-3 py-1.5 text-[13px] text-slate-800 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[12px] text-slate-400 mb-1">Adres</label>
                                            <div className="relative">
                                                <textarea className="w-full border border-slate-200 rounded px-3 py-1.5 text-[13px] text-slate-800 outline-none min-h-[60px] resize-none"></textarea>
                                                <Search size={14} className="absolute bottom-2 right-2 text-slate-300" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Custom Fields: Anlaşma Hakkında */}
                                    {customFields['about']?.map((field) => (
                                        <div key={field.id} className="space-y-1">
                                            {editingSections['about'] ? (
                                                <input value={field.label} onChange={(e) => {
                                                    const newFields = customFields['about'].map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                                                    setCustomFields(prev => ({ ...prev, about: newFields }));
                                                }} className="block text-[12px] text-blue-500 mb-1 bg-transparent border-b border-blue-100 outline-none font-bold w-full" />
                                            ) : (
                                                <label className="block text-[12px] text-slate-400 mb-1">{field.label}</label>
                                            )}
                                            {editingSections['about'] ? (
                                                <input value={field.value} onChange={(e) => {
                                                    const newFields = customFields['about'].map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                                                    setCustomFields(prev => ({ ...prev, about: newFields }));
                                                }} className="w-full border border-slate-200 rounded px-2 py-1 text-[13px] outline-blue-500" />
                                            ) : (
                                                <div className="text-[14px] text-slate-800">{field.value || 'â€”'}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-2 flex items-center justify-between text-blue-500 text-[12px] font-bold border-t border-slate-100 relative">
                                    <div className="flex items-center gap-4">
                                        <span onClick={() => openFieldSelectorModal('about')} className="cursor-pointer hover:underline">Alanı seç</span>
                                        <span onClick={() => setActiveCreateMenu(activeCreateMenu === 'about' ? null : 'about')} className="cursor-pointer hover:underline">Alan oluştur</span>
                                    </div>
                                    {activeCreateMenu === 'about' && <FieldSelector section="about" />}
                                    <div onClick={() => deleteSection('about')} className="flex items-center gap-1 text-red-500 text-[11px] uppercase tracking-wider font-bold cursor-pointer hover:underline group">
                                        <Trash2 size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <span>Bölümü sil</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: DAHA FAZLA */}
                        {!deletedSections.includes('more') && (
                            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
                                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>DAHA FAZLA</span>
                                    <div className="flex items-center gap-3">
                                        <span onClick={() => toggleEdit('more')} className="text-slate-500 italic lowercase font-normal opacity-50 cursor-pointer hover:text-blue-500 hover:opacity-100">
                                            {editingSections['more'] ? 'kaydet' : 'düzenle'}
                                        </span>
                                        <Trash2 onClick={() => deleteSection('more')} size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] text-slate-400 mb-1">Anlaşma türü</label>
                                        {editingSections['more'] ? (
                                            <input name="type" value={editData.type || 'Satış'} onChange={handleInputChange} className="w-full border border-slate-200 rounded px-2 py-1 text-[13px] outline-blue-500" />
                                        ) : (
                                            <div className="text-[14px] text-slate-800">{editData.type || 'Satış'}</div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[12px] text-slate-400 mb-1">Başlama tarihi</label>
                                        <div className="text-[14px] text-slate-800">5 Mart 2026</div>
                                    </div>
                                    {/* Custom Fields: DAHA FAZLA */}
                                    {customFields['more']?.map((field) => (
                                        <div key={field.id} className="space-y-1">
                                            {editingSections['more'] ? (
                                                <input value={field.label} onChange={(e) => {
                                                    const newFields = customFields['more'].map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                                                    setCustomFields(prev => ({ ...prev, more: newFields }));
                                                }} className="block text-[12px] text-blue-500 mb-1 bg-transparent border-b border-blue-100 outline-none font-bold w-full" />
                                            ) : (
                                                <label className="block text-[12px] text-slate-400 mb-1">{field.label}</label>
                                            )}
                                            {editingSections['more'] ? (
                                                <input value={field.value} onChange={(e) => {
                                                    const newFields = customFields['more'].map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                                                    setCustomFields(prev => ({ ...prev, more: newFields }));
                                                }} className="w-full border border-slate-200 rounded px-2 py-1 text-[13px] outline-blue-500" />
                                            ) : (
                                                <div className="text-[14px] text-slate-800">{field.value || 'â€”'}</div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="pt-2 flex items-center justify-between text-blue-500 text-[12px] font-bold border-t border-slate-100 relative">
                                        <div className="flex items-center gap-4">
                                            <span onClick={() => openFieldSelectorModal('more')} className="cursor-pointer hover:underline">Alanı seç</span>
                                            <span onClick={() => setActiveCreateMenu(activeCreateMenu === 'more' ? null : 'more')} className="cursor-pointer hover:underline">Alan oluştur</span>
                                        </div>
                                        {activeCreateMenu === 'more' && <FieldSelector section="more" />}
                                        <div onClick={() => deleteSection('more')} className="flex items-center gap-1 text-red-500 text-[11px] uppercase tracking-wider font-bold cursor-pointer hover:underline group">
                                            <Trash2 size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <span>Bölümü sil</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: SORUMLU */}
                        {!deletedSections.includes('responsible') && (
                            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-4 shadow-sm opacity-90 relative group">
                                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>Sorumlu</span>
                                    <Trash2 onClick={() => deleteSection('responsible')} size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                                </div>
                                <div className="flex items-center gap-3 border border-slate-200 rounded-full p-1 pr-6 w-fit bg-slate-50/50">
                                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white"><User size={16} /></div>
                                    <span className="text-[14px] text-blue-500 font-medium hover:underline cursor-pointer">fevziye.mamak35@gmail.com</span>
                                </div>
                                <div className="text-[11px] text-slate-400 italic">Herkese açık: Evet</div>
                                {/* Custom Fields: SORUMLU */}
                                {customFields['responsible']?.map((field) => (
                                    <div key={field.id} className="mt-2 space-y-1">
                                        {editingSections['responsible'] ? (
                                            <input value={field.label} onChange={(e) => {
                                                const newFields = customFields['responsible'].map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                                                setCustomFields(prev => ({ ...prev, responsible: newFields }));
                                            }} className="block text-[12px] text-blue-500 mb-1 bg-transparent border-b border-blue-100 outline-none font-bold w-full" />
                                        ) : (
                                            <label className="block text-[12px] text-slate-400 mb-1">{field.label}</label>
                                        )}
                                        {editingSections['responsible'] ? (
                                            <input value={field.value} onChange={(e) => {
                                                const newFields = customFields['responsible'].map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                                                setCustomFields(prev => ({ ...prev, responsible: newFields }));
                                            }} className="w-full border border-slate-200 rounded px-2 py-1 text-[13px] outline-blue-500" />
                                        ) : (
                                            <div className="text-[14px] text-slate-800">{field.value || 'â€”'}</div>
                                        )}
                                    </div>
                                ))}
                                <div className="pt-2 flex items-center justify-between text-blue-500 text-[12px] font-bold border-t border-slate-100 relative">
                                    <div className="flex items-center gap-4">
                                        <span onClick={() => openFieldSelectorModal('responsible')} className="cursor-pointer hover:underline">Alanı seç</span>
                                        <span onClick={() => setActiveCreateMenu(activeCreateMenu === 'responsible' ? null : 'responsible')} className="cursor-pointer hover:underline">Alan oluştur</span>
                                    </div>
                                    {activeCreateMenu === 'responsible' && <FieldSelector section="responsible" />}
                                    <div onClick={() => deleteSection('responsible')} className="flex items-center gap-1 text-red-500 text-[11px] uppercase tracking-wider font-bold cursor-pointer hover:underline group/del">
                                        <Trash2 size={12} className="opacity-50 group-hover/del:opacity-100 transition-opacity" />
                                        <span>Bölümü sil</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: UTM Parametreleri */}
                        {!deletedSections.includes('utm') && (
                            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
                                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>UTM parametreleri</span>
                                    <Trash2 onClick={() => deleteSection('utm')} size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                                </div>
                                <div className="text-[14px] text-slate-500">Yok</div>
                                {customFields['utm']?.map((field) => (
                                    <div key={field.id} className="mt-2 space-y-1">
                                        {editingSections['utm'] ? (
                                            <input value={field.label} onChange={(e) => {
                                                const newFields = customFields['utm'].map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                                                setCustomFields(prev => ({ ...prev, utm: newFields }));
                                            }} className="block text-[12px] text-blue-500 mb-1 bg-transparent border-b border-blue-100 outline-none font-bold w-full" />
                                        ) : (
                                            <label className="block text-[12px] text-slate-400 mb-1">{field.label}</label>
                                        )}
                                        {editingSections['utm'] ? (
                                            <input value={field.value} onChange={(e) => {
                                                const newFields = customFields['utm'].map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                                                setCustomFields(prev => ({ ...prev, utm: newFields }));
                                            }} className="w-full border border-slate-200 rounded px-2 py-1 text-[13px] outline-blue-500" />
                                        ) : (
                                            <div className="text-[14px] text-slate-800">{field.value || 'â€”'}</div>
                                        )}
                                    </div>
                                ))}
                                <div className="pt-2 flex items-center justify-between text-blue-500 text-[12px] font-bold border-t border-slate-100 relative">
                                    <div className="flex items-center gap-4">
                                        <span onClick={() => openFieldSelectorModal('utm')} className="cursor-pointer hover:underline">Alanı seç</span>
                                        <span onClick={() => setActiveCreateMenu(activeCreateMenu === 'utm' ? null : 'utm')} className="cursor-pointer hover:underline">Alan oluştur</span>
                                    </div>
                                    {activeCreateMenu === 'utm' && <FieldSelector section="utm" />}
                                    <div onClick={() => deleteSection('utm')} className="flex items-center gap-1 text-red-500 text-[11px] uppercase tracking-wider font-bold cursor-pointer hover:underline">
                                        <Trash2 size={12} className="opacity-50" />
                                        <span>Bölümü sil</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: ÜRÜNLER */}
                        {!deletedSections.includes('products') && (
                            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
                                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>ÜRÜNLER</span>
                                    <div className="flex items-center gap-3">
                                        <span onClick={() => toggleEdit('products')} className="text-slate-500 italic lowercase font-normal opacity-50 cursor-pointer hover:text-blue-500 hover:opacity-100">
                                            {editingSections['products'] ? 'kaydet' : 'düzenle'}
                                        </span>
                                        <Trash2 onClick={() => deleteSection('products')} size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                                {editingSections['products'] ? (
                                    <div className="space-y-4">
                                        <input placeholder="Ürün adı" className="w-full border border-slate-200 rounded px-3 py-2 text-[14px] outline-blue-500" />
                                        <button className="text-blue-500 text-[13px] font-bold">+ Yeni ürün ekle</button>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-blue-200 rounded bg-blue-50/30 p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50">
                                        <Plus size={18} className="text-blue-500" />
                                        <span className="text-blue-500 font-bold text-[14px]">ekle</span>
                                    </div>
                                )}
                                {customFields['products']?.map((field) => (
                                    <div key={field.id} className="mt-2 space-y-1">
                                        {editingSections['products'] ? (
                                            <input value={field.label} onChange={(e) => {
                                                const newFields = customFields['products'].map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                                                setCustomFields(prev => ({ ...prev, products: newFields }));
                                            }} className="block text-[12px] text-blue-500 mb-1 bg-transparent border-b border-blue-100 outline-none font-bold w-full" />
                                        ) : (
                                            <label className="block text-[12px] text-slate-400 mb-1">{field.label}</label>
                                        )}
                                        {editingSections['products'] ? (
                                            <input value={field.value} onChange={(e) => {
                                                const newFields = customFields['products'].map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                                                setCustomFields(prev => ({ ...prev, products: newFields }));
                                            }} className="w-full border border-slate-200 rounded px-2 py-1 text-[13px] outline-blue-500" />
                                        ) : (
                                            <div className="text-[14px] text-slate-800">{field.value || 'â€”'}</div>
                                        )}
                                    </div>
                                ))}
                                <div className="pt-2 flex items-center justify-between text-blue-500 text-[12px] font-bold border-t border-slate-100 relative">
                                    <div className="flex items-center gap-4">
                                        <span onClick={() => openFieldSelectorModal('products')} className="cursor-pointer hover:underline">Alanı seç</span>
                                        <span onClick={() => setActiveCreateMenu(activeCreateMenu === 'products' ? null : 'products')} className="cursor-pointer hover:underline">Alan oluştur</span>
                                    </div>
                                    {activeCreateMenu === 'products' && <FieldSelector section="products" />}
                                    <div onClick={() => deleteSection('products')} className="flex items-center gap-1 text-red-500 text-[11px] uppercase tracking-wider font-bold cursor-pointer hover:underline">
                                        <Trash2 size={12} className="opacity-50" />
                                        <span>Bölümü sil</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section: YİNELENEN ANLAŞMA */}
                        {!deletedSections.includes('recurring') && (
                            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
                                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <span>YİNELENEN ANLAŞMA</span>
                                    <div className="flex items-center gap-3">
                                        <span onClick={() => toggleEdit('recurring')} className="text-slate-500 italic lowercase font-normal opacity-50 cursor-pointer hover:text-blue-500 hover:opacity-100">
                                            {editingSections['recurring'] ? 'kaydet' : 'düzenle'}
                                        </span>
                                        <Trash2 onClick={() => deleteSection('recurring')} size={14} className="text-slate-300 hover:text-red-500 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] text-slate-400 mb-1">Tekrarla</label>
                                        <div className="flex items-center justify-between border border-slate-200 rounded px-3 py-2 bg-white">
                                            <span className="text-[13px] text-slate-700">Tekrarlama</span>
                                            <Lock size={14} className="text-blue-500" />
                                        </div>
                                    </div>
                                    {customFields['recurring']?.map((field) => (
                                        <div key={field.id} className="mt-2 space-y-1">
                                            {editingSections['recurring'] ? (
                                                <input value={field.label} onChange={(e) => {
                                                    const newFields = customFields['recurring'].map(f => f.id === field.id ? { ...f, label: e.target.value } : f);
                                                    setCustomFields(prev => ({ ...prev, recurring: newFields }));
                                                }} className="block text-[12px] text-blue-500 mb-1 bg-transparent border-b border-blue-100 outline-none font-bold w-full" />
                                            ) : (
                                                <label className="block text-[12px] text-slate-400 mb-1">{field.label}</label>
                                            )}
                                            {editingSections['recurring'] ? (
                                                <input value={field.value} onChange={(e) => {
                                                    const newFields = customFields['recurring'].map(f => f.id === field.id ? { ...f, value: e.target.value } : f);
                                                    setCustomFields(prev => ({ ...prev, recurring: newFields }));
                                                }} className="w-full border border-slate-200 rounded px-2 py-1 text-[13px] outline-blue-500" />
                                            ) : (
                                                <div className="text-[14px] text-slate-800">{field.value || 'â€”'}</div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="pt-2 flex items-center justify-between text-blue-500 text-[12px] font-bold border-t border-slate-100 relative">
                                        <div className="flex items-center gap-4">
                                            <span onClick={() => openFieldSelectorModal('recurring')} className="cursor-pointer hover:underline">Alanı seç</span>
                                            <span onClick={() => setActiveCreateMenu(activeCreateMenu === 'recurring' ? null : 'recurring')} className="cursor-pointer hover:underline">Alan oluştur</span>
                                        </div>
                                        {activeCreateMenu === 'recurring' && <FieldSelector section="recurring" />}
                                        <div onClick={() => deleteSection('recurring')} className="flex items-center gap-1 text-red-500 text-[11px] uppercase tracking-wider font-bold cursor-pointer hover:underline">
                                            <Trash2 size={12} className="opacity-50" />
                                            <span>Bölümü sil</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bottom Links */}
                        <div className="flex items-center gap-6 text-[12px] text-blue-500 font-bold px-2 py-4 mb-20">
                            <span className="cursor-pointer hover:underline">Bölüm ekle</span>
                            <span className="cursor-pointer hover:underline">Market</span>
                            <div className="flex items-center gap-2 text-slate-400 font-bold ml-auto cursor-pointer hover:text-slate-600 transition-colors">
                                <LayoutGrid size={14} /> Standart düzeni kullan
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Activity & Timeline */}
                    <div className="flex-1 flex flex-col gap-6">
                        {/* Combined Timeline Section */}
                        <div className="flex flex-col gap-0 relative pt-2">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-6 top-8 bottom-0 w-[1px] bg-slate-200" />

                            {/* Interactive Bar */}
                            <div className="relative mb-6">
                                {/* Timeline Icon */}
                                <div className="absolute left-2 top-6 w-8 h-8 rounded-full bg-[#3ab0ff] flex items-center justify-center text-white border-4 border-[#eff2f4] z-10">
                                    <MessageSquare size={16} fill="currentColor" className="text-white" />
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible font-bold ml-16">
                                    <div className="flex border-b border-slate-100 px-4">
                                        {['Etkinlik', 'Yorum', 'Mesaj', 'Rezervasyon', 'Görev'].map(item => (
                                            <button
                                                key={item}
                                                onClick={() => {
                                                    if (['Etkinlik', 'Yorum', 'Mesaj', 'Rezervasyon', 'Görev'].includes(item)) {
                                                        setActiveBarTab(item);
                                                    }
                                                }}
                                                className={`px-4 py-3 text-[13px] font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeBarTab === item ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                            >
                                                {item === 'Görev' && <Lock size={12} className="text-slate-400" />}
                                                {item}
                                                {item === 'Rezervasyon' && <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold ml-1">YENİ</span>}
                                            </button>
                                        ))}
                                    </div>
                                    {activeBarTab === 'Etkinlik' && (
                                        <div className={`p-4 bg-white ${isTaskInputActive ? '' : 'relative'}`}>
                                            <textarea
                                                value={isTaskInputActive ? mainTaskInput : savedTaskInput}
                                                onChange={(e) => {
                                                    if (isTaskInputActive) setMainTaskInput(e.target.value);
                                                }}
                                                onFocus={() => {
                                                    if (!isTaskInputActive) {
                                                        setMainTaskInput(savedTaskInput);
                                                        setIsTaskInputActive(true);
                                                    }
                                                }}
                                                placeholder="Yapılacaklar"
                                                className={`w-full border border-slate-200 rounded-lg p-3 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 hover:bg-slate-50 transition-colors resize-none ${(isTaskInputActive ? mainTaskInput : savedTaskInput) ? 'not-italic' : 'italic placeholder:italic'} ${isTaskInputActive ? 'min-h-[120px] mb-3' : 'min-h-[80px] pb-8'}`}
                                            />

                                            {isTaskInputActive ? (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSavedTaskInput(mainTaskInput);
                                                            setIsTaskInputActive(false);
                                                        }}
                                                        className="bg-[#bbed21] hover:bg-[#aadb1e] text-slate-800 px-6 py-2 rounded-[4px] text-[12px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                                    >
                                                        KAYDET
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setMainTaskInput(savedTaskInput);
                                                            setIsTaskInputActive(false);
                                                        }}
                                                        className="text-slate-400 hover:text-slate-600 font-bold text-[12px] px-4 py-2 uppercase transition-colors"
                                                    >
                                                        İPTAL
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="absolute bottom-6 right-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                                                    <span className="text-[12px] font-bold pr-1">eylemler</span>
                                                    <ChevronDown size={14} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeBarTab === 'Yorum' && (
                                        <div className={`p-4 bg-white ${isCommentActive ? '' : 'relative'}`}>
                                            <textarea
                                                value={isCommentActive ? commentInput : savedCommentInput}
                                                onChange={(e) => {
                                                    if (isCommentActive) setCommentInput(e.target.value);
                                                }}
                                                onFocus={() => {
                                                    if (!isCommentActive) {
                                                        setCommentInput(savedCommentInput);
                                                        setIsCommentActive(true);
                                                    }
                                                }}
                                                placeholder="İç not bırakmak için buraya tıklayın..."
                                                className={`w-full border border-slate-200 rounded-lg p-3 text-[14px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 hover:bg-slate-50 transition-colors resize-none ${(isCommentActive ? commentInput : savedCommentInput) ? 'not-italic' : 'italic placeholder:italic'} ${isCommentActive ? 'min-h-[120px] mb-3' : 'min-h-[80px] pb-8'}`}
                                            />

                                            {isCommentActive && (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSavedCommentInput(commentInput);
                                                            setIsCommentActive(false);
                                                        }}
                                                        className="bg-[#bbed21] hover:bg-[#aadb1e] text-slate-800 px-6 py-2 rounded-[4px] text-[12px] font-bold uppercase tracking-wider transition-colors shadow-sm"
                                                    >
                                                        KAYDET
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setCommentInput(savedCommentInput);
                                                            setIsCommentActive(false);
                                                        }}
                                                        className="text-slate-400 hover:text-slate-600 font-bold text-[12px] px-4 py-2 uppercase transition-colors"
                                                    >
                                                        İPTAL
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeBarTab === 'Mesaj' && (
                                        <div className="p-4 bg-white relative">
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    navigate('/messages');
                                                }}
                                                className="bg-[#0073ff] hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-[13px] font-bold flex items-center gap-2 mb-4 shadow-sm"
                                            >
                                                <MessageSquare size={16} />
                                                Mesajlaşma sağlayıcılarını bağla
                                            </button>

                                            <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col focus-within:border-blue-400 transition-colors">
                                                <textarea
                                                    value={messageInput}
                                                    onChange={(e) => setMessageInput(e.target.value)}
                                                    placeholder="Mesaj metni girin"
                                                    className="w-full p-3 min-h-[100px] text-[14px] text-slate-700 placeholder:text-slate-400 outline-none resize-none"
                                                />
                                                <div className="flex items-center justify-between px-3 pb-3">
                                                    <div className="flex items-center gap-4">
                                                        <button className="flex items-center gap-1.5 text-[14px] font-bold text-slate-600 hover:text-slate-800">
                                                            <Plus size={16} className="text-slate-400" /> Ekle
                                                        </button>
                                                        <button className="w-5 h-5 rounded-full border border-purple-500 flex items-center justify-center text-purple-600 hover:bg-purple-50">
                                                            <AtSign size={12} />
                                                        </button>
                                                    </div>
                                                    <button className="text-slate-400 hover:text-slate-600">
                                                        <Smile size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-[12px] text-slate-300 mt-2 mb-4 px-1">
                                                <span>Mesajı müşteri olarak ön izle</span>
                                                <span>{messageInput.length} / 200</span>
                                            </div>

                                            <div className="flex items-center gap-4 px-1">
                                                <button
                                                    onClick={() => {
                                                        if (messageInput.trim()) {
                                                            const newEvent = {
                                                                id: Date.now(),
                                                                type: 'message',
                                                                title: 'Mesaj gönderildi',
                                                                user: 'User',
                                                                time: 'Az önce',
                                                                content: messageInput,
                                                                icon: <MessageSquare size={14} />
                                                            };
                                                            setTimelineEvents(prev => [newEvent, ...prev]);
                                                            setMessageInput('');
                                                            setActiveBarTab('Etkinlik');
                                                        }
                                                    }}
                                                    className={`px-5 py-2 rounded-[6px] text-[13px] font-bold ${messageInput.trim() ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'} transition-colors shadow-sm`}
                                                >
                                                    Gönder
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeBarTab === 'Görev' && (
                                        <div className="p-4 bg-white relative flex flex-col gap-4">
                                            <div className="border border-slate-200 rounded-lg flex flex-col focus-within:border-blue-400 transition-colors bg-white shadow-sm overflow-visible">
                                                <textarea
                                                    value={taskInput}
                                                    onChange={(e) => setTaskInput(e.target.value)}
                                                    placeholder="Yapılacak bir şey ekleyin..."
                                                    className="w-full p-3 min-h-[80px] text-[14px] text-slate-700 placeholder:text-slate-400 outline-none resize-none"
                                                />
                                                <div className="flex items-center justify-between px-3 py-2 bg-slate-50/50 border-t border-slate-100">
                                                    <div className="flex items-center gap-3 relative">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowAssigneeDropdown(!showAssigneeDropdown);
                                                            }}
                                                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all min-w-[120px]"
                                                        >
                                                            <User size={14} className="text-slate-400" />
                                                            Atanan: {
                                                                selectedAssignees.length === 0 ? 'Hiç kimse' :
                                                                    selectedAssignees.includes('Herkes') ? 'Herkes' :
                                                                        selectedAssignees.length === 1 ? selectedAssignees[0] :
                                                                            `${selectedAssignees.length} kişi`
                                                            }
                                                        </button>

                                                        {showAssigneeDropdown && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-[90]"
                                                                    onClick={() => setShowAssigneeDropdown(false)}
                                                                />
                                                                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 shadow-2xl rounded-xl z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    <div className="p-2 flex flex-col gap-0.5 max-h-[300px] overflow-y-auto">
                                                                        {teamMembers.map((member) => (
                                                                            <div
                                                                                key={member.id}
                                                                                onClick={() => {
                                                                                    if (member.name === 'Herkes') {
                                                                                        setSelectedAssignees(['Herkes']);
                                                                                    } else if (member.name === 'Hiç kimse') {
                                                                                        setSelectedAssignees([]);
                                                                                    } else {
                                                                                        setSelectedAssignees(prev => {
                                                                                            const next = prev.filter(n => n !== 'Herkes' && n !== 'Hiç kimse');
                                                                                            if (next.includes(member.name)) {
                                                                                                return next.filter(n => n !== member.name);
                                                                                            } else {
                                                                                                return [...next, member.name];
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }}
                                                                                className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors rounded-md"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    {member.icon}
                                                                                    <span className="text-[13px] text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">
                                                                                        {member.name}
                                                                                    </span>
                                                                                </div>
                                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedAssignees.includes(member.name) ||
                                                                                    (member.name === 'Herkes' && selectedAssignees.includes('Herkes'))
                                                                                    ? 'bg-blue-500 border-blue-500'
                                                                                    : 'border-slate-300'
                                                                                    }`}>
                                                                                    {(selectedAssignees.includes(member.name) || (member.name === 'Herkes' && selectedAssignees.includes('Herkes'))) && (
                                                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}

                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowDueDateDropdown(!showDueDateDropdown);
                                                                }}
                                                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                                            >
                                                                <Plus size={14} className="text-slate-400" />
                                                                {selectedDueDate ? `Bitiş: ${selectedDueDate.getDate()} ${monthNames[selectedDueDate.getMonth()]}` : 'Bitiş Tarihi'}
                                                            </button>

                                                            {showDueDateDropdown && (
                                                                <>
                                                                    <div
                                                                        className="fixed inset-0 z-[90]"
                                                                        onClick={() => setShowDueDateDropdown(false)}
                                                                    />
                                                                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 shadow-2xl rounded-xl z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                                                                        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                                                                            <span className="text-[13px] font-bold text-slate-700">
                                                                                {monthNames[currentDueDateCalendar.getMonth()]} {currentDueDateCalendar.getFullYear()}
                                                                            </span>
                                                                            <div className="flex items-center gap-1">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setCurrentDueDateCalendar(new Date(currentDueDateCalendar.getFullYear(), currentDueDateCalendar.getMonth() - 1, 1));
                                                                                    }}
                                                                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                                                                >
                                                                                    <ArrowLeft size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setCurrentDueDateCalendar(new Date(currentDueDateCalendar.getFullYear(), currentDueDateCalendar.getMonth() + 1, 1));
                                                                                    }}
                                                                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                                                                >
                                                                                    <ArrowRight size={14} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-2">
                                                                            <div className="grid grid-cols-7 gap-0 mb-1">
                                                                                {['Pt', 'Sa', 'Çr', 'Pr', 'Cu', 'Ct', 'Pz'].map(d => (
                                                                                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
                                                                                ))}
                                                                            </div>
                                                                            <div className="grid grid-cols-7 gap-1">
                                                                                {(() => {
                                                                                    const year = currentDueDateCalendar.getFullYear();
                                                                                    const month = currentDueDateCalendar.getMonth();
                                                                                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                                                                                    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
                                                                                    const prevMonthDays = new Date(year, month, 0).getDate();

                                                                                    const grid = [];
                                                                                    for (let i = firstDay - 1; i >= 0; i--) {
                                                                                        grid.push(<div key={`prev-${i}`} className="text-center py-2 text-[11px] text-slate-300">{prevMonthDays - i}</div>);
                                                                                    }
                                                                                    for (let i = 1; i <= daysInMonth; i++) {
                                                                                        const dateValue = new Date(year, month, i);
                                                                                        const isSelected = selectedDueDate &&
                                                                                            selectedDueDate.getDate() === i &&
                                                                                            selectedDueDate.getMonth() === month &&
                                                                                            selectedDueDate.getFullYear() === year;

                                                                                        grid.push(
                                                                                            <button
                                                                                                key={`day-${i}`}
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    setSelectedDueDate(dateValue);
                                                                                                    setShowDueDateDropdown(false);
                                                                                                }}
                                                                                                className={`text-center py-1.5 text-[11px] font-semibold rounded-md transition-all hover:bg-blue-50 hover:text-blue-600 ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'text-slate-600'
                                                                                                    }`}
                                                                                            >
                                                                                                {i}
                                                                                            </button>
                                                                                        );
                                                                                    }
                                                                                    return grid;
                                                                                })()}
                                                                            </div>
                                                                        </div>
                                                                        <div className="p-2 border-t border-slate-100 bg-slate-50/30 flex justify-center">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedDueDate(null);
                                                                                    setShowDueDateDropdown(false);
                                                                                }}
                                                                                className="text-[11px] font-bold text-red-500 hover:text-red-600"
                                                                            >
                                                                                Tarihi Temizle
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 cursor-pointer hover:text-slate-700 mr-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={sendTaskAsMessage}
                                                                onChange={(e) => setSendTaskAsMessage(e.target.checked)}
                                                                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                                                            />
                                                            Mesaj olarak gönder
                                                        </label>
                                                        <button className="text-slate-400 hover:text-slate-600 p-1">
                                                            <Smile size={18} />
                                                        </button>
                                                        <button className="text-slate-400 hover:text-slate-600 p-1">
                                                            <AtSign size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowTaskActionDropdown(!showTaskActionDropdown);
                                                        }}
                                                        className="bg-[#bbed21] hover:bg-[#aadb1e] text-slate-800 px-6 py-2 rounded-[4px] text-[12px] font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2"
                                                    >
                                                        GÖREV EKLE
                                                        <ChevronDown size={14} className="text-slate-600" />
                                                    </button>

                                                    {showTaskActionDropdown && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-[90]"
                                                                onClick={() => setShowTaskActionDropdown(false)}
                                                            />
                                                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-1 duration-200">
                                                                <button
                                                                    onClick={() => {
                                                                        if (taskInput.trim()) {
                                                                            const newEvent = {
                                                                                id: Date.now(),
                                                                                type: 'task',
                                                                                title: 'Sayfama görev eklendi',
                                                                                user: 'User',
                                                                                time: 'Az önce',
                                                                                content: taskInput,
                                                                                assignee: selectedAssignees.join(', '),
                                                                                dueDate: selectedDueDate ? `${selectedDueDate.getDate()} ${monthNames[selectedDueDate.getMonth()]} ${selectedDueDate.getFullYear()}` : null,
                                                                                wasSentAsMessage: sendTaskAsMessage
                                                                            };
                                                                            setTimelineEvents(prev => {
                                                                                const updated = [newEvent, ...prev];
                                                                                if (sendTaskAsMessage) {
                                                                                    const msgEvent = {
                                                                                        id: Date.now() + 1,
                                                                                        type: 'message',
                                                                                        title: 'Mesaj gönderildi',
                                                                                        user: 'User',
                                                                                        time: 'Az önce',
                                                                                        content: `Görev Atandı: ${taskInput} (Atanan: ${selectedAssignees.join(', ')})`,
                                                                                        icon: <MessageSquare size={14} />
                                                                                    };
                                                                                    return [msgEvent, ...updated];
                                                                                }
                                                                                return updated;
                                                                            });
                                                                            setTaskInput('');
                                                                            setSelectedDueDate(null);
                                                                            setShowTaskActionDropdown(false);
                                                                            setActiveBarTab('Etkinlik');
                                                                        }
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-50 transition-colors"
                                                                >
                                                                    Sayfama görev ekle
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (taskInput.trim()) {
                                                                            const newEvent = {
                                                                                id: Date.now(),
                                                                                type: 'task',
                                                                                title: 'Takvime görev eklendi',
                                                                                user: 'User',
                                                                                time: 'Az önce',
                                                                                content: taskInput,
                                                                                assignee: selectedAssignees.join(', '),
                                                                                dueDate: selectedDueDate ? `${selectedDueDate.getDate()} ${monthNames[selectedDueDate.getMonth()]} ${selectedDueDate.getFullYear()}` : null,
                                                                                wasSentAsMessage: sendTaskAsMessage
                                                                            };
                                                                            setTimelineEvents(prev => {
                                                                                const updated = [newEvent, ...prev];
                                                                                if (sendTaskAsMessage) {
                                                                                    const msgEvent = {
                                                                                        id: Date.now() + 1,
                                                                                        type: 'message',
                                                                                        title: 'Mesaj gönderildi',
                                                                                        user: 'User',
                                                                                        time: 'Az önce',
                                                                                        content: `Görev Atandı: ${taskInput} (Atanan: ${selectedAssignees.join(', ')})`,
                                                                                        icon: <MessageSquare size={14} />
                                                                                    };
                                                                                    return [msgEvent, ...updated];
                                                                                }
                                                                                return updated;
                                                                            });
                                                                            setTaskInput('');
                                                                            setSelectedDueDate(null);
                                                                            setShowTaskActionDropdown(false);
                                                                            setActiveBarTab('Etkinlik');
                                                                        }
                                                                    }}
                                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    Takvimime ekle
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setTaskInput('');
                                                        setActiveBarTab('Etkinlik');
                                                    }}
                                                    className="text-slate-400 hover:text-slate-600 font-bold text-[12px] px-4 py-2 uppercase transition-colors"
                                                >
                                                    İPTAL
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeBarTab === 'Rezervasyon' && (
                                        <div className="bg-white relative flex flex-col h-[600px] border-t border-slate-100">
                                            {/* Top Header Controls */}
                                            <div className="flex items-center justify-between p-4 border-b border-slate-100">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="text-[18px] font-bold text-slate-800">Rezervasyon</h3>
                                                        <div className="flex flex-col items-center justify-center leading-none text-slate-400 font-bold">
                                                            <span className="text-[14px] mb-0.5">{selectedReservationDate.getDate()}</span>
                                                            <span className="text-[11px] uppercase tracking-wider">{monthNames[selectedReservationDate.getMonth()].slice(0, 3)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col text-[11px] text-slate-400 leading-tight">
                                                        <span>+ <span className="font-bold">0</span> müşteri</span>
                                                        <span>+ <span className="font-bold">0</span>â‚º</span>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Filtre"
                                                            value={reservationSearch}
                                                            onChange={(e) => setReservationSearch(e.target.value)}
                                                            className="w-[300px] pl-4 pr-10 py-1.5 border border-slate-200 rounded-full text-[13px] outline-none focus:border-blue-400 transition-colors placeholder:text-slate-400"
                                                        />
                                                        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-4 text-[12px] font-medium text-slate-500">
                                                        <span className="flex items-center gap-1.5"><span className="font-bold text-slate-700">0</span> Onaylanmamış</span>
                                                        <span className="flex items-center gap-1.5"><span className="font-bold text-slate-700">0</span> Geciken</span>
                                                    </div>
                                                    <button className="text-[12px] font-medium text-slate-500 border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors">
                                                        Rezervasyon uzantıları
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Main Content Area */}
                                            <div className="flex flex-1 overflow-hidden relative">
                                                {/* Left Panel - Timeline List */}
                                                <div className="flex-1 overflow-y-auto w-[65%] border-r border-slate-200 bg-white relative">
                                                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => {
                                                        const dateStr = selectedReservationDate.toDateString();
                                                        const slotReservations = reservations.filter(r => r.dateString === dateStr && r.time === time);
                                                        const isEditingThisSlot = bookingInput?.time === time;

                                                        return (
                                                            <div key={time} className="min-h-[64px] border-b border-slate-50 relative flex group cursor-pointer hover:bg-slate-50 transition-colors"
                                                                onClick={() => {
                                                                    if (!isEditingThisSlot && slotReservations.length === 0) {
                                                                        setBookingInput({ time, note: '' });
                                                                    }
                                                                }}
                                                            >
                                                                {/* Time Label & Notes Column */}
                                                                <div className="w-[120px] shrink-0 border-r border-slate-100 group-hover:border-blue-200 transition-colors flex flex-col pt-2 px-2 relative min-h-[64px]">
                                                                    <div className="text-[11px] text-slate-400 font-medium text-right pr-1 mb-1">
                                                                        {time}
                                                                    </div>

                                                                    {/* Render saved notes directly under the time */}
                                                                    {slotReservations.map(res => (
                                                                        <div key={res.id} className="mt-1 bg-blue-50 border border-blue-200 rounded p-1.5 text-[10px] text-blue-700 font-medium shadow-sm flex flex-col group/res relative z-10 word-break">
                                                                            <span className="leading-snug">{res.note}</span>
                                                                            <button
                                                                                className="absolute -top-1.5 -right-1.5 text-slate-400 bg-white border border-slate-200 rounded-full p-0.5 hover:text-red-500 opacity-0 group-hover/res:opacity-100 transition-opacity"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setReservations(reservations.filter(r => r.id !== res.id));
                                                                                }}
                                                                            >
                                                                                <X size={8} />
                                                                            </button>
                                                                        </div>
                                                                    ))}

                                                                    {/* Input box to create a note */}
                                                                    {isEditingThisSlot && (
                                                                        <div className="absolute left-1 right-1 top-7 z-20 bg-white border border-blue-300 rounded shadow-lg p-1.5" onClick={e => e.stopPropagation()}>
                                                                            <textarea
                                                                                autoFocus
                                                                                placeholder="Not..."
                                                                                className="w-full text-[11px] outline-none placeholder:text-slate-400 resize-none h-12 bg-slate-50 rounded p-1 border border-slate-100"
                                                                                value={bookingInput.note}
                                                                                onChange={e => setBookingInput({ ...bookingInput, note: e.target.value })}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter' && !e.shiftKey && bookingInput.note.trim()) {
                                                                                        e.preventDefault();
                                                                                        setReservations([...reservations, { id: Date.now().toString(), dateString: dateStr, time, note: bookingInput.note.trim() }]);
                                                                                        setBookingInput(null);
                                                                                    } else if (e.key === 'Escape') {
                                                                                        setBookingInput(null);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <div className="flex justify-end gap-1 mt-1">
                                                                                <button className="text-[9px] text-slate-400 hover:text-slate-600 font-bold" onClick={() => setBookingInput(null)}>İptal</button>
                                                                                <button
                                                                                    className="text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded hover:bg-blue-600 font-bold"
                                                                                    onClick={() => {
                                                                                        if (bookingInput.note.trim()) {
                                                                                            setReservations([...reservations, { id: Date.now().toString(), dateString: dateStr, time, note: bookingInput.note.trim() }]);
                                                                                            setBookingInput(null);
                                                                                        }
                                                                                    }}
                                                                                >Kaydet</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Main Timeline Body */}
                                                                <div className="flex-1 border-l border-slate-50 relative pointer-events-none" />
                                                            </div>
                                                        );
                                                    })}
                                                    {/* Current Time Indicator Example (Only show if viewing the "today" placeholder) */}
                                                    {isToday(selectedReservationDate) && (
                                                        <div className="absolute top-[180px] left-0 right-0 h-[1px] bg-red-400 z-10 pointer-events-none">
                                                            <div className="absolute -left-0 -top-2 text-[10px] text-red-500 font-bold bg-white pr-2 pl-4">11:40</div>
                                                        </div>
                                                    )}

                                                    {/* Bottom Fixed Footer inside List */}
                                                    <div className="sticky bottom-0 left-0 right-0 bg-white p-3 border-t border-slate-100 flex items-center justify-start z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                                        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 border border-slate-200 rounded px-2 py-1 bg-white cursor-pointer hover:bg-slate-50">
                                                            Tümünü göster <span className="text-slate-300 mx-1">|</span> - <span className="font-bold text-slate-700">%100</span> +
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Panel - Calendar & Waitlist */}
                                                <div className="w-[30%] shrink-0 min-w-[280px] bg-slate-50/50 flex flex-col p-4 gap-4 overflow-y-auto">
                                                    {/* Mini Calendar Component */}
                                                    <div className="bg-white border text-center border-slate-200 rounded-xl p-4 shadow-sm w-full mx-auto self-start">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <button className="text-slate-400 hover:text-slate-600" onClick={handlePrevMonth}><ArrowLeft size={14} /></button>
                                                            <span className="text-[14px] font-bold text-slate-700">{monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}</span>
                                                            <button className="text-slate-400 hover:text-slate-600" onClick={handleNextMonth}><ArrowRight size={14} /></button>
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-1 text-[11px] font-medium text-slate-400 mb-2">
                                                            <div>Pt</div><div>Sa</div><div>Ça</div><div>Pe</div><div>Cu</div><div>Ct</div><div className="text-red-400">Pz</div>
                                                        </div>
                                                        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-[13px] text-slate-600 font-medium">
                                                            {calendarGrid.map((item, idx) => {
                                                                const isSelected = isDateSelected(item.date);
                                                                const dayOfWeek = item.date.getDay(); // 0 is Sunday
                                                                const isWeekend = dayOfWeek === 0;

                                                                let textClass = 'text-slate-600';
                                                                if (!item.isCurrentMonth) {
                                                                    textClass = 'text-slate-300';
                                                                } else if (isWeekend) {
                                                                    textClass = 'text-red-400';
                                                                }

                                                                return (
                                                                    <div
                                                                        key={idx}
                                                                        onClick={() => {
                                                                            setSelectedReservationDate(item.date);
                                                                            if (!item.isCurrentMonth) {
                                                                                setCurrentCalendarDate(new Date(item.date.getFullYear(), item.date.getMonth(), 1));
                                                                            }
                                                                        }}
                                                                        className={`flex items-center justify-center mx-auto cursor-pointer w-6 h-6 rounded-full transition-colors ${isSelected ? 'bg-blue-500 text-white shadow-sm font-bold' : `hover:bg-slate-100 ${textClass}`}`}
                                                                    >
                                                                        {item.day}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Waitlist Box */}
                                                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex-1 flex flex-col min-h-[200px]">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="text-[13px] font-bold text-slate-700">Bekleme listesi</h4>
                                                            <button className="text-blue-500 font-bold text-[12px] flex items-center gap-1 hover:text-blue-600">
                                                                + Ekle <X size={12} className="text-slate-300 ml-1" />
                                                            </button>
                                                        </div>

                                                        <div className="border border-dashed border-blue-200 rounded-lg flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50">
                                                            <div className="w-12 h-14 bg-blue-50 rounded-lg flex flex-col items-center justify-center gap-1.5 mb-4 border border-blue-100 shadow-sm">
                                                                <div className="w-5 h-1 rounded-full bg-blue-200"></div>
                                                                <div className="w-5 h-1 rounded-full bg-blue-200"></div>
                                                                <div className="w-5 h-1 rounded-full bg-blue-200"></div>
                                                            </div>
                                                            <h5 className="text-[13px] font-bold text-slate-700 mb-1">Bekleme listesi</h5>
                                                            <p className="text-[11px] text-slate-400 leading-relaxed max-w-[150px]">
                                                                Mevcut bir rezervasyonu buraya sürükleyin veya yeni bir tane oluşturmak için "Ekle" düğmesine tıklayın.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Sohbette Tartış Input */}
                                <div className="relative mb-12">
                                    {/* Timeline Icon */}
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#3ab0ff] flex items-center justify-center text-white border-4 border-[#eff2f4] z-10">
                                        <MessageSquare size={16} fill="currentColor" className="text-white" />
                                    </div>

                                    <div className="ml-16 bg-white border border-slate-200 rounded-full h-12 flex items-center px-4 hover:border-blue-400 transition-colors shadow-sm relative z-10">
                                        <div className="w-7 h-7 bg-slate-500 rounded-full flex items-center justify-center text-white mr-3 relative shrink-0">
                                            <User size={14} />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#e0f4ff] rounded-full flex items-center justify-center text-[#3ab0ff] border-2 border-white">
                                                <Plus size={10} strokeWidth={4} />
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Sohbette tartış"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && chatInput.trim()) {
                                                    const newEvent = {
                                                        id: Date.now(),
                                                        type: 'message',
                                                        title: 'Mesaj gönderildi',
                                                        user: 'User',
                                                        time: 'Az önce',
                                                        content: chatInput,
                                                        icon: <MessageSquare size={14} />
                                                    };
                                                    setTimelineEvents(prev => [newEvent, ...prev]);
                                                    setChatInput('');
                                                }
                                            }}
                                            className="bg-transparent border-none outline-none flex-1 text-[14px] text-slate-700 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center mb-8 relative z-10">
                                    <div className="bg-[#41c300] text-white px-4 py-1 rounded-full text-[12px] font-bold shadow-sm">Yapılacaklar</div>
                                </div>

                                <div className="flex flex-col gap-4 ml-16 mb-8 relative z-10 w-full pr-12">
                                    <div
                                        onClick={() => setActiveBarTab('Görev')}
                                        className="bg-amber-50 rounded-lg border border-amber-100 p-5 flex items-start gap-4 mx-6 ml-0 relative z-10 mt-2 cursor-pointer hover:bg-amber-100 transition-colors"
                                    >
                                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#41c300] flex items-center justify-center text-white border-4 border-[#eff2f4] hover:scale-110 transition-transform"><Plus size={18} /></div>
                                        <div className="flex-1 py-1">
                                            <div className="text-[14px] font-bold text-slate-800 mb-0.5">Yeni bir etkinlik ekleyin</div>
                                            <div className="text-[13px] text-slate-500">Müşteriyi asla unutmamak için anlaşmadaki bir sonraki eyleminizi planlayın</div>
                                        </div>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><ChevronDown size={18} /></div>
                                    </div>
                                </div>

                                <div className="flex justify-center mb-8 relative z-10">
                                    <div className="bg-[#56cafc] text-white px-5 py-1 rounded-full text-[12px] font-bold shadow-sm flex items-center gap-2">
                                        Bugün <ChevronDown size={12} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-5 ml-16 mb-20 relative z-10">
                                    {timelineEvents.map((event) => (
                                        <div key={event.id} className="relative group">
                                            <div className="absolute -left-[56px] top-2 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 z-10 group-hover:border-blue-300 transition-colors shadow-sm">
                                                {event.icon}
                                            </div>
                                            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col gap-3 mr-6">
                                                <div className="flex items-center justify-between text-[13px]">
                                                    <div className="flex items-center gap-2 text-slate-800">
                                                        <span className="font-bold">{event.title}</span>
                                                        <span className="text-slate-400 ml-1">{event.time}</span>
                                                    </div>
                                                    <div
                                                        onClick={() => setShowUserProfile(true)}
                                                        className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white cursor-pointer hover:bg-blue-500 transition-colors"
                                                    >
                                                        <User size={12} />
                                                    </div>
                                                </div>
                                                {event.before ? (
                                                    <div className="flex items-center gap-2 text-[12px] px-3 py-2 bg-slate-50 rounded border border-slate-100 w-fit">
                                                        <span className="text-slate-500">{event.before}</span>
                                                        <span className="text-slate-300 text-[16px]">â†’</span>
                                                        <span className="text-slate-500 font-bold">{event.after}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-[13px] text-slate-600 font-medium">{event.content}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-white border-t border-slate-200 px-6 flex items-center gap-4 z-50">
                        <button onClick={() => { if (onSave) onSave(editData); else onClose(); }} className="bg-[#bbed21] hover:bg-[#aadb1e] text-slate-900 px-8 py-2.5 rounded text-[13px] font-black uppercase tracking-wider transition-colors shadow-sm">
                            KAYDET
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-[13px] px-4 py-2.5 uppercase transition-colors">
                            İPTAL
                        </button>
                    </div>

                    {/* User Profile Modal */}
                    {showUserProfile && (
                        <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-300">
                            <div className="bg-[#0b1b3d] rounded-[30px] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-[1280px] max-w-[95vw] h-[90vh] flex flex-col relative overflow-hidden text-white font-sans border border-white/10">
                                {/* Animated Background Glow */}
                                <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20 pointer-events-none blur-[120px]" />

                                {/* Modal Header */}
                                <div className="px-8 py-6 flex items-center justify-between relative z-10">
                                    <h2 className="text-[24px] font-bold tracking-tight text-white drop-shadow-md">
                                        {profileData.email}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <button className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-md text-[13px] font-bold transition-all border border-white/5 flex items-center gap-2">
                                            Uzantılar <ChevronDown size={14} />
                                        </button>
                                        <button className="bg-blue-600/80 hover:bg-blue-600 px-4 py-1.5 rounded-md text-[13px] font-bold transition-all shadow-lg shadow-blue-500/20">
                                            Güvenlik
                                        </button>
                                        <button
                                            onClick={() => setShowUserProfile(false)}
                                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5 ml-4"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs Navigation */}
                                <div className="px-8 flex items-center gap-2 border-b border-white/10 relative z-10 bg-white/5 backdrop-blur-sm">
                                    {['Genel', 'Görevler', 'Takvim', 'Disk', 'Akış', 'Belgelerim', 'Analizler', 'Verimlilik', 'Grup', 'Daha fazla'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveProfileTab(tab)}
                                            className={`px-4 py-4 text-[14px] font-medium transition-all relative ${activeProfileTab === tab ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            {tab}
                                            {tab === 'Verimlilik' && <span className="absolute -top-1 -right-2 text-[9px] bg-blue-500 text-white px-1 rounded-full px-1.5 font-bold">100%</span>}
                                            {activeProfileTab === tab && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-t-full shadow-[0_0_10px_#60a5fa]" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Modal Body */}
                                <div className="flex-1 overflow-y-auto p-10 flex gap-8 relative z-10 bg-gradient-to-b from-white/5 to-transparent">
                                    {/* Left Column */}
                                    <div className="w-[320px] shrink-0 flex flex-col gap-6">
                                        {/* Profile Image & Status Card */}
                                        {/* Profile Image & Status Card */}
                                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-blue-600/5 pointer-events-none" />

                                            <div className="w-full flex flex-col items-center relative z-10">
                                                {/* Photo Upload Area - Full Width Header */}
                                                <div className="w-full relative group/photo">
                                                    <input
                                                        type="file"
                                                        id="profile-photo-input"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setProfilePhoto(reader.result as string);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="profile-photo-input"
                                                        className="w-full aspect-square bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all relative overflow-hidden mb-10 border-b border-white/5"
                                                    >
                                                        {profilePhoto ? (
                                                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-6">
                                                                <div className="w-32 h-32 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center shadow-xl">
                                                                    <User size={64} className="text-slate-400 opacity-20" />
                                                                </div>
                                                                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-50">Fotoğraf Ekle</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity backdrop-blur-[2px]">
                                                            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center shadow-2xl scale-90 group-hover/photo:scale-100 transition-transform duration-300">
                                                                <Plus size={40} className="text-white" />
                                                            </div>
                                                        </div>
                                                    </label>

                                                    {/* Edit Icon Overlay */}
                                                    <div className="absolute bottom-4 right-6 w-12 h-12 rounded-full bg-blue-600 border-4 border-[#0b1b3d] flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform z-20">
                                                        <Edit3 size={18} className="text-white" />
                                                    </div>
                                                </div>

                                                {/* Status Badges Row - With Padding */}
                                                <div className="px-8 w-full flex flex-col items-center pb-8">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="bg-blue-600 hover:bg-blue-500 rounded px-3 py-1 text-[11px] font-black tracking-widest uppercase flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer transition-colors">
                                                            Yönetici <ChevronDown size={12} />
                                                        </div>
                                                        <div className="bg-white/5 border border-white/10 rounded px-3 py-1 flex items-center gap-2 shadow-inner">
                                                            <div className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
                                                            <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest">Çevrimiçi</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-[10px] text-slate-500 italic opacity-70 px-4 text-center">son görünme 6 dakika önce</div>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Takdirler */}
                                        <div className="bg-[#0f224a] rounded-2xl p-6 pb-8 border border-white/5 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest ml-1">Takdirler</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
                                            </div>

                                            <div className="grid grid-cols-5 gap-4 justify-items-center">
                                                {[
                                                    { id: 1, Icon: ThumbsUp, msg: "Beğeni gönderildi!" },
                                                    { id: 2, Icon: Gift, msg: "Hediye gönderildi!" },
                                                    { id: 3, Icon: Trophy, msg: "Kupa takdim edildi!" },
                                                    { id: 4, Icon: DollarSign, msg: "Para ödülü gönderildi!" },
                                                    { id: 5, Icon: Crown, msg: "Liderlik takdir edildi!" },
                                                    { id: 6, Icon: Martini, msg: "Kutlama mesajı gönderildi!" },
                                                    { id: 7, Icon: Cake, msg: "Pasta gönderildi!" },
                                                    { id: 8, custom: "1", msg: "Birinci seçildi!" },
                                                    { id: 9, Icon: Flag, msg: "Bayrak çekildi!" },
                                                    { id: 10, Icon: Star, msg: "Yıldız oyuncu seçildi!" },
                                                    { id: 11, Icon: Heart, msg: "Sevgi paylaşıldı!" },
                                                    { id: 12, Icon: Beer, msg: "Keyifli vakitler dileriz!" },
                                                    { id: 13, Icon: Flower2, msg: "Çiçek gönderildi!" },
                                                    { id: 14, Icon: Smile, msg: "Gülümseme iletildi!" },
                                                ].map((badge) => {
                                                    const isActive = selectedBadges.includes(badge.id);
                                                    return (
                                                        <div
                                                            key={badge.id}
                                                            onClick={() => {
                                                                setSelectedBadges(prev =>
                                                                    isActive ? prev.filter(id => id !== badge.id) : [...prev, badge.id]
                                                                );
                                                                if (!isActive) {
                                                                    setBadgeNotificationText(badge.msg);
                                                                    setShowBadgeNotification(true);
                                                                    setTimeout(() => setShowBadgeNotification(false), 3000);
                                                                }
                                                            }}
                                                            className={`w-10 h-10 rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer
                                                            ${isActive
                                                                    ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110'
                                                                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-blue-500/50 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {badge.Icon ? (
                                                                <badge.Icon size={18} className={isActive ? 'text-white' : 'opacity-40'} />
                                                            ) : (
                                                                <span className={`text-[14px] font-black ${isActive ? 'text-white' : 'opacity-40'}`}>{badge.custom}</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Inline Notification */}
                                            {showBadgeNotification && (
                                                <div className="absolute inset-x-0 bottom-0 bg-blue-600 py-2 px-4 flex items-center justify-center gap-2 animate-in slide-in-from-bottom-full duration-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">{badgeNotificationText}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="flex-1 flex flex-col gap-6">
                                        {activeProfileTab === 'Genel' ? (
                                            <>
                                                {/* İletişim Bilgisi Card */}
                                                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-10 border border-white/10 shadow-2xl relative min-h-[500px]">
                                                    <div className="flex items-center justify-between mb-10">
                                                        <h3 className="text-[18px] font-bold text-slate-100">İletişim bilgisi</h3>
                                                        <button
                                                            onClick={() => setIsEditingContactInfo(!isEditingContactInfo)}
                                                            className={`text-[12px] font-bold transition-all uppercase tracking-widest px-4 py-2 rounded ${isEditingContactInfo
                                                                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
                                                                : 'text-slate-400 hover:text-blue-400'
                                                                }`}
                                                        >
                                                            {isEditingContactInfo ? 'KAYDET' : 'DÜZENLE'}
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-10">
                                                        <div className="space-y-3 group">
                                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Ad</label>
                                                            <input
                                                                value={profileData.ad}
                                                                onChange={(e) => setProfileData(prev => ({ ...prev, ad: e.target.value }))}
                                                                readOnly={!isEditingContactInfo}
                                                                placeholder={isEditingContactInfo ? "ad girin" : "alan boş"}
                                                                className={`w-full bg-transparent border-b pb-2 text-[15px] outline-none transition-all ${isEditingContactInfo
                                                                    ? 'border-blue-400/50 text-white'
                                                                    : 'border-white/5 text-slate-400 cursor-default'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div className="space-y-3 group">
                                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Soyad</label>
                                                            <input
                                                                value={profileData.soyad}
                                                                onChange={(e) => setProfileData(prev => ({ ...prev, soyad: e.target.value }))}
                                                                readOnly={!isEditingContactInfo}
                                                                placeholder={isEditingContactInfo ? "soyad girin" : "alan boş"}
                                                                className={`w-full bg-transparent border-b pb-2 text-[15px] outline-none transition-all ${isEditingContactInfo
                                                                    ? 'border-blue-400/50 text-white'
                                                                    : 'border-white/5 text-slate-400 cursor-default'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div className="space-y-3 group">
                                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">E-posta</label>
                                                            <input
                                                                value={profileData.email}
                                                                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                                                readOnly={!isEditingContactInfo}
                                                                className={`w-full bg-transparent border-b pb-2 text-[15px] outline-none transition-all ${isEditingContactInfo
                                                                    ? 'border-blue-400/50 text-white'
                                                                    : 'border-white/5 text-blue-400/60 cursor-default'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div className="space-y-3 group">
                                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Departman</label>
                                                            <input
                                                                value={profileData.departman}
                                                                onChange={(e) => setProfileData(prev => ({ ...prev, departman: e.target.value }))}
                                                                readOnly={!isEditingContactInfo}
                                                                className={`w-full bg-transparent border-b pb-2 text-[15px] outline-none transition-all ${isEditingContactInfo
                                                                    ? 'border-blue-400/50 text-white'
                                                                    : 'border-white/5 text-slate-400 cursor-default'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div className="space-y-3 group">
                                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">İkinci ad</label>
                                                            <input
                                                                value={profileData.ikinciAd}
                                                                onChange={(e) => setProfileData(prev => ({ ...prev, ikinciAd: e.target.value }))}
                                                                readOnly={!isEditingContactInfo}
                                                                placeholder={isEditingContactInfo ? "ikinci ad girin" : "alan boş"}
                                                                className={`w-full bg-transparent border-b pb-2 text-[15px] outline-none transition-all ${isEditingContactInfo
                                                                    ? 'border-blue-400/50 text-white'
                                                                    : 'border-white/5 text-slate-400 cursor-default'
                                                                    }`}
                                                            />
                                                        </div>
                                                        <div className="space-y-3 group">
                                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Bildirim dili</label>
                                                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                                                <span className="text-[15px]">{profileData.bildirimDili}</span>
                                                                <ChevronDown size={14} className="text-slate-500" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-12 flex items-center gap-6">
                                                        <span className="text-[12px] font-bold text-blue-400 hover:text-blue-300 transition-all cursor-pointer underline underline-offset-4 decoration-blue-500/30">Alanı seç</span>
                                                        <span className="text-[12px] font-bold text-blue-400 hover:text-blue-300 transition-all cursor-pointer underline underline-offset-4 decoration-blue-500/30">Alan oluştur</span>
                                                    </div>
                                                </div>

                                                {/* Kişisel detaylar section */}
                                                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h3 className="text-[16px] font-bold text-slate-100">Kişisel detaylar</h3>
                                                        {isEditingKisiselDetaylar && (
                                                            <button
                                                                onClick={() => setIsEditingKisiselDetaylar(false)}
                                                                className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded text-[12px] font-bold uppercase tracking-widest transition-all text-white shadow-lg shadow-blue-500/20"
                                                            >
                                                                KAYDET
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-start gap-8">
                                                        <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                                            <Trash2 size={32} className="text-blue-400/40" />
                                                        </div>
                                                        <div className="flex-1">
                                                            {isEditingKisiselDetaylar ? (
                                                                <textarea
                                                                    value={kisiselDetaylarText}
                                                                    onChange={(e) => setKisiselDetaylarText(e.target.value)}
                                                                    autoFocus
                                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-[13px] text-slate-200 outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none leading-relaxed"
                                                                />
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    <p className="text-[13px] text-slate-400 leading-relaxed max-w-[450px]">
                                                                        {kisiselDetaylarText}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => setIsEditingKisiselDetaylar(true)}
                                                                        className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded text-[12px] font-bold uppercase tracking-widest transition-all border border-white/5"
                                                                    >
                                                                        DÜZENLE
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : activeProfileTab === 'Görevler' ? (
                                            <div className="flex-1 min-w-0 flex flex-col bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[700px]">
                                                {/* Görevler Header */}
                                                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="text-[20px] font-bold text-white flex items-center gap-2">
                                                            Görevlerim <Edit3 size={16} className="text-slate-500" />
                                                        </h3>
                                                        <div className="flex items-center bg-[#2fc6f6]/10 rounded-full overflow-hidden border border-[#2fc6f6]/20">
                                                            <button
                                                                onClick={() => setShowCreateTaskModal(true)}
                                                                className="bg-[#2fc6f6] hover:bg-[#26b4e0] text-white px-4 py-1.5 text-[12px] font-bold flex items-center gap-2 transition-all"
                                                            >
                                                                <Plus size={14} /> Oluştur
                                                            </button>
                                                            <button
                                                                onClick={() => setShowCreateTaskModal(true)}
                                                                className="px-2 py-1.5 hover:bg-[#2fc6f6]/20 text-[#2fc6f6] transition-all"
                                                            >
                                                                <ChevronDown size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {/* Role Dropdown */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                                                className="flex items-center bg-white/5 hover:bg-white/10 rounded px-3 py-1.5 border border-white/10 text-[12px] text-slate-400 gap-2 transition-all"
                                                            >
                                                                {selectedRole ?? 'Tüm roller'} <ChevronDown size={14} />
                                                            </button>
                                                            {showRoleDropdown && (
                                                                <>
                                                                    <div className="fixed inset-0 z-[490]" onClick={() => setShowRoleDropdown(false)} />
                                                                    <div className="absolute top-full left-0 mt-1 w-36 bg-[#0d2050] border border-white/10 rounded-lg shadow-2xl z-[500] overflow-hidden">
                                                                        {['Tüm roller', 'Satış', 'Yönetim', 'Teknik'].map(role => (
                                                                            <button
                                                                                key={role}
                                                                                onClick={() => { setSelectedRole(role === 'Tüm roller' ? null : role); setShowRoleDropdown(false); }}
                                                                                className={`w-full text-left px-4 py-2.5 text-[12px] font-bold hover:bg-white/5 transition-colors ${(role === 'Tüm roller' && !selectedRole) || selectedRole === role ? 'text-blue-400' : 'text-slate-300'}`}
                                                                            >
                                                                                {role}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        {/* Status Filter */}
                                                        <button
                                                            onClick={() => setTaskStatusFilter(taskStatusFilter === 'Devam eden' ? 'Tümü' : 'Devam eden')}
                                                            className="flex items-center bg-white/5 hover:bg-white/10 rounded px-3 py-1.5 border border-white/10 text-[12px] text-slate-400 gap-2 transition-all"
                                                        >
                                                            {taskStatusFilter} <X size={14} className="hover:text-red-400" onClick={(e) => { e.stopPropagation(); setTaskStatusFilter('Tümü'); }} />
                                                        </button>
                                                        {/* Search */}
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                placeholder="Ara"
                                                                value={taskSearch}
                                                                onChange={e => setTaskSearch(e.target.value)}
                                                                className="bg-white/5 border border-white/10 rounded px-10 py-1.5 text-[12px] outline-none text-white w-48 focus:border-blue-500/50 transition-all"
                                                            />
                                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                            {taskSearch && (
                                                                <button onClick={() => setTaskSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Create Task Modal */}
                                                {showCreateTaskModal && (
                                                    <div className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowCreateTaskModal(false)}>
                                                        <div className="bg-[#0d2050] border border-white/10 rounded-2xl p-8 w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
                                                            <h3 className="text-[18px] font-bold text-white mb-6">Yeni Görev Oluştur</h3>
                                                            <input
                                                                type="text"
                                                                placeholder="Görev başlığı..."
                                                                autoFocus
                                                                value={newTaskTitle}
                                                                onChange={e => setNewTaskTitle(e.target.value)}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter' && newTaskTitle.trim()) {
                                                                        setNewTaskTitle('');
                                                                        setShowCreateTaskModal(false);
                                                                    } else if (e.key === 'Escape') setShowCreateTaskModal(false);
                                                                }}
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-[14px] outline-none focus:border-blue-500/60 mb-6"
                                                            />
                                                            <div className="flex justify-end gap-3">
                                                                <button onClick={() => setShowCreateTaskModal(false)} className="px-5 py-2 text-[13px] text-slate-400 hover:text-white font-bold transition-colors">İptal</button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (newTaskTitle.trim()) {
                                                                            setNewTaskTitle('');
                                                                            setShowCreateTaskModal(false);
                                                                        }
                                                                    }}
                                                                    className="bg-[#2fc6f6] hover:bg-[#26b4e0] text-white px-6 py-2 rounded-lg text-[13px] font-bold transition-all"
                                                                >Oluştur</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Sub-tabs Navigation */}
                                                <div className="px-6 border-b border-white/10 flex items-center bg-white/5">
                                                    {['Liste', 'Son tarih', 'Planlayıcı', 'Takvim', 'Gantt'].map(subTab => (
                                                        <button
                                                            key={subTab}
                                                            onClick={() => setActiveGorevlerSubTab(subTab)}
                                                            className={`px-4 py-3 text-[12px] font-bold transition-all relative ${activeGorevlerSubTab === subTab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                                                        >
                                                            {subTab}
                                                        </button>
                                                    ))}
                                                    <div className="ml-auto flex items-center gap-4">
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest py-3">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 0 Görev sohbetleri
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest py-3">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 0 Gecikmiş
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest py-3 border-r border-white/10 pr-4">
                                                            0 Yorumlar
                                                        </div>
                                                        <div className="flex items-center gap-4 py-3 pl-2">
                                                            <MessageSquare size={16} className="text-slate-500 cursor-pointer hover:text-blue-400" />
                                                            <List size={16} className="text-slate-500 cursor-pointer hover:text-blue-400" />
                                                            <div className="bg-white/10 p-1 rounded cursor-pointer">
                                                                <LayoutGrid size={16} className="text-white" />
                                                            </div>
                                                            <MoreHorizontal size={16} className="text-slate-500 cursor-pointer hover:text-blue-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Calendar Grid View */}
                                                {activeGorevlerSubTab === 'Takvim' && (
                                                    <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="text-[24px] font-light text-slate-300">Mart, 2026</h4>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center bg-white/5 border border-white/10 rounded px-3 py-1 text-[13px] text-slate-400 gap-2 cursor-pointer">
                                                                    Ay <ChevronDown size={14} />
                                                                </div>
                                                                <div className="flex items-center bg-white/5 border border-white/10 rounded gap-px overflow-hidden ml-4">
                                                                    <button className="px-3 py-1 hover:bg-white/10 transition-all text-slate-400"><ChevronLeft size={16} /></button>
                                                                    <button className="px-4 py-1 hover:bg-white/10 transition-all text-[13px] text-slate-400 font-bold border-x border-white/10">Bugün</button>
                                                                    <button className="px-3 py-1 hover:bg-white/10 transition-all text-slate-400"><ChevronRight size={16} /></button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Calendar Grid */}
                                                        <div className="flex-1 flex flex-col border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-white/5">
                                                            <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
                                                                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(day => (
                                                                    <div key={day} className="py-2 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">{day}</div>
                                                                ))}
                                                            </div>
                                                            <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
                                                                {[
                                                                    { d: 23, m: 'Feb' }, { d: 24, m: 'Feb' }, { d: 25, m: 'Feb' }, { d: 26, m: 'Feb' }, { d: 27, m: 'Feb' }, { d: 28, m: 'Feb' }, { d: 1, m: 'Mar' },
                                                                    { d: 2 }, { d: 3 }, { d: 4 }, { d: 5 }, { d: 6, current: true }, { d: 7 }, { d: 8 },
                                                                    { d: 9 }, { d: 10 }, { d: 11 }, { d: 12 }, { d: 13 }, { d: 14 }, { d: 15 },
                                                                    { d: 16 }, { d: 17 }, { d: 18 }, { d: 19 }, { d: 20 }, { d: 21 }, { d: 22 },
                                                                    { d: 23 }, { d: 24 }, { d: 25 }, { d: 26 }, { d: 27 }, { d: 28 }, { d: 29 },
                                                                    { d: 30 }, { d: 31 }, { d: 1, m: 'Apr' }, { d: 2, m: 'Apr' }, { d: 3, m: 'Apr' }, { d: 4, m: 'Apr' }, { d: 5, m: 'Apr' },
                                                                ].slice(0, 35).map((day, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        onClick={() => {
                                                                            if (!dayInput) {
                                                                                setDayInput({ idx, text: '' });
                                                                            }
                                                                        }}
                                                                        className={`border-r border-b border-white/10 p-4 transition-all relative group/cell cursor-pointer min-h-[100px] flex flex-col
                                                                        ${day.m && day.m !== 'Mar' ? 'opacity-20' : 'hover:bg-white/5'}
                                                                        ${day.current ? 'bg-blue-500/5' : ''}
                                                                    `}
                                                                        onMouseEnter={() => setShowAddTaskTooltip(idx)}
                                                                        onMouseLeave={() => setShowAddTaskTooltip(null)}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className={`text-[15px] font-medium ${day.current ? 'text-blue-400 bg-blue-400/20 w-8 h-8 rounded-full flex items-center justify-center -m-1' : 'text-slate-400'}`}>
                                                                                {day.d}
                                                                            </span>
                                                                            {day.m && <span className="text-[10px] text-slate-600 uppercase font-black">{day.m}</span>}
                                                                        </div>

                                                                        {/* Tasks List */}
                                                                        <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar max-h-[60px]">
                                                                            {calendarTasks[idx]?.map((task, tidx) => (
                                                                                <div key={tidx} className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded flex flex-col gap-0.5 border border-blue-500/30">
                                                                                    <span className="font-bold truncate">{task.text}</span>
                                                                                    <span className="text-[8px] opacity-70 italic truncate">Atanan: {task.assignee}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {/* Task Input Box */}
                                                                        {dayInput?.idx === idx && (
                                                                            <div className="absolute inset-0 bg-[#0b1b3d]/95 backdrop-blur-md p-3 z-50 flex flex-col gap-2 animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
                                                                                <textarea
                                                                                    autoFocus
                                                                                    placeholder="Görev detayı..."
                                                                                    className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-[11px] text-white outline-none focus:border-blue-500/50 resize-none"
                                                                                    value={dayInput.text}
                                                                                    onChange={e => setDayInput({ ...dayInput, text: e.target.value })}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter' && !e.shiftKey && dayInput.text.trim()) {
                                                                                            e.preventDefault();
                                                                                            const newTask = { text: dayInput.text.trim(), assignee: profileData.email };
                                                                                            setCalendarTasks(prev => ({
                                                                                                ...prev,
                                                                                                [idx]: [...(prev[idx] || []), newTask]
                                                                                            }));
                                                                                            setDayInput(null);
                                                                                        } else if (e.key === 'Escape') {
                                                                                            setDayInput(null);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <div className="flex justify-end gap-2">
                                                                                    <button onClick={() => setDayInput(null)} className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">İptal</button>
                                                                                    <button
                                                                                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider"
                                                                                        onClick={() => {
                                                                                            if (dayInput.text.trim()) {
                                                                                                const newTask = { text: dayInput.text.trim(), assignee: profileData.email };
                                                                                                setCalendarTasks(prev => ({
                                                                                                    ...prev,
                                                                                                    [idx]: [...(prev[idx] || []), newTask]
                                                                                                }));
                                                                                                setDayInput(null);
                                                                                            }
                                                                                        }}
                                                                                    >Kaydet</button>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {showAddTaskTooltip === idx && !dayInput && (
                                                                            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10 backdrop-blur-[1px] animate-in fade-in duration-200">
                                                                                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                                                                                    <Plus size={12} /> Görev Ekle
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showCloseModal && (
                        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-[20px] shadow-2xl w-[600px] p-10 relative overflow-hidden animate-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => setShowCloseModal(false)}
                                    className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <X size={28} />
                                </button>

                                <h2 className="text-[22px] font-bold text-slate-700 text-center mb-10 mt-4 leading-tight">
                                    Anlaşmanın kapatılması için sonuç seçin.
                                </h2>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setEditData((prev: any) => ({ ...prev, stage: 'Anlaşma kazanıldı' }));
                                            setShowCloseModal(false);
                                            setShowStageDropdown(false);
                                        }}
                                        className="flex-1 bg-[#bbed21] hover:bg-[#aadb1e] text-slate-800 h-16 rounded-[4px] text-[15px] font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center"
                                    >
                                        KAPATILAN KAZANÇLAR
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditData((prev: any) => ({ ...prev, stage: 'Anlaşma kaybedildi' }));
                                            setShowCloseModal(false);
                                            setShowStageDropdown(false);
                                        }}
                                        className="flex-1 bg-[#ff3b30] hover:bg-[#e0352b] text-white h-16 rounded-[4px] text-[15px] font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center"
                                    >
                                        BAŞARISIZ ANLAŞMA
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Field Selector Modal */}
                    {showFieldSelectorModal && (
                        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg shadow-2xl w-[800px] flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                                {/* Modal Header */}
                                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                    <h2 className="text-[16px] font-bold text-slate-700">Alanları seçin</h2>
                                    <button onClick={() => setShowFieldSelectorModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="px-6 py-4 flex-1 overflow-y-auto min-h-[400px]">
                                    {/* Search Bar & Anlaşma Label */}
                                    <div className="flex justify-between items-center mb-8 gap-4">
                                        <div className="relative flex-1 max-w-[400px]">
                                            <input
                                                type="text"
                                                placeholder="Alan bul"
                                                className="w-full border border-slate-200 rounded px-3 py-2 text-[14px] outline-none focus:border-blue-400 text-slate-700 placeholder:text-slate-400"
                                                value={fieldSearch}
                                                onChange={(e) => setFieldSearch(e.target.value)}
                                            />
                                            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                        <div className="border border-blue-200 rounded px-4 py-2 text-[14px] text-slate-700 relative flex items-center">
                                            Anlaşma
                                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00d0f5] rounded-full flex items-center justify-center text-white"><span className="text-[10px] leading-none">âœ“</span></div>
                                        </div>
                                    </div>

                                    {/* Field Groups */}
                                    <div className="space-y-8">
                                        {availableFieldGroups.map((group) => {
                                            const filteredFields = group.fields.filter(f => f.toLowerCase().includes(fieldSearch.toLowerCase()));
                                            if (filteredFields.length === 0) return null;

                                            return (
                                                <div key={group.groupName}>
                                                    <h3 className="text-[18px] text-slate-600 mb-4 border-b border-slate-100 pb-2">{group.groupName}</h3>
                                                    <div className="grid grid-cols-3 gap-y-4 gap-x-6">
                                                        {filteredFields.map(field => (
                                                            <label key={field} className="flex items-center gap-3 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="appearance-none w-4 h-4 border border-slate-300 rounded-[3px] checked:bg-[#00d0f5] checked:border-[#00d0f5] transition-colors cursor-pointer peer"
                                                                        checked={selectedFieldKeys.includes(field)}
                                                                        onChange={() => toggleFieldKey(field)}
                                                                    />
                                                                    <span className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 font-bold block pb-0.5" style={{ fontSize: '10px' }}>âœ“</span>
                                                                </div>
                                                                <span className="text-[14px] text-slate-600 group-hover:text-slate-900">{field}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 pt-4 border-t border-slate-100 flex items-center gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer group mr-auto">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="appearance-none w-4 h-4 border border-slate-300 rounded-[3px] checked:bg-[#00d0f5] checked:border-[#00d0f5] transition-colors cursor-pointer peer"
                                                checked={allSelected}
                                                onChange={() => {
                                                    if (allSelected) {
                                                        setSelectedFieldKeys([]);
                                                    } else {
                                                        setSelectedFieldKeys(allFieldKeys);
                                                    }
                                                }}
                                            />
                                            <span className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 font-bold block pb-0.5" style={{ fontSize: '10px' }}>âœ“</span>
                                        </div>
                                        <span className="text-[14px] text-slate-500">tümünü seç</span>
                                    </label>

                                    <button
                                        onClick={handleSelectFields}
                                        className="bg-[#bbed21] hover:bg-[#aadb1e] text-slate-800 px-8 py-2.5 rounded-[4px] text-[13px] font-bold uppercase tracking-wider transition-all"
                                    >
                                        SEÇ
                                    </button>
                                    <button
                                        onClick={() => setShowFieldSelectorModal(false)}
                                        className="text-slate-500 hover:text-slate-700 font-bold text-[13px] px-2 py-2.5 uppercase transition-colors"
                                    >
                                        İPTAL
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealDetailView;
