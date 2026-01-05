import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, MapPin, Plus, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { meetingService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export function MeetingsPage() {
    const toast = useToast();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({ type: 'Online' });
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
            setIsModalOpen(false);
            setFormData({ type: 'Online' });
            loadMeetings();
        } catch (error) {
            toast.error('Toplantı planlanamadı');
        }
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
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium flex items-center gap-1">
                                        {meeting.type === 'Online' ? <Video size={12} /> : <MapPin size={12} />}
                                        {meeting.type}
                                    </span>
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
                        Toplantıları ve etkinlikleri otomatik olarak senkronize etmek için Google Takvim veya Outlook'unuzu bağlayın.
                    </p>
                    <Button variant="outline" className="w-full justify-center">
                        Takvim Bağla
                    </Button>
                </div>
            </div>
        </div>
    );
}
