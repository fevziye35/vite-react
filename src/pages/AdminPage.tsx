import React, { useState, useEffect } from 'react';
import { Shield, Edit2, Trash2, UserPlus, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

export default function AdminPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);


    const [editingUser, setEditingUser] = useState<any>(null);

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        role: 'Kullanıcı',
        permissions: {
            deals: true,
            customers: true,
            offers: true,
            messages: true
        }
    });

    const isSuperAdmin = user?.role === 'SuperAdmin' || user?.email === 'fevziye.mamak35@gmail.com';

    useEffect(() => {
        if (isSuperAdmin) {
            fetchUsers();
        }
    }, [isSuperAdmin]);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
            setError('');
        } catch (err: any) {
            setError('Kullanıcı listesi yüklenemedi: ' + (err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.update(editingUser.id, formData);
                alert('Kullanıcı güncellendi.');
            } else {
                // PROFESYONEL DAVET SİSTEMİ (Backend Üzerinden generateLink + local SMTP)
                alert("Davet linki oluşturuluyor ve mail gönderiliyor, lütfen bekleyin...");
                await userService.create(formData);
                alert("Resmi davet maili başarıyla gönderildi!");
            }
            setIsAddModalOpen(false);
            setEditingUser(null);
            fetchUsers();
            // Reset form
            setFormData({
                email: '',
                fullName: '',
                role: 'Kullanıcı',
                permissions: { deals: true, customers: true, offers: true, messages: true }
            });
        } catch (err: any) {
            alert('Hata: ' + (err.message));
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            await userService.delete(id);
            fetchUsers();
        } catch (err: any) {
            alert('Hata: ' + (err.message));
        }
    };

    if (!isSuperAdmin) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl inline-block font-bold">
                    Bu sayfaya erişim yetkiniz yok.
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Shield className="text-blue-600" size={32} />
                        Sistem Yönetimi
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Kullanıcıları ve yetkilerini yönetin</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <UserPlus size={20} />
                    Yeni Kullanıcı Ekle
                </button>
            </header>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                    <X size={20} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((u) => (
                    <div key={u.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-blue-50 transition-colors" />
                        
                        <div className="relative">
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <UserIcon size={28} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            setEditingUser(u);
                                            setFormData({
                                                email: u.email,
                                                fullName: u.full_name,
                                                role: u.role,
                                                permissions: u.permissions || { deals: true, customers: true, offers: true, messages: true }
                                            });
                                            setIsAddModalOpen(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUser(u.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{u.full_name}</h3>
                                <p className="text-slate-500 font-medium text-sm lowercase">{u.email}</p>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                    u.role === 'SuperAdmin' || u.role === 'Admin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                                }`}>
                                    {u.role}
                                </span>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-3">
                                {Object.entries(u.permissions || {}).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-green-500' : 'bg-slate-200'}`} />
                                        <span className={`text-[10px] font-bold uppercase tracking-tight ${value ? 'text-slate-700' : 'text-slate-300'}`}>
                                            {key === 'deals' ? 'Anlaşmalar' :
                                             key === 'customers' ? 'Müşteriler' :
                                             key === 'offers' ? 'Teklifler' : 'Mesajlar'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">{editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</h3>
                                <p className="text-slate-500 font-medium text-sm">Sisteme yeni bir personel ekleyin</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingUser(null);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-900 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tam Ad Soyad</label>
                                    <input 
                                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-Posta</label>
                                    <input 
                                        type="email"
                                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rol</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-slate-700 appearance-none"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Kullanıcı">Kullanıcı</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yetkiler</label>
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                                    {Object.keys(formData.permissions).map((key) => (
                                        <label key={key} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-blue-200 cursor-pointer transition-all">
                                            <input 
                                                type="checkbox"
                                                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                                                checked={(formData.permissions as any)[key]}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    permissions: {
                                                        ...formData.permissions,
                                                        [key]: e.target.checked
                                                    }
                                                })}
                                            />
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                                                {key === 'deals' ? 'Anlaşmalar' :
                                                 key === 'customers' ? 'Müşteriler' :
                                                 key === 'offers' ? 'Teklifler' : 'Mesajlar'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingUser(null);
                                    }}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                                >
                                    Vazgeç
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    {editingUser ? 'Güncelle' : 'Kullanıcıyı Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function UserIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}