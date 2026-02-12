import { useState, useEffect } from 'react';
import { Plus, Loader2, Calendar, Clock, User, AlertCircle, CheckCircle2, Circle, Trash2, Edit2, Users, RotateCcw, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { taskService } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { notificationService } from '../../services/notifications';

const EMPLOYEES = ['Ali', 'Fevziye', 'Berk', 'Atılay'];

const PRIORITY_CONFIG = {
    urgent: { label: 'Acil', color: 'bg-red-100 text-red-700 border-red-200', icon: '🔴' },
    medium: { label: 'Orta', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '🟡' },
    low: { label: 'Düşük', color: 'bg-green-100 text-green-700 border-green-200', icon: '🟢' }
};

const STATUS_CONFIG = {
    pending: { label: 'Bekliyor', color: 'bg-slate-100 text-slate-700', icon: Circle },
    in_progress: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700', icon: Clock },
    completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-700', icon: CheckCircle2 }
};

interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    createdAt: string;
    priority: 'urgent' | 'medium' | 'low';
    assignedTo?: string; // Now stores comma-separated names or JSON array
    status: 'pending' | 'in_progress' | 'completed';
    link?: string; // URL link to documents, Drive, etc.
}

// Helper to parse assignedTo field (can be string, comma-separated, or JSON array)
function parseAssignees(assignedTo?: string): string[] {
    if (!assignedTo) return [];
    try {
        const parsed = JSON.parse(assignedTo);
        if (Array.isArray(parsed)) return parsed;
    } catch {
        // Not JSON, try comma-separated
        if (assignedTo.includes(',')) {
            return assignedTo.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    return assignedTo ? [assignedTo] : [];
}

// Helper to format assignees for storage
function formatAssignees(assignees: string[]): string {
    return assignees.join(', ');
}

export function TasksPage() {
    const toast = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [showCompleted, setShowCompleted] = useState(true);
    const [formData, setFormData] = useState<Partial<Task>>({
        priority: 'medium',
        status: 'pending'
    });

    useEffect(() => {
        loadTasks();
    }, []);

    // Separate tasks into active and completed
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    async function loadTasks() {
        try {
            const data = await taskService.getAll();
            setTasks(data);
        } catch (error) {
            console.error(error);
            toast.error('Görevler yüklenemedi');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const dataToSave = {
                ...formData,
                assignedTo: formatAssignees(selectedAssignees)
            };

            if (editingTask) {
                await taskService.update(editingTask.id, dataToSave);
                toast.success('Görev güncellendi');
            } else {
                await taskService.create(dataToSave);
                toast.success('Görev oluşturuldu');

                // Send browser notification for new task
                notificationService.sendTaskNotification({
                    title: formData.title || 'Yeni Görev',
                    assignedTo: formatAssignees(selectedAssignees),
                    priority: formData.priority,
                    dueDate: formData.dueDate
                });
            }
            setIsModalOpen(false);
            setFormData({ priority: 'medium', status: 'pending' });
            setSelectedAssignees([]);
            setEditingTask(null);
            loadTasks();
        } catch (error) {
            console.error(error);
            toast.error('Görev kaydedilemedi');
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) return;
        try {
            await taskService.delete(id);
            toast.success('Görev silindi');
            loadTasks();
        } catch (error) {
            console.error(error);
            toast.error('Görev silinemedi');
        }
    }

    async function handleStatusChange(task: Task, newStatus: Task['status']) {
        try {
            await taskService.update(task.id, { ...task, status: newStatus });
            toast.success('Durum güncellendi');
            loadTasks();
        } catch (error) {
            console.error(error);
            toast.error('Durum güncellenemedi');
        }
    }

    function toggleAssignee(employee: string) {
        setSelectedAssignees(prev =>
            prev.includes(employee)
                ? prev.filter(e => e !== employee)
                : [...prev, employee]
        );
    }

    function openEditModal(task: Task) {
        setEditingTask(task);
        setSelectedAssignees(parseAssignees(task.assignedTo));
        setFormData({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
            link: task.link
        });
        setIsModalOpen(true);
    }

    function openCreateModal() {
        setEditingTask(null);
        setSelectedAssignees([]);
        setFormData({ priority: 'medium', status: 'pending' });
        setIsModalOpen(true);
    }

    // Task Card Component
    function TaskCard({ task, showActions = true }: { task: Task; showActions?: boolean }) {
        const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
        const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
        const StatusIcon = statusConfig.icon;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        const assignees = parseAssignees(task.assignedTo);

        return (
            <div
                className={`bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-all ${task.status === 'completed' ? 'opacity-75 bg-slate-50' : ''
                    } ${isOverdue ? 'border-red-200' : 'border-slate-100'}`}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className={`font-bold text-navy-900 ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Düzenle"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {task.description}
                    </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                        {priorityConfig.icon} {priorityConfig.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon size={12} className="inline mr-1" />
                        {statusConfig.label}
                    </span>
                </div>

                {/* Assignees */}
                {assignees.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className="text-slate-400" />
                        <div className="flex flex-wrap gap-1">
                            {assignees.map(name => (
                                <span
                                    key={name}
                                    className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Meta Info */}
                <div className="space-y-1.5 text-sm text-slate-500">
                    {task.link && (
                        <a
                            href={task.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            <ExternalLink size={14} />
                            <span className="truncate">Bağlantıyı Aç</span>
                        </a>
                    )}
                    {task.dueDate && (
                        <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                            <Calendar size={14} />
                            <span>Bitiş: {new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                            {isOverdue && <span className="text-xs">(Gecikmiş)</span>}
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} />
                        <span>Eklenme: {new Date(task.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                </div>

                {/* Quick Status Buttons */}
                {showActions && task.status !== 'completed' && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex gap-2">
                            {task.status === 'pending' && (
                                <button
                                    onClick={() => handleStatusChange(task, 'in_progress')}
                                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                                >
                                    Başlat
                                </button>
                            )}
                            <button
                                onClick={() => handleStatusChange(task, 'completed')}
                                className="flex-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                            >
                                Tamamla
                            </button>
                        </div>
                    </div>
                )}

                {/* Reopen button for completed tasks */}
                {task.status === 'completed' && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                            onClick={() => handleStatusChange(task, 'pending')}
                            className="w-full px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                        >
                            <RotateCcw size={12} />
                            Yeniden Aç
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    setSelectedAssignees([]);
                    setFormData({ priority: 'medium', status: 'pending' });
                }}
                title={editingTask ? 'Görev Düzenle' : 'Yeni Görev'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Başlık <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Görev başlığı..."
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Açıklama
                        </label>
                        <textarea
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            rows={3}
                            placeholder="Görev detayları..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Bitiş Tarihi
                            </label>
                            <input
                                type="date"
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                value={formData.dueDate || ''}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Öncelik
                            </label>
                            <select
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                value={formData.priority || 'medium'}
                                onChange={e => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                            >
                                <option value="urgent">🔴 Acil</option>
                                <option value="medium">🟡 Orta</option>
                                <option value="low">🟢 Düşük</option>
                            </select>
                        </div>
                    </div>

                    {/* Multi-select Assignees */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Atanan Kişiler (birden fazla seçebilirsiniz)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {EMPLOYEES.map(emp => (
                                <button
                                    key={emp}
                                    type="button"
                                    onClick={() => toggleAssignee(emp)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedAssignees.includes(emp)
                                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-400'
                                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
                                        }`}
                                >
                                    <User size={14} className="inline mr-1" />
                                    {emp}
                                </button>
                            ))}
                        </div>
                        {selectedAssignees.length > 0 && (
                            <p className="text-xs text-slate-500 mt-2">
                                Seçilen: {selectedAssignees.join(', ')}
                            </p>
                        )}
                    </div>

                    {/* Link Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <LinkIcon size={14} className="inline mr-1" />
                            Bağlantı (Döküman, Drive vb.)
                        </label>
                        <input
                            type="url"
                            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="https://drive.google.com/..."
                            value={formData.link || ''}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Görevle ilgili döküman veya kaynak bağlantısı ekleyin
                        </p>
                    </div>

                    {editingTask && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Durum
                            </label>
                            <select
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                value={formData.status || 'pending'}
                                onChange={e => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                            >
                                <option value="pending">Bekliyor</option>
                                <option value="in_progress">Devam Ediyor</option>
                                <option value="completed">Tamamlandı</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingTask(null);
                                setSelectedAssignees([]);
                            }}
                        >
                            İptal
                        </Button>
                        <Button type="submit">
                            {editingTask ? 'Güncelle' : 'Oluştur'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">Görevler</h1>
                    <p className="text-slate-500">Çalışanlara atanmış görevleri yönetin</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Görev
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <AlertCircle className="text-slate-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-navy-900">{tasks.length}</p>
                            <p className="text-sm text-slate-500">Toplam Görev</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Circle className="text-yellow-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-navy-900">
                                {tasks.filter(t => t.status === 'pending').length}
                            </p>
                            <p className="text-sm text-slate-500">Bekleyen</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-navy-900">
                                {tasks.filter(t => t.status === 'in_progress').length}
                            </p>
                            <p className="text-sm text-slate-500">Devam Eden</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 className="text-green-600" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-navy-900">
                                {completedTasks.length}
                            </p>
                            <p className="text-sm text-slate-500">Tamamlanan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Tasks Section */}
            {tasks.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">Henüz görev yok</h3>
                    <p className="text-slate-500 mb-4">İlk görevinizi ekleyerek başlayın</p>
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" /> Yeni Görev Ekle
                    </Button>
                </div>
            ) : (
                <>
                    {/* Active Tasks */}
                    <div>
                        <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                            <Circle className="text-blue-500" size={20} />
                            Aktif Görevler ({activeTasks.length})
                        </h2>
                        {activeTasks.length === 0 ? (
                            <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center">
                                <CheckCircle2 className="text-green-400 mx-auto mb-2" size={32} />
                                <p className="text-slate-500">Tüm görevler tamamlandı! 🎉</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeTasks.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Completed Tasks Section */}
                    {completedTasks.length > 0 && (
                        <div className="mt-8">
                            <button
                                onClick={() => setShowCompleted(!showCompleted)}
                                className="w-full flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="text-green-600" size={20} />
                                    <span className="font-bold text-green-800">
                                        Tamamlanan Görevler ({completedTasks.length})
                                    </span>
                                </div>
                                <span className="text-green-600 text-sm font-medium">
                                    {showCompleted ? 'Gizle ▲' : 'Göster ▼'}
                                </span>
                            </button>

                            {showCompleted && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                    {completedTasks.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
