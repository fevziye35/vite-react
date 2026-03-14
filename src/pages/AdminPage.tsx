import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Shield, Trash2, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const MODULES = [
    { id: 'deals', label: 'İŞLER' },
    { id: 'customers', label: 'Müşteriler' },
    { id: 'offers', label: 'Proformalar' },
    { id: 'messages', label: 'Mesajlar' },
];

export default function AdminPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'Viewer',
        permissions: {
            deals: true,
            customers: true,
            offers: true,
            messages: true
        } as Record<string, boolean>
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(`${API_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            // Loading state removed
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.post(`${API_URL}/api/admin/users`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAddModalOpen(false);
            setFormData({ email: '', password: '', fullName: '', role: 'Viewer', permissions: {} });
            fetchUsers();
            alert('Kullanıcı başarıyla eklendi.');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Kullanıcı eklenemedi.');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`${API_URL}/api/admin/users/${editingUser.id}`, {
                fullName: editingUser.fullName,
                role: editingUser.role,
                permissions: editingUser.permissions,
                password: formData.password || undefined // Only update if provided
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditModalOpen(false);
            setEditingUser(null);
            setFormData({ ...formData, password: '' });
            fetchUsers();
            alert('Kullanıcı güncellendi.');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Kullanıcı güncellenemedi.');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${API_URL}/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Kullanıcı silinemedi.');
        }
    };

    const togglePermission = (userId: string | null, moduleId: string) => {
        if (userId === null) {
            // New user form
            setFormData(prev => ({
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [moduleId]: !prev.permissions[moduleId]
                }
            }));
        } else {
            // Editing existing user
            setEditingUser((prev: any) => ({
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [moduleId]: !prev.permissions?.[moduleId]
                }
            }));
        }
    };

    if (currentUser?.email !== 'fevziye.mamak35@gmail.com') {
        return <div className="p-8 text-center text-red-500 font-bold">Yetkisiz erişim!</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <Shield className="text-blue-500" /> Kullanıcı Yönetimi
                </h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
                >
                    <Plus size={20} /> Yeni Kullanıcı
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kullanıcı</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rol</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Erişim Yetkileri</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Kayıt Tarihi</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-bold text-slate-800">{u.full_name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        u.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {u.permissions && Object.keys(JSON.parse(u.permissions || '{}')).some(k => JSON.parse(u.permissions || '{}')[k] === false) ? (
                                            MODULES.map(m => {
                                                const perms = JSON.parse(u.permissions || '{}');
                                                return perms[m.id] !== false && (
                                                    <span key={m.id} className="bg-green-50 text-green-600 text-[10px] px-2 py-0.5 rounded-md border border-green-100">
                                                        {m.label}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="text-green-600 text-[10px] font-bold italic">Tam Erişim</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => {
                                                const perms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
                                                setEditingUser({
                                                    ...u,
                                                    fullName: u.full_name,
                                                    permissions: perms || { deals: true, customers: true, offers: true, messages: true }
                                                });
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                            disabled={u.email === 'fevziye.mamak35@gmail.com'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="text-blue-500" /> Yeni Kullanıcı Ekle
                        </h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-posta</label>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label>
                                <input 
                                    type="password" 
                                    required 
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad Soyad</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                                    value={formData.fullName}
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Erişim Yetkileri</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {MODULES.map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => togglePermission(null, m.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                                                formData.permissions[m.id] 
                                                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                                : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            {formData.permissions[m.id] ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                                >
                                    İptal
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Edit2 className="text-blue-500" /> Kullanıcıyı Düzenle
                        </h2>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad Soyad</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                                    value={editingUser.fullName}
                                    onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre Değiştir (İsteğe Bağlı)</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                                    placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Erişim Yetkileri</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {MODULES.map(m => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => togglePermission(editingUser.id, m.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                                                editingUser.permissions?.[m.id] 
                                                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                                : 'bg-white border-slate-200 text-slate-500'
                                            }`}
                                        >
                                            {editingUser.permissions?.[m.id] ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingUser(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                                >
                                    İptal
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
                                >
                                    Güncelle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
