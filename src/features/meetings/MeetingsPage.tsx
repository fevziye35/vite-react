import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, MapPin, Plus, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { meetingService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

// Helper function to generate Google Calendar URL
function generateGoogleCalendarUrl(meeting: any) {
    const startDate = new Date(meeting.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: meeting.title || 'Meeting',
        dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
        details: meeting.notes || '',
        location: meeting.type === 'Online' ? 'Online Meeting' : 'Office'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function MeetingsPage() {
    const toast = useToast();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({ type: 'Online', addToGoogleCalendar: false });
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        loadMeetings();
        // Load customers for dropdown
        import('../../services/api').then(mod => mod.customerService.getAll().then(setCustomers));
    }, []);

    async function loadMeetings() {
        try {
            const data = await meetingService.getAll();
            setMeetings(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        try {
            await meetingService.create(formData);

            // If user wants to add to Google Calendar, open URL in new tab
            if (formData.addToGoogleCalendar) {
                const calendarUrl = generateGoogleCalendarUrl(formData);
                window.open(calendarUrl, '_blank');
            }

            toast.success('Toplantı başarıyla planlandı');
            setIsModalOpen(false);
            setFormData({ type: 'Online', addToGoogleCalendar: false });
            loadMeetings();
        } catch (error) {
            toast.error('Toplantı planlanamadı');
        }
    }

    function handleAddToGoogleCalendar(meeting: any) {
        const calendarUrl = generateGoogleCalendarUrl(meeting);
        window.open(calendarUrl, '_blank');
    }

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;
    return (
        <div className="space-y-6">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Toplantı Planla">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Başlık / Konu</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri</label>
                        <select
                            required
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                            value={formData.customerId || ''}
                            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                        >
                            <option value="">Müşteri Seçiniz...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tarih ve Saat</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                value={formData.date || ''}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tür</label>
                            <select
                                className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Online">Çevrimiçi</option>
                                <option value="In-Person">Yüz Yüze</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                        <textarea
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                            rows={3}
                            value={formData.notes || ''}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                    {/* Google Calendar Integration Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <input
                            type="checkbox"
                            id="addToGoogleCalendar"
                            checked={formData.addToGoogleCalendar || false}
                            onChange={e => setFormData({ ...formData, addToGoogleCalendar: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="addToGoogleCalendar" className="flex items-center gap-2 text-sm font-medium text-blue-800 cursor-pointer">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5V19.5C2 20.88 3.12 22 4.5 22H19.5C20.88 22 22 20.88 22 19.5V6.5C22 5.12 20.88 4 19.5 4Z" fill="#4285F4" />
                                <path d="M19.5 4H12V13L15.75 10.5L19.5 13V6.5C19.5 5.12 20.88 4 19.5 4Z" fill="#EA4335" />
                                <path d="M4.5 22H12V13L8.25 15.5L4.5 13V19.5C4.5 20.88 3.12 22 4.5 22Z" fill="#34A853" />
                                <path d="M4.5 4C3.12 4 2 5.12 2 6.5V13L5.75 10.5L12 13V4H4.5Z" fill="#FBBC05" />
                            </svg>
                            Google Takvim'e Ekle
                        </label>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>İptal</Button>
                        <Button type="submit">Planla</Button>
                    </div>
                </form>
            </Modal>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Toplantılar ve Aramalar</h1>
                    <p className="text-slate-500">Müşterilerle planlanmış görüşmeler</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Toplantı Planla
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upcoming Meetings List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-navy-900">Yaklaşan</h2>
                    {meetings.map((meeting: any) => (
                        <div key={meeting.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex gap-4 hover:shadow-md transition">
                            <div className="bg-blue-50 text-blue-600 rounded-lg w-16 h-16 flex flex-col items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold uppercase">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-2xl font-bold">{new Date(meeting.date).getDate()}</span>
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-navy-900 text-lg">{meeting.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAddToGoogleCalendar(meeting)}
                                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Google Takvim'e Ekle"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium flex items-center gap-1">
                                            {meeting.type === 'Online' ? <Video size={12} /> : <MapPin size={12} />}
                                            {meeting.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users size={14} />
                                        {meeting.with}
                                    </div>
                                </div>
                                <p className="text-slate-600 text-sm mt-3 bg-slate-50 p-2 rounded border border-slate-100">
                                    {meeting.notes}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Integration Calendar Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
                    <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                        <CalendarIcon size={20} className="text-primary-600" />
                        Takvim Entegrasyonu
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                        Toplantıları Google Takvim'e eklemek için toplantı kartlarındaki <ExternalLink size={12} className="inline" /> butonunu kullanın veya yeni toplantı oluştururken "Google Takvim'e Ekle" seçeneğini işaretleyin.
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5V19.5C2 20.88 3.12 22 4.5 22H19.5C20.88 22 22 20.88 22 19.5V6.5C22 5.12 20.88 4 19.5 4Z" fill="#4285F4" />
                            <path d="M19.5 4H12V13L15.75 10.5L19.5 13V6.5C19.5 5.12 20.88 4 19.5 4Z" fill="#EA4335" />
                            <path d="M4.5 22H12V13L8.25 15.5L4.5 13V19.5C4.5 20.88 3.12 22 4.5 22Z" fill="#34A853" />
                            <path d="M4.5 4C3.12 4 2 5.12 2 6.5V13L5.75 10.5L12 13V4H4.5Z" fill="#FBBC05" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">Google Calendar Hazır</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
