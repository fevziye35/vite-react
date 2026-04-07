import React, { useState, useEffect } from 'react';
import { Shield, Edit2, Trash2, UserPlus, Save, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { supabase } from '../services/supabase';

export default function AdminPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [lastInviteLink, setLastInviteLink] = useState('');
    const [showInviteSuccess, setShowInviteSuccess] = useState(false);

    const [editingUser, setEditingUser] = useState<any>(null);

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        role: 'Admin',
        permissions: {
            deals: true,
            customers: true,  
            offers: true, 
            messages: true
        }
    });

    const isSuperAdmin = user?.email === 'fevziye.mamak35@gmail.com';

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
                // SİHİRLİ DEĞİŞİKLİK: Magic Link gönderiyoruz
                const { error: otpError } = await supabase.auth.signInWithOtp({
                    email: formData.email,
                    options: {
                        emailRedirectTo: 'https://crm.makfaglobal.com', 
                    },
                });

                if (otpError) throw otpError;

                // Profili de oluşturuyoruz (Kullanıcı listesinde gözükmesi için)
                try { await userService.create(formData); } catch (e) {}

                alert('Sihirli link gönderildi! Mail kutusunu kontrol edin.');
            }
            setIsAddModalOpen(false);
            setEditingUser(null);
            fetchUsers();
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

    if (user?.email !== 'fevziye.mamak35@gmail.com') {
        return (
            <div className="p-8 text-center">
                <Shield className="mx-auto mb-4 text-red-500" size={48} />
                <h2 className="text-2xl font-bold mb-2">Erişim Engellendi</h2>
                <p className="text-slate-600">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Shield size={64} className="text-red-500 mb-4 opacity-20" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Yetkisiz Erişim</h2>
                <p className="text-slate-500">Bu sayfayı görüntülemek için Süper Admin yetkisine sahip olmanız gerekmektedir.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sistem Yönetimi</h1>
                    <p className="text-slate-500 font-medium">Kullanıcıları ve yetkileri yönetin</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingUser(null);
                        setFormData({
                            email: '', fullName: '', role: 'Admin',
                            permissions: { deals: true, customers: true, offers: true, messages: true }
                        });
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
                >
                    <UserPlus size={20} />
                    Yeni Kullanıcı Ekle
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold">
                    {error}
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Kullanıcı</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Yetkiler</th>
                            <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{u.fullName}</div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                        u.role === 'SuperAdmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {u.permissions && Object.entries(u.permissions).map(([key, val]) => (
                                            val && (
                                                <span key={key} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                                                    {key}
                                                </span>
                                            )
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => {
                                                setEditingUser(u);
                                                setFormData({
                                                    email: u.email,
                                                    fullName: u.fullName,
                                                    role: u.role,
                                                    permissions: u.permissions || { deals: false, customers: false, offers: false, messages: false }
                                                });
                                                setIsAddModalOpen(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        {u.email !== 'fevziye.mamak35@gmail.com' && (
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h3>
                                <p className="text-xs text-slate-500 font-medium">{editingUser ? editingUser.email : 'Sisteme yeni bir personel ekleyin'}</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors shado-sm">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="p-8 space-y-6">
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
                                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox"
                                                className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={(formData.permissions as any)[key]}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    permissions: { ...formData.permissions, [key]: e.target.checked }
                                                })}
                                            />
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                                                {key === 'deals' ? 'Anlaşmalar' : 
                                                 key === 'customers' ? 'Müşteriler' : 
                                                 key === 'offers' ? 'Teklifler' : 
                                                 key === 'messages' ? 'Mesajlar' : key}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
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
            {/* Success Invitation Modal */}
            {showInviteSuccess && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <Check size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Davet Hazır!</h3>
                        <p className="text-slate-500 text-sm font-medium mb-8">E-posta gönderimi tetiklendi. Ancak isterseniz aşağıdaki linki kopyalayıp doğrudan kişiye gönderebilirsiniz.</p>
                        
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-8 flex items-center gap-3">
                            <input 
                                readOnly 
                                value={lastInviteLink}
                                className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-500 w-full"
                            />
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(lastInviteLink);
                                    alert('Link kopyalandı!');
                                }}
                                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shrink-0"
                                title="Kopyala"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => {
                                setShowInviteSuccess(false);
                                setLastInviteLink('');
                            }}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all"
                        >
                            Tamam, Kapat
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}